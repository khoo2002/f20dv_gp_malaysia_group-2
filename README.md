# 📊 Road Accidents in Europe — Malaysia Group 2

Welcome to the group project for the **F20DV: Data Visualisation & Analytics** course.

This project explores road safety data across European countries using interactive visualisations built with **D3.js**. The dashboard allows users to compare key safety metrics like fatalities, infrastructure investment, GDP, and more — through charts such as scatter plots, line charts, heatmaps, choropleth maps, and bidirectional bar charts.

---

## 🧑‍🤝‍🧑 Group Members

1. Khoo Zhao Wei (Leader) H00434665
2. V Thanaaysh A/L Vishvanathan H00391598
3. Magdalena Piekarczyk H00376712

---

## 📁 Project Structure

Here’s a quick overview of the project files and how they all fit together:

### Root Files

- `index.html`  
  The main HTML file that displays the full dashboard. All visualisation components are injected into it via JS modules.

- `README.md`  
  This file — explains how the project works and how files relate to one another.

---

### 📂 data/

- `database_Europe_clean1_iqr_log_transformed.csv`  
  Cleaned CSV dataset used for preprocessing.

- `database_Europe_clean1_iqr_log_transformed.json`  
  Same dataset in JSON format for easier D3 data loading.

- `images/front_cover.png`, `images/back_cover.png`  
  Front and back visuals for cover pages of the dashboard (mostly used for design/storytelling).

---

### 🎨 styles/

- `main.css`  
  Handles all styling — layout, chart spacing, hover effects, tooltips, filters, etc. Carefully written to avoid interfering with other chart styles.

---

### 📚 libs/

- `d3/d3.v7.min.js`  
  D3.js library (version 7) – core library powering all interactive charts.

---

### 📜 scripts/

This is where all the JavaScript magic happens.

- `main.js`  
  Entry point that triggers data loading and calls the functions that render each graph.

- `load_data.js`  
  Loads and parses the dataset (especially numerical fields), and provides a helper function to filter attributes.

- `ScatterPlot.js`  
  Creates a scatter plot comparing metrics like GDP vs. fatalities per passenger km, with a regression line and interactive tooltips.

- `LineChart.js`  
  Displays trends over time (per country) for various metrics like fatalities or accidents, using a dropdown for variable selection.

- `BarChartWithTwinAxis.js`  
  A bar chart that compares two variables with two y-axes — great for visualising relationships like vehicle type vs. motorisation index.

- `HeatMap.js`  
  Builds a matrix-style heatmap that shows metric intensity over time and across countries.

- `ChoroplethMapComponent.js`  
  Basic choropleth map that displays countries shaded based on a selected metric.

- `ChoroplethMapComponentWithAddViewsNTimeSlicer.js`  
  Enhanced choropleth map that includes time sliders and multiple views for deeper exploration.

- `DualPerspective.js`  
  This powers the interactive bidirectional chart, showing two opposing metrics (e.g. fatalities vs. passenger km) on the same y-axis.

- `Graph2.js`  
  Helper script that builds the line chart by managing selected countries and variables.

- `Graph5.js`  
  Controls the heatmap generation — handles both the rendering and the user dropdown filtering.

- `GraphQuizComponent.js`  
  Adds a small quiz to test users' understanding of trends and data insights (interactive learning component).

---

## 🔁 How Everything Links

- The `index.html` loads the D3 library and CSS.
- Then it calls `main.js`, which loads the data and passes it into each visualisation module.
- Each script targets its own `<div>` inside the HTML layout.
- All visualisations use the same dataset (`database_Europe_clean1_iqr_log_transformed.json`) to ensure consistency.

---

## 💡 Want to Extend or Modify?

Each JS module is standalone and commented — feel free to add new comparisons, charts, or styles. The structure makes it easy to maintain or upgrade without breaking other parts.

Just follow these tips:
- If adding a new chart: create a new JS module and hook it up in `main.js`.
- If styling changes: keep them scoped using IDs or `.class` names to avoid global conflicts.

---

## Final Note

This dashboard was built with usability, clarity, and insight in mind — feel free to explore, extend, or improve it as needed.


### Planned Task Distribution

#### Team Members
- Khoo Zhao Wei - KHOO
- V Thanaaysh A/L Vishvanathan - TH
- Magdalena Piekarczyk - MA

#### 1. Initial Meetings & Design Presentation
- **Leadership:** KHOO designated as the team leader.
- **Dataset Agreement:** All team members agreed on the chosen dataset.
- **Task Allocation:**
  - **KHOO:** Data preprocessing
  - **TH & MA:** Exploratory Data Analysis (EDA)
  - **KHOO:** Preparation of presentation slides

#### 2. Implementation Phase
- **KHOO:** Responsible for three graphs – HeatMap (G1), Dual-Perspective Chart (G3), Choropleth Map (G5).
- **TH:** Responsible for three line charts (G4).
- **MA:** Responsible for a Scatter Plot (G2).
**G:** Graph

#### 3. Final Demonstration
- **KHOO:** Responsible for the preparation of the final presentation slides.

### Actual Task Completion

#### 1. Data Preparation & EDA
- **KHOO:** Completed data preprocessing, prepared presentation slides, and refined EDA.
- **TH:** Completed EDA.
- **MA:** No contributions recorded.

#### 2. Graph Implementation
- **KHOO:** Completed three assigned graphs (FG 1, 3, 6).
- **TH:** Completed one assigned graphs, two additional graphs (FG 2, 4, 5).
- **MA:** No contributions recorded.
**FG:** Final graph

#### 3. Final Presentation Preparation
- **KHOO:** Completed the preparation of presentation slides.