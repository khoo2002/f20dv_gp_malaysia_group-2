'use strict';
import HeatMap from "./HeatMap.js";

import { loadGraph2 } from "./Graph2.js";

import DualPerspective from "./DualPerspective.js";

import { loadGraph4 } from "./Graph4.js";

import { loadGraph5 } from "./Graph5.js";

import ChoroplethMapComponentWithAddViewsNTimeSlicer from "./ChoroplethMapComponentWithAddViewsNTimeSlicer.js";

// Import data loading functions from load_data.js
import { loadDatabaseEurope, filterData } from "./load_data.js";

// Global attribute descriptions (remains global as required).
const attributeDescriptions = {
  fatal_pc_km: "Fatalities per billion passenger-km",
  fatal_mIn: "Fatalities per million inhabitants",
  accid_adj_pc_km: "Accidents per billion passenger-km",
  p_km: "Billions of passenger-km",
  croad_inv_km: "Investment in roads construction per kilometer, €/km (2015 constant prices)",
  croad_maint_km: "Expenditure on roads maintenance per kilometer, €/km (2015 constant prices)",
  prop_motorwa: "Proportion of motorways over the total road network (%)",
  populat: "Population, in millions of inhabitants",
  unemploy: "Unemployment rate (%)",
  petrol_car: "Consumption of gasolina and petrol derivatives (tons) per tourism",
  alcohol: "Alcohol consumption, in liters per capita (age > 15)",
  mot_index_1000: "Motorization index, in cars per 1,000 inhabitants",
  den_populat: "Population density, inhabitants/km²",
  cgdp: "Gross Domestic Product (GDP), in € (2015 constant prices)",
  cgdp_cap: "GDP per capita, in € (2015 constant prices)",
  precipit: "Average depth of rain water during a year (mm)",
  prop_elder: "Proportion of people over 65 years (%)",
  dps: "Demerit Point System (0: no; 1: yes)",
  freight: "Freight transport, in billions of ton-km"
};
window.attributeDescriptions = attributeDescriptions;

