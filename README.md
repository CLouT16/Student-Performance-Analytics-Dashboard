# Student Performance Analytics Dashboard

Interactive analytics dashboard for student performance data across 9 academic years (2017-2025).

---

## Overview

This dashboard analyzes performance data for 4,246 undergraduate students across four schools: Business, Social Science, Natural & Computing Sciences, and Legal Studies.

---

## Features

### Analytics

- **Enrollment Trends** - Track enrollment growth over 9 years
- **Academic Performance** - GPA distribution, pass/fail rates, grade analysis
- **Programme Comparison** - Compare performance across programmes
- **Retention & Attrition** - Monitor student retention and dropout patterns
- **Degree Classifications** - View distribution of degree outcomes
- **Demographics** - Gender, nationality, age, disability, and language proficiency

### Interactive Features

- Real-time filtering by year, school, programme, gender, and nationality
- Export filtered data as CSV
- Responsive design for all devices

---

## Technical Stack

- HTML5, CSS3, JavaScript
- Chart.js for visualizations
- PapaParse for CSV processing
- Client-side processing (no backend)

---

## Data Files

### Main Files (data/)

- `01_Admissions_Synthetic_Data.csv` - Application and admission records
- `02_COMBINED_Current_Students_All_Years.csv` - Student status by year
- `03_COMBINED_Course_Enrolments_All_Years.csv` - Course enrollments
- `04_COMBINED_Current_Students_All_Years.csv` - Course grades
- `05_COMBINED_Attendance_All_Years.csv` - Attendance records
- `06_Degree_Classifications.csv` - Graduate outcomes

### Detailed Data (generated_data/)

Complete breakdown by academic year (2017-18 through 2025-26), including:
- Current student lists per year
- Individual course reports by semester (Sem1, Sem2, Sem3_Resit)

### Supporting Files

- `database/` - SQL database files
- `scripts/` - Python data generation scripts

---

## Setup

### View Live Dashboard

https://clout16.github.io/Student-Performance-Analytics-Dashboard/

### Run Locally

```bash
git clone https://github.com/CLouT16/Student-Performance-Analytics-Dashboard.git
cd Student-Performance-Analytics-Dashboard
python -m http.server 8000
```

Open browser to http://localhost:8000

---

## Project Structure

```
Student-Performance-Analytics-Dashboard/
├── index.html
├── css/
├── js/
├── data/                    (6 combined CSV files)
├── generated_data/          (yearly breakdown)
├── database/                (SQL files)
└── scripts/                 (Python scripts)
```

---

## Academic Project

**Title:** Building a Student Performance Analytics Dashboard for Strategic Decision-Making

**Programme:** MSc Data Science

**Year:** 2025-2026

All data is synthetic and generated for academic purposes.

---

## Browser Support

Chrome/Edge 90+, Firefox 88+, Safari 14+

---

**Last Updated:** February 2026
