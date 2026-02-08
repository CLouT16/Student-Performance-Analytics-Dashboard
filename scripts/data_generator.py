"""
Student Performance Analytics - Data Generator
Generates synthetic student data for 9 academic years (2017-2026)

Features:
- Programme-specific course assignments
- Credit-weighted GPA calculations (50/50 Year 3 + Year 4)
- Realistic attendance patterns
- Degree classification bands
"""

import pandas as pd
import random
import os
from datetime import datetime
from collections import defaultdict

# Configuration
RANDOM_SEED = 42
random.seed(RANDOM_SEED)

print("="*80)
print("Student Performance Analytics - Data Generator")
print("="*80)
print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

# ============================================================================
# Programme Course Mappings
# ============================================================================

# Business Management
BM_COURSES = {
    1: {
        'Sem1': ['GS1001', 'GS1002', 'B1003', 'B1004'],
        'Sem2': ['B1501', 'B1502', 'B1503', 'B1504']
    },
    2: {
        'Sem1': ['B2004', 'B2006', 'B2007', 'B2009'],
        'Sem2': ['B2504', 'B2505', 'B2506', 'B2501']
    },
    3: {
        'Sem1': ['B3004', 'B3005'],
        'Sem2': ['B3006', 'B3007']
    },
    4: {
        'Sem1': ['B4005', 'B4006'],
        'Sem2': ['B4007']
    }
}

# Accountancy & Finance
AF_COURSES = {
    1: {
        'Sem1': ['GS1001', 'GS1002', 'B1003', 'B1004'],
        'Sem2': ['B1501', 'B1502', 'B1503', 'B1504']
    },
    2: {
        'Sem1': ['B2001', 'B2002', 'B2003', 'B2004'],
        'Sem2': ['B2501', 'B2502', 'B2503', 'B2504']
    },
    3: {
        'Sem1': ['B3001', 'B3002', 'B3009', 'B3010'],
        'Sem2': ['B3507', 'B3508', 'B3511', 'B3512']
    },
    4: {
        'Sem1': ['B4003', 'B4007'],
        'Sem2': ['B4010', 'B4015', 'B4501']  # B4501 OR B4502 dissertation
    }
}

# Business Management - Information Systems
BM_IS_COURSES = {
    1: {
        'Sem1': ['GS1001', 'GS1002', 'B1003', 'B1004'],
        'Sem2': ['B1501', 'B1502', 'B1503', 'I1501']
    },
    2: {
        'Sem1': ['B2004', 'B2006', 'B2007', 'B2009'],
        'Sem2': ['B2504', 'B2505', 'B2506', 'I2501']
    },
    3: {
        'Sem1': ['B3004', 'B3005'],
        'Sem2': ['B3006', 'I3501']
    },
    4: {
        'Sem1': ['B4005', 'I4501'],
        'Sem2': ['I4502']
    }
}

# Business Management - International Relations
BM_IR_COURSES = {
    1: {
        'Sem1': ['GS1001', 'GS1002', 'B1003', 'B1004'],
        'Sem2': ['B1501', 'B1502', 'B1503', 'I1501']
    },
    2: {
        'Sem1': ['B2004', 'B2006', 'B2007', 'I2001'],
        'Sem2': ['B2504', 'B2505', 'B2506', 'I2501']
    },
    3: {
        'Sem1': ['B3004', 'I3001'],
        'Sem2': ['B3006', 'I3501']
    },
    4: {
        'Sem1': ['B4005', 'I4001'],
        'Sem2': ['I4502']
    }
}

# Computing Science
CS_COURSES = {
    1: {
        'Sem1': ['GS1001', 'C1001', 'C1002', 'C1003'],
        'Sem2': ['B1501', 'C1504', 'C1505', 'C1506']  # Elective: B1501-B1504 or I1501
    },
    2: {
        'Sem1': ['C2001', 'C2002', 'C2003', 'C2004'],
        'Sem2': ['C2501', 'C2502', 'C2503', 'B2501']  # Elective: B2501-B2506
    },
    3: {
        'Sem1': ['C3001', 'C3002'],
        'Sem2': ['C3501', 'C3502']
    },
    4: {
        'Sem1': ['C4501', 'C4502', 'C4503'],  # Only 3 courses in Year 4
        'Sem2': []
    }
}

