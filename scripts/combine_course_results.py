#!/usr/bin/env python3
"""
Combine individual course report CSVs from generated_data/ into a single file.

Scans generated_data/YYYY-YY/Sem*/ for *_Course_Report_*.csv files and merges
them into data/06_COMBINED_Course_Results_All_Years.csv.

Output schema:
  Academic_Year, Semester, Course_Code, Student_ID, Course_Grade_Point, Overall_Grade, Warning
"""

import csv
import os
import re
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
GENERATED_DATA = PROJECT_ROOT / "generated_data"
OUTPUT_FILE = PROJECT_ROOT / "data" / "06_COMBINED_Course_Results_All_Years.csv"

FIELDNAMES = [
    "Academic_Year",
    "Semester",
    "Course_Code",
    "Student_ID",
    "Course_Grade_Point",
    "Overall_Grade",
    "Warning",
]

# Pattern to extract course code from filename like B1003_Course_Report_2020-21.csv or GS1002_Course_Report_2017-18.csv
FILENAME_RE = re.compile(r"^([A-Z]{1,3}\d{4})_Course_Report_\d{4}-\d{2}\.csv$")

# Pattern to extract course code from resit filename like B1003_Resit_2017-18.csv
RESIT_RE = re.compile(r"^([A-Z]{1,3}\d{4})_Resit_\d{4}-\d{2}\.csv$")

# Pattern to identify semester folder
SEMESTER_RE = re.compile(r"^Sem(\d+)(?:_Resit)?$")


def parse_semester_folder(folder_name):
    """Convert folder name like 'Sem1', 'Sem2', 'Sem3_Resit' to semester string."""
    m = SEMESTER_RE.match(folder_name)
    if not m:
        return None
    num = m.group(1)
    if "Resit" in folder_name:
        return f"Sem{num}_Resit"
    return f"Sem{num}"


def combine_course_results():
    if not GENERATED_DATA.exists():
        print(f"Error: generated_data directory not found at {GENERATED_DATA}")
        sys.exit(1)

    total_rows = 0
    files_processed = 0

    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as outfile:
        writer = csv.DictWriter(outfile, fieldnames=FIELDNAMES)
        writer.writeheader()

        # Iterate over academic year directories
        for year_dir in sorted(GENERATED_DATA.iterdir()):
            if not year_dir.is_dir():
                continue
            academic_year = year_dir.name  # e.g. "2017-18"

            # Iterate over semester directories within each year
            for sem_dir in sorted(year_dir.iterdir()):
                if not sem_dir.is_dir():
                    continue

                semester = parse_semester_folder(sem_dir.name)
                if semester is None:
                    continue

                # Process each CSV in the semester directory (course reports and resits)
                for csv_file in sorted(sem_dir.glob("*.csv")):
                    m = FILENAME_RE.match(csv_file.name)
                    if not m:
                        m = RESIT_RE.match(csv_file.name)
                    if not m:
                        continue
                    course_code = m.group(1)

                    with open(csv_file, "r", encoding="utf-8") as infile:
                        reader = csv.DictReader(infile)
                        for row in reader:
                            student_id = row.get("Student_ID", "").strip()
                            if not student_id:
                                continue

                            writer.writerow({
                                "Academic_Year": academic_year,
                                "Semester": semester,
                                "Course_Code": course_code,
                                "Student_ID": student_id,
                                "Course_Grade_Point": row.get("Course_Grade_Point", "").strip(),
                                "Overall_Grade": row.get("Overall_Grade", "").strip(),
                                "Warning": row.get("Warning", "").strip(),
                            })
                            total_rows += 1

                    files_processed += 1

    print(f"Done. Processed {files_processed} course report files.")
    print(f"Total rows written: {total_rows}")
    print(f"Output: {OUTPUT_FILE}")


if __name__ == "__main__":
    combine_course_results()
