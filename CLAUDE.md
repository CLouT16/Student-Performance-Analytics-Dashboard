# Student Performance Analytics Dashboard

## Thesis Context
- Aim: Design and implement an integrated data analytics system for an interactive dashboard to enable management to make evidence-based strategic decisions regarding student recruitment, programme development, and student support initiatives
- Role: Academic Administrator — data collation is always last minute and reactive
- Problem: Student performance data exists in disparate formats across multiple systems
- Value: Beyond academic requirements, genuine potential to benefit the institution

## Tech Stack
- Client-side: HTML5, CSS3, ES6 JavaScript, Chart.js 4.4.0, PapaParse 5.4.1
- Deployment: GitHub Pages + CI/CD (GitHub Actions)
- Standalone: dashboard_standalone.html (~10MB self-contained)
- Database: MySQL (optional backend)

## Data Files (data/)
- 01: Admissions, 02: Students, 03: Enrolments, 04: Attendance, 05: Classifications, 06: Course Results
- 70,000+ records, 7 programmes, 4 schools, 9 academic years, ~3,038 students
- Scottish Common Grading Scale (CGS) 0–22

## Documentation (local only, gitignored)
- Generator scripts in /tmp/docgen venv (python-docx, docx2pdf, python-pptx)
- Doc generator: /tmp/generate_docs.py
- Presentation generator: /tmp/generate_presentation.py

## Git Preferences
- Single clean "Initial commit", NO Co-Authored-By
- Force push to keep clean history
- Documentation files (.docx, .pdf, .pptx) kept locally only, never on GitHub
