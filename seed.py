"""
seed.py — Comprehensive Malaysian Scholarships (Public + Private + GLC + Banking + Corporate)
Run once after setting up the DB:  python seed.py

Categories covered:
  🏛️  Government (JPA, MARA, Bank Negara, Biasiswa Perguruan, Khazanah, PNB)
  🏙️  State (Sabah, Sarawak, Penang, Selangor)
  🏢  GLCs (Petronas, TNB, Telekom, Sime Darby, UEM, Shell)
  🏦  Banking (Maybank, CIMB, Hong Leong, OSK, OCBC, Bank Rakyat, PIDM, Cagamas, Great Eastern)
  🏭  Corporate (Gamuda, YTL, Sunway, Kuok, Star, Maxis, Axiata, Top Glove,
                 IJM, IOI, Lion-Parkson, DRB-HICOM, KLK, Generali, Budimas)
"""

from datetime import date
from app import create_app
from models import db, Scholarship

SCHOLARSHIPS = [

    # ══════════════════════════════════════════════
    # 🏛️ GOVERNMENT SCHOLARSHIPS
    # ══════════════════════════════════════════════

    {
        "name": "JPA Program Penajaan Nasional (PPN)",
        "provider": "Jabatan Perkhidmatan Awam (JPA)",
        "amount": "Full sponsorship to top world universities",
        "deadline": date(2026, 4, 16),
        "eligibility_criteria": (
            "Malaysian citizens only. Top 20 SPM leavers nationwide. Minimum 9A+ in SPM. "
            "Maximum household income RM 10,000/month. Must be below 20 years old. "
            "Open to all races. Must bond with Malaysian government after graduation."
        ),
        "essay_prompts": [
            "How will you contribute to Malaysia after completing your studies abroad?",
            "Describe a challenge you overcame and what you learnt from it.",
        ],
        "required_docs": ["transcript", "IC", "parent_income_slip", "referee_letter"],
        "min_cgpa": None,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://www.jpa.gov.my/biasiswa",
    },
    {
        "name": "JPA Program Khas Lepasan SPM Dalam Negara (LSPM)",
        "provider": "Jabatan Perkhidmatan Awam (JPA)",
        "amount": "Full sponsorship for local universities",
        "deadline": date(2026, 4, 16),
        "eligibility_criteria": (
            "Malaysian citizens. SPM leavers with minimum 5A+ including core subjects. "
            "Household income below RM 10,000/month. Must be below 20 years old. "
            "Open to all races. Includes foundation to first degree sponsorship."
        ),
        "essay_prompts": [
            "Why do you want to serve the Malaysian public sector?",
            "Describe your biggest academic or extracurricular achievement.",
        ],
        "required_docs": ["transcript", "IC", "parent_income_slip", "referee_letter"],
        "min_cgpa": None,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://www.jpa.gov.my/biasiswa",
    },
    {
        "name": "JPA Program Khas Jepun, Korea, Perancis & Jerman (JKPJ)",
        "provider": "Jabatan Perkhidmatan Awam (JPA)",
        "amount": "Full sponsorship including language training abroad",
        "deadline": date(2026, 4, 16),
        "eligibility_criteria": (
            "Malaysian citizens. SPM leavers. Strong in Science, Technology, Engineering or Social Science. "
            "Must be willing to learn Japanese, Korean, French or German. "
            "Minimum 5A in SPM. Open to all races."
        ),
        "essay_prompts": [
            "Why do you want to study in Japan/Korea/France/Germany?",
            "How will international exposure help Malaysia's development?",
        ],
        "required_docs": ["transcript", "IC", "parent_income_slip"],
        "min_cgpa": None,
        "open_to": "All Malaysians",
        "field_of_study": "Engineering / Science / Social Science",
        "portal_url": "https://www.jpa.gov.my/biasiswa",
    },
    {
        "name": "Program Khas JPA-MARA (PKJM)",
        "provider": "JPA & MARA (joint)",
        "amount": "Pinjaman Boleh Ubah (convertible loan to scholarship)",
        "deadline": date(2026, 4, 16),
        "eligibility_criteria": (
            "Malaysian citizens. First-time SPM candidates. "
            "Open to Bumiputera. Joint collaboration between JPA and MARA. "
            "Must meet minimum SPM results as required by programme."
        ),
        "essay_prompts": [
            "What career do you aspire to and why?",
        ],
        "required_docs": ["transcript", "IC", "birth_certificate", "parent_IC"],
        "min_cgpa": None,
        "open_to": "Bumiputera",
        "field_of_study": "Any",
        "portal_url": "https://www.jpa.gov.my/biasiswa",
    },
    {
        "name": "MARA Young Talent Development Programme (YTP)",
        "provider": "Majlis Amanah Rakyat (MARA)",
        "amount": "Full sponsorship to top overseas universities",
        "deadline": date(2026, 4, 13),
        "eligibility_criteria": (
            "Bumiputera Malaysian citizens only. Outstanding SPM results — minimum 8A+. "
            "Excellent co-curricular record. Strong leadership qualities. "
            "Must agree to a bond period with MARA-linked entities."
        ),
        "essay_prompts": [
            "How will your overseas education uplift the Bumiputera community?",
            "Describe a leadership role you held and its impact.",
        ],
        "required_docs": ["transcript", "IC", "birth_certificate", "co-curriculum_cert"],
        "min_cgpa": None,
        "open_to": "Bumiputera",
        "field_of_study": "Any",
        "portal_url": "https://biasiswa.mara.gov.my",
    },
    {
        "name": "MARA Tertiary Education Sponsorship Programme (TESP)",
        "provider": "Majlis Amanah Rakyat (MARA)",
        "amount": "RM 25,000–55,000/year depending on institution",
        "deadline": date(2025, 5, 30),
        "eligibility_criteria": (
            "Bumiputera Malaysian citizens. Minimum CGPA 3.5 for degree applicants. "
            "Household income below RM 15,000/month. "
            "Must not be receiving any other full government scholarship simultaneously."
        ),
        "essay_prompts": [
            "What is your motivation for pursuing this field of study?",
            "How will your studies benefit the Bumiputera community?",
        ],
        "required_docs": ["transcript", "IC", "birth_certificate", "income_statement"],
        "min_cgpa": 3.5,
        "open_to": "Bumiputera",
        "field_of_study": "Any",
        "portal_url": "https://biasiswa.mara.gov.my",
    },
    {
        "name": "MARA Graduate Excellence Programme (GrEP)",
        "provider": "Majlis Amanah Rakyat (MARA)",
        "amount": "Postgraduate full sponsorship",
        "deadline": date(2025, 6, 30),
        "eligibility_criteria": (
            "Bumiputera Malaysian citizens. Must have completed a degree. "
            "Minimum CGPA 3.5 at degree level. Pursuing Masters or PhD. "
            "Priority to STEM, business, finance fields."
        ),
        "essay_prompts": [
            "Describe your research proposal and its significance to Malaysia.",
        ],
        "required_docs": ["transcript", "IC", "degree_cert", "research_proposal"],
        "min_cgpa": 3.5,
        "open_to": "Bumiputera",
        "field_of_study": "Any",
        "portal_url": "https://biasiswa.mara.gov.my",
    },
    {
        "name": "Yayasan Khazanah Global Scholarship",
        "provider": "Khazanah Nasional",
        "amount": "RM 60,000/year (full sponsorship)",
        "deadline": date(2025, 3, 31),
        "eligibility_criteria": (
            "Open to Malaysian citizens. Must have straight A's in SPM/STPM or equivalent. "
            "Minimum CGPA 3.8 for undergrad applicants. Must demonstrate leadership qualities "
            "and community involvement. Open to all races. Must not be bonded to any other scholarship."
        ),
        "essay_prompts": [
            "Why do you deserve this scholarship?",
            "Describe your career goals and how this scholarship helps you achieve them.",
            "Tell us about a time you demonstrated leadership.",
        ],
        "required_docs": ["transcript", "IC", "referee_letter", "personal_statement"],
        "min_cgpa": 3.8,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://yayasankhazanah.com.my/scholarships",
    },
    {
        "name": "Bank Negara Malaysia Kijang Scholarship (Undergraduate)",
        "provider": "Bank Negara Malaysia",
        "amount": "Full sponsorship + guaranteed internship",
        "deadline": date(2025, 4, 8),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.9. Interest in economics, finance, "
            "law, or related fields. Excellent communication skills. "
            "Open to all races. Must demonstrate intellectual curiosity and leadership."
        ),
        "essay_prompts": [
            "What is the biggest economic challenge Malaysia faces today?",
            "Describe your leadership experience and its impact.",
            "Why do you want a career in central banking or finance?",
        ],
        "required_docs": ["transcript", "IC", "referee_letter", "essay"],
        "min_cgpa": 3.9,
        "open_to": "All Malaysians",
        "field_of_study": "Economics / Finance / Law",
        "portal_url": "https://www.bnm.gov.my/kijang-scholarship",
    },
    {
        "name": "Bank Negara Malaysia Kijang Pre-University Scholarship",
        "provider": "Bank Negara Malaysia",
        "amount": "Full pre-university + degree sponsorship",
        "deadline": date(2026, 4, 8),
        "eligibility_criteria": (
            "Malaysian citizens. SPM leavers. Minimum 8A+ in SPM. "
            "Strong interest in economics, finance, actuarial science, or law. "
            "Open to all races. Excellent leadership and communication skills."
        ),
        "essay_prompts": [
            "Why are you interested in finance and economics?",
            "What change would you make to Malaysia's economy if you could?",
        ],
        "required_docs": ["transcript", "IC", "referee_letter"],
        "min_cgpa": None,
        "open_to": "All Malaysians",
        "field_of_study": "Economics / Finance / Law / Actuarial",
        "portal_url": "https://www.bnm.gov.my/kijang-scholarship",
    },
    {
        "name": "Biasiswa Perguruan Persekutuan (ISMP)",
        "provider": "Kementerian Pendidikan Malaysia",
        "amount": "Full teaching scholarship + guaranteed job placement",
        "deadline": date(2025, 4, 24),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.0 or equivalent SPM/STPM results. "
            "Passionate about teaching and education. "
            "Must commit to teach in Malaysian national schools upon graduation. "
            "Open to all races."
        ),
        "essay_prompts": [
            "Why do you want to become a teacher?",
            "How will you inspire the next generation of Malaysian students?",
        ],
        "required_docs": ["transcript", "IC", "referee_letter"],
        "min_cgpa": 3.0,
        "open_to": "All Malaysians",
        "field_of_study": "Education",
        "portal_url": "https://www.moe.gov.my",
    },
    {
        "name": "PNB Global Scholarship Award",
        "provider": "Permodalan Nasional Berhad (PNB) / Yayasan Tun Ismail",
        "amount": "Full overseas sponsorship + living allowance",
        "deadline": date(2026, 4, 8),
        "eligibility_criteria": (
            "Bumiputera Malaysian citizens. SPM leavers. Minimum 7A+ in SPM. "
            "Strong academic and leadership record. "
            "Must be willing to work with PNB or its subsidiaries after graduation."
        ),
        "essay_prompts": [
            "How will you contribute to Malaysia's financial sector?",
            "Describe your most meaningful extracurricular achievement.",
        ],
        "required_docs": ["transcript", "IC", "referee_letter", "co-curriculum_cert"],
        "min_cgpa": None,
        "open_to": "Bumiputera",
        "field_of_study": "Business / Finance / Economics / Law",
        "portal_url": "https://www.pnb.com.my/scholarship",
    },


    # ══════════════════════════════════════════════
    # 🏙️ STATE SCHOLARSHIPS
    # ══════════════════════════════════════════════

    {
        "name": "Biasiswa Kerajaan Negeri Sabah (BKNS)",
        "provider": "Sabah State Government",
        "amount": "RM 18,000–40,000/year",
        "deadline": date(2026, 4, 21),
        "eligibility_criteria": (
            "Must be a Sabahan citizen. Minimum CGPA 3.0. "
            "Household income below RM 8,000/month. "
            "Must be pursuing studies at a recognised local or overseas university. "
            "Open to all races originating from Sabah."
        ),
        "essay_prompts": [
            "How will you use your education to develop Sabah?",
        ],
        "required_docs": ["transcript", "IC", "birth_certificate", "income_statement"],
        "min_cgpa": 3.0,
        "open_to": "Sabahans",
        "field_of_study": "Any",
        "portal_url": "https://www.sabah.gov.my/biasiswa",
    },
    {
        "name": "Yayasan Sabah Scholarship",
        "provider": "Yayasan Sabah",
        "amount": "Up to RM 30,000/year",
        "deadline": date(2026, 5, 31),
        "eligibility_criteria": (
            "Sabah-origin Malaysian students. Open for Diploma, Degree, Master's and PhD. "
            "Must demonstrate financial need and academic merit. Open to all races in Sabah."
        ),
        "essay_prompts": [
            "What are your career aspirations and how will you give back to Sabah?",
        ],
        "required_docs": ["transcript", "IC", "birth_certificate", "income_statement", "referee_letter"],
        "min_cgpa": 2.5,
        "open_to": "Sabahans",
        "field_of_study": "Any",
        "portal_url": "https://www.yayasansabah.org.my",
    },
    {
        "name": "Yayasan Biasiswa Sarawak Tun Abdul Razak",
        "provider": "Yayasan Biasiswa Sarawak",
        "amount": "RM 18,000–40,000/year",
        "deadline": date(2025, 5, 31),
        "eligibility_criteria": (
            "Must be a Sarawakian citizen. Minimum CGPA 3.0. "
            "Household income below RM 8,000/month. "
            "Must be pursuing studies at a recognised university. Open to all races in Sarawak."
        ),
        "essay_prompts": [
            "How will you use your education to develop Sarawak?",
        ],
        "required_docs": ["transcript", "IC", "birth_certificate", "income_statement"],
        "min_cgpa": 3.0,
        "open_to": "Sarawakians",
        "field_of_study": "Any",
        "portal_url": "https://www.yayasanbiasiswasarawak.com",
    },
    {
        "name": "Penang Future Foundation Scholarship",
        "provider": "Penang State Government",
        "amount": "Up to RM 15,000/year",
        "deadline": date(2025, 7, 31),
        "eligibility_criteria": (
            "Must be a Penang-origin Malaysian. Minimum CGPA 3.5. "
            "Household income below RM 10,000/month. "
            "Pursuing degree at recognised local university. Open to all races from Penang."
        ),
        "essay_prompts": [
            "How will you contribute to Penang's growth as a tech and innovation hub?",
        ],
        "required_docs": ["transcript", "IC", "birth_certificate", "income_statement"],
        "min_cgpa": 3.5,
        "open_to": "Penangites",
        "field_of_study": "Any",
        "portal_url": "https://www.penang.gov.my/scholarship",
    },
    {
        "name": "Lembaga Zakat Selangor (LZS) Scholarship",
        "provider": "Lembaga Zakat Selangor",
        "amount": "Up to RM 12,000/year",
        "deadline": date(2025, 8, 31),
        "eligibility_criteria": (
            "Muslim Malaysian citizens residing in Selangor. Minimum CGPA 3.0. "
            "Household income below RM 5,000/month (asnaf category preferred). "
            "Pursuing degree at a recognised local university."
        ),
        "essay_prompts": [
            "How will your education benefit your community and the ummah?",
        ],
        "required_docs": ["transcript", "IC", "income_statement", "zakat_receipt"],
        "min_cgpa": 3.0,
        "open_to": "Muslim Selangorians",
        "field_of_study": "Any",
        "portal_url": "https://www.zakatselangor.com.my",
    },


    # ══════════════════════════════════════════════
    # 🏢 GLC (GOVERNMENT-LINKED COMPANY) SCHOLARSHIPS
    # ══════════════════════════════════════════════

    {
        "name": "PETRONAS Education Sponsorship Programme (PESP)",
        "provider": "PETRONAS",
        "amount": "Full tuition + RM 1,400/month stipend",
        "deadline": date(2025, 3, 15),
        "eligibility_criteria": (
            "Malaysian citizens. STEM subjects — minimum 5A's in SPM including "
            "Add Maths, Physics, Chemistry. CGPA 3.7 and above for undergrads. "
            "Must be willing to work with PETRONAS or its subsidiaries. Open to all races."
        ),
        "essay_prompts": [
            "Why do you want to work in the energy sector?",
            "Describe a STEM project that sparked your passion.",
            "Where do you see yourself in 10 years?",
        ],
        "required_docs": ["transcript", "IC", "referee_letter", "co-curriculum_cert"],
        "min_cgpa": 3.7,
        "open_to": "All Malaysians",
        "field_of_study": "STEM",
        "portal_url": "https://www.petronas.com/careers/student-graduate/scholarship",
    },
    {
        "name": "Yayasan Tenaga Nasional (TNB) Scholarship",
        "provider": "Tenaga Nasional Berhad (TNB)",
        "amount": "Full tuition + RM 1,000/month allowance",
        "deadline": date(2025, 6, 30),
        "eligibility_criteria": (
            "Malaysian citizens. Must be pursuing engineering (electrical preferred), "
            "computer science, or IT. Minimum CGPA 3.5. "
            "Active in co-curricular activities. Open to all races. "
            "Must agree to work with TNB after graduation."
        ),
        "essay_prompts": [
            "How will you contribute to Malaysia's energy transition?",
            "Describe a problem you solved using engineering or technology.",
        ],
        "required_docs": ["transcript", "IC", "co-curriculum_cert", "referee_letter"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Engineering / Computer Science",
        "portal_url": "https://ytn.com.my",
    },
    {
        "name": "Yayasan Telekom Malaysia Future Leaders Scholarship",
        "provider": "Telekom Malaysia (TM)",
        "amount": "Full tuition + RM 1,200/month living allowance",
        "deadline": date(2025, 5, 31),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.5 or equivalent. "
            "Pursuing IT, computer science, engineering, or business. "
            "Must demonstrate leadership and community involvement. "
            "Open to all races. Bond to TM after graduation."
        ),
        "essay_prompts": [
            "How will digital technology transform Malaysia in the next decade?",
            "Describe a time you led a team and the outcome.",
        ],
        "required_docs": ["transcript", "IC", "referee_letter", "co-curriculum_cert"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "IT / Engineering / Business",
        "portal_url": "https://www.tm.com.my/scholarship",
    },
    {
        "name": "Yayasan Sime Darby Undergraduate Excellence Scholarship",
        "provider": "Yayasan Sime Darby (YSD)",
        "amount": "Full tuition + allowances + internship at Sime Darby",
        "deadline": date(2025, 4, 30),
        "eligibility_criteria": (
            "Malaysian citizens. Age 25 or below. "
            "Minimum CGPA 3.30 from STPM/Pre-U/Foundation/Matriculation. "
            "Household income RM 11,000 and below. "
            "Strong leadership through school/national/global positions. "
            "Active in community service. Open to all races."
        ),
        "essay_prompts": [
            "Describe your most significant leadership experience.",
            "What is your vision for Malaysia's sustainability future?",
            "How has community service shaped who you are?",
        ],
        "required_docs": ["transcript", "IC", "income_statement", "co-curriculum_cert", "referee_letter"],
        "min_cgpa": 3.3,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://www.yayasansimedarby.com/scholarship-information",
    },
    {
        "name": "Yayasan UEM Scholarship",
        "provider": "Yayasan UEM (UEM Group)",
        "amount": "Full tuition + RM 1,000/month stipend",
        "deadline": date(2025, 5, 15),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.5. Pursuing engineering, "
            "quantity surveying, architecture, business, or IT. "
            "Active in co-curricular activities. Open to all races. "
            "Bond with UEM Group companies after graduation."
        ),
        "essay_prompts": [
            "Why do you want a career in infrastructure and construction?",
            "Describe a project you led or contributed to.",
        ],
        "required_docs": ["transcript", "IC", "referee_letter", "co-curriculum_cert"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Engineering / Architecture / Business / IT",
        "portal_url": "https://www.uem.com.my/scholarship",
    },
    {
        "name": "Shell Malaysia Scholarship",
        "provider": "Shell Malaysia",
        "amount": "Full tuition + RM 1,500/month + gadget allowance",
        "deadline": date(2025, 4, 30),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.5 or 3A in A-Level. "
            "Pursuing chemical/mechanical/electrical engineering, geoscience, IT, or business. "
            "Strong co-curricular record. Excellent English. Open to all races."
        ),
        "essay_prompts": [
            "How does energy transition affect Malaysia and what is your role in it?",
            "Describe a challenge you solved creatively.",
            "Where do you see yourself in 5 years?",
        ],
        "required_docs": ["transcript", "IC", "referee_letter", "co-curriculum_cert"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Engineering / Geoscience / IT / Business",
        "portal_url": "https://www.shell.com.my/careers/students-and-graduates/scholarships.html",
    },


    # ══════════════════════════════════════════════
    # 🏦 BANKING & FINANCIAL INSTITUTIONS
    # ══════════════════════════════════════════════

    {
        "name": "Maybank Scholarship",
        "provider": "Malayan Banking Berhad (Maybank)",
        "amount": "Full tuition + RM 1,200/month living allowance",
        "deadline": date(2025, 4, 15),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.6. Pursuing business, finance, accounting, "
            "economics, or IT. Strong communication and interpersonal skills. "
            "Demonstrated interest in banking and financial services. Open to all races."
        ),
        "essay_prompts": [
            "Why do you want a career in banking?",
            "Tell us about a time you worked in a team to solve a problem.",
        ],
        "required_docs": ["transcript", "IC", "referee_letter"],
        "min_cgpa": 3.6,
        "open_to": "All Malaysians",
        "field_of_study": "Business / Finance / IT",
        "portal_url": "https://www.maybank.com/scholarship",
    },
    {
        "name": "CIMB Scholarship",
        "provider": "CIMB Group",
        "amount": "Full tuition + monthly allowance",
        "deadline": date(2025, 5, 31),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.5. Pursuing finance, banking, accounting, "
            "economics, business, or technology. Strong communication skills. "
            "Active in co-curricular activities. Open to all races."
        ),
        "essay_prompts": [
            "What does CIMB's role in ASEAN banking mean to you?",
            "Describe how you demonstrated initiative in a team setting.",
        ],
        "required_docs": ["transcript", "IC", "referee_letter"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Finance / Business / Technology",
        "portal_url": "https://www.cimb.com/careers/scholarship",
    },
    {
        "name": "Hong Leong Foundation Scholarship",
        "provider": "Hong Leong Foundation",
        "amount": "Up to RM 50,000 total",
        "deadline": date(2025, 6, 30),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.5. "
            "Pursuing any degree at a recognised Malaysian university. "
            "Financial need considered — household income below RM 8,000/month. "
            "Open to all races."
        ),
        "essay_prompts": [
            "How will this scholarship help you achieve your goals?",
            "Describe your biggest challenge and how you overcame it.",
        ],
        "required_docs": ["transcript", "IC", "income_statement", "referee_letter"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://www.hlf.com.my/scholarship",
    },
    {
        "name": "OSK Foundation Scholarship",
        "provider": "OSK Foundation",
        "amount": "Up to RM 15,000/year",
        "deadline": date(2025, 5, 31),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.5. "
            "Pursuing finance, business, economics, law, engineering, or architecture. "
            "Demonstrated financial need. Open to all races."
        ),
        "essay_prompts": [
            "How will your studies contribute to Malaysia's economy?",
        ],
        "required_docs": ["transcript", "IC", "income_statement"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Finance / Business / Engineering / Law",
        "portal_url": "https://www.oskfoundation.com.my",
    },
    {
        "name": "OCBC Scholarship Malaysia",
        "provider": "OCBC Bank Malaysia",
        "amount": "Full tuition + internship + fast-track hiring",
        "deadline": date(2025, 4, 30),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.5. Pursuing banking, finance, business, "
            "economics, IT, or data science. Excellent analytical and interpersonal skills. "
            "Open to all races."
        ),
        "essay_prompts": [
            "Why do you want to work in financial services?",
            "Describe your experience with data or technology.",
        ],
        "required_docs": ["transcript", "IC", "referee_letter"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Finance / Business / IT / Data Science",
        "portal_url": "https://www.ocbc.com.my/scholarship",
    },
    {
        "name": "Yayasan Bank Rakyat Scholarship",
        "provider": "Bank Rakyat",
        "amount": "Up to RM 20,000/year",
        "deadline": date(2025, 6, 30),
        "eligibility_criteria": (
            "Bumiputera Malaysian citizens. Minimum CGPA 3.0. "
            "Pursuing finance, business, Islamic banking, or related fields. "
            "Household income below RM 6,000/month preferred."
        ),
        "essay_prompts": [
            "How will Islamic finance benefit Malaysia's economy?",
        ],
        "required_docs": ["transcript", "IC", "income_statement"],
        "min_cgpa": 3.0,
        "open_to": "Bumiputera",
        "field_of_study": "Finance / Business / Islamic Banking",
        "portal_url": "https://www.bankrakyat.com.my/scholarship",
    },
    {
        "name": "PIDM Undergraduate Scholarship",
        "provider": "Perbadanan Insurans Deposit Malaysia (PIDM)",
        "amount": "Full tuition + RM 1,500/month allowance",
        "deadline": date(2025, 5, 15),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.7. Pursuing finance, economics, accounting, "
            "law, actuarial science, or IT. Strong academic and leadership track record. "
            "Open to all races."
        ),
        "essay_prompts": [
            "What is the role of deposit insurance in financial stability?",
            "Describe a time you took initiative to solve a problem.",
        ],
        "required_docs": ["transcript", "IC", "referee_letter"],
        "min_cgpa": 3.7,
        "open_to": "All Malaysians",
        "field_of_study": "Finance / Economics / Law / Actuarial / IT",
        "portal_url": "https://www.pidm.gov.my/scholarship",
    },
    {
        "name": "Cagamas Scholarship",
        "provider": "Cagamas Berhad",
        "amount": "Full tuition + monthly allowance",
        "deadline": date(2025, 5, 31),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.5. "
            "Pursuing finance, banking, economics, accounting, or actuarial science. "
            "Open to all races. Must demonstrate strong analytical skills."
        ),
        "essay_prompts": [
            "What is the importance of the secondary mortgage market in Malaysia?",
        ],
        "required_docs": ["transcript", "IC", "referee_letter"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Finance / Economics / Actuarial",
        "portal_url": "https://www.cagamas.com.my/scholarship",
    },
    {
        "name": "Great Eastern Life Scholarship",
        "provider": "Great Eastern Life Malaysia",
        "amount": "Up to RM 15,000/year + internship",
        "deadline": date(2025, 6, 30),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.3. "
            "Pursuing actuarial science, finance, business, economics, or IT. "
            "Open to all races."
        ),
        "essay_prompts": [
            "Why are you interested in the insurance and financial services industry?",
        ],
        "required_docs": ["transcript", "IC"],
        "min_cgpa": 3.3,
        "open_to": "All Malaysians",
        "field_of_study": "Actuarial / Finance / Business / IT",
        "portal_url": "https://www.greateasternlife.com/my/scholarship",
    },


    # ══════════════════════════════════════════════
    # 🏭 CORPORATE & PRIVATE SCHOLARSHIPS
    # ══════════════════════════════════════════════

    {
        "name": "Gamuda Scholarship",
        "provider": "Gamuda Berhad",
        "amount": "Full tuition + RM 1,200/month + guaranteed placement",
        "deadline": date(2025, 5, 31),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.5 or equivalent. "
            "Pursuing civil, mechanical, electrical engineering, IT, or quantity surveying. "
            "Active in co-curricular activities. Open to all races."
        ),
        "essay_prompts": [
            "How will you contribute to Malaysia's infrastructure development?",
            "Describe an engineering problem you found fascinating and why.",
        ],
        "required_docs": ["transcript", "IC", "co-curriculum_cert", "referee_letter"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Engineering / IT / Quantity Surveying",
        "portal_url": "https://www.gamuda.com.my/scholarship",
    },
    {
        "name": "YTL Foundation Scholarship Programme",
        "provider": "YTL Foundation",
        "amount": "Up to RM 20,000/year + RM 2,000 learning aids",
        "deadline": date(2025, 6, 30),
        "eligibility_criteria": (
            "Malaysian citizens. STPM/Matriculation/A-Level or equivalent. "
            "Pursuing any degree at a recognised public or private university. "
            "Must demonstrate financial need and academic merit. Open to all races."
        ),
        "essay_prompts": [
            "How has your background shaped your ambitions?",
            "What impact do you hope to make on Malaysia?",
        ],
        "required_docs": ["transcript", "IC", "income_statement", "referee_letter"],
        "min_cgpa": 3.0,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://ytlfoundation.org/scholarship",
    },
    {
        "name": "Jeffrey Cheah Foundation Scholarship (Sunway)",
        "provider": "Jeffrey Cheah Foundation / Sunway Group",
        "amount": "Partial to full tuition at Sunway University/College",
        "deadline": date(2025, 7, 31),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.5 or equivalent. "
            "Pursuing any programme at Sunway University or Sunway College. "
            "Strong academic merit. Open to all races."
        ),
        "essay_prompts": [
            "What does Jeffrey Cheah's legacy of giving back mean to you?",
            "Describe your community involvement and its impact.",
        ],
        "required_docs": ["transcript", "IC", "referee_letter"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://scholarship.sunway.edu.my",
    },
    {
        "name": "Kuok Foundation Scholarship",
        "provider": "Kuok Foundation Berhad",
        "amount": "Full tuition + living allowance",
        "deadline": date(2025, 5, 31),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.5. "
            "Pursuing any discipline at a recognised university. "
            "Financial need — household income below RM 10,000/month. Open to all races."
        ),
        "essay_prompts": [
            "How will higher education help you serve your community?",
            "Describe a personal challenge that has defined your character.",
        ],
        "required_docs": ["transcript", "IC", "income_statement", "referee_letter"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://www.kuokfoundation.com",
    },
    {
        "name": "The Star Education Fund Scholarship",
        "provider": "Star Media Group",
        "amount": "Partial to full tuition coverage",
        "deadline": date(2025, 6, 30),
        "eligibility_criteria": (
            "Malaysian citizens. Not more than 25 years old. "
            "Excel in extra-curricular activities or active in sports. "
            "Not bonded to any other scholarship. Reasonably good SPM/STPM/UEC results. "
            "Open to all races."
        ),
        "essay_prompts": [
            "How has media or journalism influenced your life?",
            "Describe your proudest extracurricular achievement.",
        ],
        "required_docs": ["transcript", "IC", "co-curriculum_cert"],
        "min_cgpa": 3.0,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://www.star.com.my/education-fund",
    },
    {
        "name": "Maxis Scholarship Programme",
        "provider": "Maxis Berhad",
        "amount": "Full tuition + RM 1,500/month + gadget allowance",
        "deadline": date(2025, 5, 15),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.5. "
            "Pursuing IT, computer science, data science, engineering, or business. "
            "Passionate about technology and digital transformation. Open to all races."
        ),
        "essay_prompts": [
            "How will 5G change Malaysia and what is your role in it?",
            "Describe a tech project you built or contributed to.",
        ],
        "required_docs": ["transcript", "IC", "referee_letter"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "IT / Engineering / Data Science / Business",
        "portal_url": "https://www.maxis.com.my/scholarship",
    },
    {
        "name": "Axiata Foundation All-Star Bestari Scholarship",
        "provider": "Axiata Foundation",
        "amount": "Full tuition + monthly allowance + mentorship",
        "deadline": date(2025, 5, 31),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.5. "
            "Pursuing IT, engineering, data science, business, or finance. "
            "Strong academic and leadership record. Open to all races."
        ),
        "essay_prompts": [
            "How will digital connectivity improve lives in Malaysia?",
            "Describe your biggest achievement in technology or innovation.",
        ],
        "required_docs": ["transcript", "IC", "co-curriculum_cert", "referee_letter"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "IT / Engineering / Business / Finance",
        "portal_url": "https://www.axiata.com/scholarship",
    },
    {
        "name": "Top Glove Foundation Scholarship",
        "provider": "Top Glove Foundation",
        "amount": "Up to RM 12,000/year",
        "deadline": date(2025, 7, 31),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.0. "
            "Pursuing any degree at a recognised Malaysian university. "
            "Financial need — household income below RM 5,000/month. Open to all races."
        ),
        "essay_prompts": [
            "How has financial hardship shaped your determination?",
        ],
        "required_docs": ["transcript", "IC", "income_statement"],
        "min_cgpa": 3.0,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://www.topglovefoundation.org",
    },
    {
        "name": "IJM Scholarship",
        "provider": "IJM Corporation Berhad",
        "amount": "Full tuition + RM 1,000/month allowance",
        "deadline": date(2025, 5, 31),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.3. "
            "Pursuing civil/structural engineering, quantity surveying, architecture, or business. "
            "Must be willing to work with IJM after graduation. Open to all races."
        ),
        "essay_prompts": [
            "What infrastructure project in Malaysia inspires you most and why?",
        ],
        "required_docs": ["transcript", "IC", "referee_letter"],
        "min_cgpa": 3.3,
        "open_to": "All Malaysians",
        "field_of_study": "Engineering / Architecture / Business",
        "portal_url": "https://www.ijm.com/scholarship",
    },
    {
        "name": "IOI Group Scholarship",
        "provider": "IOI Group",
        "amount": "Full tuition + RM 1,000/month allowance",
        "deadline": date(2025, 6, 30),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.3. "
            "Pursuing plantation science, chemical engineering, food science, business, or IT. "
            "Open to all races."
        ),
        "essay_prompts": [
            "What is the future of sustainable palm oil and Malaysia's role in it?",
        ],
        "required_docs": ["transcript", "IC", "referee_letter"],
        "min_cgpa": 3.3,
        "open_to": "All Malaysians",
        "field_of_study": "Agriculture / Engineering / Business / IT",
        "portal_url": "https://www.ioigroup.com/scholarship",
    },
    {
        "name": "Lion-Parkson Foundation Scholarship",
        "provider": "Lion-Parkson Foundation",
        "amount": "Up to RM 10,000/year",
        "deadline": date(2025, 6, 30),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.0. "
            "Pursuing any degree at a recognised Malaysian university. "
            "Financial need — household income below RM 6,000/month. Open to all races."
        ),
        "essay_prompts": [
            "How will education transform your family's future?",
        ],
        "required_docs": ["transcript", "IC", "income_statement"],
        "min_cgpa": 3.0,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://www.lionparkson.com/foundation",
    },
    {
        "name": "DRB-HICOM Degree Scholarship",
        "provider": "DRB-HICOM Berhad",
        "amount": "Full tuition + allowances",
        "deadline": date(2025, 5, 31),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.3 or equivalent. "
            "Pursuing mechanical/automotive engineering, business, IT, or finance. "
            "Must agree to bond with DRB-HICOM. Open to all races."
        ),
        "essay_prompts": [
            "What is the future of the Malaysian automotive industry?",
            "Describe how you have demonstrated perseverance.",
        ],
        "required_docs": ["transcript", "IC", "co-curriculum_cert", "referee_letter"],
        "min_cgpa": 3.3,
        "open_to": "All Malaysians",
        "field_of_study": "Engineering / Business / IT",
        "portal_url": "https://www.drb-hicom.com/scholarship",
    },
    {
        "name": "Yayasan KLK Scholarship",
        "provider": "Kuala Lumpur Kepong Berhad (KLK)",
        "amount": "Up to RM 15,000/year",
        "deadline": date(2025, 6, 30),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.3. "
            "Pursuing plantation science, chemical engineering, food technology, business, or IT. "
            "Open to all races. Preference for students from plantation communities."
        ),
        "essay_prompts": [
            "How can Malaysia's plantation sector evolve sustainably?",
        ],
        "required_docs": ["transcript", "IC", "income_statement"],
        "min_cgpa": 3.3,
        "open_to": "All Malaysians",
        "field_of_study": "Agriculture / Engineering / Business",
        "portal_url": "https://www.klk.com.my/scholarship",
    },
    {
        "name": "Generali Malaysia Volare Scholarship",
        "provider": "Generali Malaysia",
        "amount": "Up to RM 20,000/year + mentorship + internship",
        "deadline": date(2025, 5, 31),
        "eligibility_criteria": (
            "Malaysian citizens. Minimum CGPA 3.5. "
            "Pursuing actuarial science, finance, business, economics, or IT. "
            "Open to all races. Strong interest in insurance and risk management."
        ),
        "essay_prompts": [
            "Why does Malaysia need better insurance awareness?",
            "Where do you see yourself in financial services in 10 years?",
        ],
        "required_docs": ["transcript", "IC", "referee_letter"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Actuarial / Finance / Business / IT",
        "portal_url": "https://www.generali.com.my/scholarship",
    },
    {
        "name": "Budimas Charitable Foundation Scholarship",
        "provider": "Budimas Charitable Foundation",
        "amount": "Up to RM 10,000/year",
        "deadline": date(2025, 8, 31),
        "eligibility_criteria": (
            "Malaysian citizens from underprivileged backgrounds. Minimum CGPA 2.5. "
            "Household income below RM 4,000/month. "
            "Pursuing any degree at a recognised Malaysian university. Open to all races."
        ),
        "essay_prompts": [
            "How has your background shaped your determination to succeed?",
        ],
        "required_docs": ["transcript", "IC", "income_statement"],
        "min_cgpa": 2.5,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://www.budimas.org.my",
    },


    # ══════════════════════════════════════════════
    # 🎓 UNIVERSITY-SPECIFIC SCHOLARSHIPS
    # ══════════════════════════════════════════════

    # ── TAYLOR'S UNIVERSITY & COLLEGE ─────────────
    {
        "name": "Taylor's Excellence Award (Merit Scholarship)",
        "provider": "Taylor's University",
        "amount": "Up to 100% tuition waiver — scales with your results",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "Malaysian full-time students. Must have STPM/Matriculation/Foundation/Diploma with "
            "minimum CGPA 3.50; or A-Level minimum 3As; or UEC minimum 7As. "
            "The higher your results, the higher the award percentage. "
            "Must not be receiving another full scholarship with a bond. Open to all races. "
            "Applicable for 2025 intakes, subject to availability."
        ),
        "essay_prompts": [
            "What motivates you to pursue your chosen field of study?",
            "How will a Taylor's education help you achieve your ambitions?",
        ],
        "required_docs": ["transcript", "IC", "offer_letter"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://university.taylors.edu.my/en/study/scholarships-and-financial-aid/undergraduate-scholarships.html",
    },
    {
        "name": "Taylor's Talent Scholarship",
        "provider": "Taylor's University / Taylor's College",
        "amount": "Partial to full tuition waiver based on talent level",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "Malaysian students. Recognised achievement in arts, music, performing arts, "
            "design, or creative fields. Portfolio or audition required. "
            "Open to all races. No specific CGPA requirement — talent is the main criterion."
        ),
        "essay_prompts": [
            "Describe your artistic journey and what inspired your talent.",
            "How will you use your creative abilities to contribute to Malaysia?",
        ],
        "required_docs": ["transcript", "IC", "portfolio_or_audition_video"],
        "min_cgpa": None,
        "open_to": "All Malaysians",
        "field_of_study": "Arts / Design / Music / Creative",
        "portal_url": "https://university.taylors.edu.my/en/study/scholarships-and-financial-aid/undergraduate-scholarships.html",
    },
    {
        "name": "Taylor's Sports Scholarship",
        "provider": "Taylor's University / Taylor's College",
        "amount": "Partial to full tuition waiver based on sports achievement",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "Malaysian students. Must have represented Malaysia or state at national/international level. "
            "Recognised achievements in sports competitions. Open to all races. "
            "No specific CGPA minimum — sporting achievement is the main criterion."
        ),
        "essay_prompts": [
            "Describe your sports journey and your highest achievement.",
            "How has sport shaped your character and discipline?",
        ],
        "required_docs": ["transcript", "IC", "sports_cert", "sports_achievement_proof"],
        "min_cgpa": None,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://university.taylors.edu.my/en/study/scholarships-and-financial-aid/undergraduate-scholarships.html",
    },
    {
        "name": "Taylor's Community Scholarship",
        "provider": "Taylor's University",
        "amount": "Partial tuition waiver",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "Malaysian full-time students. Minimum CGPA 3.40 in STPM or equivalent "
            "(A-Levels, Matriculation, Foundation, Diploma, UEC). "
            "Must demonstrate financial need — proof of low household income required. "
            "Open to all races."
        ),
        "essay_prompts": [
            "How has your community shaped who you are today?",
            "What do you hope to give back to your community after graduating?",
        ],
        "required_docs": ["transcript", "IC", "income_statement"],
        "min_cgpa": 3.4,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://university.taylors.edu.my/en/study/scholarships-and-financial-aid/undergraduate-scholarships.html",
    },

    # ── MONASH UNIVERSITY MALAYSIA ─────────────────
    {
        "name": "Monash University Malaysia Merit Scholarship (New Students)",
        "provider": "Monash University Malaysia",
        "amount": "RM 8,000–10,000 tuition fee waiver per year",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "Open to Malaysian and international students. "
            "Applying for any Bachelor Degree course except Medicine and Pharmacy. "
            "Must have outstanding results in STPM/A-Level/Foundation or equivalent. "
            "Automatically considered when you apply for admission — no separate application needed. "
            "Must maintain satisfactory academic progress to keep the scholarship."
        ),
        "essay_prompts": [],
        "required_docs": ["transcript", "IC", "offer_letter"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Any (except Medicine & Pharmacy)",
        "portal_url": "https://www.monash.edu.my/student-services/financial-assistance/scholarships-and-study-loans/merit-scholarships",
    },
    {
        "name": "Monash High Achiever Award (Continuing Students)",
        "provider": "Monash University Malaysia",
        "amount": "RM 10,000 tuition fee waiver per year",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "Current Monash Malaysia undergraduate students only. "
            "Must have completed 2 continuous semesters with 48 credit points. "
            "Must have achieved average score of 80% and above from 8 units completed. "
            "Must fall within the top 1% of scorers in the school population. "
            "Must enrol with 24 credit points for the current semester. "
            "Cannot be receiving another full scholarship (PTPTN excluded)."
        ),
        "essay_prompts": [],
        "required_docs": ["transcript", "IC"],
        "min_cgpa": 3.7,
        "open_to": "All Malaysians",
        "field_of_study": "Any (except Medicine & Pharmacy)",
        "portal_url": "https://www.monash.edu.my/student-services/financial-assistance/scholarships-and-study-loans/merit-scholarships",
    },
    {
        "name": "Monash University Malaysia Need-Based Bursary",
        "provider": "Monash University Malaysia",
        "amount": "Up to 100% tuition waiver + RM 2,000/month stipend + laptop",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "Malaysian citizens or permanent residents only. "
            "Must come from low-income or underrepresented backgrounds. "
            "Demonstrates clear financial hardship. "
            "Must be a full-time undergraduate student at Monash Malaysia."
        ),
        "essay_prompts": [
            "Describe your financial situation and how it has affected your education journey.",
            "What are your career goals and how will Monash help you achieve them?",
        ],
        "required_docs": ["transcript", "IC", "income_statement"],
        "min_cgpa": 3.0,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://www.monash.edu.my/student-services/financial-assistance",
    },

    # ── UNIVERSITY OF NOTTINGHAM MALAYSIA ──────────
    {
        "name": "University of Nottingham Malaysia Excellence Scholarship",
        "provider": "University of Nottingham Malaysia",
        "amount": "Up to 50% tuition fee reduction",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "Malaysian and international students. Outstanding academic achievement — "
            "minimum CGPA 3.5 or equivalent A-Level/Foundation results. "
            "Applying for any undergraduate degree at UNM. Open to all races."
        ),
        "essay_prompts": [
            "Why did you choose your field of study and what do you hope to achieve?",
        ],
        "required_docs": ["transcript", "IC", "offer_letter"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://www.nottingham.edu.my/Study/Scholarships/index.aspx",
    },

    # ── SUNWAY UNIVERSITY ──────────────────────────
    {
        "name": "Sunway University Academic Excellence Scholarship",
        "provider": "Sunway University",
        "amount": "Up to 100% tuition waiver based on results",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "Malaysian and international students. Minimum CGPA 3.5 or 9A's in SPM. "
            "Pursuing any undergraduate programme at Sunway University. "
            "Must maintain required CGPA to keep scholarship each semester. Open to all races."
        ),
        "essay_prompts": [
            "What inspired you to pursue your chosen course at Sunway?",
        ],
        "required_docs": ["transcript", "IC"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://university.sunway.edu.my/scholarships",
    },

    # ── UTAR (UNIVERSITI TUNKU ABDUL RAHMAN) ───────
    {
        "name": "UTAR Merit Scholarship",
        "provider": "Universiti Tunku Abdul Rahman (UTAR)",
        "amount": "25%–100% tuition fee waiver",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "Malaysian students. Minimum 7As in SPM or CGPA 3.0 and above in Foundation/Diploma. "
            "Open to all races. Must be pursuing a full-time degree at UTAR. "
            "Must maintain minimum CGPA to retain scholarship each semester."
        ),
        "essay_prompts": [
            "Describe an academic or personal challenge you have overcome.",
        ],
        "required_docs": ["transcript", "IC"],
        "min_cgpa": 3.0,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://www.utar.edu.my/scholarship",
    },
    {
        "name": "UTAR Financial Aid Bursary",
        "provider": "Universiti Tunku Abdul Rahman (UTAR)",
        "amount": "Partial tuition subsidy based on income level",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "Malaysian students with household income below RM 5,000/month. "
            "Minimum CGPA 2.0. Full-time undergraduate students at UTAR only. "
            "Open to all races."
        ),
        "essay_prompts": [
            "How has financial hardship shaped your determination to pursue higher education?",
        ],
        "required_docs": ["transcript", "IC", "income_statement"],
        "min_cgpa": 2.0,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://www.utar.edu.my/scholarship",
    },

    # ── CURTIN MALAYSIA ────────────────────────────
    {
        "name": "Curtin Malaysia Merit Scholarship",
        "provider": "Curtin University Malaysia",
        "amount": "Up to 50% tuition waiver",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "Malaysian and international students. Minimum CGPA 3.5 in Foundation/Diploma "
            "or minimum 5As in SPM. Pursuing any undergraduate degree at Curtin Malaysia. "
            "Open to all races. Must maintain CGPA to keep scholarship."
        ),
        "essay_prompts": [
            "What are your career aspirations and how will your studies at Curtin help?",
        ],
        "required_docs": ["transcript", "IC"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://www.curtin.edu.my/admissions/scholarships/",
    },

    # ── SWINBURNE UNIVERSITY SARAWAK ───────────────
    {
        "name": "Swinburne Sarawak Merit Scholarship",
        "provider": "Swinburne University of Technology Sarawak",
        "amount": "Up to 50% tuition fee waiver",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "Malaysian students, preference for Sarawakians. "
            "Minimum CGPA 3.5 or 5As in SPM. "
            "Pursuing engineering, IT, business, or science at Swinburne Sarawak. Open to all races."
        ),
        "essay_prompts": [
            "How will your studies contribute to Sarawak's development?",
        ],
        "required_docs": ["transcript", "IC"],
        "min_cgpa": 3.5,
        "open_to": "Sarawakians / All Malaysians",
        "field_of_study": "Engineering / IT / Business / Science",
        "portal_url": "https://www.swinburne.edu.my/study/scholarships",
    },

    # ── HERIOT-WATT UNIVERSITY MALAYSIA ───────────
    {
        "name": "Heriot-Watt Malaysia Excellence Scholarship",
        "provider": "Heriot-Watt University Malaysia",
        "amount": "Up to 50% tuition fee waiver",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "Malaysian and international students. Outstanding results — minimum CGPA 3.5 "
            "or equivalent A-Level/Foundation. Pursuing any undergraduate degree at HWU Malaysia. "
            "Open to all races."
        ),
        "essay_prompts": [
            "Why did you choose Heriot-Watt and your field of study?",
        ],
        "required_docs": ["transcript", "IC"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Engineering / Business / Design",
        "portal_url": "https://www.hw.ac.uk/malaysia/study/scholarships.htm",
    },

    # ── APU (ASIA PACIFIC UNIVERSITY) ─────────────
    {
        "name": "APU Merit Scholarship",
        "provider": "Asia Pacific University of Technology & Innovation (APU)",
        "amount": "Up to 100% tuition waiver",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "ASEAN citizens (including Malaysians). Minimum CGPA 3.25/4.0 or equivalent. "
            "Excellent academic track record and active in co-curricular activities. "
            "Must not be a recipient of any other scholarship with a service bond. "
            "Pursuing business, IT, engineering, or science at APU."
        ),
        "essay_prompts": [
            "How will technology shape Malaysia's future and what is your role in it?",
        ],
        "required_docs": ["transcript", "IC"],
        "min_cgpa": 3.25,
        "open_to": "All Malaysians",
        "field_of_study": "IT / Engineering / Business / Science",
        "portal_url": "https://www.apu.edu.my/scholarships",
    },

    # ── MMU (MULTIMEDIA UNIVERSITY) ───────────────
    {
        "name": "MMU Academic Excellence Scholarship",
        "provider": "Multimedia University (MMU)",
        "amount": "25%–100% tuition fee waiver",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "Malaysian students. Minimum CGPA 3.5 in Foundation/Diploma or 8As in SPM. "
            "Pursuing any undergraduate programme at MMU Cyberjaya or Melaka campus. "
            "Open to all races. Must maintain CGPA to renew each semester."
        ),
        "essay_prompts": [
            "How will your chosen field of study help Malaysia's digital economy?",
        ],
        "required_docs": ["transcript", "IC"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://www.mmu.edu.my/scholarship",
    },

    # ── UCSI UNIVERSITY ────────────────────────────
    {
        "name": "UCSI University Excellence Scholarship",
        "provider": "UCSI University",
        "amount": "Up to 100% tuition waiver based on academic results",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "Malaysian and ASEAN students. Minimum CGPA 3.5 or equivalent SPM/STPM results. "
            "Pursuing any undergraduate programme at UCSI. Open to all races. "
            "Must maintain minimum CGPA each semester to retain scholarship."
        ),
        "essay_prompts": [
            "Describe your career goals and how UCSI will help you get there.",
        ],
        "required_docs": ["transcript", "IC"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://www.ucsiuniversity.edu.my/scholarships",
    },

    # ── HELP UNIVERSITY ────────────────────────────
    {
        "name": "HELP University Merit Scholarship",
        "provider": "HELP University",
        "amount": "Up to 100% tuition waiver",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "Malaysian students. Minimum CGPA 3.5 in Foundation/Diploma or 7As in SPM. "
            "Pursuing any full-time undergraduate programme at HELP University. "
            "Open to all races. Must maintain required GPA to continue scholarship."
        ),
        "essay_prompts": [
            "What drives you to pursue higher education and your chosen field?",
        ],
        "required_docs": ["transcript", "IC"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://www.help.edu.my/scholarship",
    },

    # ── INTI INTERNATIONAL UNIVERSITY ─────────────
    {
        "name": "INTI International University Academic Scholarship",
        "provider": "INTI International University",
        "amount": "Up to 50% tuition waiver",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "Malaysian and international students. Minimum CGPA 3.3 or 5As in SPM. "
            "Pursuing any programme at INTI campuses nationwide. Open to all races."
        ),
        "essay_prompts": [
            "How do you plan to make a difference in your chosen industry?",
        ],
        "required_docs": ["transcript", "IC"],
        "min_cgpa": 3.3,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://www.newinti.edu.my/scholarships",
    },

    # ── SEGi UNIVERSITY ────────────────────────────
    {
        "name": "SEGi University Merit Scholarship",
        "provider": "SEGi University",
        "amount": "Up to 50% tuition fee reduction",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "Malaysian students. Minimum 5As in SPM or CGPA 3.0 in Foundation/Diploma. "
            "Pursuing any undergraduate programme at SEGi. Open to all races."
        ),
        "essay_prompts": [
            "What are your career plans after graduating from SEGi?",
        ],
        "required_docs": ["transcript", "IC"],
        "min_cgpa": 3.0,
        "open_to": "All Malaysians",
        "field_of_study": "Any",
        "portal_url": "https://www.segi.edu.my/scholarships",
    },

    # ── IMU (INTERNATIONAL MEDICAL UNIVERSITY) ─────
    {
        "name": "IMU Merit Scholarship",
        "provider": "International Medical University (IMU)",
        "amount": "Up to 20% tuition fee waiver",
        "deadline": date(2025, 12, 31),
        "eligibility_criteria": (
            "Malaysian and international students. Minimum CGPA 3.7 in Foundation/A-Level or "
            "equivalent. Pursuing Medicine, Pharmacy, Dentistry, Nursing, or Health Sciences at IMU. "
            "Open to all races. Must maintain required CGPA each semester."
        ),
        "essay_prompts": [
            "Why do you want to pursue a career in healthcare?",
            "Describe an experience that confirmed your passion for medicine or health sciences.",
        ],
        "required_docs": ["transcript", "IC", "referee_letter"],
        "min_cgpa": 3.7,
        "open_to": "All Malaysians",
        "field_of_study": "Medicine / Pharmacy / Dentistry / Health Sciences",
        "portal_url": "https://www.imu.edu.my/scholarships",
    },

    # ── UTP (UNIVERSITI TEKNOLOGI PETRONAS) ────────
    {
        "name": "UTP Academic Scholarship",
        "provider": "Universiti Teknologi PETRONAS (UTP)",
        "amount": "Full tuition + monthly allowance",
        "deadline": date(2025, 6, 30),
        "eligibility_criteria": (
            "Malaysian citizens. Strong academic results — minimum 5As in SPM "
            "including Add Maths and Physics. Pursuing engineering, technology, or science. "
            "Open to all races. Must maintain CGPA 2.0 and above to continue. "
            "Note: Most UTP students are sponsored by PETRONAS directly."
        ),
        "essay_prompts": [
            "Why do you want to study engineering or technology at UTP?",
            "Where do you see yourself contributing to Malaysia's energy future?",
        ],
        "required_docs": ["transcript", "IC", "referee_letter"],
        "min_cgpa": None,
        "open_to": "All Malaysians",
        "field_of_study": "Engineering / Technology / Science",
        "portal_url": "https://www.utp.edu.my/scholarship",
    },

    # ── UNITEN (UNIVERSITI TENAGA NASIONAL) ────────
    {
        "name": "UNITEN Merit Scholarship",
        "provider": "Universiti Tenaga Nasional (UNITEN)",
        "amount": "Up to 100% tuition fee waiver",
        "deadline": date(2025, 7, 31),
        "eligibility_criteria": (
            "Malaysian students. Minimum CGPA 3.5 in Foundation/Matriculation or 8As in SPM. "
            "Pursuing engineering, IT, business, or science at UNITEN. "
            "Open to all races. Must maintain CGPA 3.0 to renew."
        ),
        "essay_prompts": [
            "How will engineering or technology transform Malaysia's energy landscape?",
        ],
        "required_docs": ["transcript", "IC"],
        "min_cgpa": 3.5,
        "open_to": "All Malaysians",
        "field_of_study": "Engineering / IT / Business / Science",
        "portal_url": "https://www.uniten.edu.my/scholarship",
    },
]


