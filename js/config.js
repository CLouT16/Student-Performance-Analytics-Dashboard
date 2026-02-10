// Centralized Configuration for Student Performance Analytics Dashboard
const CONFIG = {
    // CSV file paths
    csvPaths: {
        admissions:      'data/01_Admissions_Synthetic_Data.csv',
        currentStudents: 'data/02_COMBINED_Current_Students_All_Years.csv',
        enrollments:     'data/03_COMBINED_Course_Enrolments_All_Years.csv',
        attendance:      'data/04_COMBINED_Attendance_All_Years.csv',
        classifications: 'data/05_Degree_Classifications.csv',
        courseResults:    'data/06_COMBINED_Course_Results_All_Years.csv'
    },

    // Scottish Common Grading Scale (CGS) — full mapping
    // Grade → { points, pass }
    gradeScale: {
        'A2': { points: 22, pass: true },
        'A3': { points: 21, pass: true },
        'A4': { points: 20, pass: true },
        'A5': { points: 19, pass: true },
        'B1': { points: 18, pass: true },
        'B2': { points: 17, pass: true },
        'B3': { points: 16, pass: true },
        'C1': { points: 15, pass: true },
        'C2': { points: 14, pass: true },
        'C3': { points: 13, pass: true },
        'D1': { points: 12, pass: true },
        'D2': { points: 11, pass: true },
        'D3': { points: 10, pass: true },
        'E1': { points: 9,  pass: true },
        'E2': { points: 8,  pass: true },
        'E3': { points: 7,  pass: true },
        'F1': { points: 6,  pass: true },
        'F2': { points: 5,  pass: true },
        'F3': { points: 4,  pass: true },
        'G1': { points: 3,  pass: false },
        'G2': { points: 2,  pass: false },
        'G3': { points: 1,  pass: false },
        'NP': { points: 0,  pass: false }
    },

    // Ordered list of CGS grades for chart display (best → worst)
    gradeOrder: [
        'A2','A3','A4','A5',
        'B1','B2','B3',
        'C1','C2','C3',
        'D1','D2','D3',
        'E1','E2','E3',
        'F1','F2','F3',
        'G1','G2','G3',
        'NP'
    ],

    // GPA distribution ranges for charts (0–22 scale)
    gpaRanges: [
        { label: '0–4',   min: 0,  max: 4  },
        { label: '5–8',   min: 5,  max: 8  },
        { label: '9–12',  min: 9,  max: 12 },
        { label: '13–16', min: 13, max: 16 },
        { label: '17–20', min: 17, max: 20 },
        { label: '21–22', min: 21, max: 22 }
    ],

    // Programme → School mapping
    programmeToSchool: {
        'Accountancy & Finance':                          'Business',
        'Business Management':                            'Business',
        'Business Management and Information Systems':    'Business',
        'Business Management and International Relations': 'Social Science',
        'Computing Science':                              'Natural & Computing Sciences',
        'Legal Studies':                                  'Legal Studies',
        'Politics and International Relations':           'Social Science'
    },

    // Degree classification display order (best → worst)
    classificationOrder: [
        'First Class Honours',
        'Borderline 2.1/1st',
        'Upper Second Class Honours',
        'Borderline 2.2/2.1',
        'Lower Second Class Honours',
        'Borderline 3rd/2.2',
        'Third Class Honours',
        'Borderline Fail/3rd',
        'Fail'
    ],

    // IELTS → Proficiency band mapping
    ieltsBands: [
        { label: 'Advanced',      min: 7.5, max: 9.0  },
        { label: 'Proficient',    min: 6.5, max: 7.4  },
        { label: 'Intermediate',  min: 5.5, max: 6.4  },
        { label: 'Beginner',      min: 0,   max: 5.4  }
    ],

    // Chart color palette — soothing, muted tones
    colors: {
        primary:   '#4b7baa',
        secondary: '#5a9e8f',
        success:   '#6aab8e',
        warning:   '#d4a843',
        danger:    '#c05c5c',
        info:      '#6b8db5',
        palette: [
            '#4b7baa', '#5a9e8f', '#8b7eb8', '#c5885a',
            '#6aab8e', '#b56e8a', '#5d84a3', '#d4a843',
            '#5a8f8f', '#9b8ec0', '#a87c54', '#5e9a72'
        ]
    },

    // Admission statuses to exclude from student analysis
    excludedStatuses: ['Rejected', 'Not Interested'],

    // Programme abbreviations for chart labels
    programmeAbbreviations: {
        'Accountancy & Finance':                          'AF',
        'Business Management':                            'BM',
        'Business Management and Information Systems':    'BM-IS',
        'Business Management and International Relations': 'BM-IR',
        'Computing Science':                              'CS',
        'Legal Studies':                                  'LS',
        'Politics and International Relations':           'PIR'
    },

    // Helper: get abbreviated programme name for charts
    abbrevProgramme(name) {
        return this.programmeAbbreviations[name] || name;
    },

    // Junk values to exclude from "How did you hear about us?" referral source
    referralJunkValues: ['6.5', '7', '6', 'Chemistry'],

    // Helper: get school for a programme name
    getSchool(programme) {
        return this.programmeToSchool[programme] || 'Other';
    },

    // CSV schemas — required columns for validation on import
    csvSchemas: {
        admissions: ['Student_ID', 'First Name', 'Last Name', 'Gender', 'Nationality', 'Date of Birth', 'Course/Degree', 'Student Status', 'Academic Year'],
        currentStudents: ['Student_ID', 'Academic_Year', 'Surname', 'Forename', 'Gender', 'Nationality', 'Programme_Name'],
        enrollments: ['Student_ID', 'Academic_Year', 'Course_Code', 'Credits', 'Semester'],
        attendance: ['Student_ID', 'Academic_Year', 'Semester', 'Course_Code', 'Total_Sessions', 'Sessions_Attended', 'Attendance_Percentage', 'Attendance_Status'],
        classifications: ['Student_ID', 'Programme', 'Final_GPA', 'Degree_Classification', 'Graduation_Status'],
        courseResults: ['Student_ID', 'Academic_Year', 'Semester', 'Course_Code', 'Course_Grade_Point', 'Overall_Grade']
    },

    // Degree classification colors (matches classificationOrder)
    classificationColors: [
        '#1a7a3a', // First Class Honours — dark green
        '#3a9e5c', // Borderline 2.1/1st — lighter green
        '#4baa6e', // Upper Second Class Honours — green
        '#7dbf8e', // Borderline 2.2/2.1 — light green
        '#d4a843', // Lower Second Class Honours — amber
        '#c5965a', // Borderline 3rd/2.2 — light brown
        '#b07840', // Third Class Honours — warm brown
        '#c07858', // Borderline Fail/3rd — light red-brown
        '#c05c5c'  // Fail — red
    ],

    // Short labels for classification chart x-axis
    classificationLabels: [
        '1st', 'BL 2:1/1st', '2:1', 'BL 2:2/2:1', '2:2', 'BL 3rd/2:2', '3rd', 'BL Fail/3rd', 'Fail'
    ],

    // Helper: is a CGS grade a pass?
    isPass(grade) {
        const entry = this.gradeScale[grade];
        return entry ? entry.pass : false;
    },

    // Helper: IELTS score → proficiency label
    getProficiency(ieltsScore) {
        if (ieltsScore == null || isNaN(ieltsScore)) return 'Not Specified';
        const score = parseFloat(ieltsScore);
        for (const band of this.ieltsBands) {
            if (score >= band.min && score <= band.max) return band.label;
        }
        return 'Not Specified';
    }
};
