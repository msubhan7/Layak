# Sarjana — Backend Integration Guide

## Quick start

```bash
cp .env.example .env        # then set VITE_API_URL to your backend URL
npm install
npm run dev
```

While the backend is offline the app falls back to mock data automatically — nothing breaks.

---

## How the API layer works

All HTTP calls live in `src/api/`. There is one file per backend service:

| File | Routes covered |
|------|---------------|
| `api/auth.js` | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| `api/profile.js` | `GET /profile`, `POST /profile`, `PUT /profile` |
| `api/scholarships.js` | `GET /scholarships`, `GET /scholarships/{id}`, `GET /universities`, `GET /universities/{id}` |
| `api/essays.js` | `POST /essays`, `GET /essays`, `GET /essays/{id}`, `PUT /essays/{id}`, `GET /evaluations/{essay_id}` |
| `api/documents.js` | `POST /documents/upload` (multipart), `GET /documents`, `GET /documents/checklist/{scholarship_id}` |
| `api/ai.js` | `POST /ai/evaluate-essay`, `POST /ai/re-evaluate-essay`, `POST /ai/check-eligibility`, `POST /ai/match-scholarships`, `POST /ai/reshape-content`, `GET /eligibility/{scholarship_id}`, `GET /matches` |
| `api/applications.js` | `POST /applications`, `GET /applications`, `GET /applications/{id}`, `PUT /applications/{id}/status`, `DELETE /applications/{id}` |
| `api/dashboard.js` | `GET /dashboard`, `GET /dashboard/summary`, `GET /deadlines`, `GET /readiness/{application_id}`, `GET /notifications`, `POST /notifications/mark-read` |

Import anything from the barrel file: `import { getScholarships, evaluateEssay } from '../api'`.

---

## Auth token

`api/auth.js` → `login()` automatically stores the JWT in `localStorage` under the key `auth_token`.

`api/client.js` attaches it as `Authorization: Bearer <token>` on every request.

---

## Expected response shapes

### GET /scholarships → array of:
```json
{
  "id": "sc1",
  "title": "Yayasan Khazanah Watan Scholarship",
  "provider": "Yayasan Khazanah",
  "university": "Overseas — Ivy League / Oxbridge",
  "deadline": "2026-05-15",
  "days_left": 21,
  "word_limit": 800,
  "fit_score": 92,
  "eligibility_status": "eligible",
  "status": "draft",
  "tags": ["Need-based", "Leadership", "Overseas"],
  "essay_prompt": "Describe a community you belong to...",
  "requirements": ["Malaysian citizen", "CGPA ≥ 3.75"]
}
```

### GET /evaluations/{essay_id} → array of (most recent first):
```json
{
  "overall_score": 82,
  "previous_score": 78,
  "criterion_scores_json": {
    "Clarity of goals": 85,
    "Specificity of achievements": 78
  },
  "weaknesses": [
    { "location": "Paragraph 2", "excerpt": "…she thought…", "note": "Ends abruptly." }
  ],
  "revision_suggestions": ["Quantify your tutoring — hours/week, students, SPM outcomes."]
}
```

### GET /documents → array of:
```json
{
  "id": "d1",
  "document_type": "IC / Passport",
  "filename": "ic_aisyah.pdf",
  "file_url": "https://...",
  "uploaded_at": "2026-03-12",
  "status": "verified"
}
```

### GET /matches → array of:
```json
{
  "scholarship_id": "sc1",
  "fit_score": 92,
  "match_reason": "Your B40 background, CGPA...",
  "risk_note": "Competition is heavy..."
}
```

### GET /deadlines → array of:
```json
{
  "scholarship_id": "sc1",
  "title": "Yayasan Khazanah Watan Scholarship",
  "provider": "Yayasan Khazanah",
  "deadline": "2026-05-15",
  "days_left": 21,
  "eligibility": "eligible",
  "fit_score": 92
}
```

### GET /notifications → array of:
```json
{
  "id": "n1",
  "type": "deadline",
  "message": "Cambridge Trust — ASEAN Bursary is due in 5 days.",
  "created_at": "2h ago",
  "is_read": false
}
```

---

## CORS

Your backend must allow requests from `http://localhost:5173` (Vite's default dev port).

FastAPI example:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

---

## Mock fallback behaviour

Every page that fetches data does:
```js
const { data: apiData } = useApi(getScholarships);
const scholarships = apiData ?? MOCK_SCHOLARSHIPS;
```

So while your teammate's backend is still being built, the app renders with mock data and shows no errors. Once the backend is live and `VITE_API_URL` is set, real data loads automatically.

---

## File upload note

`POST /documents/upload` sends `multipart/form-data` — **not** JSON.

Fields:
- `file` — the binary file
- `document_type` — string, e.g. `"IC / Passport"`

The Documents page's Upload button already handles this via `uploadDocument(file, type)` in `api/documents.js`.
