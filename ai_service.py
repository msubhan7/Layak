import os
import json
import logging
import time
import re
from google import genai

logger = logging.getLogger(__name__)

# ── Safety check ──────────────────────────────────────────────────────────────
_gemini_api_key = os.getenv('GEMINI_API_KEY')
if not _gemini_api_key:
    raise EnvironmentError(
        "GEMINI_API_KEY not found. Please set it in your .env file."
    )

client = genai.Client(api_key=_gemini_api_key)

# ── Retry config ──────────────────────────────────────────────────────────────
_MAX_RETRIES = 2          # total extra attempts after the first try
_RETRY_BACKOFF = [2, 5]   # seconds to wait before retry 1 and retry 2

# ── Output validators ─────────────────────────────────────────────────────────
# Each validator receives the parsed dict and returns (ok: bool, reason: str).

def _validate_evaluate_essay(data: dict):
    score = data.get('overall_score')
    if score is None:
        return False, "missing overall_score"
    if not isinstance(score, (int, float)) or not (0 <= float(score) <= 10):
        return False, f"overall_score out of range: {score}"
    criteria = data.get('criterion_scores', {})
    required = [
        'clarity_of_goals', 'specificity_of_achievements', 'scholarship_alignment',
        'emotional_authenticity', 'grammar_and_formality', 'structure_and_flow',
        'word_count_efficiency'
    ]
    for key in required:
        v = criteria.get(key)
        if v is None or not (0 <= float(v) <= 10):
            return False, f"criterion_scores.{key} invalid: {v}"
    return True, ""

def _validate_check_eligibility(data: dict):
    if 'eligible' not in data or not isinstance(data['eligible'], bool):
        return False, "missing or non-boolean 'eligible' field"
    if 'passed_criteria' not in data or 'failed_criteria' not in data:
        return False, "missing passed_criteria or failed_criteria"
    return True, ""

def _validate_match_scholarships(data: dict):
    matches = data.get('top_matches')
    if not isinstance(matches, list) or len(matches) == 0:
        return False, "top_matches is empty or missing"
    for m in matches:
        score = m.get('fit_score')
        if score is None or not (0 <= float(score) <= 10):
            return False, f"fit_score invalid: {score}"
    return True, ""

def _validate_reshape_content(data: dict):
    text = data.get('reshaped_text', '')
    if not text or len(text.strip()) < 20:
        return False, "reshaped_text is missing or too short"
    wc = data.get('word_count')
    if wc is None or not isinstance(wc, (int, float)) or wc <= 0:
        return False, f"word_count invalid: {wc}"
    return True, ""

def _validate_autofill_form(data: dict):
    if 'filled_fields' not in data or not isinstance(data['filled_fields'], dict):
        return False, "missing filled_fields dict"
    return True, ""

# Map feature name → validator function
_VALIDATORS = {
    'evaluate_essay':     _validate_evaluate_essay,
    'check_eligibility':  _validate_check_eligibility,
    'match_scholarships': _validate_match_scholarships,
    'reshape_content':    _validate_reshape_content,
    'autofill_form':      _validate_autofill_form,
}

# ── Fence stripper (handles nested/multiple fences) ───────────────────────────
def _strip_fences(raw: str) -> str:
    """Remove all markdown code fences regardless of nesting or language tag."""
    clean = re.sub(r'```[a-zA-Z]*\n?', '', raw)
    clean = re.sub(r'```', '', clean)
    return clean.strip()

