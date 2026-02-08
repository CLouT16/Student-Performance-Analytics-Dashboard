# Quick Deployment Guide

## 🚀 Deploy to GitHub Pages (5 Minutes)

### Step 1: Prepare Your Files

Make sure you have this structure:
```
Student-Performance-Analytics-Dashboard/
├── index.html
├── css/
│   └── dashboard.css
├── js/
│   ├── main.js
│   ├── dataLoader.js
│   ├── charts.js
│   ├── queryBuilder.js
│   └── insights.js
├── data/
│   ├── students.csv
│   ├── enrollments.csv
│   └── grades.csv
└── README.md
```

### Step 2: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon → **"New repository"**
3. Name it: `Student-Performance-Analytics-Dashboard`
4. Make it **Public**
5. Click **"Create repository"**

### Step 3: Push Your Code

Open terminal/command prompt in your dashboard folder:

```bash
# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial dashboard deployment"

# Add remote (replace YOUR-USERNAME with your GitHub username)
git remote add origin https://github.com/CLouT16/Student-Performance-Analytics-Dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** (top menu)
3. Scroll down to **Pages** (left sidebar)
4. Under "Source":
   - Select branch: **main**
   - Select folder: **/ (root)**
5. Click **Save**
6. Wait 1-2 minutes for deployment

### Step 5: Access Your Dashboard

Your dashboard will be live at:
```
https://clout16.github.io/Student-Performance-Analytics-Dashboard/
```

Share this URL with anyone - no login required! 🎉

---

## 🖥️ Local Development Setup

### Using Python (Easiest)

```bash
# Navigate to dashboard folder
cd Student-Performance-Analytics-Dashboard

# Start server (Python 3)
python -m http.server 8000
```

Open browser: `http://localhost:8000`

### Using Node.js

```bash
# Install http-server globally (one time)
npm install -g http-server

# Start server
http-server -p 8000
```

Open browser: `http://localhost:8000`

### Using VS Code

1. Install extension: **"Live Server"** by Ritwick Dey
2. Right-click `index.html`
3. Select **"Open with Live Server"**

---

## 📊 Adding Your Data

### Step 1: Create CSV Files

Create three CSV files in the `data/` folder:

#### data/students.csv
```csv
student_id,school,programme,gender,nationality,age,entry_year,status,is_disabled,english_proficiency,education_system
S001,Business,BSc Accounting,Female,Qatari,19,2021,Active,No,Advanced,British
S002,Social Science,BA Psychology,Male,Indian,20,2020,Graduated,No,Proficient,American
S003,Legal Studies,LLB Law,Female,Pakistani,21,2019,Active,Yes,Proficient,British
```

#### data/enrollments.csv
```csv
student_id,academic_year,course_code,year_of_study
S001,2021-2022,ACC101,1
S001,2022-2023,ACC201,2
S002,2020-2021,PSY101,1
S002,2021-2022,PSY201,2
```

#### data/grades.csv
```csv
student_id,course_code,numeric_grade,cgs_grade
S001,ACC101,17,A2
S001,ACC201,15,A3
S002,PSY101,16,A2
S002,PSY201,14,A3
```

### Step 2: Verify Data Format

✅ **Required fields** must be present
✅ **No empty cells** in required columns
✅ **Consistent IDs** across all files
✅ **Valid values** for categorical fields

### Step 3: Test Locally First

1. Start local server
2. Open dashboard
3. Check for errors in browser console (F12)
4. Verify all visualizations load

### Step 4: Deploy Updated Data

```bash
git add data/
git commit -m "Add student data"
git push
```

GitHub Pages will auto-update in 1-2 minutes.

---

## 🎨 Customization Tips

### Change Dashboard Title

Edit `index.html` line 8:
```html
<title>Your Custom Title</title>
```

### Change Header Text

Edit `index.html` around line 17:
```html
<h1>Your Institution Name</h1>
<p class="subtitle">Your Programme Description</p>
```

### Adjust Color Scheme

Edit `css/dashboard.css` lines 2-10:
```css
:root {
    --primary-color: #YOUR-COLOR;
    --secondary-color: #YOUR-COLOR;
    /* ... */
}
```

### Add Your Logo

Add to header in `index.html`:
```html
<div class="header-content">
    <img src="logo.png" alt="Logo" style="height: 60px;">
    <h1>Student Performance Analytics Dashboard</h1>
</div>
```

---

## ✅ Pre-Presentation Checklist

Two weeks before presentation:

- [ ] All CSV files uploaded and tested
- [ ] Dashboard deployed to GitHub Pages
- [ ] All visualizations working correctly
- [ ] Test dashboard on presentation laptop
- [ ] Prepare list of 3-5 key insights to highlight
- [ ] Practice navigating between tabs smoothly
- [ ] Test filter functionality
- [ ] Verify export feature works
- [ ] Bookmark dashboard URL
- [ ] Have offline backup (local version)

One day before presentation:

- [ ] Test dashboard on presentation WiFi
- [ ] Clear browser cache and reload
- [ ] Verify all charts display correctly
- [ ] Test on projector/external display
- [ ] Prepare speaking notes for each section
- [ ] Have screenshot backups just in case

---

## 🆘 Emergency Troubleshooting

### Dashboard Won't Load

1. Check GitHub Pages status in repository settings
2. Try accessing with `/index.html` explicitly
3. Check all CSV files are committed to repository
4. Clear browser cache (Ctrl+Shift+Delete)
5. Try different browser

### Data Not Displaying

1. Open browser console (F12)
2. Look for red error messages
3. Common issues:
   - CSV file path incorrect (must be `data/students.csv`)
   - CSV format error (missing headers, extra commas)
   - CORS issue (GitHub Pages should handle this)

### Charts Broken

1. Check Chart.js CDN is accessible
2. Verify internet connection
3. Try different browser
4. Check console for JavaScript errors

### During Presentation if Issues Occur

**Have backup plan:**
1. Keep local version running (Python server)
2. Have PowerPoint with screenshots
3. Have PDF export of key visualizations
4. Can explain manually using data tables

---

## 📞 Quick Support Commands

### Check if server is running:
```bash
# Should show your local server
netstat -an | grep 8000
```

### Force refresh browser:
- Windows/Linux: `Ctrl + Shift + R`
- Mac: `Cmd + Shift + R`

### View detailed errors:
- Press `F12` → Console tab
- Look for red error messages

### Test CSV loading:
- Open browser console (F12)
- Type: `window.DashboardAPI.getData()`
- Should show your data objects

---

## 🎓 For MSc Presentation

### Recommended Flow:

1. **Introduction** (1 min)
   - "I've built an interactive analytics dashboard..."
   - Open live dashboard URL

2. **Demo Filter Functionality** (2 min)
   - Show query builder
   - Apply filters (e.g., Business School only)
   - Show real-time updates

3. **Key Insights** (3 min)
   - Navigate to Insights tab
   - Highlight 2-3 strategic recommendations
   - Show how data drives decisions

4. **Technical Overview** (2 min)
   - Mention: "Client-side, no backend required"
   - "2,500 student records across 9 years"
   - "Exportable for reporting"

5. **Q&A** (2 min)

### Practice Lines:

- "This dashboard processes 2,500 student records..."
- "I can filter by any combination of criteria..."
- "The system automatically generates actionable insights..."
- "All visualizations update in real-time..."
- "Data can be exported for further analysis..."

---

**You're ready to deploy! 🚀**

Next step: Run the deployment commands and test your dashboard!
