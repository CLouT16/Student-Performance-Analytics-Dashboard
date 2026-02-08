# Student Performance Analytics Dashboard

**MSc Data Science Project - Synthetic Dataset**

# Overview

This repository contains synthetic student performance data generated for my MSc Data Science thesis project. The dataset spans 9 academic years (2017/18 - 2025/26) and includes 3,038 students across 7 undergraduate programmes.

# Project Goals

Building a Student Performance Analytics Dashboard for Strategic Decision-Making in Undergraduate Programme Management using:
- MySQL database
- Power BI for visualization
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

## Key Features

- Programme-specific course assignments  
- 50/50 GPA weighting (Year 3 + Year 4)  
- Realistic grade distributions  
- Attendance correlated with performance  
- Proper degree classification bands  

**Note:** This is a work-in-progress academic project. Data is completely synthetic and does not represent any real institution.
