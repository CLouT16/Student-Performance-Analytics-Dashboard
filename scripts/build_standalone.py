#!/usr/bin/env python3
"""
Build a single self-contained HTML file that embeds all CSV data, CSS, and JS.
The output file can be opened directly in any browser — no server required.
"""

import json
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent
OUT = PROJECT / "dashboard_standalone.html"

# Files to embed
CSS_FILE = PROJECT / "css" / "dashboard.css"
JS_FILES = [
    PROJECT / "js" / "config.js",
    PROJECT / "js" / "dataLoader.js",
    PROJECT / "js" / "dataStore.js",
    PROJECT / "js" / "charts.js",
    PROJECT / "js" / "tables.js",
    PROJECT / "js" / "queryPanel.js",
    PROJECT / "js" / "insights.js",
    PROJECT / "js" / "app.js",
]
CSV_FILES = {
    "admissions":      PROJECT / "data" / "01_Admissions_Synthetic_Data.csv",
    "currentStudents": PROJECT / "data" / "02_COMBINED_Current_Students_All_Years.csv",
    "enrollments":     PROJECT / "data" / "03_COMBINED_Course_Enrolments_All_Years.csv",
    "attendance":      PROJECT / "data" / "04_COMBINED_Attendance_All_Years.csv",
    "classifications": PROJECT / "data" / "05_Degree_Classifications.csv",
    "courseResults":    PROJECT / "data" / "06_COMBINED_Course_Results_All_Years.csv",
}


def read_file(path):
    return path.read_text(encoding="utf-8")


def build():
    # Read the index.html as a template reference for the body structure
    index_html = read_file(PROJECT / "index.html")

    # Extract the body content between <body> and </body>
    body_start = index_html.index("<body>") + len("<body>")
    body_end = index_html.index("</body>")
    body_content = index_html[body_start:body_end]

    # Remove the <script src="..."> tags from body content — we'll inline them
    import re
    body_content = re.sub(r'\s*<script src="js/[^"]+"></script>', '', body_content)
    body_content = re.sub(r'\s*<script src="https://[^"]+"></script>', '', body_content)

    # Read CSS
    css = read_file(CSS_FILE)

    # Read all JS files and concatenate
    js_parts = []
    for js_file in JS_FILES:
        js_parts.append(f"// === {js_file.name} ===")
        js_parts.append(read_file(js_file))
    all_js = "\n\n".join(js_parts)

    # Embed CSV data as JS strings and override the loadCSV method
    csv_embed_parts = ["// === Embedded CSV Data ===", "const EMBEDDED_CSV_DATA = {};"]
    for key, csv_path in CSV_FILES.items():
        csv_text = read_file(csv_path)
        # Escape for JS string using JSON encoding
        csv_json = json.dumps(csv_text)
        csv_embed_parts.append(f"EMBEDDED_CSV_DATA['{key}'] = {csv_json};")

    # Override DataLoader.loadCSV to parse from embedded strings instead of downloading
    csv_embed_parts.append("""
// Override loadCSV to use embedded data
DataLoader._originalLoadCSV = DataLoader.loadCSV;
DataLoader.loadCSV = function(path) {
    // Find which key matches this path
    for (const [key, csvPath] of Object.entries(CONFIG.csvPaths)) {
        if (csvPath === path && EMBEDDED_CSV_DATA[key]) {
            return new Promise((resolve) => {
                const results = Papa.parse(EMBEDDED_CSV_DATA[key], {
                    header: true,
                    dynamicTyping: false,
                    skipEmptyLines: true
                });
                resolve(results.data);
            });
        }
    }
    // Fallback to original (won't work from file:// but just in case)
    return this._originalLoadCSV(path);
};
""")
    csv_embed_js = "\n".join(csv_embed_parts)

    # Build the standalone HTML
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Student Performance Analytics Dashboard</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js"></script>
    <style>
{css}
    </style>
</head>
<body>
{body_content}
    <script>
{all_js}

{csv_embed_js}
    </script>
</body>
</html>
"""

    OUT.write_text(html, encoding="utf-8")
    size_mb = OUT.stat().st_size / (1024 * 1024)
    print(f"Built: {OUT}")
    print(f"Size: {size_mb:.1f} MB")
    print(f"Open this file directly in any browser — no server needed.")


if __name__ == "__main__":
    build()