console.log("Loading database_Europe dataset...");
(async function () {
  const dataRaw = await loadDatabaseEurope();
  console.log("Data loaded:", dataRaw);
  const filteredData = filterData(dataRaw, [
    "country", "year", "fatal_pc_km", "fatal_mIn", "accid_adj_pc_km",
    "p_km", "croad_inv_km", "croad_maint_km", "prop_motorwa", "populat",
    "unemploy", "petrol_car", "alcohol", "mot_index_1000", "den_populat",
    "cgdp", "cgdp_cap", "precipit", "prop_elder", "dps", "freight"
  ]);
  console.log(filteredData);

  //Graph 1
  // Pivot the data inline using d3.rollup:
  const graph1PivotData = Object.fromEntries(
    Array.from(
      d3.rollup(
        filteredData,
        v => d3.mean(v, d => +d.fatal_pc_km),
        d => d.country,
        d => d.year
      ),
      ([country, yearMap]) => [country, Object.fromEntries(yearMap)]
    )
  );

  // Create an instance of HeatMap.
  const graph1Heatmap1 = new HeatMap({
    containerSelector: "#HeatMap1", // Ensure #HeatMap1 exists in your HTML
    pivotData: graph1PivotData,
    title: "Road Safety Comparison Across Countries and Years\n(Fatalities per Billion Passenger-Km)",
    xLabel: "Year",
    yLabel: "Country",
    width: 800,
    height: 600,
    options: {
      colorScheme: d3.interpolateYlOrRd,
      annotations: true,
      titleFontSize: "16px",
      labelFontSize: "12px"
    }
  });

  graph1Heatmap1.draw();


  //Graph 2

  loadGraph2(filteredData);

  //Graph 3
  // Graph 3: Prepare DualPerspective data (BarChart and HeatMap)
  // Aggregate data for BarChart (time-series view)
  const graph3TimeSeriesData = Array.from(
    d3.rollup(
      filteredData,
      v => ({
        croad_inv_km: d3.mean(v, d => +d.croad_inv_km),
        fatal_pc_km: d3.mean(v, d => +d.fatal_pc_km)
      }),
      d => d.year
    ),
    ([year, values]) => ({
      year: +year,
      ...values
    })
  ).sort((a, b) => a.year - b.year);

  // Define investment threshold (median).
  const graph3InvestmentThreshold = d3.median(filteredData, d => +d.croad_inv_km);
  // Filter data for "insufficient" investment.
  const graph3LowInvestData = filteredData.filter(d => d.croad_inv_km < graph3InvestmentThreshold);

  // Build pivot table from low investment data.
  // (Pivot: rows = country, columns = year, cell = mean fatal_pc_km)
  const graph3PivotDataRaw = Object.fromEntries(
    Array.from(
      d3.rollup(
        graph3LowInvestData,
        v => d3.mean(v, d => +d.fatal_pc_km),
        d => d.country,
        d => d.year
      ),
      ([country, yearMap]) => [country, Object.fromEntries(yearMap)]
    )
  );
  // Include all countries from the full dataset even if not present in lowInvestData.
  const graph3AllCountries = Array.from(new Set(filteredData.map(d => d.country))).sort();
  const graph3PivotData = {};
  graph3AllCountries.forEach(country => {
    graph3PivotData[country] = graph3PivotDataRaw[country] || {};
  });

  // Create an instance of DualPerspective to show two graphs in a row.
  const graph3DualPerspective = new DualPerspective({
    containerSelector: "#DualPerspectiveGraph", // Ensure this element exists in your HTML
    barChartData: graph3TimeSeriesData,
    heatmapData: graph3PivotData,
    barChartConfig: {
      xKey: "year",
      barYKey: "croad_inv_km",
      lineYKey: "fatal_pc_km",
      title: "Positive Facet: Road Investment & Safety Improvements Over Time",
      xLabel: "Year",
      leftYLabel: "Mean Road Investment (€ per km)",
      rightYLabel: "Mean Fatality Rate (per billion passenger-km)",
      width: 750,
      height: 500,
      options: {
        barColor: "skyblue",
        lineColor: "red",
        lineMarkerRadius: 4,
        titleFontSize: "16px",
        labelFontSize: "12px",
        tickFontSize: "10px"
      }
    },
    heatmapConfig: {
      title: "Negative Facet: Insufficient Road Investment & High Fatality Rates\n(Including All Countries)",
      xLabel: "Year",
      yLabel: "Country",
      width: 720,
      height: 500,
      options: {
        colorScheme: d3.interpolateReds,
        annotations: true,
        titleFontSize: "16px",
        labelFontSize: "12px"
      }
    },
    layoutOptions: {
      leftWidth: "50%",
      rightWidth: "50%",
      gap: "20px"
    }
  });
  graph3DualPerspective.draw();

  //Graph 4
  // Graph 4: Prepare for Bidirectional Charts
  loadGraph4(filteredData);

  //Graph 5
  loadGraph5(dataRaw);

  //Graph 6
  // Load GeoData for Europe.
  const graph6GeoData = await d3.json("https://raw.githubusercontent.com/leakyMirror/map-of-europe/master/GeoJSON/europe.geojson");


  // Create an instance of the new component.
  const graph6Component = new ChoroplethMapComponentWithAddViewsNTimeSlicer({
    containerSelector: "#ChoroplethMap",
    geoData: graph6GeoData,
    data: filteredData,
    initialAttr: "fatal_pc_km",
    initialYear: d3.min(filteredData, d => d.year)
  });


})();

// Other functions
import GraphQuizComponent, { checkAnswer } from './GraphQuizComponent.js';

// Quiz 1 Data
const problemStatement1 = "Influence of behavioral factors (alcohol consumption, traffic laws) on accident rates.";
const graphTitle1 = "Why Choose the Heatmap?";
const graphDescription1 = `
    1. Efficient for large datasets: Shows patterns across multiple countries and years.<br>
    2. Color intensity reveals trends: Darker shades indicate higher accident rates.<br>
    3. Facilitates quick comparisons: Identifies high-risk regions at a glance.<br>
`;
const quizQuestion1 = "Which European countries have the highest road fatalities?";
const quizOptions1 = {
  "A": "United Kingdom",
  "B": "Sweden",
  "C": "Latvia"
};
const correctAnswer1 = "C";

// Inject Quiz 1
document.getElementById("problem-1").innerHTML = GraphQuizComponent(
  problemStatement1, graphTitle1, graphDescription1, quizQuestion1, quizOptions1, correctAnswer1
);

