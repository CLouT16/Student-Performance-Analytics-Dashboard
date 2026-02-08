# Student Performance Analytics Dashboard

**AFG College with University of Aberdeen**

Interactive analytics dashboard for student performance data across 9 academic years (2017-2025).

---

## Project Overview

This dashboard analyzes performance data for 4,246 undergraduate students across four schools: Business, Social Science, Natural & Computing Sciences, and Legal Studies.

## Dashboard Features

### Analytics Sections

**Enrollment Trends**
- Track enrollment growth over 9 years
- View distribution across schools and programmes
- Monitor year-over-year changes

**Academic Performance**
- GPA distribution analysis
- Pass/fail rates by school
- Grade distribution using Common Grading Scale (CGS)
- Performance trends over time

**Programme Comparison**
- Compare performance across programmes
- Analyze completion rates
- View programme effectiveness metrics

**Retention & Attrition**
- Monitor student retention rates
- Track dropout patterns
- Analyze completion by cohort

**Degree Classifications**
- View distribution of degree classifications
- Analyze outcomes by programme
- Track graduation success rates

**Demographics**
- Gender distribution across programmes
- Nationality diversity (35+ countries)
- Age demographics
- Disability status
- English proficiency levels
- Educational system backgrounds

### Interactive Features

**Query Builder**
Filter data by academic year, school, programme, gender, and nationality. All visualizations update in real-time.

**Export Functionality**
Download filtered datasets as CSV files for further analysis.

**Responsive Design**
Works on desktop, tablet, and mobile devices.

---

## Technical Stack

- HTML5, CSS3, JavaScript (ES6+)
- Chart.js for visualizations
- PapaParse for CSV processing
- Client-side processing (no backend required)

---

## Data Files

The dashboard uses 6 CSV files:

1. `01_Admissions_Synthetic_Data.csv` - Application and admission records
2. `02_COMBINED_Current_Students_All_Years.csv` - Student status by year
3. `03_COMBINED_Course_Enrolments_All_Years.csv` - Course enrollment records
4. `04_COMBINED_Current_Students_All_Years.csv` - Course grades and reports
5. `05_COMBINED_Attendance_All_Years.csv` - Attendance tracking
6. `06_Degree_Classifications.csv` - Graduate outcomes

---

## Setup Instructions

### Local Testing

```bash
# Clone repository
git clone https://github.com/CLouT16/Student-Performance-Analytics-Dashboard.git
cd Student-Performance-Analytics-Dashboard

# Start local server
python -m http.server 8000

# Open browser to http://localhost:8000
```

### GitHub Pages Deployment

1. Push code to GitHub repository
2. Go to Settings → Pages
3. Select main branch as source
4. Dashboard will be live at: https://clout16.github.io/Student-Performance-Analytics-Dashboard/

---

## Project Structure

```
Student-Performance-Analytics-Dashboard/
├── index.html                 # Main dashboard
├── css/
│   └── dashboard.css         # Styling
├── js/
│   ├── main.js               # Initialization
│   ├── dataLoader.js         # Data processing
│   ├── charts.js             # Visualizations
│   ├── queryBuilder.js       # Filters
│   └── insights.js           # Recommendations
└── data/                     # CSV data files
    ├── 01_Admissions_Synthetic_Data.csv
    ├── 02_COMBINED_Current_Students_All_Years.csv
    ├── 03_COMBINED_Course_Enrolments_All_Years.csv
    ├── 04_COMBINED_Current_Students_All_Years.csv
    ├── 05_COMBINED_Attendance_All_Years.csv
    └── 06_Degree_Classifications.csv
```

---

## Academic Context

**Project:** Building a Student Performance Analytics Dashboard for Strategic Decision-Making

**Programme:** MSc Data Science (Online), University of Aberdeen

**Academic Year:** 2025-2026

**Components:**
- Synthetic data generation (Python/SQL)
- Interactive web dashboard (HTML/CSS/JavaScript)
- Automated analytics and insights
- Comprehensive documentation

---

## Data Privacy

All data is synthetic and generated for academic purposes. No real student information is included.

---

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

---

## Performance

- Handles 4,246 student records efficiently
- Load time: 2-3 seconds
- Filter updates: <1 second
- Smooth interaction across all devices

---

## Documentation

Additional documentation available:
- DEPLOYMENT.md - Deployment instructions
- DATA_STRUCTURE.md - CSV file specifications
- QUICKSTART.md - Quick setup guide

---

## Contact

**Developer:** Cindy Lou  
**Institution:** AFG College with University of Aberdeen  
**Programme:** MSc Data Science (Online)

---

**Last Updated:** February 2026
