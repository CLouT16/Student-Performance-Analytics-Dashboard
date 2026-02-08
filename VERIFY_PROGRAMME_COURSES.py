"""
PROGRAMME COURSE VERIFICATION SCRIPT
Checks if students are enrolled in correct courses for their programme
"""

import pandas as pd
import os

print("="*80)
print(" PROGRAMME COURSE VERIFICATION")
print("="*80)

# Programme expected courses
PROGRAMME_COURSES = {
    'Business Management': {
        1: {'Sem1': ['GS1001', 'GS1002', 'B1003', 'B1004'], 'Sem2': ['B1501', 'B1502', 'B1503', 'B1504']},
        2: {'Sem1': ['B2004', 'B2006', 'B2007', 'B2009'], 'Sem2': ['B2504', 'B2505', 'B2506', 'B2501', 'B2503', 'I1501']},
        3: {'Sem1': ['B3004', 'B3005'], 'Sem2': ['B3503', 'B3504']},
        4: {'Sem1': ['B4005', 'B4008'], 'Sem2': ['B4503', 'B4505']}
    },
    'Accountancy & Finance': {
        1: {'Sem1': ['GS1001', 'GS1002', 'B1003', 'B1004'], 'Sem2': ['B1501', 'B1502', 'B1503', 'B1504']},
        2: {'Sem1': ['B2002', 'B2004', 'B2006', 'B2007'], 'Sem2': ['B2501', 'B2502', 'B2503', 'B2504']},
        3: {'Sem1': ['B3001', 'B3002', 'B3009', 'B3010'], 'Sem2': ['B3507', 'B3508', 'B3511', 'B3512']},
        4: {'Sem1': ['B4003', 'B4007', 'B4010', 'B4015'], 'Sem2': ['B4501', 'B4502', 'B4505', 'B4512']}
    },
    'Business Management and Information Systems': {
        1: {'Sem1': ['GS1001', 'GS1002', 'C1002', 'C1003'], 'Sem2': ['B1501', 'B1504', 'C1502', 'C1505']},
        2: {'Sem1': ['B2006', 'B2007', 'C2001', 'C2002'], 'Sem2': ['B2504', 'B2505', 'C2501', 'C2503']},
        3: {'Sem1': ['B3004', 'C3001', 'C3002'], 'Sem2': ['B3503', 'C3502', 'C3504']},
        4: {'Sem1': ['B4008', 'C4001', 'C4002'], 'Sem2': ['B4505', 'C4501']}
    },
    'Business Management and International Relations': {
        1: {'Sem1': ['GS1001', 'GS1002', 'B1003', 'I1001'], 'Sem2': ['B1501', 'B1502', 'B1504', 'I1501']},
        2: {'Sem1': ['B2006', 'B2007', 'I2001'], 'Sem2': ['B2504', 'B2506', 'I2501']},
        3: {'Sem1': ['B3004', 'I3005'], 'Sem2': ['B3503', 'I3503']},
        4: {'Sem1': ['B4005', 'B4008', 'I4006'], 'Sem2': ['B4505', 'I4505']}
    },
    'Computing Science': {
        1: {'Sem1': ['GS1001', 'GS1002', 'C1002', 'C1003'], 'Sem2': ['C1502', 'C1505', 'C1507', 'B1501']},
        2: {'Sem1': ['C1006', 'C1008', 'C2001', 'C2002'], 'Sem2': ['C1509', 'C2501', 'C2503', 'B2501']},
        3: {'Sem1': ['B2009', 'C3001', 'C3002', 'C3003'], 'Sem2': ['C3502', 'C3503', 'C3504', 'B3501']},
        4: {'Sem1': ['C4001', 'C4002', 'C4004'], 'Sem2': ['C4505']}
    }
}

# Load combined enrolments
enrolments = pd.read_csv('Generated_Data/COMBINED_Course_Enrolments_All_Years.csv')
print(f"\n✓ Loaded {len(enrolments)} course enrolments")