// Attach event listeners for Quiz 1
const container1 = document.getElementById(`quiz-container-${graphTitle1.replace(/[^a-zA-Z0-9]/g, '')}`);
container1.querySelectorAll(".quiz-btn").forEach(button => {
  button.addEventListener("click", function () {
    const option = this.getAttribute("data-option");
    const resultId = this.getAttribute("data-result");
    const containerId = this.getAttribute("data-container");
    checkAnswer(option, correctAnswer1, quizOptions1, resultId, containerId);
  });
});

// Quiz 2 Data
const problemStatement2 = "Correlation between GDP and road safety";
const graphTitle2 = "Why Choose the Scatter Plot with Regression Line?";
const graphDescription2 = `
    1. Shows relationships between variables: CGDP vs. fatalities.<br>
    2. Regression line highlights trends: Helps identify positive or negative correlations.<br>
`;
const quizQuestion2 = "Does a country’s economic status impact road fatalities?";
const quizOptions2 = {
  "A": "Yes. It's a positive correlation.",
  "B": "Yes. It's a negative correlation.",
  "C": "No."
};
const correctAnswer2 = "B";

// Inject Quiz 2
document.getElementById("problem-2").innerHTML = GraphQuizComponent(
  problemStatement2, graphTitle2, graphDescription2, quizQuestion2, quizOptions2, correctAnswer2
);

// Attach event listeners for Quiz 2
const container2 = document.getElementById(`quiz-container-${graphTitle2.replace(/[^a-zA-Z0-9]/g, '')}`);
container2.querySelectorAll(".quiz-btn").forEach(button => {
  button.addEventListener("click", function () {
    const option = this.getAttribute("data-option");
    const resultId = this.getAttribute("data-result");
    const containerId = this.getAttribute("data-container");
    checkAnswer(option, correctAnswer2, quizOptions2, resultId, containerId);
  });
});

// Quiz 3 Data
const problemStatement3 = "Examines how road investment impacts accident rates across countries.";
const graphTitle3 = "Why choose the Dual-Perspective Chart(Bar chart, Heatmap):";
const graphDescription3 = `
    1. Clear comparison between countries with high/low investment.<br>
    2. Easy to interpret for identifying trends and policy effectiveness.<br>
    3. Positive facet: High investment, lower accident rates.<br>
    4. Negative facet: Low investment, higher accident rates.<br>
<p>Note: Negative facet has empties are because the road investment higher than all countries's median.</p>
    
`;
const quizQuestion3 = "How does investment in road infrastructure correlate with safety?";
const quizOptions3 = {
  "A": "The more investment, the lower the accident rates.",
  "B": "The more investment, the higher the accident rates."
};
const correctAnswer3 = "A";

// Inject Quiz 3
document.getElementById("problem-3").innerHTML = GraphQuizComponent(
  problemStatement3, graphTitle3, graphDescription3, quizQuestion3, quizOptions3, correctAnswer3
);

// Attach event listeners for Quiz 3
const container3 = document.getElementById(`quiz-container-${graphTitle3.replace(/[^a-zA-Z0-9]/g, '')}`);
container3.querySelectorAll(".quiz-btn").forEach(button => {
  button.addEventListener("click", function () {
    const option = this.getAttribute("data-option");
    const resultId = this.getAttribute("data-result");
    const containerId = this.getAttribute("data-container");
    checkAnswer(option, correctAnswer3, quizOptions3, resultId, containerId);
  });
});

// Quiz 4 Data
const problemStatement4 = "Contrasting Road Safety Factors Using Bidirectional Charts.";
const graphTitle4 = "Why choose the Bidirectional Charts:";
const graphDescription4 = `
    1. Dual Perspective Comparison – Directly contrasts two opposite metrics (e.g., fatalities vs. passenger km, investment vs. accident rates).<br>
    2. Balanced Visualization – Clearly shows which factor dominates, making trends more intuitive.<br>
    3. Effective Policy Analysis – Helps assess if policies aimed at improving safety (e.g., investments, stricter laws) are working.<br>
    4. Interactivity for Deeper Exploration – Allows filtering by country, time period, and specific factors to uncover nuanced patterns.</br>    
`;
const quizQuestion4 = "Which European countries demonstrate safer roads based on high travel volumes and low fatality rates?";
const quizOptions4 = {
  "A": "Countries with high passenger km and low fatality rates.",
  "B": "Countries with low passenger km and high fatality rates."
};
const correctAnswer4 = "A";