# ============================================================================
# Credit Assignments
# ============================================================================

CREDIT_MAP = {
    # Year 1-2: All 15 credits
    'GS1001': 15, 'GS1002': 15, 'B1003': 15, 'B1004': 15,
    'B1501': 15, 'B1502': 15, 'B1503': 15, 'B1504': 15, 'I1501': 15,
    'B2001': 15, 'B2002': 15, 'B2003': 15, 'B2004': 15,
    'B2006': 15, 'B2007': 15, 'B2009': 15,
    'B2501': 15, 'B2502': 15, 'B2503': 15, 'B2504': 15,
    'B2505': 15, 'B2506': 15, 'I2001': 15, 'I2501': 15,
    
    # Year 3: Mix of 15 and 30 credits
    'B3001': 15, 'B3002': 15, 'B3004': 30, 'B3005': 30,
    'B3006': 30, 'B3007': 30, 'B3009': 15, 'B3010': 15,
    'B3507': 15, 'B3508': 15, 'B3511': 15, 'B3512': 15,
    'I3001': 30, 'I3501': 30,
    
    # Year 4: Mix of 15, 30, and 60 credits
    'B4003': 30, 'B4005': 30, 'B4006': 30, 'B4007': 15,
    'B4010': 15, 'B4015': 15, 'B4501': 30, 'B4502': 30,
    'I4001': 30, 'I4501': 30, 'I4502': 60,
    
    # Computing Science courses
    'C1001': 15, 'C1002': 15, 'C1003': 15, 'C1504': 15, 'C1505': 15, 'C1506': 15,
    'C2001': 15, 'C2002': 15, 'C2003': 15, 'C2004': 15,
    'C2501': 15, 'C2502': 15, 'C2503': 15,
    'C3001': 30, 'C3002': 30, 'C3501': 30, 'C3502': 30,
    'C4501': 30, 'C4502': 30, 'C4503': 30, 'C4505': 60
}

# ============================================================================
# Helper Functions
# ============================================================================

def get_programme_courses(programme_name):
    """Return course dictionary for given programme"""
    prog_map = {
        'Business Management': BM_COURSES,
        'Accountancy & Finance': AF_COURSES,
        'Business Management and Information Systems': BM_IS_COURSES,
        'Business Management and International Relations': BM_IR_COURSES,
        'Computing Science': CS_COURSES
    }
    return prog_map.get(programme_name, BM_COURSES)

def generate_grade():
    """Generate realistic grade distribution"""
    rand = random.random()
    
    # NP (No Paper): 3%
    if rand < 0.03:
        return 'NP', None
    
    # Grade distribution (Common Grading Scale)
    if rand < 0.05:
        return random.choice(['A1', 'A2']), round(random.uniform(20.0, 22.0), 2)
    elif rand < 0.15:
        return random.choice(['A3', 'A4', 'A5']), round(random.uniform(18.0, 19.99), 2)
    elif rand < 0.40:
        return random.choice(['B1', 'B2', 'B3']), round(random.uniform(15.0, 17.99), 2)
    elif rand < 0.70:
        return random.choice(['C1', 'C2', 'C3']), round(random.uniform(12.0, 14.99), 2)
    elif rand < 0.90:
        return random.choice(['D1', 'D2', 'D3']), round(random.uniform(9.0, 11.99), 2)
    else:
        return random.choice(['E1', 'E2', 'E3', 'F1', 'F2', 'F3']), round(random.uniform(0.0, 8.99), 2)