# Load combined students
students = pd.read_csv('Generated_Data/COMBINED_Current_Students_All_Years.csv')
print(f"✓ Loaded {len(students)} student records\n")

# Sample students from each programme
print("="*80)
print(" SAMPLING STUDENTS BY PROGRAMME")
print("="*80 + "\n")

programmes_to_check = [
    'Business Management',
    'Accountancy & Finance',
    'Business Management and Information Systems',
    'Business Management and International Relations',
    'Computing Science'
]

verification_results = []

for prog_name in programmes_to_check:
    print(f"\n{prog_name}:")
    print("-" * len(prog_name))
    
    # Get students in this programme
    prog_students = students[students['Programme_Name'] == prog_name].copy()
    
    if len(prog_students) == 0:
        print(f"  No students found in {prog_name}")
        continue
    
    # Sample one student from each year level
    for year_level in [1, 2, 3, 4]:
        level_students = prog_students[prog_students['Prog_Yr'] == year_level]
        
        if len(level_students) == 0:
            continue
        
        # Pick first student
        sample = level_students.iloc[0]
        sid = str(sample['Student_ID'])
        acad_year = sample['Academic_Year']
        
        print(f"\n  Year {year_level} Student: {sid} ({acad_year})")
        
        # Get their courses
        student_courses = enrolments[
            (enrolments['Student_ID'].astype(str) == sid) & 
            (enrolments['Academic_Year'] == acad_year)
        ]
        
        sem1_courses = student_courses[student_courses['Semester'] == 'Sem1']['Course_Code'].tolist()
        sem2_courses = student_courses[student_courses['Semester'] == 'Sem2']['Course_Code'].tolist()
        
        print(f"    Sem1: {', '.join(sem1_courses)}")
        print(f"    Sem2: {', '.join(sem2_courses)}")
        
        # Check against expected
        if prog_name in PROGRAMME_COURSES and year_level in PROGRAMME_COURSES[prog_name]:
            expected_sem1 = PROGRAMME_COURSES[prog_name][year_level]['Sem1']
            expected_sem2 = PROGRAMME_COURSES[prog_name][year_level]['Sem2']
            
            # Check Sem1
            sem1_match = all(c in expected_sem1 for c in sem1_courses)
            # Check Sem2
            sem2_match = all(c in expected_sem2 for c in sem2_courses) if sem2_courses else True
            
            if sem1_match and sem2_match:
                print(f"    ✓ CORRECT courses for {prog_name} Year {year_level}")
                verification_results.append({
                    'Programme': prog_name,
                    'Year': year_level,
                    'Student_ID': sid,
                    'Status': 'CORRECT'
                })
            else:
                print(f"    ✗ WRONG courses!")
                print(f"    Expected Sem1: {', '.join(expected_sem1)}")
                if expected_sem2:
                    print(f"    Expected Sem2: {', '.join(expected_sem2)}")
                verification_results.append({
                    'Programme': prog_name,
                    'Year': year_level,
                    'Student_ID': sid,
                    'Status': 'WRONG'
                })

print("\n" + "="*80)
print(" VERIFICATION SUMMARY")
print("="*80 + "\n")

if verification_results:
    df_results = pd.DataFrame(verification_results)
    
    correct = len(df_results[df_results['Status'] == 'CORRECT'])
    wrong = len(df_results[df_results['Status'] == 'WRONG'])
    total = len(df_results)
    
    print(f"Total Checked: {total}")
    print(f"✓ Correct: {correct}")
    print(f"✗ Wrong: {wrong}")
    
    if wrong > 0:
        print(f"\nStudents with WRONG courses:")
        wrong_df = df_results[df_results['Status'] == 'WRONG']
        for _, row in wrong_df.iterrows():
            print(f"  - {row['Programme']} Year {row['Year']}: Student {row['Student_ID']}")
    else:
        print("\n🎉 ALL STUDENTS HAVE CORRECT COURSES!")
else:
    print("No verification results")

print("\n" + "="*80)
print(" VERIFICATION COMPLETE")
print("="*80)