// Inject Quiz 4
document.getElementById("problem-4").innerHTML = GraphQuizComponent(
  problemStatement4, graphTitle4, graphDescription4, quizQuestion4, quizOptions4, correctAnswer4
);

// Attach event listeners for Quiz 4
const container4 = document.getElementById(`quiz-container-${graphTitle4.replace(/[^a-zA-Z0-9]/g, '')}`);
container4.querySelectorAll(".quiz-btn").forEach(button => {
  button.addEventListener("click", function () {
    const option = this.getAttribute("data-option");
    const resultId = this.getAttribute("data-result");
    const containerId = this.getAttribute("data-container");
    checkAnswer(option, correctAnswer4, quizOptions4, resultId, containerId);
  });
});

// Quiz 5 Data
const problemStatement5 = "Trends in accident rates over time.";
const graphTitle5 = "Why choose the Line Charts:";
const graphDescription5 = `
    1. Best for showing trends over time.<br>
    2. Clearly displays upward or downward patterns in fatalities, accidents, and investments.<br>
    3. Allows easy comparison between variables when plotted together.<br>
    4. Interactivity: Can filter by country and compare multiple attributes.</br>    
`;
const quizQuestion5 = "How has road safety improved over time across European countries?";
const quizOptions5 = {
  "A": "The road safety has improved over time.",
  "B": "The road safety has worsened over time."
};
const correctAnswer5 = "A";

// Inject Quiz 5
document.getElementById("problem-5").innerHTML = GraphQuizComponent(
  problemStatement5, graphTitle5, graphDescription5, quizQuestion5, quizOptions5, correctAnswer5
);

// Attach event listeners for Quiz 5
const container5 = document.getElementById(`quiz-container-${graphTitle5.replace(/[^a-zA-Z0-9]/g, '')}`);
container5.querySelectorAll(".quiz-btn").forEach(button => {
  button.addEventListener("click", function () {
    const option = this.getAttribute("data-option");
    const resultId = this.getAttribute("data-result");
    const containerId = this.getAttribute("data-container");
    checkAnswer(option, correctAnswer5, quizOptions5, resultId, containerId);
  });
});

// Quiz 6 Data
const problemStatement6 = "How Have Road Safety Metrics Changed Across Europe Over Time?";
const graphTitle6 = "Why choose the Choropleth Map with Interactive Filters & Timeline Slider:";
const graphDescription6 = `
    1. Allows users to see how road safety varies across different countries.<br>
    2. Highlights regions with higher or lower fatalities and accident rates.<br>
    3. User-Controlled Feature Selection: Users can choose different variables (e.g., fatalities, accidents, infrastructure investment).<br>
    4. Provides flexibility to explore different aspects of road safety.</br> 
    5. Time-Based Trends (Timeline Slider): The slider enables users to track changes over time (1998–2016).</br>  
    6. Multiple Perspectives (Add Button for More Views): Users can compare different features side by side, such as fatalities vs. road investment.</br>    
    7. Encourages deeper analysis by viewing multiple safety indicators together.</br>    
`;
const quizQuestion6 = "Do you think this graph helps in identifying road safety trends over time?";
const quizOptions6 = {
  "A": "Yes.",
  "B": "No."
};
const correctAnswer6 = "A";

// Inject Quiz 6
document.getElementById("problem-6").innerHTML = GraphQuizComponent(
  problemStatement6, graphTitle6, graphDescription6, quizQuestion6, quizOptions6, correctAnswer6
);

// Attach event listeners for Quiz 6
const container6 = document.getElementById(`quiz-container-${graphTitle6.replace(/[^a-zA-Z0-9]/g, '')}`);
container6.querySelectorAll(".quiz-btn").forEach(button => {
  button.addEventListener("click", function () {
    const option = this.getAttribute("data-option");
    const resultId = this.getAttribute("data-result");
    const containerId = this.getAttribute("data-container");
    checkAnswer(option, correctAnswer6, quizOptions6, resultId, containerId);
  });
});