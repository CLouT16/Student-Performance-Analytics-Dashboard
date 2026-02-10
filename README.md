# Student Performance Analytics Dashboard

An interactive, client-side analytics dashboard for monitoring undergraduate student performance across 9 academic years (2017/18 - 2025/26). Built as part of an MSc Data Science thesis project using synthetic student data across 7 undergraduate programmes.

## Live Demo

**GitHub Pages:** https://clout16.github.io/Student-Performance-Analytics-Dashboard/

**Standalone:** Open `dashboard_standalone.html` directly in any browser (no server required). This single file embeds all CSS, JavaScript, and CSV data.

---

## Features

### Management Overview (Home Page)

Strategic KPIs visible immediately without tab switching:

| Chart | Description |
|-------|-------------|
| **Recruitment Sources** | Horizontal bar showing how applicants discovered the university (cleaned of junk values) |
| **Recruitment Source Effectiveness** | Stacked bar breaking down each source into graduated, registered, dropped, rejected, not interested |
| **Admissions Conversion Funnel** | Total applicants through to graduated, including rejection and offer breakdowns |
| **Degree Classification by Programme** | Stacked horizontal bar showing First, Upper Second, Lower Second, Third, Fail per programme |
| **Attendance Risk Overview** | Doughnut showing Good/Warning/Concern distribution |
| **Education System Performance** | Average GPA by prior education system (IB, A-Level, Foundation Year, etc.) |
| **New vs Returning Students** | Stacked bar showing new and returning students by academic year |

A **Recruitment Source Summary Table** sits below the charts with sortable columns: Source, Applicants, Rejected, Not Interested, Registered, Graduated, Dropped, Conversion Rate, and Graduation Rate.

### Tab-Based Analytics

| Tab | Charts & Tables |
|-----|----------------|
| **Enrollment Trends** | Enrollment over time (line), by school (doughnut), by programme (horizontal bar), summary table |
| **Academic Performance** | GPA distribution, pass/fail rates by programme (horizontal stacked), average GPA by programme, CGS grade distribution |
| **Programme Comparison** | Completion rates by programme, performance matrix (scatter: enrollment size vs GPA) |
| **Retention & Attrition** | Retention rate over time (line), attrition rate by school, completion rate by cohort (line) |
| **Demographics** | Gender (doughnut), top 10 nationalities, age distribution, English proficiency levels (doughnut) |
| **Insights** | Auto-generated enrollment, performance, retention, demographic insights with strategic recommendations |

### Interactive Filtering

- Filter by: Academic Year, School, Programme, Gender, Nationality, Attendance Status, Degree Classification, Entry Level, GPA Range, and free-text search
- Filter chips with one-click removal
- Cascading dropdowns (School filters Programme options)
- All charts and tables update in real-time when filters are applied
- Export filtered data as CSV
- Filters collapse by default to keep data prominent

### Responsive Design

Optimised for iPad (portrait & landscape), phones (including small screens), and desktop/laptop displays. Touch-friendly controls with minimum 44px tap targets.

---

## Technical Architecture

### Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Chart.js** | 4.4.0 | All 21+ chart visualizations |
| **PapaParse** | 5.4.1 | CSV parsing |
| **Inter** | Google Fonts | Typography |
| **HTML5/CSS3/ES6** | - | Core structure, styling, logic |

No build tools, no npm, no backend server required. Pure client-side processing.

### Module Structure

```
js/
  config.js       Central configuration (CSV paths, grade scales, colour palette, programme-to-school mapping)
  dataLoader.js   Loads and processes all 6 CSV files with progress feedback
  dataStore.js    Filtering, querying, and metric calculations (30+ methods)
  charts.js       Creates and updates 21+ Chart.js visualizations
  tables.js       Sortable data tables for each section
  queryPanel.js   Filter panel, tab navigation, header stats, filter chips
  insights.js     Auto-generated insights and strategic recommendations
  app.js          Entry point (DOMContentLoaded initialiser)
```

### Data Flow

```
CSV Files (data/)
    |
    v
DataLoader (parse, clean, index)
    |
    v
DataStore (filter, query, calculate)
    |
    v
ChartsManager / TablesManager / InsightsGenerator / QueryPanel
    |
    v
Browser DOM (Chart.js canvases, HTML tables, stat cards)
```

### Key Design Decisions

1. **Two applicant arrays**: `students` (excludes Rejected/Not Interested) for academic analysis; `allApplicants` (includes all) for management overview metrics so admissions can track rejection rates
2. **Registered students** = unique student IDs from `current_students` data (not course enrolment rows)
3. **GPA scale**: Scottish Common Grading Scale (CGS) with 22-point system (A2=22 down to NP=0)
4. **Charts created once, updated in-place**: `ChartsManager.initializeCharts()` creates all Chart.js instances; `updateAllCharts()` updates their data without destroying/recreating
5. **Classification bands**: Degree classifications grouped into 5 bands (First, Upper Second, Lower Second, Third, Fail) with borderline grades merged into the nearest main class
6. **Auto-updating**: Dashboard automatically reflects new data when CSV files are updated - no code changes needed

