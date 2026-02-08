"""
═══════════════════════════════════════════════════════════════════════════════
STUDENT PERFORMANCE ANALYTICS - CORRECT GENERATOR WITH PROGRAMME MAPPING
Built from Official Programme Prescriptions
═══════════════════════════════════════════════════════════════════════════════

CRITICAL FIXES:
✓ Each programme has EXACT course assignments from prescriptions
✓ AF students take AF courses ONLY (not BM courses)
✓ Handles "OR" choices (B4501 OR B4502 for AF dissertations)
✓ Students tracked through correct academic years
✓ Student IDs preserved from admissions file

Created: 2026-02-07 16:00 Doha Time
Author: Cindy
═══════════════════════════════════════════════════════════════════════════════
"""

import pandas as pd
import random
import os
from datetime import datetime
from collections import defaultdict

print("="*80)
print(" STUDENT PERFORMANCE ANALYTICS - PROGRAMME-MAPPED GENERATOR")
print("="*80)
print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

RANDOM_SEED = 42
random.seed(RANDOM_SEED)

# ============================================================================
# PROGRAMME COURSE MAPPINGS (From Official Prescriptions)
# ============================================================================

# Note: Using actual course codes from List_of_Courses.xlsx
# GS = General Studies, B = Business, C = Computing, I = International Relations, L = Legal

BM_COURSES = {
    1: {
        'Sem1': ['GS1001', 'GS1002', 'B1003', 'B1004'],  # Using actual codes from your file
        'Sem2': ['B1501', 'B1502', 'B1503', 'B1504']
    },
    2: {
        'Sem1': ['B2004', 'B2006', 'B2007', 'B2009'],
        'Sem2': ['B2504', 'B2505', 'B2506', 'B2501']  # Last one is choice (B2501 or B2503 or I1501)
    },
    3: {
        'Sem1': ['B3004', 'B3005'],  # 30 credit courses (2 courses = 60 credits)
        'Sem2': ['B3503', 'B3504']
    },
    4: {
        'Sem1': ['B4005', 'B4008'],
        'Sem2': ['B4503', 'B4505']
    }
}

AF_COURSES = {
    1: {
        'Sem1': ['GS1001', 'GS1002', 'B1003', 'B1004'],  # Same as BM
        'Sem2': ['B1501', 'B1502', 'B1503', 'B1504']
    },
    2: {
        'Sem1': ['B2002', 'B2004', 'B2006', 'B2007'],
        'Sem2': ['B2501', 'B2502', 'B2503', 'B2504']
    },
    3: {
        'Sem1': ['B3001', 'B3002', 'B3009', 'B3010'],
        'Sem2': ['B3507', 'B3508', 'B3511', 'B3512']
    },
    4: {
        'Sem1': ['B4003', 'B4007', 'B4010', 'B4015'],  # Note: B4003 is 30 credits, others 15
        'Sem2': ['DISSERTATION', 'STRATEGY']  # Special handling for choices
    }
}

# For AF Year 4 Sem2 choices
AF_DISSERTATION_CHOICES = ['B4501', 'B4502']  # Accountancy OR Finance
AF_STRATEGY_CHOICES = ['B4505', 'B4512']  # Business Strategy OR alternatives

BMIS_COURSES = {
    1: {
        'Sem1': ['GS1001', 'GS1002', 'C1002', 'C1003'],
        'Sem2': ['B1501', 'B1504', 'C1502', 'C1505']
    },
    2: {
        'Sem1': ['B2006', 'B2007', 'C2001', 'C2002'],
        'Sem2': ['B2504', 'B2505', 'C2501', 'C2503']
    },
    3: {
        'Sem1': ['B3004', 'C3001', 'C3002'],  # B3004 is 30 credits
        'Sem2': ['B3503', 'C3502', 'C3504']
    },
    4: {
        'Sem1': ['B4008', 'C4001', 'C4002'],  # C4001 is 30 credits
        'Sem2': ['B4505', 'C4501']
    }
}

BMIR_COURSES = {
    1: {
        'Sem1': ['GS1001', 'GS1002', 'B1003', 'I1001'],
        'Sem2': ['B1501', 'B1502', 'B1504', 'I1501']
    },
    2: {
        'Sem1': ['B2006', 'B2007', 'I2001'],  # I2001 is 30 credits
        'Sem2': ['B2504', 'B2506', 'I2501']  # I2501 is 30 credits
    },
    3: {
        'Sem1': ['B3004', 'I3005'],
        'Sem2': ['B3503', 'I3503']
    },
    4: {
        'Sem1': ['CHOICE_BM', 'I4006'],  # Choice: B4005 OR B4008
        'Sem2': ['B4505', 'I4505']
    }
}

