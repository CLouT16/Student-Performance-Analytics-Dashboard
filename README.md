# Student Performance Analytics Dashboard

**MSc Data Science Project - Synthetic Dataset**

# Overview

This repository contains synthetic student performance data generated for my MSc Data Science thesis project. The dataset spans 9 academic years (2017/18 - 2025/26) and includes 3,038 students across 7 undergraduate programmes.

# Project Goals

Building a Student Performance Analytics Dashboard for Strategic Decision-Making in Undergraduate Programme Management using:
- MySQL database for data storage
- Interactive web-based dashboard (accessible to anyone, no license required)
- Hosted on GitHub Pages for public access
- Predictive analytics for student outcomes


# Dataset Contents

**Generated Data:**
- 9 academic year folders (2017-18 through 2025-26)
- Individual course reports per semester
- Combined datasets for analysis
- Degree classifications for 1,682 graduates

**Key Files:**
- `COMBINED_Current_Students_All_Years.csv` - All student records
- `COMBINED_Course_Enrolments_All_Years.csv` - Course enrollments
- `COMBINED_Attendance_All_Years.csv` - Attendance tracking
- `Degree_Classifications.csv` - Graduate outcomes

## Programmes Included

| Programme | Years Active | Students |
|---|---|---|
| Business Management | 2017-present | ~1,350 |
| Accountancy & Finance | 2017-present | ~150 |
| BM - Information Systems | 2020-present | ~520 |
| BM - International Relations | 2020-present | ~480 |
| Computing Science | 2023-present | ~290 |
| Politics & International Relations | 2023-present | ~180 |
| BM - Legal Studies | 2022-2025 | ~68 |

# Data Generation

All data is **fully synthetic and anonymized**. Generated using:
- `PROGRAMME_MAPPED_GENERATOR.py` - Main data generator
- `VERIFY_PROGRAMME_COURSES.py` - Programme validation (20/20 correct)
- `VERIFY_GPA_DETAILED.py` - GPA calculation verification

## Features

- **6 dashboard views**: Overview, Enrolment Trends, Academic Performance, Programme Comparison, Retention & Attrition, Data Explorer
- **Interactive filtering**: Filter by academic year, school, and level — all charts update in real-time
- **15+ chart types**: Bar, line, doughnut, polar area, radar, stacked area, and simulated box plots
- **KPI cards**: Total students, average GPA, pass rate, graduates, withdrawal rate
- **Student-level data table**: Sortable, filterable sample of 2,500 synthetic records
- **Responsive design**: Works on desktop, tablet, and mobile
- **Zero dependencies on backend**: All data embedded as JSON — no database required at runtime

## Tech Stack

- **Chart.js 4.4** — interactive, responsive charts
- **Vanilla HTML/CSS/JS** — no framework, fast loading 

**Note:** This dashboard was developed as part of an MSc Data Science project, focusing on data-driven decision-making for undergraduate programme management in a transnational higher education context.
