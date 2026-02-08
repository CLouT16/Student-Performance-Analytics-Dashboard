"""
GPA CALCULATION VERIFICATION SCRIPT
Generates detailed GPA calculations for all students showing Year 3 and Year 4 breakdown

This will help verify the degree classification calculations are correct.
"""

import pandas as pd
import os
from collections import defaultdict

print("="*80)
print(" GPA CALCULATION VERIFICATION")
print("="*80)

# Configuration - UPDATE THIS PATH if your Generated_Data folder is elsewhere
DATA_FOLDER = 'Generated_Data'

if not os.path.exists(DATA_FOLDER):
    print(f"\nERROR: '{DATA_FOLDER}' folder not found!")
    print("Please run MASTER_DATA_GENERATOR.py first, or update DATA_FOLDER path in this script.")
    exit(1)

print(f"\nReading data from: {DATA_FOLDER}/")

# Load all students
admissions_df = pd.read_csv('01_Admissions_Synthetic_Data.csv', dtype=str)
students_df = admissions_df[~admissions_df['Student Status'].isin(['Not Interested', 'Rejected'])].copy()

# Get graduates only
graduates = students_df[students_df['Student Status'].str.contains('Graduated', na=False)].copy()

print(f"Found {len(graduates)} graduates to verify")

# Academic years
ACADEMIC_YEARS = ["2017/18", "2018/19", "2019/20", "2020/21", "2021/22", 
                  "2022/23", "2023/24", "2024/25", "2025/26"]

# Storage for student course data
student_courses = defaultdict(lambda: {'year3': [], 'year4': []})

print("\nReading all course reports...")

# Read all course reports
for year in ACADEMIC_YEARS:
    year_code = year.replace('/', '-')
    year_dir = f'{DATA_FOLDER}/{year_code}'
    
    if not os.path.exists(year_dir):
        continue
    
    # Read Sem1 and Sem2
    for sem_folder in ['Sem1', 'Sem2']:
        sem_path = f'{year_dir}/{sem_folder}'
        if not os.path.exists(sem_path):
            continue
        
        # Read all course reports in this semester
        for course_file in os.listdir(sem_path):
            if not course_file.endswith('.csv'):
                continue
            
            course_code = course_file.split('_')[0]
            
            # Determine year level from course code
            if len(course_code) >= 2 and course_code[1].isdigit():
                level = int(course_code[1])
            else:
                continue
            
            # Only track Year 3 and Year 4
            if level not in [3, 4]:
                continue
            
            # Read course report
            df = pd.read_csv(f'{sem_path}/{course_file}')
            
            # Default credit (most courses are 15 or 30)
            credit = 30 if course_code.startswith('B') and level >= 3 else 15
            
            for _, row in df.iterrows():
                sid = row['Student_ID']
                grade_point = row['Course_Grade_Point']
                
                # Skip NP
                if grade_point == 'NP' or pd.isna(grade_point):
                    continue
                
                grade_point = float(grade_point)
                
                # Store by level
                if level == 3:
                    student_courses[sid]['year3'].append({
                        'course': course_code,
                        'grade_point': grade_point,
                        'credit': credit,
                        'semester': sem_folder
                    })
                elif level == 4:
                    student_courses[sid]['year4'].append({
                        'course': course_code,
                        'grade_point': grade_point,
                        'credit': credit,
                        'semester': sem_folder
                    })

print(f"✓ Course data collected for {len(student_courses)} students")

# Generate verification report
print("\nGenerating GPA verification report...")

verification_data = []

