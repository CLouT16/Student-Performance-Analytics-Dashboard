# Student Performance Analytics Dashboard

**AFG College with University of Aberdeen - Undergraduate Programmes**

Interactive web-based analytics dashboard for visualizing student performance data across 9 academic years (2017-2025). Built for MSc Data Science Project.

## 🎯 Dashboard Features

### Core Analytics
- **Enrollment Trends** - Track enrollment growth, programme distribution, and year-on-year changes
- **Academic Performance** - GPA distributions, pass/fail rates, grade analysis
- **Programme Comparison** - Side-by-side performance metrics and completion rates
- **Retention & Attrition** - Student retention rates, dropout analysis, completion tracking
- **Demographics** - Gender, nationality, age, qualifications, disability status

### Interactive Features
- **Query Builder** - Filter data by year, school, programme, gender, nationality
- **Actionable Insights** - Automated recommendations based on data patterns
- **Export Functionality** - Download filtered data as CSV
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Real-time Updates** - All visualizations update instantly with filter changes

## 📊 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Charting**: Chart.js v4.4.0
- **Data Parsing**: PapaParse v5.4.1
- **No Backend Required** - Runs entirely in the browser

## 📁 Project Structure

```
Student-Performance-Analytics-Dashboard/
├── index.html                 # Main dashboard page
├── css/
│   └── dashboard.css         # Styling and responsive design
├── js/
│   ├── main.js               # Application entry point
│   ├── dataLoader.js         # CSV loading and data processing
│   ├── charts.js             # All chart visualizations
│   ├── queryBuilder.js       # Filter functionality
│   └── insights.js           # Insights generation
├── data/
│   ├── students.csv          # Student demographics and status
│   ├── enrollments.csv       # Course enrollment records
│   └── grades.csv            # Assessment grades (CGS system)
└── README.md                 # This file
```

## 🚀 Quick Start

### Method 1: GitHub Pages (Recommended)

1. **Push your code to GitHub**:
   ```bash
   cd Student-Performance-Analytics-Dashboard
   git add .
   git commit -m "Initial dashboard commit"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository on GitHub
   - Click **Settings** → **Pages**
   - Under "Source", select **main** branch
   - Click **Save**
   - Your dashboard will be live at: `https://clout16.github.io/Student-Performance-Analytics-Dashboard/`

3. **Add your CSV files**:
   - Create a `data/` folder in your repository
   - Upload `students.csv`, `enrollments.csv`, `grades.csv`
   - Commit and push

### Method 2: Local Web Server

You **cannot** open `index.html` directly in a browser (CSV loading requires a web server). Use one of these methods:

#### Option A: Python
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then visit: `http://localhost:8000`

#### Option B: Node.js
```bash
# Install http-server globally
npm install -g http-server

# Run from dashboard directory
http-server -p 8000
```

Then visit: `http://localhost:8000`

#### Option C: VS Code Live Server
1. Install "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"

### Method 3: Other Hosting Services

