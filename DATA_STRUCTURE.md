# CSV Data Structure Guide

## Overview

This guide explains the exact structure needed for your three CSV files. Each section includes field descriptions, valid values, and examples.

---

## 1. students.csv

### Required Fields

| Field | Type | Description | Valid Values | Example |
|-------|------|-------------|--------------|---------|
| `student_id` | String | Unique student identifier | Any format (e.g., S001, STU12345) | S001 |
| `school` | String | Academic school/faculty | Business, Social Science, Natural & Computing Sciences, Legal Studies | Business |
| `programme` | String | Degree programme | Full programme name | BSc Accounting and Finance |
| `gender` | String | Student gender | Male, Female, Non-binary, Prefer not to say | Female |
| `nationality` | String | Student nationality | Any country name | Qatari |
| `age` | Integer | Current age | 17-60 | 19 |
| `entry_year` | Integer | Year of first enrollment | 2017-2025 | 2021 |
| `status` | String | Current student status | Active, Graduated, Dropped, Suspended | Active |
| `is_disabled` | Boolean | Has disclosed disability | Yes, No, True, False | No |
| `english_proficiency` | String | English language level | Beginner, Intermediate, Proficient, Advanced, Native | Advanced |
| `education_system` | String | Previous educational system | British, American, IB, Other | British |

### Optional Fields (Enhance Analytics)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `date_of_birth` | Date | Birth date | 2003-05-15 |
| `high_school_gpa` | Float | Entry qualification | 3.8 |
| `scholarship` | Boolean | Has scholarship | Yes |
| `part_time` | Boolean | Part-time student | No |
| `expected_graduation` | Integer | Expected grad year | 2025 |

### Sample students.csv

```csv
student_id,school,programme,gender,nationality,age,entry_year,status,is_disabled,english_proficiency,education_system
S001,Business,BSc Accounting and Finance,Female,Qatari,19,2021,Active,No,Advanced,British
S002,Social Science,BA Psychology,Male,Indian,20,2020,Graduated,No,Proficient,American
S003,Legal Studies,LLB Law,Female,Pakistani,21,2019,Active,Yes,Proficient,British
S004,Natural & Computing Sciences,BSc Computer Science,Male,Qatari,18,2022,Active,No,Native,British
S005,Business,BSc Business Management,Female,Egyptian,22,2018,Graduated,No,Advanced,British
S006,Social Science,BA Sociology,Male,Lebanese,20,2021,Dropped,No,Intermediate,Other
S007,Legal Studies,LLB Law with Management,Female,Jordanian,19,2022,Active,No,Proficient,British
S008,Natural & Computing Sciences,BSc Information Systems,Male,Saudi,21,2020,Active,No,Advanced,American
S009,Business,BSc Economics,Female,Qatari,18,2023,Active,No,Native,British
S010,Social Science,BA International Relations,Male,Syrian,23,2019,Active,Yes,Proficient,IB
```

---

## 2. enrollments.csv

### Required Fields

| Field | Type | Description | Valid Values | Example |
|-------|------|-------------|--------------|---------|
| `student_id` | String | Student identifier (must match students.csv) | Same as students.csv | S001 |
| `academic_year` | String | Academic year of enrollment | Format: YYYY-YYYY | 2021-2022 |
| `course_code` | String | Course identifier | Any format | ACC101 |
| `year_of_study` | Integer | Year level | 1, 2, 3, 4 | 1 |

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `course_name` | String | Full course name | Introduction to Accounting |
| `credits` | Integer | Course credit value | 20 |
| `semester` | String | Fall, Spring, Summer | Fall |
| `instructor` | String | Course instructor | Dr. Smith |

### Sample enrollments.csv

