"""
GPA Calculation Verification Script
Validates GPA calculations using 50/50 weighting formula
"""

import pandas as pd

# Credit map for weighted GPA calculation
CREDIT_MAP = {
    # Year 3 courses
    'B3001': 15, 'B3002': 15, 'B3004': 30, 'B3005': 30,
    'B3006': 30, 'B3007': 30, 'B3009': 15, 'B3010': 15,
    'B3507': 15, 'B3508': 15, 'B3511': 15, 'B3512': 15,
    
    # Year 4 courses
    'B4003': 30, 'B4005': 30, 'B4006': 30, 'B4007': 15,
    'B4010': 15, 'B4015': 15, 'B4501': 30, 'B4502': 30,
    
    # Add more as needed
}

def calculate_year_gpa(course_grades):
    """
    Calculate credit-weighted GPA for a year
    
    Args:
        course_grades: dict of {course_code: grade_point}
        
    Returns:
        float: Weighted GPA
    """
    total_points = 0
    total_credits = 0
    
    for course_code, grade_point in course_grades.items():
        if grade_point is None or grade_point == 'NP':
            grade_point = 0.0
        
        credits = CREDIT_MAP.get(course_code, 15)  # Default 15 if not found
        total_points += float(grade_point) * credits
        total_credits += credits
    
    if total_credits == 0:
        return 0.0
    
    return round(total_points / total_credits, 2)

def verify_gpa_calculation(student_id, stored_year3, stored_year4, stored_final):
    """
    Verify stored GPA matches calculated GPA
    
    Returns:
        tuple: (is_valid, details_dict)
    """
    # For demonstration - would load actual course results
    # This is a simplified verification
    
    try:
        year3 = float(stored_year3) if stored_year3 != 'N/A' else 0
        year4 = float(stored_year4) if stored_year4 != 'N/A' else 0
        final = float(stored_final)
        
        # Calculate expected final GPA (50/50 weighting)
        expected_final = round((year3 * 0.5) + (year4 * 0.5), 2)
        
        is_valid = abs(expected_final - final) < 0.01  # Allow 0.01 rounding error
        
        return is_valid, {
            'year3': year3,
            'year4': year4,
            'expected_final': expected_final,
            'stored_final': final,
            'difference': round(abs(expected_final - final), 2)
        }
    except:
        return False, {'error': 'Calculation error'}

def run_gpa_verification():
    """Main GPA verification function"""
    print("="*80)
    print("GPA Calculation Verification")
    print("="*80)
    
    # Load degree classifications
    df = pd.read_csv('Degree_Classifications.csv')
    
    # Sample students for verification
    sample = df.sample(n=20, random_state=42)
    
    results = []
    
    for _, student in sample.iterrows():
        student_id = student['Student_ID']
        year3_gpa = student['Year_3_GPA']
        year4_gpa = student['Year_4_GPA']
        final_gpa = student['Final_GPA']
        
        is_valid, details = verify_gpa_calculation(
            student_id, year3_gpa, year4_gpa, final_gpa
        )
        
        results.append({
            'Student_ID': student_id,
            'Valid': is_valid,
            'Details': details
        })
        
        status = "✓ PASS" if is_valid else "✗ FAIL"
        if 'error' not in details:
            print(f"{status} | {student_id} | "
                  f"Y3: {details['year3']:.2f} | "
                  f"Y4: {details['year4']:.2f} | "
                  f"Final: {details['stored_final']:.2f} "
                  f"(Expected: {details['expected_final']:.2f})")
        else:
            print(f"{status} | {student_id} | {details['error']}")
    
    # Summary
    print("\n" + "="*80)
    passed = sum(1 for r in results if r['Valid'])
    print(f"Results: {passed}/{len(sample)} GPAs verified correctly")
    print(f"Success Rate: {passed/len(sample)*100:.1f}%")
    print("="*80)
    
    return passed == len(sample)

if __name__ == '__main__':
    success = run_gpa_verification()
    exit(0 if success else 1)