BMIR_Y4S1_CHOICES = ['B4005', 'B4008']

CS_COURSES = {
    1: {
        'Sem1': ['GS1001', 'GS1002', 'C1002', 'C1003'],
        'Sem2': ['C1502', 'C1505', 'C1507', 'CS_Y1_CHOICE']  # Business/IR elective
    },
    2: {
        'Sem1': ['C1006', 'C1008', 'C2001', 'C2002'],
        'Sem2': ['C1509', 'C2501', 'C2503', 'CS_Y2_CHOICE']  # Business elective
    },
    3: {
        'Sem1': ['B2009', 'C3001', 'C3002', 'C3003'],
        'Sem2': ['C3502', 'C3503', 'C3504', 'CS_Y3_CHOICE']  # Business elective
    },
    4: {
        'Sem1': ['C4001', 'C4002', 'C4004'],  # Only 3 courses - no 4th!
        'Sem2': ['C4505']  # 60 credit project
    }
}

# CS Elective choices by year
CS_Y1_CHOICES = ['B1501', 'B1502', 'B1503', 'B1504', 'I1501']
CS_Y2_CHOICES = ['B2501', 'B2502', 'B2503', 'B2504', 'B2505', 'B2506']
CS_Y3_CHOICES = ['B3501', 'B3502', 'B3503', 'B3504']  # Available business electives

# Programme launch years
PROGRAMME_LAUNCH = {
    'BUSINESS MANAGEMENT': 2017,
    'ACCOUNTANCY': 2017,
    'FINANCE': 2017,
    'INFORMATION SYSTEMS': 2020,
    'INTERNATIONAL RELATIONS': 2020,
    'COMPUTING': 2023,
    'POLITICS': 2023,
    'LEGAL': 2022
}

ACADEMIC_YEARS = ["2017/18", "2018/19", "2019/20", "2020/21", "2021/22", 
                  "2022/23", "2023/24", "2024/25", "2025/26"]

# ============================================================================
# LOAD DATA
# ============================================================================

print("="*80)
print(" LOADING DATA")
print("="*80 + "\n")

admissions_df = pd.read_csv('01_Admissions_Synthetic_Data.csv')
admissions_df['Student_ID'] = admissions_df['Student_ID'].astype(str)
students_df = admissions_df[~admissions_df['Student Status'].isin(['Not Interested', 'Rejected'])].copy()

print(f"✓ Loaded {len(students_df)} students")
print(f"✓ Sample Student IDs: {students_df['Student_ID'].head(3).tolist()}")

courses_df = pd.read_excel('List_of_Courses.xlsx', engine='openpyxl')
print(f"✓ Loaded {len(courses_df)} courses\n")

# ============================================================================
# HELPER FUNCTIONS
# ============================================================================

def get_programme_courses(programme_name):
    """Get course structure for a programme"""
    prog_upper = str(programme_name).upper()
    
    if 'ACCOUNTANCY' in prog_upper or 'FINANCE' in prog_upper:
        return AF_COURSES
    elif 'INFORMATION SYSTEMS' in prog_upper:
        return BMIS_COURSES
    elif 'INTERNATIONAL RELATIONS' in prog_upper and 'BUSINESS' in prog_upper:
        return BMIR_COURSES
    elif 'COMPUTING' in prog_upper:
        return CS_COURSES
    elif 'BUSINESS MANAGEMENT' in prog_upper and 'INFORMATION' not in prog_upper and 'INTERNATIONAL' not in prog_upper and 'LEGAL' not in prog_upper:
        return BM_COURSES
    else:
        return BM_COURSES  # Default