- **Netlify**: Drag and drop your folder to [netlify.com/drop](https://app.netlify.com/drop)
- **Vercel**: Connect your GitHub repo at [vercel.com](https://vercel.com)
- **Surge**: `npm install -g surge && surge`

## 📋 CSV File Requirements

### students.csv
Required columns:
```csv
student_id,school,programme,gender,nationality,age,entry_year,status,is_disabled,english_proficiency,education_system
```

Example:
```csv
S001,Business,BSc Accounting,Female,Qatari,19,2021,Active,No,Advanced,British
S002,Social Science,BA Psychology,Male,Indian,20,2020,Graduated,No,Proficient,American
```

### enrollments.csv
Required columns:
```csv
student_id,academic_year,course_code,year_of_study
```

Example:
```csv
S001,2021-2022,ACC101,1
S001,2022-2023,ACC201,2
```

### grades.csv
Required columns:
```csv
student_id,course_code,numeric_grade,cgs_grade
```

Example:
```csv
S001,ACC101,17,A2
S001,ACC201,15,A3
```

**CGS Grade Scale**:
- A1 (18+), A2 (16-17), A3 (14-15)
- B1 (12-13), B2 (10-11), B3 (8-9)
- C1 (6-7), C2 (4-5), C3 (2-3)
- D1 (1), D2 (0), F (Fail)

## 🎓 Usage for MSc Project

### For Formative Presentation (2 March 2026)

1. **Prepare Your Demo**:
   - Load dashboard on laptop
   - Prepare 2-3 key insights to highlight
   - Practice navigating between tabs
   - Show filter functionality

2. **Key Points to Demonstrate**:
   - Real-time filtering capabilities
   - Automated insights generation
   - Interactive visualizations
   - Export functionality for reports

### For Thesis

Include in your Methods section:
```
The dashboard was developed using HTML5, CSS3, and JavaScript with 
Chart.js for data visualization. PapaParse library enables client-side 
CSV processing, eliminating server requirements. The application 
implements a modular architecture with separate concerns for data 
loading, visualization, filtering, and insight generation.
```

Include in your Results section:
- Screenshots of key visualizations
- Examples of generated insights
- Explanation of actionable recommendations

### For Viva

Be prepared to discuss:
- Design decisions (why client-side vs server-side)
- Data processing workflow
- Insight generation algorithms
- Scalability considerations
- Security and data privacy

## 🔧 Customization

### Adding New Visualizations

Edit `js/charts.js`:
```javascript
createMyNewChart() {
    const data = DataLoader.getData();
    // Process your data
    const ctx = this.getCtx('myNewChartId');
    
    this.charts.myNewChart = new Chart(ctx, {
        type: 'bar', // or 'line', 'pie', etc.
        data: { /* your data */ },
        options: { /* your options */ }
    });
}
```

Add to HTML in appropriate tab:
```html
<div class="chart-container">
    <h3>My New Chart</h3>
    <canvas id="myNewChartId"></canvas>
</div>
```

Call in `initializeCharts()`:
```javascript
this.createMyNewChart();
```

### Changing Colors

Edit `js/charts.js` color palette:
```javascript
colors: {
    primary: '#0066cc',
    secondary: '#004499',
    // Add more colors...
}
```

### Adding New Filters

1. Add select element to HTML
2. Update `populateFilterOptions()` in `js/queryBuilder.js`
3. Update filter logic in `applyFilters()` in `js/dataLoader.js`

## 📊 Dashboard API

Access dashboard functionality programmatically via browser console:

```javascript
// Get current filtered data
const data = window.DashboardAPI.getData();

// Apply custom filters
window.DashboardAPI.applyFilters({
    year: ['2023-2024'],
    school: ['Business', 'Legal Studies']
});

// Get summary statistics
const stats = window.DashboardAPI.getSummaryStats();
console.log(stats);

// Export data
window.DashboardAPI.exportData();

// Refresh all visualizations
window.DashboardAPI.refresh();
```

## ⌨️ Keyboard Shortcuts

- **Ctrl/Cmd + E**: Export filtered data to CSV
- **Ctrl/Cmd + P**: Print dashboard
- **Ctrl/Cmd + R**: Refresh page

## 🐛 Troubleshooting

### "Failed to load data" Error

**Problem**: CSV files not loading

**Solutions**:
1. Ensure CSV files are in `data/` folder
2. Check file names are exactly: `students.csv`, `enrollments.csv`, `grades.csv`
3. Must run from web server (not opening HTML directly)
4. Check browser console (F12) for specific error messages

### Charts Not Displaying

**Problem**: Blank chart containers

**Solutions**:
1. Check browser console for JavaScript errors
2. Ensure Chart.js CDN is accessible
3. Verify CSV data is properly formatted
4. Clear browser cache and reload

### Filters Not Working

**Problem**: Applying filters doesn't update visualizations

**Solutions**:
1. Check browser console for errors
2. Verify filter dropdowns are populated
3. Try resetting filters first
4. Check data has required fields

### Performance Issues

**Problem**: Dashboard slow with large datasets

**Solutions**:
1. The dashboard is optimized for ~2,500 student records
2. For >10,000 records, consider data aggregation
3. Reduce number of simultaneous visualizations
4. Use more specific filters to reduce data size

## 📱 Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Mobile browsers (iOS Safari, Chrome Android)

## 📄 License

Academic project for MSc Data Science (University of Aberdeen)

## 👤 Author

**Cindy Lou**  
MSc Data Science Student  
AFG College with University of Aberdeen  
Project: Building a Student Performance Analytics Dashboard for Strategic Decision-Making

## 📞 Support

For questions about this dashboard:
1. Check browser console for errors (F12)
2. Review this README thoroughly
3. Verify CSV file format and location
4. Ensure running from web server

## 🎉 Next Steps

1. ✅ Clone/download dashboard files
2. ✅ Add your CSV data to `data/` folder
3. ✅ Start local web server OR deploy to GitHub Pages
4. ✅ Open dashboard in browser
5. ✅ Explore visualizations and insights
6. ✅ Customize for your presentation
7. ✅ Document findings for thesis

**Ready to analyze your student performance data!** 🚀