def calculate_gpa(grades_dict):
    """Calculate credit-weighted GPA"""
    total_points = 0
    total_credits = 0
    
    for course_code, grade_point in grades_dict.items():
        if grade_point is not None:  # Skip NP
            credits = CREDIT_MAP.get(course_code, 15)
            total_points += grade_point * credits
            total_credits += credits
    
    if total_credits == 0:
        return 0.0
    
    return round(total_points / total_credits, 2)

def determine_classification(final_gpa):
    """Determine degree classification from final GPA"""
    if final_gpa >= 18.0:
        return 'First Class Honours'
    elif final_gpa >= 17.5:
        return 'Borderline 2.1/1st'
    elif final_gpa >= 15.0:
        return 'Upper Second Class Honours'
    elif final_gpa >= 14.5:
        return 'Borderline 2.2/2.1'
    elif final_gpa >= 12.0:
        return 'Lower Second Class Honours'
    elif final_gpa >= 11.5:
        return 'Borderline 3rd/2.2'
    elif final_gpa >= 9.0:
        return 'Third Class Honours'
    elif final_gpa >= 8.5:
        return 'Borderline Fail/3rd'
    else:
        return 'Fail'

# ============================================================================
# Main Generation Logic
# ============================================================================

def generate_all_data():
    """Main function to generate all years of data"""
    
    # Load admissions data
    admissions_df = pd.read_csv('01_Admissions_Synthetic_Data.csv')
    
    output_dir = 'Generated_Data'
    os.makedirs(output_dir, exist_ok=True)
    
    all_students = []
    all_enrolments = []
    all_attendance = []
    all_classifications = []
    
    # Generate data year by year
    for year in range(2017, 2026):
        year_str = f"{year}/{str(year+1)[2:]}"
        print(f"\nGenerating {year_str}...")
        
        # Filter students for this year
        year_students = admissions_df[admissions_df['Academic_Year'] == year_str]
        
        for _, student in year_students.iterrows():
            student_id = student['Student_ID']
            programme = student['Programme_Name']
            prog_yr = student['Prog_Yr']
            
            # Get programme courses
            prog_courses = get_programme_courses(programme)
            
            if prog_yr not in prog_courses:
                continue
            
            # Generate semester data
            for semester in ['Sem1', 'Sem2']:
                if semester in prog_courses[prog_yr]:
                    for course_code in prog_courses[prog_yr][semester]:
                        credits = CREDIT_MAP.get(course_code, 15)
                        
                        # Generate grade
                        grade, grade_point = generate_grade()
                        
                        # Generate attendance
                        attendance_pct = round(random.uniform(40, 100), 2)
                        sessions_attended = int(20 * attendance_pct / 100)
                        
                        if attendance_pct >= 80:
                            status = 'Good'
                        elif attendance_pct >= 60:
                            status = 'Warning'
                        else:
                            status = 'Concern'
                        
                        # Record enrolment
                        all_enrolments.append({
                            'Academic_Year': year_str,
                            'Student_ID': student_id,
                            'Course_Code': course_code,
                            'Credits': credits,
                            'Semester': semester
                        })
                        
                        # Record attendance
                        all_attendance.append({
                            'Academic_Year': year_str,
                            'Semester': semester,
                            'Student_ID': student_id,
                            'Course_Code': course_code,
                            'Total_Sessions': 20,
                            'Sessions_Attended': sessions_attended,
                            'Attendance_Percentage': attendance_pct,
                            'Attendance_Status': status
                        })
    
    # Save combined files
    pd.DataFrame(all_enrolments).to_csv(
        f'{output_dir}/COMBINED_Course_Enrolments_All_Years.csv', index=False
    )
    pd.DataFrame(all_attendance).to_csv(
        f'{output_dir}/COMBINED_Attendance_All_Years.csv', index=False
    )
    
    print("\n" + "="*80)
    print("Data Generation Complete!")
    print(f"Total Enrolments: {len(all_enrolments):,}")
    print(f"Total Attendance Records: {len(all_attendance):,}")
    print("="*80)

if __name__ == '__main__':
    generate_all_data()