def get_courses_for_student(programme_name, level, semester):
    """Get exact courses for a student based on programme and level"""
    prog_courses = get_programme_courses(programme_name)
    
    if level not in prog_courses:
        return []
    
    sem_key = f'Sem{semester}'
    if sem_key not in prog_courses[level]:
        return []
    
    course_codes = prog_courses[level][sem_key]
    result = []
    
    for code in course_codes:
        # Handle special cases
        if code == 'DISSERTATION':
            # AF Year 4 Sem 2 dissertation choice
            chosen = random.choice(AF_DISSERTATION_CHOICES)
            result.append(chosen)
        elif code == 'STRATEGY':
            # AF Year 4 Sem 2 strategy choice
            chosen = random.choice(AF_STRATEGY_CHOICES)
            result.append(chosen)
        elif code == 'CHOICE_BM':
            # BM-IR Year 4 Sem 1 choice
            chosen = random.choice(BMIR_Y4S1_CHOICES)
            result.append(chosen)
        elif code == 'CS_Y1_CHOICE':
            # CS Year 1 elective
            chosen = random.choice(CS_Y1_CHOICES)
            result.append(chosen)
        elif code == 'CS_Y2_CHOICE':
            # CS Year 2 elective
            chosen = random.choice(CS_Y2_CHOICES)
            result.append(chosen)
        elif code == 'CS_Y3_CHOICE':
            # CS Year 3 elective
            chosen = random.choice(CS_Y3_CHOICES)
            result.append(chosen)
        else:
            result.append(code)
    
    return result

# Student performance
student_performance = {}
for _, student in students_df.iterrows():
    sid = str(student['Student_ID'])
    perf = random.choices(['Excellent', 'Good', 'Average', 'Struggling'], weights=[0.15, 0.35, 0.35, 0.15])[0]
    student_performance[sid] = perf

print(f"✓ Assigned performance levels to {len(student_performance)} students\n")

# Grading functions
def generate_grade_for_student(student_id):
    sid = str(student_id)
    perf = student_performance.get(sid, 'Average')
    
    if perf == 'Excellent': return round(random.triangular(18.0, 22.0, 20.0), 2)
    elif perf == 'Good': return round(random.triangular(12.0, 18.0, 15.0), 2)
    elif perf == 'Average': return round(random.triangular(7.0, 15.0, 11.0), 2)
    else: return round(random.triangular(0.0, 12.0, 6.0), 2)

def get_attendance_for_student(student_id, grade_point):
    sid = str(student_id)
    perf = student_performance.get(sid, 'Average')
    
    if perf == 'Excellent': base = random.triangular(85, 100, 92)
    elif perf == 'Good': base = random.triangular(75, 95, 85)
    elif perf == 'Average': base = random.triangular(60, 85, 72)
    else: base = random.triangular(40, 75, 58)
    
    return round(max(0, min(100, base + random.uniform(-5, 5))), 1)

def get_attendance_status(rate):
    if rate > 80: return 'Good'
    elif rate >= 60: return 'Warning'
    else: return 'Concern'

def get_grade_letter(point):
    if point >= 22.0: return 'A1'
    elif point >= 21.0: return 'A2'
    elif point >= 20.0: return 'A3'
    elif point >= 19.0: return 'A4'
    elif point >= 18.0: return 'A5'
    elif point >= 17.0: return 'B1'
    elif point >= 16.0: return 'B2'
    elif point >= 15.0: return 'B3'
    elif point >= 14.0: return 'C1'
    elif point >= 13.0: return 'C2'
    elif point >= 12.0: return 'C3'
    elif point >= 11.0: return 'D1'
    elif point >= 10.0: return 'D2'
    elif point >= 9.0: return 'D3'
    elif point >= 8.0: return 'E1'
    elif point >= 7.0: return 'E2'
    elif point >= 6.0: return 'E3'
    elif point >= 5.0: return 'F1'
    elif point >= 4.0: return 'F2'
    elif point >= 3.0: return 'F3'
    elif point >= 1.0: return 'G1'
    elif point >= 0.5: return 'G2'
    else: return 'G3'

def get_programme_launch_year(programme_name):
    prog_upper = str(programme_name).upper()
    for key, year in PROGRAMME_LAUNCH.items():
        if key in prog_upper:
            return year
    return 2017

def can_student_be_in_programme(entry_year_str, programme_name):
    launch_year = get_programme_launch_year(programme_name)
    entry_year = int(str(entry_year_str)[:4])
    return entry_year >= launch_year

def get_course_credits(course_code):
    """Get credits for a course from the courses file"""
    course_info = courses_df[courses_df['Course Codes'] == course_code]
    if len(course_info) > 0:
        return int(course_info.iloc[0]['Credit'])
    return 15  # Default

# ============================================================================
# GENERATE DATA
# ============================================================================

