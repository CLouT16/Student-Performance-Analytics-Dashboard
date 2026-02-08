# Sample Test Data

Use these small sample files to test your dashboard immediately before adding your full dataset.

## Quick Test Files

Create these three files in your `data/` folder to test the dashboard:

### 1. Create `data/students.csv`

```csv
student_id,school,programme,gender,nationality,age,entry_year,status,is_disabled,english_proficiency,education_system
S001,Business,BSc Accounting and Finance,Female,Qatari,19,2021,Active,No,Advanced,British
S002,Social Science,BA Psychology,Male,Indian,20,2020,Graduated,No,Proficient,American
S003,Legal Studies,LLB Law,Female,Pakistani,21,2019,Active,Yes,Proficient,British
S004,Natural & Computing Sciences,BSc Computer Science,Male,Qatari,18,2022,Active,No,Native,British
S005,Business,BSc Business Management,Female,Egyptian,22,2018,Graduated,No,Advanced,British
S006,Social Science,BA Sociology,Male,Lebanese,20,2021,Dropped,No,Intermediate,Other
S007,Legal Studies,LLB Law with Management,Female,Jordanian,19,2022,Active,No,Proficient,British
S008,Natural & Computing Sciences,BSc Information Systems,Male,Saudi,21,2020,Active,No,Advanced,American
S009,Business,BSc Economics,Female,Qatari,18,2023,Active,No,Native,British
S010,Social Science,BA International Relations,Male,Syrian,23,2019,Active,Yes,Proficient,IB
```

### 2. Create `data/enrollments.csv`

```csv
student_id,academic_year,course_code,year_of_study
S001,2021-2022,ACC101,1
S001,2021-2022,BUS101,1
S001,2021-2022,ECO101,1
S001,2021-2022,MTH101,1
S001,2022-2023,ACC201,2
S001,2022-2023,FIN201,2
S002,2020-2021,PSY101,1
S002,2020-2021,SOC101,1
S002,2021-2022,PSY201,2
S002,2021-2022,RES201,2
S002,2022-2023,PSY301,3
S002,2022-2023,PSY302,3
S002,2023-2024,PSY401,4
S002,2023-2024,DIS499,4
S003,2019-2020,LAW101,1
S003,2019-2020,LAW102,1
S003,2020-2021,LAW201,2
S003,2020-2021,LAW202,2
S003,2021-2022,LAW301,3
S003,2021-2022,LAW302,3
S003,2022-2023,LAW401,4
S003,2022-2023,LAW402,4
S004,2022-2023,CS101,1
S004,2022-2023,CS102,1
S004,2023-2024,CS201,2
S004,2023-2024,CS202,2
S005,2018-2019,BUS101,1
S005,2018-2019,MGT101,1
S005,2019-2020,BUS201,2
S005,2019-2020,MGT201,2
S005,2020-2021,BUS301,3
S005,2020-2021,MGT301,3
S005,2021-2022,BUS401,4
S005,2021-2022,MGT401,4
S006,2021-2022,SOC101,1
S006,2021-2022,SOC102,1
S007,2022-2023,LAW101,1
S007,2022-2023,MGT101,1
S007,2023-2024,LAW201,2
S007,2023-2024,MGT201,2
S008,2020-2021,IS101,1
S008,2020-2021,CS101,1
S008,2021-2022,IS201,2
S008,2021-2022,CS201,2
S008,2022-2023,IS301,3
S008,2022-2023,CS301,3
S008,2023-2024,IS401,4
S008,2023-2024,CS401,4
S009,2023-2024,ECO101,1
S009,2023-2024,MTH101,1
S010,2019-2020,IR101,1
S010,2019-2020,POL101,1
S010,2020-2021,IR201,2
S010,2020-2021,POL201,2
S010,2021-2022,IR301,3
S010,2021-2022,POL301,3
S010,2022-2023,IR401,4
S010,2022-2023,POL401,4
```

### 3. Create `data/grades.csv`

