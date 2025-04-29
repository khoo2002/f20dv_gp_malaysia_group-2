// Import the ScatterPlot class from ScatterPlot.js
import ScatterPlot from "./ScatterPlot.js";

// Function to initialize and load the scatter plot graph
export function loadGraph2(data) {
    // Define the container where the scatter plot will be rendered
    const container = "#scatter-plot";

    // Define a color scale for distinguishing different countries in the scatter plot
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Create a global event dispatcher for handling highlight interactions across graphs
    const globalDispatcher = d3.dispatch("highlight", "unhighlight");

    // Create an instance of the ScatterPlot class with the required parameters
    let scatterPlot = new ScatterPlot({
        container,         // The container ID where the graph will be appended
        data,             // The dataset being visualized
        xKey: "cgdp",      // X-axis data key (GDP)
        yKey: "fatal_pc_km", // Y-axis data key (Fatalities per Billion Passenger-km)
        title: "GDP vs. Fatalities per Billion Passenger-km", // Title of the scatter plot
        colorScale,        // The color scale for different categories (countries)
        globalDispatcher,  // Global dispatcher to enable event communication between graphs
        width: 1200,       // Width of the scatter plot
        height: 800,       // Height of the scatter plot
    });

    // Ensure the updated country filter logic works correctly
    const countryFilterContainer = d3.select("#country-filter-container");

    // Attach the event listener for country filter update
    countryFilterContainer.on("change", function () {
        // Get selected countries
        const selectedCountries = Array.from(this.querySelectorAll("input[type='checkbox']:checked"))
            .map(input => input.value);

        // Update scatterPlot with new filtered data
        scatterPlot.filterByCountry(selectedCountries);
    });
}