output_base = 'Generated_Data'
os.makedirs(output_base, exist_ok=True)

student_course_grades = defaultdict(lambda: {'year3': [], 'year4': []})

print("="*80)
print(" GENERATING DATA FOR ALL YEARS")
print("="*80 + "\n")

for year_idx, year in enumerate(ACADEMIC_YEARS):
    year_code = year.replace('/', '-')
    year_num = int(year[:4])
    is_current_year = year == "2025/26"
    
    print(f"[{year_idx+1}/9] {year}...")
    
    # Create directories
    year_dir = f'{output_base}/{year_code}'
    os.makedirs(year_dir, exist_ok=True)
    os.makedirs(f'{year_dir}/Sem1', exist_ok=True)
    if not is_current_year:
        os.makedirs(f'{year_dir}/Sem2', exist_ok=True)
        os.makedirs(f'{year_dir}/Sem3_Resit', exist_ok=True)
    
    # Get new students
    new_students = students_df[students_df['Academic Year '] == year].copy()
    
    # Get continuing students WITH programme validation
    continuing_students = []
    for prev_year in ACADEMIC_YEARS[:year_idx]:
        prev_students = students_df[students_df['Academic Year '] == prev_year].copy()
        for _, student in prev_students.iterrows():
            entry_level = int(student['Level offered'])
            entry_year = int(str(prev_year)[:4])
            current_level = entry_level + (year_num - entry_year)
            
            if not can_student_be_in_programme(prev_year, student['Course/Degree']):
                continue
            
            if current_level <= 4:
                sc = student.copy()
                sc['current_level'] = current_level
                continuing_students.append(sc)
    
    year_students = pd.concat(
        [new_students] + ([pd.DataFrame(continuing_students)] if continuing_students else []),
        ignore_index=True
    )
    
    print(f"  {len(new_students)} new + {len(continuing_students)} continuing = {len(year_students)} total")
    
    # Storage
    course_reports_sem1 = {}
    course_reports_sem2 = {}
    course_reports_sem3 = {}
    all_enrolments = []
    all_attendance = []
    current_students_list = []
    
    # Process each student
    for _, student in year_students.iterrows():
        sid = str(student['Student_ID'])
        prog = student['Course/Degree']
        
        if 'current_level' in student and pd.notna(student['current_level']):
            current_level = int(student['current_level'])
        else:
            current_level = int(student['Level offered'])
        
        entry_level = int(student['Level offered'])
        entry_year_str = str(student['Academic Year '])
        entry_year_num = int(entry_year_str[:4])
        years_in_institution = year_num - entry_year_num + 1
        
        current_students_list.append({
            'Academic_Year': year,
            'Student_ID': sid,
            'Surname': student['Last Name '],
            'Forename': student['First Name '],
            'Gender': student['Gender '],
            'Date_of_Birth': student['Date of Birth'],
            'Nationality': student['Nationality'],
            'username': f"{str(student['First Name '])[0].lower()}{str(student['Last Name ']).lower().replace(' ', '')}{random.randint(1,999)}",
            'email': student['Uni_Email Address'],
            'Prog_Yr': current_level,
            'Stud_Yr': years_in_institution,
            'AIMS_Start': f"{entry_year_num}-09-20" if 'September' in str(student['Entry Semester ']) else f"{entry_year_num+1}-01-15",
            'AIMS_ExpEnd': f"{entry_year_num + (4 - entry_level)}-06-30",
            'Category': 'UG',
            'Programme_Name': prog
        })
        
        # Generate courses based on PROGRAMME PRESCRIPTION
        semesters = [1, 2] if not is_current_year else [1]
        
        for sem in semesters:
            # Get exact courses for this programme/level/semester
            course_codes = get_courses_for_student(prog, current_level, sem)
            
            for course_code in course_codes:
                credit = get_course_credits(course_code)
                
                # Generate grade
                grade_point = generate_grade_for_student(sid)
                grade_letter = get_grade_letter(grade_point)
                pass_fail = 'Pass' if grade_point >= 9.0 else 'Fail'
                is_np = random.random() < 0.03
                
                # Track for GPA
                if current_level == 3:
                    student_course_grades[sid]['year3'].append({
                        'course': course_code,
                        'credit': credit,
                        'grade_point': grade_point if not is_np else 0,
                        'is_np': is_np
                    })
                elif current_level == 4:
                    student_course_grades[sid]['year4'].append({
                        'course': course_code,
                        'credit': credit,
                        'grade_point': grade_point if not is_np else 0,
                        'is_np': is_np
                    })
                
                # Enrolment
                all_enrolments.append({
                    'Academic_Year': year,
                    'Student_ID': sid,
                    'Course_Code': course_code,
                    'Credits': credit,
                    'Semester': f'Sem{sem}'
                })
                
                # Course report
                report_dict = course_reports_sem1 if sem == 1 else course_reports_sem2
                if course_code not in report_dict:
                    report_dict[course_code] = []
                
                if is_np:
                    report_dict[course_code].append({
                        'Student_ID': sid,
                        'Course_Grade_Point': 'NP',
                        'Overall_Grade': 'NP',
                        'Warning': 'NO PAPER - FOLLOW UP REQUIRED'
                    })
                else:
                    report_dict[course_code].append({
                        'Student_ID': sid,
                        'Course_Grade_Point': grade_point,
                        'Overall_Grade': grade_letter,
                        'Warning': ''
                    })
                
                # Attendance
                attendance_rate = get_attendance_for_student(sid, grade_point)
                attended = int(20 * attendance_rate / 100)
                
                all_attendance.append({
                    'Academic_Year': year,
                    'Semester': f'Sem{sem}',
                    'Student_ID': sid,
                    'Course_Code': course_code,
                    'Total_Sessions': 20,
                    'Sessions_Attended': attended,
                    'Attendance_Percentage': attendance_rate,
                    'Attendance_Status': get_attendance_status(attendance_rate)
                })
                
                # Resit
                if pass_fail == 'Fail' and not is_np and not is_current_year:
                    if course_code not in course_reports_sem3:
                        course_reports_sem3[course_code] = []
                    
                    resit_point = min(generate_grade_for_student(sid) * 1.15, 22.0)
                    course_reports_sem3[course_code].append({
                        'Student_ID': sid,
                        'Course_Grade_Point': resit_point,
                        'Overall_Grade': get_grade_letter(resit_point),
                        'Warning': ''
                    })
    
    # Save files
    pd.DataFrame(current_students_list).to_csv(f'{year_dir}/Current_Students_{year_code}.csv', index=False)
    pd.DataFrame(all_enrolments).to_csv(f'{year_dir}/Course_Enrolments_{year_code}.csv', index=False)
    pd.DataFrame(all_attendance).to_csv(f'{year_dir}/Attendance_{year_code}.csv', index=False)
    
    for course_code, records in course_reports_sem1.items():
        pd.DataFrame(records).to_csv(f'{year_dir}/Sem1/{course_code}_Course_Report_{year_code}.csv', index=False)
    
    if not is_current_year:
        for course_code, records in course_reports_sem2.items():
            pd.DataFrame(records).to_csv(f'{year_dir}/Sem2/{course_code}_Course_Report_{year_code}.csv', index=False)
        
        for course_code, records in course_reports_sem3.items():
            pd.DataFrame(records).to_csv(f'{year_dir}/Sem3_Resit/{course_code}_Resit_{year_code}.csv', index=False)
    
    print(f"  ✓ Saved {len(course_reports_sem1)} Sem1", end="")
    if not is_current_year:
        print(f", {len(course_reports_sem2)} Sem2, {len(course_reports_sem3)} Resit")
    else:
        print(" (Sem1 only)")