```csv
student_id,course_code,numeric_grade,cgs_grade
S001,ACC101,17.5,A2
S001,BUS101,16.0,A2
S001,ECO101,15.5,A3
S001,MTH101,14.0,A3
S001,ACC201,18.5,A1
S001,FIN201,16.5,A2
S002,PSY101,16.5,A2
S002,SOC101,14.5,A3
S002,PSY201,17.0,A2
S002,RES201,14.0,A3
S002,PSY301,18.0,A1
S002,PSY302,16.5,A2
S002,PSY401,18.5,A1
S002,DIS499,19.0,A1
S003,LAW101,15.0,A3
S003,LAW102,14.5,A3
S003,LAW201,16.0,A2
S003,LAW202,15.5,A3
S003,LAW301,17.0,A2
S003,LAW302,16.0,A2
S003,LAW401,18.0,A1
S003,LAW402,17.5,A2
S004,CS101,19.0,A1
S004,CS102,18.5,A1
S004,CS201,18.0,A1
S004,CS202,17.5,A2
S005,BUS101,13.0,B1
S005,MGT101,12.5,B1
S005,BUS201,14.0,A3
S005,MGT201,13.5,B1
S005,BUS301,15.0,A3
S005,MGT301,14.5,A3
S005,BUS401,16.0,A2
S005,MGT401,15.5,A3
S006,SOC101,8.0,B3
S006,SOC102,7.5,C1
S007,LAW101,16.5,A2
S007,MGT101,15.0,A3
S007,LAW201,17.0,A2
S007,MGT201,16.0,A2
S008,IS101,17.5,A2
S008,CS101,18.0,A1
S008,IS201,17.0,A2
S008,CS201,16.5,A2
S008,IS301,18.5,A1
S008,CS301,17.5,A2
S008,IS401,19.0,A1
S008,CS401,18.0,A1
S009,ECO101,15.5,A3
S009,MTH101,14.0,A3
S010,IR101,14.5,A3
S010,POL101,13.0,B1
S010,IR201,15.0,A3
S010,POL201,14.0,A3
S010,IR301,16.0,A2
S010,POL301,15.5,A3
S010,IR401,17.0,A2
S010,POL401,16.5,A2
```

## Quick Test Commands

```bash
# 1. Create the data directory
mkdir -p data

# 2. Create students.csv (copy content above)
cat > data/students.csv << 'EOF'
[paste students.csv content here]
EOF

# 3. Create enrollments.csv (copy content above)
cat > data/enrollments.csv << 'EOF'
[paste enrollments.csv content here]
EOF

# 4. Create grades.csv (copy content above)
cat > data/grades.csv << 'EOF'
[paste grades.csv content here]
EOF

# 5. Start web server
python -m http.server 8000

# 6. Open http://localhost:8000 in browser
```

## What You Should See

After loading the dashboard with this test data:

✅ **Header Statistics**:
- Total Students: 10
- Total Enrollments: 58
- Average GPA: ~3.4
- Completion Rate: 20%

✅ **Enrollment Trends**:
- Shows data from 2018-2023
- 4 schools represented
- 10 different programmes

✅ **Demographics**:
- Gender: 5 Female, 5 Male
- 8 different nationalities
- Age range: 18-23

✅ **Performance**:
- Mostly A grades (good test data)
- One dropout (S006) with lower performance
- Two graduates (S002, S005)

✅ **All Filters Work**:
- Try filtering by "Business" school
- Try filtering by "2021-2022" academic year
- Try filtering by "Female" gender

## Expected Behavior

1. **Dashboard loads** within 2-3 seconds
2. **All tabs** are clickable and show charts
3. **Filters** update all visualizations when applied
4. **Export** downloads a CSV file
5. **No console errors** (press F12 to check)

## Troubleshooting Test Data

If you see errors:

### "No data found"
- Check files are in `data/` folder exactly
- Verify filenames: `students.csv`, `enrollments.csv`, `grades.csv`
- Check for byte-order marks (BOM) - save as UTF-8

### "Cannot parse CSV"
- Check for extra commas
- Verify headers match exactly (case-sensitive)
- No blank lines in middle of file
- Save as CSV (comma-separated), not tab-separated

### Charts show wrong data
- Verify student_id matches across all files
- Check numeric fields are actually numbers
- Verify dates in correct format (YYYY or YYYY-YYYY)

## Replacing Test Data with Real Data

Once you verify the dashboard works with test data:

1. **Backup test files**:
   ```bash
   mv data data_test_backup
   ```

2. **Create new data directory**:
   ```bash
   mkdir data
   ```

3. **Copy your real CSV files**:
   ```bash
   cp /path/to/your/students.csv data/
   cp /path/to/your/enrollments.csv data/
   cp /path/to/your/grades.csv data/
   ```

4. **Refresh browser** (Ctrl+Shift+R)

5. **Verify everything still works** with your real data

## Performance Expectations

With this test data (10 students):
- Load time: < 1 second
- Filter updates: Instant
- Export: < 1 second
- Smooth scrolling and interaction

With your full data (2,500 students):
- Load time: 2-3 seconds
- Filter updates: < 1 second
- Export: 1-2 seconds
- Still smooth interaction

## Next Steps

1. ✅ Test with sample data first
2. ✅ Verify all features work
3. ✅ Understand the interface
4. ✅ Then replace with your real data
5. ✅ Test again with full dataset
6. ✅ Deploy to GitHub Pages
7. ✅ Share with stakeholders

---

**Start testing now with this sample data!** 🚀