def seed():
    app = create_app()
    with app.app_context():
        existing = Scholarship.query.count()
        if existing > 0:
            print(f"⚠️  Found {existing} existing scholarships. Clearing and re-seeding...")
            Scholarship.query.delete()
            db.session.commit()

        for data in SCHOLARSHIPS:
            scholarship = Scholarship(**data)
            db.session.add(scholarship)

        db.session.commit()
        print(f"\n✅ Seeded {len(SCHOLARSHIPS)} Malaysian scholarships successfully!\n")
        print("Breakdown:")
        print("   Government (12):    JPA x4, MARA x3, Khazanah, Bank Negara x2, Biasiswa Perguruan, PNB")
        print("   State (5):          Sabah x2, Sarawak, Penang, Selangor (Zakat)")
        print("   GLCs (6):           Petronas, TNB, Telekom, Sime Darby, UEM, Shell")
        print("   Banking (9):        Maybank, CIMB, Hong Leong, OSK, OCBC, Bank Rakyat, PIDM, Cagamas, Great Eastern")
        print("   Corporate (15):     Gamuda, YTL, Sunway/Jeffrey Cheah, Kuok, Star, Maxis, Axiata,")
        print("                       Top Glove, IJM, IOI, Lion-Parkson, DRB-HICOM, KLK, Generali, Budimas")
        print("   University (22):    Taylor's x4, Monash x3, Nottingham, Sunway Uni, UTAR x2,")
        print("                       Curtin, Swinburne, Heriot-Watt, APU, MMU, UCSI,")
        print("                       HELP, INTI, SEGi, IMU, UTP, UNITEN")


if __name__ == "__main__":
    seed()