# Degree classifications
print("\n" + "="*80)
print(" GENERATING DEGREE CLASSIFICATIONS")
print("="*80 + "\n")

graduates = students_df[students_df['Student Status'].str.contains('Graduated', na=False)].copy()
degree_classifications = []

for _, grad in graduates.iterrows():
    sid = str(grad['Student_ID'])
    prog = grad['Course/Degree']
    entry_level = int(grad['Level offered'])
    
    year3_courses = student_course_grades[sid]['year3']
    year4_courses = student_course_grades[sid]['year4']
    
    if year3_courses:
        total_y3_credits = sum(c['credit'] for c in year3_courses)
        year3_gpa = sum(c['grade_point'] * c['credit'] / total_y3_credits for c in year3_courses)
    else:
        year3_gpa = 0
    
    if year4_courses:
        total_y4_credits = sum(c['credit'] for c in year4_courses)
        year4_gpa = sum(c['grade_point'] * c['credit'] / total_y4_credits for c in year4_courses)
    else:
        year4_gpa = 0
    
    if year3_gpa > 0 and year4_gpa > 0:
        final_gpa = (year3_gpa * 0.5) + (year4_gpa * 0.5)
    elif year4_gpa > 0:
        final_gpa = year4_gpa
    else:
        final_gpa = round(random.triangular(9.0, 22.0, 15.0), 2)
    
    final_gpa = round(final_gpa, 2)
    
    if final_gpa >= 18.0: classification = 'First Class Honours'
    elif final_gpa >= 17.5: classification = 'Borderline 2.1/1st'
    elif final_gpa >= 15.0: classification = 'Upper Second Class Honours'
    elif final_gpa >= 14.5: classification = 'Borderline 2.2/2.1'
    elif final_gpa >= 12.0: classification = 'Lower Second Class Honours'
    elif final_gpa >= 11.5: classification = 'Borderline 3rd/2.2'
    elif final_gpa >= 9.0: classification = 'Third Class Honours'
    elif final_gpa >= 8.5: classification = 'Borderline Fail/3rd'
    else: classification = 'Fail'
    
    # Check if student has any NP in Year 4 (mandatory courses)
    has_year4_np = any(course.get('is_np', False) for course in year4_courses)
    
    # Determine graduation status
    if classification == 'Fail':
        status = 'Deferred'
    elif has_year4_np:
        status = 'Pending'  # Must resit Year 4 NP courses
    elif final_gpa < 9.5:
        status = random.choice(['Graduated', 'Pending'])
    else:
        status = 'Graduated'
    
    grad_year_str = str(grad['Student Status']).replace('Graduated ', '')
    if '/' in grad_year_str:
        grad_year = int('20' + grad_year_str.split('/')[1])
    elif '-' in grad_year_str:
        grad_year = int('20' + grad_year_str.split('-')[1])
    else:
        grad_year = 2020
    
    degree_classifications.append({
        'Student_ID': sid,
        'Programme': prog,
        'Entry_Level': entry_level,
        'Entry_Year': grad['Academic Year '],
        'Total_Credits': (4 - entry_level) * 120,
        'Year_3_GPA': round(year3_gpa, 2) if year3_gpa > 0 else 'N/A',
        'Year_4_GPA': round(year4_gpa, 2) if year4_gpa > 0 else 'N/A',
        'Final_GPA': final_gpa,
        'Degree_Classification': classification,
        'Graduation_Date': f"{grad_year}-06-30",
        'Graduation_Status': status
    })

