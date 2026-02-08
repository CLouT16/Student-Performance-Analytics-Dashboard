"""
Programme Course Verification Script
Validates that students are enrolled in correct programme-specific courses
"""

import pandas as pd
import random

# Programme course mappings for verification
PROGRAMME_COURSES = {
    'Business Management': {
        1: ['GS1001', 'GS1002', 'B1003', 'B1004', 'B1501', 'B1502', 'B1503', 'B1504'],
        2: ['B2004', 'B2006', 'B2007', 'B2009', 'B2504', 'B2505', 'B2506', 'B2501'],
        3: ['B3004', 'B3005', 'B3006', 'B3007'],
        4: ['B4005', 'B4006', 'B4007']
    },
    'Accountancy & Finance': {
        1: ['GS1001', 'GS1002', 'B1003', 'B1004', 'B1501', 'B1502', 'B1503', 'B1504'],
        2: ['B2001', 'B2002', 'B2003', 'B2004', 'B2501', 'B2502', 'B2503', 'B2504'],
        3: ['B3001', 'B3002', 'B3009', 'B3010', 'B3507', 'B3508', 'B3511', 'B3512'],
        4: ['B4003', 'B4007', 'B4010', 'B4015', 'B4501', 'B4502']
    },
    'Computing Science': {
        1: ['GS1001', 'C1001', 'C1002', 'C1003', 'B1501', 'C1504', 'C1505', 'C1506'],
        2: ['C2001', 'C2002', 'C2003', 'C2004', 'C2501', 'C2502', 'C2503', 'B2501'],
        3: ['C3001', 'C3002', 'C3501', 'C3502'],
        4: ['C4501', 'C4502', 'C4503', 'C4505']
    }
}

def verify_student_courses(student_id, programme, prog_yr, enrolled_courses):
    """
    Verify a student's courses match their programme requirements
    
    Returns:
        tuple: (is_valid, error_message)
    """
    if programme not in PROGRAMME_COURSES:
        return True, "Programme not in verification list"
    
    if prog_yr not in PROGRAMME_COURSES[programme]:
        return True, f"Year {prog_yr} not defined for {programme}"
    
    valid_courses = set(PROGRAMME_COURSES[programme][prog_yr])
    enrolled_set = set(enrolled_courses)
    
    # Check if all enrolled courses are valid
    invalid_courses = enrolled_set - valid_courses
    
    if invalid_courses:
        return False, f"Invalid courses: {invalid_courses}"
    
    return True, "All courses valid"

def run_verification():
    """Main verification function"""
    print("="*80)
    print("Programme Course Verification")
    print("="*80)
    
    # Load data
    students_df = pd.read_csv('COMBINED_Current_Students_All_Years.csv')
    enrolments_df = pd.read_csv('COMBINED_Course_Enrolments_All_Years.csv')
    
    # Sample random students for verification
    sample_size = 20
    sample_students = students_df.sample(n=sample_size, random_state=42)
    
    results = []
    
    for _, student in sample_students.iterrows():
        student_id = student['Student_ID']
        programme = student['Programme_Name']
        prog_yr = student['Prog_Yr']
        academic_year = student['Academic_Year']
        
        # Get student's enrolled courses
        student_courses = enrolments_df[
            (enrolments_df['Student_ID'] == student_id) &
            (enrolments_df['Academic_Year'] == academic_year)
        ]['Course_Code'].tolist()
        
        # Verify
        is_valid, message = verify_student_courses(
            student_id, programme, prog_yr, student_courses
        )
        
        results.append({
            'Student_ID': student_id,
            'Programme': programme,
            'Year': prog_yr,
            'Valid': is_valid,
            'Message': message
        })
        
        status = "✓ PASS" if is_valid else "✗ FAIL"
        print(f"{status} | {student_id} | {programme} Y{prog_yr} | {message}")
    
    # Summary
    print("\n" + "="*80)
    passed = sum(1 for r in results if r['Valid'])
    print(f"Results: {passed}/{sample_size} students passed verification")
    print(f"Success Rate: {passed/sample_size*100:.1f}%")
    print("="*80)
    
    return passed == sample_size

if __name__ == '__main__':
    success = run_verification()
    exit(0 if success else 1)