```csv
student_id,academic_year,course_code,year_of_study
S001,2021-2022,ACC101,1
S001,2021-2022,BUS101,1
S001,2021-2022,ECO101,1
S001,2021-2022,MTH101,1
S001,2022-2023,ACC201,2
S001,2022-2023,ACC202,2
S001,2022-2023,FIN201,2
S001,2022-2023,BUS201,2
S002,2020-2021,PSY101,1
S002,2020-2021,PSY102,1
S002,2020-2021,SOC101,1
S002,2020-2021,ENG101,1
S002,2021-2022,PSY201,2
S002,2021-2022,PSY202,2
S002,2021-2022,PSY203,2
S002,2021-2022,RES201,2
S002,2022-2023,PSY301,3
S002,2022-2023,PSY302,3
S002,2022-2023,PSY303,3
S002,2022-2023,PSY304,3
S002,2023-2024,PSY401,4
S002,2023-2024,PSY402,4
S002,2023-2024,PSY403,4
S002,2023-2024,DIS499,4
```

### Important Notes

- Each row = one course enrollment for one student in one academic year
- A student typically has 8-12 courses per year (2 semesters × 4-6 courses)
- `student_id` must exist in students.csv
- `year_of_study` should progress logically with `academic_year`
- Same student can appear multiple times (once per course)

---

## 3. grades.csv

### Required Fields

| Field | Type | Description | Valid Values | Example |
|-------|------|-------------|--------------|---------|
| `student_id` | String | Student identifier (must match students.csv) | Same as students.csv | S001 |
| `course_code` | String | Course identifier (should match enrollments.csv) | Any format | ACC101 |
| `numeric_grade` | Float | Numerical grade (0-20 scale) | 0.0 - 20.0 | 17.5 |
| `cgs_grade` | String | Common Grading Scale grade | A1, A2, A3, B1, B2, B3, C1, C2, C3, D1, D2, F | A2 |

### CGS Grade Scale Reference

| CGS Grade | Numeric Range | GPA Equivalent | Description |
|-----------|---------------|----------------|-------------|
| A1 | 18.0 - 20.0 | 4.0 | Excellent |
| A2 | 16.0 - 17.9 | 3.7 | Excellent |
| A3 | 14.0 - 15.9 | 3.3 | Very Good |
| B1 | 12.0 - 13.9 | 3.0 | Good |
| B2 | 10.0 - 11.9 | 2.7 | Good |
| B3 | 8.0 - 9.9 | 2.3 | Satisfactory |
| C1 | 6.0 - 7.9 | 2.0 | Adequate |
| C2 | 4.0 - 5.9 | 1.7 | Adequate |
| C3 | 2.0 - 3.9 | 1.3 | Pass |
| D1 | 1.0 - 1.9 | 1.0 | Marginal Pass |
| D2 | 0.1 - 0.9 | 0.7 | Marginal Pass |
| F | 0.0 | 0.0 | Fail |

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `academic_year` | String | Year grade was received | 2021-2022 |
| `attempt` | Integer | Attempt number | 1 |
| `grade_date` | Date | Date grade recorded | 2022-06-15 |

### Sample grades.csv

```csv
student_id,course_code,numeric_grade,cgs_grade
S001,ACC101,17.5,A2
S001,BUS101,16.0,A2
S001,ECO101,15.5,A3
S001,MTH101,14.0,A3
S001,ACC201,18.5,A1
S001,ACC202,17.0,A2
S001,FIN201,16.5,A2
S001,BUS201,15.0,A3
S002,PSY101,16.5,A2
S002,PSY102,15.0,A3
S002,SOC101,14.5,A3
S002,ENG101,13.0,B1
S002,PSY201,17.0,A2
S002,PSY202,16.0,A2
S002,PSY203,15.5,A3
S002,RES201,14.0,A3
S002,PSY301,18.0,A1
S002,PSY302,17.5,A2
S002,PSY303,16.5,A2
S002,PSY304,15.5,A3
S002,PSY401,18.5,A1
S002,PSY402,17.0,A2
S002,PSY403,16.5,A2
S002,DIS499,19.0,A1
```

### Important Notes

- Each row = one grade for one course for one student
- `student_id` must exist in students.csv
- `course_code` should match enrollments.csv
- Passing grades: A1-D2 (numeric_grade ≥ 0.1)
- Failing grade: F (numeric_grade = 0.0)
- Not all enrolled courses need grades (in-progress courses)

---

## Data Validation Checklist

Before uploading your CSV files, verify:

### File Format
- [ ] Files are saved as `.csv` (comma-separated values)
- [ ] UTF-8 encoding (for international characters)
- [ ] No extra blank rows at the end
- [ ] No blank rows between data

### Data Integrity
- [ ] All `student_id` values in enrollments.csv exist in students.csv
- [ ] All `student_id` values in grades.csv exist in students.csv
- [ ] All required fields have values (no empty cells)
- [ ] Dates in correct format (YYYY-MM-DD)
- [ ] Numbers are numeric (no text in number fields)

### Data Quality
- [ ] No duplicate student IDs in students.csv
- [ ] Consistent naming (e.g., "Business" not "business" or "BUSINESS")
- [ ] Valid year ranges (2017-2025)
- [ ] Logical progression (Year 1 → Year 2 → Year 3 → Year 4)
- [ ] CGS grades match numeric grades

### Testing
- [ ] Load files in dashboard locally first
- [ ] Check browser console for errors
- [ ] Verify all visualizations display
- [ ] Test filter functionality
- [ ] Export data to verify integrity

---

## Common Issues & Solutions

### Issue: "Failed to load data"

**Cause**: File path or name incorrect

**Solution**:
- Files must be in `data/` folder
- Exact names: `students.csv`, `enrollments.csv`, `grades.csv`
- Case-sensitive on some systems

### Issue: Charts show "NaN" or blank

**Cause**: Data type mismatch

**Solution**:
- Remove any non-numeric characters from number fields
- Ensure boolean fields use: Yes/No or True/False
- Check for extra spaces in field names

### Issue: Student not appearing in visualizations

**Cause**: Missing or mismatched IDs

**Solution**:
- Verify `student_id` matches across all three files
- Check for leading/trailing spaces
- Ensure consistent capitalization

### Issue: Enrollment trends look wrong

**Cause**: Incorrect date formats

**Solution**:
- Use format: `2021-2022` for academic years
- Use format: `YYYY` for entry year
- Be consistent throughout all files

---

## Generating Synthetic Data

If you need to generate large datasets, consider:

### Python (using pandas + faker)
```python
import pandas as pd
from faker import Faker
import random

fake = Faker()

# Generate students
students = []
for i in range(2500):
    students.append({
        'student_id': f'S{i+1:04d}',
        'school': random.choice(['Business', 'Social Science', 'Legal Studies', 'Natural & Computing Sciences']),
        'programme': random.choice(['BSc Accounting', 'BA Psychology', 'LLB Law', 'BSc Computer Science']),
        'gender': random.choice(['Male', 'Female']),
        'nationality': fake.country(),
        'age': random.randint(18, 28),
        'entry_year': random.randint(2017, 2023),
        'status': random.choice(['Active', 'Graduated', 'Dropped']),
        'is_disabled': random.choice(['Yes', 'No']),
        'english_proficiency': random.choice(['Beginner', 'Intermediate', 'Proficient', 'Advanced', 'Native']),
        'education_system': random.choice(['British', 'American', 'IB', 'Other'])
    })

df_students = pd.DataFrame(students)
df_students.to_csv('students.csv', index=False)
```

### R (using tidyverse)
```r
library(tidyverse)

# Generate students
students <- tibble(
  student_id = sprintf("S%04d", 1:2500),
  school = sample(c("Business", "Social Science", "Legal Studies", "Natural & Computing Sciences"), 2500, replace = TRUE),
  programme = sample(c("BSc Accounting", "BA Psychology", "LLB Law", "BSc Computer Science"), 2500, replace = TRUE),
  gender = sample(c("Male", "Female"), 2500, replace = TRUE),
  # ... add more fields
)

write_csv(students, "students.csv")
```

---

## Next Steps

1. ✅ Review this guide thoroughly
2. ✅ Prepare your CSV files with correct structure
3. ✅ Validate data using checklist above
4. ✅ Test locally before deploying
5. ✅ Upload to `data/` folder in repository
6. ✅ Deploy to GitHub Pages
7. ✅ Verify dashboard works with your data

**You're ready to populate your dashboard with real data!** 📊