pd.DataFrame(degree_classifications).to_csv(f'{output_base}/Degree_Classifications.csv', index=False)
print(f"✓ Generated {len(degree_classifications)} degree classifications\n")

# Combined files
print("="*80)
print(" GENERATING COMBINED FILES")
print("="*80 + "\n")

all_current = []
all_enrol = []
all_attend = []

for year_code in [y.replace('/', '-') for y in ACADEMIC_YEARS]:
    year_dir = f'{output_base}/{year_code}'
    all_current.append(pd.read_csv(f'{year_dir}/Current_Students_{year_code}.csv'))
    all_enrol.append(pd.read_csv(f'{year_dir}/Course_Enrolments_{year_code}.csv'))
    all_attend.append(pd.read_csv(f'{year_dir}/Attendance_{year_code}.csv'))

pd.concat(all_current, ignore_index=True).to_csv(f'{output_base}/COMBINED_Current_Students_All_Years.csv', index=False)
pd.concat(all_enrol, ignore_index=True).to_csv(f'{output_base}/COMBINED_Course_Enrolments_All_Years.csv', index=False)
pd.concat(all_attend, ignore_index=True).to_csv(f'{output_base}/COMBINED_Attendance_All_Years.csv', index=False)

print("✓ Combined all files\n")

print("="*80)
print(" ✅ GENERATION COMPLETE!")
print("="*80)
print(f"\nFinished: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
print("\n🎯 KEY FEATURES:")
print("  ✓ Programme-specific course assignments from prescriptions")
print("  ✓ AF students take AF courses ONLY (not BM)")
print("  ✓ Handles dissertation choices (B4501 OR B4502)")
print("  ✓ Student IDs preserved from admissions")
print("  ✓ 50/50 GPA weighting (Year 3 + Year 4)")
print("  ✓ 2025-26: Sem1 only (current year)")
print("\n🚀 Ready for verification and GitHub upload!")
print("="*80)