# ── Core caller with retry + validation ──────────────────────────────────────
def call_gemini(
    prompt: str,
    system_prompt: str = "You are a helpful assistant. Always respond in valid JSON.",
    feature: str = None
) -> dict:
    """
    Call Gemini with automatic retry (up to _MAX_RETRIES extra attempts)
    and optional output validation.

    Returns parsed JSON dict on success.
    Returns {'error': ..., 'details': ...} on permanent failure.
    """
    raw = None
    last_error = None
    full_prompt = f"{system_prompt}\n\n{prompt}"

    for attempt in range(1 + _MAX_RETRIES):
        try:
            if attempt > 0:
                wait = _RETRY_BACKOFF[attempt - 1]
                logger.warning("Retrying Gemini call (attempt %d/%d) after %ds — reason: %s",
                               attempt + 1, 1 + _MAX_RETRIES, wait, last_error)
                time.sleep(wait)

            logger.info("Sending request to Gemini | feature=%s | attempt=%d | prompt_len=%d",
                        feature or 'unknown', attempt + 1, len(prompt))

            response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=full_prompt
            )
            raw = response.text

            logger.info("Response received from Gemini | feature=%s | raw_len=%d",
                        feature or 'unknown', len(raw))

            # Strip markdown code fences if model wraps response
            clean = _strip_fences(raw)

            parsed = json.loads(clean)

            # ── Output validation ─────────────────────────────────────────────
            if feature and feature in _VALIDATORS:
                ok, reason = _VALIDATORS[feature](parsed)
                if not ok:
                    last_error = f"validation failed: {reason}"
                    logger.warning("Gemini output validation failed | feature=%s | reason=%s | attempt=%d",
                                   feature, reason, attempt + 1)
                    continue

            logger.info("Gemini call succeeded | feature=%s | attempt=%d", feature or 'unknown', attempt + 1)
            return parsed

        except json.JSONDecodeError as e:
            last_error = f"JSON parse error: {e} | raw preview: {str(raw)[:200] if raw else 'N/A'}"
            logger.error("JSON parse failed | feature=%s | attempt=%d | %s",
                         feature or 'unknown', attempt + 1, last_error)

        except Exception as e:
            last_error = str(e)
            logger.error("Gemini API call failed | feature=%s | attempt=%d | error=%s",
                         feature or 'unknown', attempt + 1, last_error)

    # All attempts exhausted
    logger.error("Gemini call permanently failed after %d attempts | feature=%s | last_error=%s",
                 1 + _MAX_RETRIES, feature or 'unknown', last_error)
    return {
        "error": "Gemini API call failed",
        "details": last_error,
        "feature": feature or "unknown"
    }


# ─────────────────────────────────────────────
# AI Feature 1: Essay Scorer & Improver
# ─────────────────────────────────────────────
def evaluate_essay(essay_text: str, essay_prompt: str, evaluation_criteria: str, profile: dict) -> dict:
    """
    Scores essay across 7 dimensions, checks tone, contradictions,
    returns weak lines with specific rewrites.
    """
    prompt = f"""
You are an expert Malaysian scholarship essay evaluator.

SCHOLARSHIP ESSAY QUESTION:
{essay_prompt}

EVALUATION CRITERIA:
{evaluation_criteria}

STUDENT PROFILE CONTEXT:
- Name: {profile.get('full_name')}
- Course: {profile.get('course')}
- CGPA: {profile.get('cgpa')}
- Achievements: {profile.get('achievements')}
- Goals: {profile.get('goals')}

STUDENT ESSAY:
{essay_text}

Evaluate this essay thoroughly and return a JSON object with this exact structure:
{{
  "overall_score": <float 0-10>,
  "criterion_scores": {{
    "clarity_of_goals": <float 0-10>,
    "specificity_of_achievements": <float 0-10>,
    "scholarship_alignment": <float 0-10>,
    "emotional_authenticity": <float 0-10>,
    "grammar_and_formality": <float 0-10>,
    "structure_and_flow": <float 0-10>,
    "word_count_efficiency": <float 0-10>
  }},
  "matched_requirements": [<list of requirements the essay meets>],
  "missing_requirements": [<list of requirements not addressed>],
  "weaknesses": [<list of weak points>],
  "revision_suggestions": [
    {{
      "weak_line": "<quoted weak sentence>",
      "reason": "<why it's weak>",
      "suggested_rewrite": "<better version>"
    }}
  ],
  "paragraph_feedback": [
    {{
      "paragraph_number": <int>,
      "feedback": "<specific feedback for this paragraph>",
      "score": <float 0-10>
    }}
  ],
  "tone_check": {{
    "tone": "<e.g. formal/informal/mixed>",
    "formality_score": <float 0-10>,
    "tone_issues": [<list of tone problems if any>]
  }},
  "contradiction_check": {{
    "has_contradictions": <true/false>,
    "contradictions": [<list of contradicting statements if any>]
  }}
}}
"""
    return call_gemini(prompt, feature='evaluate_essay')


