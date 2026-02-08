"""
GPA VERIFICATION SCRIPT
Verifies that GPA calculations match the 50/50 weighting methodology
"""

import pandas as pd
import os

print("="*80)
print(" GPA CALCULATION VERIFICATION")
print("="*80)

# Load degree classifications
try:
    degree_class = pd.read_csv('Generated_Data/Degree_Classifications.csv')
    print(f"\n✓ Loaded {len(degree_class)} degree classifications")
except Exception as e:
    print(f"\n✗ ERROR loading degree classifications: {e}")
    exit(1)

# Load combined enrolments to verify course counts
enrolments = pd.read_csv('Generated_Data/COMBINED_Course_Enrolments_All_Years.csv')
print(f"✓ Loaded {len(enrolments)} course enrolments")

# Load all course reports to verify grade calculations
print("\n" + "="*80)
print(" DETAILED GPA VERIFICATION FOR SAMPLE GRADUATES")
print("="*80)

# Sample 5 graduates for detailed verification
sample_graduates = degree_class[degree_class['Graduation_Status'] == 'Graduated'].head(5)

for idx, grad in sample_graduates.iterrows():
    sid = str(grad['Student_ID'])
    prog = grad['Programme']
    entry_year = grad['Entry_Year']
    final_gpa = grad['Final_GPA']
    y3_gpa = grad['Year_3_GPA']
    y4_gpa = grad['Year_4_GPA']
    classification = grad['Degree_Classification']
    
    print(f"\n{'='*80}")
    print(f"Graduate: {sid}")
    print(f"Programme: {prog}")
    print(f"Entry Year: {entry_year}")
    print(f"{'='*80}")
    
    # Calculate graduation year from entry year
    entry_year_num = int(entry_year[:4])
    entry_level = int(grad['Entry_Level'])
    
    # Year 3 would be entry_year + (3 - entry_level) years
    # Year 4 would be entry_year + (4 - entry_level) years
    
    if entry_level == 1:
        y3_year = f"{entry_year_num + 2}/{str(entry_year_num + 3)[-2:]}"
        y4_year = f"{entry_year_num + 3}/{str(entry_year_num + 4)[-2:]}"
    elif entry_level == 2:
        y3_year = f"{entry_year_num + 1}/{str(entry_year_num + 2)[-2:]}"
        y4_year = f"{entry_year_num + 2}/{str(entry_year_num + 3)[-2:]}"
    elif entry_level == 3:
        y3_year = f"{entry_year_num}/{str(entry_year_num + 1)[-2:]}"
        y4_year = f"{entry_year_num + 1}/{str(entry_year_num + 2)[-2:]}"
    else:
        y3_year = "N/A"
        y4_year = f"{entry_year_num}/{str(entry_year_num + 1)[-2:]}"
    
    print(f"\nYear 3 Academic Year: {y3_year}")
    print(f"Year 4 Academic Year: {y4_year}")
    
    # Get Year 3 courses
    y3_year_code = y3_year.replace('/', '-')
    y4_year_code = y4_year.replace('/', '-')
    
    y3_courses = []
    y4_courses = []
    
    # Find Year 3 courses (level 3 courses starting with B3, C3, I3, L3)
    for year_folder in ['2017-18', '2018-19', '2019-20', '2020-21', '2021-22', '2022-23', '2023-24', '2024-25']:
        for sem in ['Sem1', 'Sem2']:
            sem_path = f'Generated_Data/{year_folder}/{sem}'
            if os.path.exists(sem_path):
                for course_file in os.listdir(sem_path):
                    if not course_file.endswith('.csv'):
                        continue
                    
                    course_code = course_file.split('_')[0]
                    
                    # Check if this is a Year 3 course
                    if course_code[0] in ['B', 'C', 'I', 'L'] and len(course_code) > 1 and course_code[1] == '3':
                        try:
                            df = pd.read_csv(f'{sem_path}/{course_file}')
                            if sid in df['Student_ID'].astype(str).values:
                                student_row = df[df['Student_ID'].astype(str) == sid].iloc[0]
                                grade_point = student_row['Course_Grade_Point']
                                
                                if grade_point != 'NP':
                                    # Get credits from enrolments
                                    course_enrol = enrolments[
                                        (enrolments['Student_ID'].astype(str) == sid) & 
                                        (enrolments['Course_Code'] == course_code)
                                    ]
                                    if len(course_enrol) > 0:
                                        credits = int(course_enrol.iloc[0]['Credits'])
                                        y3_courses.append({
                                            'course': course_code,
                                            'grade': float(grade_point),
                                            'credits': credits,
                                            'year': year_folder
                                        })
                        except:
                            pass
                    
                    # Check if this is a Year 4 course
                    if course_code[0] in ['B', 'C', 'I', 'L'] and len(course_code) > 1 and course_code[1] == '4':
                        try:
                            df = pd.read_csv(f'{sem_path}/{course_file}')
                            if sid in df['Student_ID'].astype(str).values:
                                student_row = df[df['Student_ID'].astype(str) == sid].iloc[0]
                                grade_point = student_row['Course_Grade_Point']
                                
                                if grade_point != 'NP':
                                    course_enrol = enrolments[
                                        (enrolments['Student_ID'].astype(str) == sid) & 
                                        (enrolments['Course_Code'] == course_code)
                                    ]
                                    if len(course_enrol) > 0:
                                        credits = int(course_enrol.iloc[0]['Credits'])
                                        y4_courses.append({
                                            'course': course_code,
                                            'grade': float(grade_point),
                                            'credits': credits,
                                            'year': year_folder
                                        })
                        except:
                            pass
    
    # Calculate Year 3 GPA
    print(f"\n--- YEAR 3 COURSES ---")
    if y3_courses:
        print(f"Found {len(y3_courses)} Year 3 courses:")
        total_y3_credits = sum(c['credits'] for c in y3_courses)
        weighted_sum_y3 = sum(c['grade'] * c['credits'] for c in y3_courses)
        calculated_y3_gpa = weighted_sum_y3 / total_y3_credits
        
        for course in y3_courses:
            contribution = (course['grade'] * course['credits']) / total_y3_credits
            print(f"  {course['course']}: {course['grade']:.2f} × {course['credits']} credits = {contribution:.2f} GPA contribution")
        
        print(f"\nTotal Year 3 Credits: {total_y3_credits}")
        print(f"Calculated Year 3 GPA: {calculated_y3_gpa:.2f}")
        print(f"Stored Year 3 GPA: {y3_gpa}")
        
        if abs(calculated_y3_gpa - float(y3_gpa)) < 0.01:
            print("✓ Year 3 GPA MATCHES!")
        else:
            print(f"✗ Year 3 GPA MISMATCH! Difference: {abs(calculated_y3_gpa - float(y3_gpa)):.2f}")
    else:
        print("No Year 3 courses found (student may have entered at Year 4)")
    
    # Calculate Year 4 GPA
    print(f"\n--- YEAR 4 COURSES ---")
    if y4_courses:
        print(f"Found {len(y4_courses)} Year 4 courses:")
        total_y4_credits = sum(c['credits'] for c in y4_courses)
        weighted_sum_y4 = sum(c['grade'] * c['credits'] for c in y4_courses)
        calculated_y4_gpa = weighted_sum_y4 / total_y4_credits
        
        for course in y4_courses:
            contribution = (course['grade'] * course['credits']) / total_y4_credits
            print(f"  {course['course']}: {course['grade']:.2f} × {course['credits']} credits = {contribution:.2f} GPA contribution")
        
        print(f"\nTotal Year 4 Credits: {total_y4_credits}")
        print(f"Calculated Year 4 GPA: {calculated_y4_gpa:.2f}")
        print(f"Stored Year 4 GPA: {y4_gpa}")
        
        if abs(calculated_y4_gpa - float(y4_gpa)) < 0.01:
            print("✓ Year 4 GPA MATCHES!")
        else:
            print(f"✗ Year 4 GPA MISMATCH! Difference: {abs(calculated_y4_gpa - float(y4_gpa)):.2f}")
    else:
        print("No Year 4 courses found")
    
    # Calculate Final GPA (50/50 weighting)
    print(f"\n--- FINAL GPA CALCULATION ---")
    if y3_courses and y4_courses:
        calculated_y3_gpa = weighted_sum_y3 / total_y3_credits
        calculated_y4_gpa = weighted_sum_y4 / total_y4_credits
        calculated_final_gpa = (calculated_y3_gpa * 0.5) + (calculated_y4_gpa * 0.5)
        
        print(f"Year 3 GPA: {calculated_y3_gpa:.2f} × 0.5 = {calculated_y3_gpa * 0.5:.2f}")
        print(f"Year 4 GPA: {calculated_y4_gpa:.2f} × 0.5 = {calculated_y4_gpa * 0.5:.2f}")
        print(f"Calculated Final GPA: {calculated_final_gpa:.2f}")
        print(f"Stored Final GPA: {final_gpa}")
        
        if abs(calculated_final_gpa - final_gpa) < 0.01:
            print("✓ FINAL GPA MATCHES! (50/50 weighting correct)")
        else:
            print(f"✗ FINAL GPA MISMATCH! Difference: {abs(calculated_final_gpa - final_gpa):.2f}")
    else:
        print("Cannot calculate final GPA - missing Year 3 or Year 4 data")
    
    # Verify degree classification
    print(f"\n--- DEGREE CLASSIFICATION ---")
    print(f"Final GPA: {final_gpa}")
    print(f"Classification: {classification}")
    
    # Check classification boundaries
    if final_gpa >= 18.0:
        expected = 'First Class Honours'
    elif final_gpa >= 17.5:
        expected = 'Borderline 2.1/1st'
    elif final_gpa >= 15.0:
        expected = 'Upper Second Class Honours'
    elif final_gpa >= 14.5:
        expected = 'Borderline 2.2/2.1'
    elif final_gpa >= 12.0:
        expected = 'Lower Second Class Honours'
    elif final_gpa >= 11.5:
        expected = 'Borderline 3rd/2.2'
    elif final_gpa >= 9.0:
        expected = 'Third Class Honours'
    elif final_gpa >= 8.5:
        expected = 'Borderline Fail/3rd'
    else:
        expected = 'Fail'
    
    if classification == expected:
        print(f"✓ Classification CORRECT for GPA {final_gpa}")
    else:
        print(f"✗ Classification WRONG! Expected: {expected}, Got: {classification}")

# Overall statistics
print("\n" + "="*80)
print(" OVERALL GPA STATISTICS")
print("="*80)

print(f"\nTotal Graduates: {len(degree_class)}")

# Classification distribution
print("\nDegree Classification Distribution:")
class_dist = degree_class['Degree_Classification'].value_counts().sort_index()
for classification, count in class_dist.items():
    percentage = (count / len(degree_class)) * 100
    print(f"  {classification}: {count} ({percentage:.1f}%)")

# GPA statistics
print(f"\nFinal GPA Statistics:")
print(f"  Mean: {degree_class['Final_GPA'].mean():.2f}")
print(f"  Median: {degree_class['Final_GPA'].median():.2f}")
print(f"  Min: {degree_class['Final_GPA'].min():.2f}")
print(f"  Max: {degree_class['Final_GPA'].max():.2f}")
print(f"  Std Dev: {degree_class['Final_GPA'].std():.2f}")

print("\n" + "="*80)
print(" VERIFICATION COMPLETE")
print("="*80)
