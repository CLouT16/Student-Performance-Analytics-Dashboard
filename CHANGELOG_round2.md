# Changelog — Supervisor Meeting Amendments (Round 2)

**Date:** 18 February 2026
**Commit:** Amend to "Initial commit"

---

## Summary of Changes

### 1. BM-IS School Mapping Fix
**File:** `js/config.js`
- Changed `Business Management and Information Systems` from `Business` to `Natural & Computing Sciences` in `programmeToSchool` mapping
- Affects Sunburst (Classification Hierarchy), all school-level groupings

### 2. Sunburst — Graduated Students Only
**Files:** `js/dataStore.js`, `js/charts.js`, `index.html`
- `getSunburstData()` now filters to `graduation_status === 'Graduated'` only (was including Deferred and Pending)
- Count reduced from 1,682 to 1,246 actual graduates
- Center label: pastel blue background (`#d6e8f5`) with dark navy text, reads "All Graduates" (count shown on hover)
- Heading updated to: "Classification Hierarchy — All Graduates by School / Programme / Classification"

### 3. Sankey — Improved Layout with Fixed Node Positions
**File:** `js/charts.js`
- Layout: Applicants (left) → Registered (middle) → all final outcomes (right)
- Rejected and Not Interested positioned at top-right, with visible gap from Registered outcomes (Graduated, Dropped, Active) below
- Uses `arrangement: 'fixed'` with explicit `node.x` and `node.y` positions

### 4. Programme Comparison Table — Completion Rate Fix
**File:** `js/tables.js`
- `renderComparisonTable()`: Added `eligibleIds` Set to only count classifications from students who entered 4+ years ago
- Fixed BM-IS showing 104.9% completion rate (was counting recent direct-entry graduates against eligible-only denominator)

### 5. Insights — Graduated-Only Metrics
**File:** `js/insights.js`
- **Average Graduate GPA**: Filtered to `graduation_status === 'Graduated'` (was using all 1,682 classifications, now uses 1,246 graduates)
- **Good Honours (1st + 2:1)**: Same graduated-only filter applied
- **Programme GPA Spread**: Same graduated-only filter applied

### 6. Insights — Retention Rewrite (Status-Based)
**File:** `js/insights.js`
- Replaced Year 1→2 and Year 2→3 retention metrics (which showed 100% due to year-to-year transition logic) with status-based metrics using `DataStore.getRetentionAttritionCounts()`
- New metrics: Overall Retention (graduated vs dropped), Lowest Programme Retention, Programme Completion, Overall Attrition
- Now consistent with Retention Cohort Summary table data

### 7. Enrollment Table — Rename Column
**File:** `js/tables.js`
- Renamed "YoY Change" to "Annual Change" for clarity

---

## Files Modified

| File | Changes |
|------|---------|
| `js/config.js` | BM-IS → Natural & Computing Sciences |
| `js/dataStore.js` | Sunburst: graduated-only filter |
| `js/charts.js` | Sunburst visuals (pastel center, label), Sankey fixed layout |
| `js/insights.js` | Graduated-only GPA/honours, status-based retention metrics |
| `js/tables.js` | Comparison table eligibleIds fix, "Annual Change" rename |
| `index.html` | Sunburst heading update |
| `dashboard_standalone.html` | Rebuilt with all changes |