---

## Data Files

### Combined Data (`data/`)

| File | Records | Description |
|------|---------|-------------|
| `01_Admissions_Synthetic_Data.csv` | 4,247 | Application and admission records including offer types, referral source, sponsorship status |
| `02_COMBINED_Current_Students_All_Years.csv` | 9,381 | Student registrations by academic year (3,038 unique students across up to 4 years each) |
| `03_COMBINED_Course_Enrolments_All_Years.csv` | ~17,000 | Course enrolment records per student per semester |
| `04_COMBINED_Attendance_All_Years.csv` | ~19,000 | Attendance percentage and status (Good/Warning/Concern) per student per semester |
| `05_Degree_Classifications.csv` | ~1,200 | Final GPA, degree classification, and graduation status for completed students |
| `06_COMBINED_Course_Results_All_Years.csv` | ~19,000 | Individual course grades (CGS scale) with pass/fail status |

### Yearly Breakdown (`generated_data/`)

Complete per-year data from 2017/18 through 2025/26, including:
- Current student lists
- Course reports by semester (Sem1, Sem2, Sem3_Resit)

### Database Schema (`database/`)

- `create_database_schema.sql` - MySQL schema for all tables
- `create_analytics_views.sql` - Pre-built analytical views
- `dashboard_queries.sql` - Key dashboard queries
- `import_data.sql` - Data import scripts

### Utility Scripts (`scripts/`)

- `data_generator.py` - Generates all synthetic student data
- `combine_course_results.py` - Combines yearly course results into file 06
- `build_standalone.py` - Builds the self-contained `dashboard_standalone.html`
- `verify_gpa.py` - Validates GPA calculations against the CGS scale
- `verify_programme_courses.py` - Validates course-programme assignments

---

## Setup

### Option 1: Standalone (Recommended for Quick View)

Open `dashboard_standalone.html` in any modern browser. Everything is embedded - no server needed.

### Option 2: Local Server

```bash
git clone https://github.com/CLouT16/Student-Performance-Analytics-Dashboard.git
cd Student-Performance-Analytics-Dashboard
python3 -m http.server 8000
```

Open http://localhost:8000 in your browser.

### Option 3: GitHub Pages

The repository is configured for GitHub Pages deployment from the `main` branch. Enable Pages in repository Settings > Pages > Source: Deploy from branch > `main`.

---

## Programmes & Schools

| Programme | School |
|-----------|--------|
| Accountancy & Finance | Business |
| Business Management | Business |
| Business Management and Information Systems | Business |
| Business Management and International Relations | Social Science |
| Computing Science | Natural & Computing Sciences |
| Legal Studies | Legal Studies |
| Politics and International Relations | Social Science |

---

## Key Metrics Explained

| Metric | Calculation |
|--------|-------------|
| **Total Applicants** | Count of all records in admissions data (includes rejected and not interested) |
| **Registered Students** | Count of unique student IDs in current_students data |
| **Average GPA** | Mean of final_gpa from degree classifications (0-22 CGS scale) |
| **Avg Attendance** | Mean of attendance_percentage across all attendance records |
| **Completion Rate** | Graduates / Students who entered 4+ years ago |
| **Retention Rate** | Year-1 students who returned as Year-2+ in the next academic year |
| **Conversion Rate** | Registered students / Total applicants per recruitment source |
| **Graduation Rate** | Graduated students / Registered students per recruitment source |

---

## Browser Support

| Browser | Minimum Version |
|---------|----------------|
| Chrome / Edge | 90+ |
| Firefox | 88+ |
| Safari | 14+ |

---

## Thesis Context

This dashboard was developed as part of an MSc Data Science thesis project examining student performance analytics. All data is **synthetic** and generated using the `scripts/data_generator.py` script to model realistic patterns across 9 academic years.

The dashboard demonstrates:
- Client-side data processing and visualisation at scale (~70,000+ total records across 6 CSV files)
- Interactive analytics with real-time filtering and cross-referencing between datasets
- Management-level KPI reporting alongside detailed analytical breakdowns
- Responsive design principles for accessibility across devices

---

## Colour Palette

The dashboard uses a soothing, muted colour scheme designed for extended use:

| Colour | Hex | Usage |
|--------|-----|-------|
| Steel Blue | `#4b7baa` | Primary |
| Sage Green | `#5a9e8f` | Secondary |
| Soft Green | `#6aab8e` | Success / Pass |
| Warm Amber | `#d4a843` | Warning |
| Muted Rose | `#c05c5c` | Danger / Fail |
| Slate Blue | `#6b8db5` | Info |

---

## License

Academic project - all data is synthetic.