# ─────────────────────────────────────────────
# AI Feature 2: Eligibility Checker
# ─────────────────────────────────────────────
def check_eligibility(scholarship: dict, profile: dict) -> dict:
    """
    Checks profile against scholarship eligibility criteria.
    Returns passed/failed/warnings with hard disqualifiers flagged.
    """
    prompt = f"""
You are a Malaysian scholarship eligibility checker.

SCHOLARSHIP: {scholarship.get('title')} by {scholarship.get('provider')}
ELIGIBILITY CRITERIA:
{scholarship.get('eligibility')}

STUDENT PROFILE:
- Citizenship: {profile.get('citizenship')}
- Race: {profile.get('race')}
- CGPA: {profile.get('cgpa')}
- Course: {profile.get('course')}
- School: {profile.get('school')}
- Financial Info: {profile.get('financial_info')}

Go through EVERY eligibility requirement one by one and check if the student meets it.
Return a JSON object with this exact structure:
{{
  "eligible": <true/false>,
  "passed_criteria": [<list of criteria the student meets>],
  "failed_criteria": [<list of criteria the student does NOT meet>],
  "hard_disqualifiers": [<list of criteria that immediately disqualify — if any>],
  "warnings": [<list of borderline or uncertain criteria>],
  "summary": "<one sentence explanation of result>"
}}
"""
    return call_gemini(prompt, feature='check_eligibility')


# ─────────────────────────────────────────────
# AI Feature 3: Smart Scholarship Matching
# ─────────────────────────────────────────────
def match_scholarships(profile: dict, scholarships: list) -> dict:
    """
    Ranks scholarships by fit score based on student profile.
    Returns top matches with reasons and risks.
    """
    slim_scholarships = [
        {
            'id': s.get('id'),
            'title': s.get('title'),
            'provider': s.get('provider'),
            'eligibility': s.get('eligibility'),
            'field_of_study': s.get('field_of_study'),
            'open_to': s.get('open_to'),
            'min_cgpa': s.get('min_cgpa'),
            'amount': s.get('amount')
        }
        for s in scholarships
    ]

    prompt = f"""
You are a Malaysian scholarship advisor.

STUDENT PROFILE:
- CGPA: {profile.get('cgpa')}
- Race: {profile.get('race')}
- Citizenship: {profile.get('citizenship')}
- Course: {profile.get('course')}
- Achievements: {profile.get('achievements')}
- Goals: {profile.get('goals')}
- Financial Info: {profile.get('financial_info')}

AVAILABLE SCHOLARSHIPS:
{json.dumps(slim_scholarships, indent=2)}

Rank the TOP 5 scholarships that best match this student's profile.
Return a JSON object with this exact structure:
{{
  "top_matches": [
    {{
      "scholarship_id": <id>,
      "scholarship_title": "<title>",
      "fit_score": <float 0-10>,
      "match_reason": "<one sentence why this fits well>",
      "risk_note": "<one sentence about a potential risk or concern>"
    }}
  ]
}}
Order by fit_score descending.
"""
    return call_gemini(prompt, feature='match_scholarships')


# ─────────────────────────────────────────────
# AI Feature 4: Content Reshaper
# ─────────────────────────────────────────────
def reshape_content(original_essay: str, target_question: str, word_limit: int, profile: dict) -> dict:
    """
    Reshapes existing essay to fit a new scholarship question and word limit.
    Keeps student's voice — doesn't invent new content.
    """
    prompt = f"""
You are helping a Malaysian student reuse their existing essay for a new application.

ORIGINAL ESSAY:
{original_essay}

NEW SCHOLARSHIP QUESTION:
{target_question}

WORD LIMIT: {word_limit} words

STUDENT CONTEXT:
- Course: {profile.get('course')}
- Goals: {profile.get('goals')}

Rewrite the essay to answer the new question within the word limit.
IMPORTANT RULES:
- Keep the student's voice and real experiences
- Do NOT add new facts, achievements, or claims
- Do NOT make it sound AI-generated
- Stay within {word_limit} words

Return a JSON object:
{{
  "reshaped_text": "<the rewritten essay>",
  "word_count": <actual word count>,
  "changes_made": ["<list of key changes you made>"]
}}
"""
    return call_gemini(prompt, feature='reshape_content')


# ─────────────────────────────────────────────
# AI Feature 5: Profile Autofill Suggestions
# ─────────────────────────────────────────────
def autofill_form(profile: dict, form_fields: list) -> dict:
    """
    Takes student profile and a list of form field names,
    returns suggested values for each field.
    """
    prompt = f"""
You are helping a Malaysian student auto-fill a scholarship application form.

STUDENT PROFILE:
{json.dumps(profile, indent=2)}

FORM FIELDS TO FILL:
{json.dumps(form_fields, indent=2)}

For each form field, suggest the best value from the student's profile.
If a field cannot be filled from the profile, set value to null.

Return a JSON object:
{{
  "filled_fields": {{
    "<field_name>": "<suggested value>",
    ...
  }},
  "unfillable_fields": ["<fields that couldn't be filled>"]
}}
"""
    return call_gemini(prompt, feature='autofill_form')