for _, grad in graduates.iterrows():
    sid = grad['Student_ID']
    
    if sid not in student_courses:
        continue
    
    year3_courses = student_courses[sid]['year3']
    year4_courses = student_courses[sid]['year4']
    
    # Calculate Year 3 GPA
    if year3_courses:
        total_credits_y3 = sum(c['credit'] for c in year3_courses)
        
        # Calculate course GPA contributions
        y3_details = []
        for course in year3_courses:
            course_gpa_contribution = (course['grade_point'] * course['credit']) / total_credits_y3
            y3_details.append({
                'course': course['course'],
                'grade_point': course['grade_point'],
                'credit': course['credit'],
                'contribution': round(course_gpa_contribution, 4)
            })
        
        year3_gpa = sum(c['contribution'] for c in y3_details)
    else:
        year3_gpa = 0
        y3_details = []
    
    # Calculate Year 4 GPA
    if year4_courses:
        total_credits_y4 = sum(c['credit'] for c in year4_courses)
        
        y4_details = []
        for course in year4_courses:
            course_gpa_contribution = (course['grade_point'] * course['credit']) / total_credits_y4
            y4_details.append({
                'course': course['course'],
                'grade_point': course['grade_point'],
                'credit': course['credit'],
                'contribution': round(course_gpa_contribution, 4)
            })
        
        year4_gpa = sum(c['contribution'] for c in y4_details)
    else:
        year4_gpa = 0
        y4_details = []
    
    # Final GPA (50/50 weighting)
    if year3_gpa > 0 and year4_gpa > 0:
        final_gpa = (year3_gpa * 0.5) + (year4_gpa * 0.5)
    elif year4_gpa > 0:
        final_gpa = year4_gpa
    else:
        final_gpa = 0
    
    # Degree classification
    if final_gpa >= 18.0:
        classification = 'First Class Honours'
    elif final_gpa >= 17.5:
        classification = 'Borderline 2.1/1st'
    elif final_gpa >= 15.0:
        classification = 'Upper Second Class Honours'
    elif final_gpa >= 14.5:
        classification = 'Borderline 2.2/2.1'
    elif final_gpa >= 12.0:
        classification = 'Lower Second Class Honours'
    elif final_gpa >= 11.5:
        classification = 'Borderline 3rd/2.2'
    elif final_gpa >= 9.0:
        classification = 'Third Class Honours'
    elif final_gpa >= 8.5:
        classification = 'Borderline Fail/3rd'
    else:
        classification = 'Fail'
    
    verification_data.append({
        'Student_ID': sid,
        'Programme': grad['Course/Degree'],
        'Entry_Level': grad['Level offered'],
        'Y3_Courses_Count': len(year3_courses),
        'Y3_Total_Credits': sum(c['credit'] for c in year3_courses) if year3_courses else 0,
        'Y3_GPA': round(year3_gpa, 2),
        'Y4_Courses_Count': len(year4_courses),
        'Y4_Total_Credits': sum(c['credit'] for c in year4_courses) if year4_courses else 0,
        'Y4_GPA': round(year4_gpa, 2),
        'Final_GPA': round(final_gpa, 2),
        'Degree_Classification': classification
    })

# Save verification report
verification_df = pd.DataFrame(verification_data)
verification_df.to_csv(f'{DATA_FOLDER}/GPA_Verification_Report.csv', index=False)

print(f"✓ Generated verification report: {DATA_FOLDER}/GPA_Verification_Report.csv")

# Show sample calculations for first 10 students
print("\n" + "="*80)
print(" SAMPLE CALCULATIONS (First 10 students)")
print("="*80)

for i, row in verification_df.head(10).iterrows():
    print(f"\nStudent {row['Student_ID']} - {row['Programme']}")
    print(f"  Entry Level: {row['Entry_Level']}")
    print(f"  Year 3: {row['Y3_Courses_Count']} courses, {row['Y3_Total_Credits']} credits → GPA: {row['Y3_GPA']}")
    print(f"  Year 4: {row['Y4_Courses_Count']} courses, {row['Y4_Total_Credits']} credits → GPA: {row['Y4_GPA']}")
    print(f"  Final GPA (50/50): {row['Final_GPA']}")
    print(f"  Classification: {row['Degree_Classification']}")

# Summary statistics
print("\n" + "="*80)
print(" SUMMARY STATISTICS")
print("="*80)

print(f"\nTotal graduates verified: {len(verification_df)}")

print("\nDegree Classification Distribution:")
for classification, count in verification_df['Degree_Classification'].value_counts().items():
    pct = count / len(verification_df) * 100
    print(f"  {classification}: {count} ({pct:.1f}%)")

print("\nGPA Statistics:")
print(f"  Mean GPA: {verification_df['Final_GPA'].mean():.2f}")
print(f"  Median GPA: {verification_df['Final_GPA'].median():.2f}")
print(f"  Min GPA: {verification_df['Final_GPA'].min():.2f}")
print(f"  Max GPA: {verification_df['Final_GPA'].max():.2f}")

print("\n" + "="*80)
print(" VERIFICATION COMPLETE")
print("="*80)
print(f"\nDetailed report saved to: {DATA_FOLDER}/GPA_Verification_Report.csv")
print("\nOpen this file in Excel to verify individual student calculations!")
