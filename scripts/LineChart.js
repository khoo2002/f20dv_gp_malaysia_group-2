// Define and export the LineChart class for visualizing time-series data using D3.js
export default class LineChart {
    constructor({ container, data, xKey, yKey, title, color, globalDispatcher }) {
        // Store the provided parameters for future reference
        this.container = container;  // HTML container where the chart will be drawn
        this.data = data;            // Data set to be visualized
        this.xKey = 'year';          // Fixed to year, it should not change
        this.yKey = yKey;            // Key representing the y-axis data (e.g., Fatalities)
        this.title = title;          // Title of the line chart
        this.color = color;          // Line color
        this.globalDispatcher = globalDispatcher; // Dispatcher for event communication across graphs

        // Define margins and chart dimensions
        this.margin = { top: 50, right: 30, bottom: 50, left: 70 };
        this.width = 400 - this.margin.left - this.margin.right;  // Compute chart width
        this.height = 300 - this.margin.top - this.margin.bottom; // Compute chart height

        // Initialize the chart
        this.initChart();
    }

    // Function to initialize the line chart and set up SVG elements
    initChart() {
        // Create the SVG container and append a group element for drawing
        this.svg = d3.select(this.container)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        // Define y scale
        this.yScale = d3.scaleLinear().range([this.height, 0]); // Y-axis: Linear scale

        // Append axes groups
        this.xAxis = this.svg.append("g").attr("transform", `translate(0, ${this.height})`); // X-axis positioned at bottom
        // Add X-axis label
        this.svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", this.height + 40)  // Position below the X-axis
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .text(this.xKey);  // Label for year (fixed)

        this.yAxis = this.svg.append("g"); // Y-axis positioned at left
        // Add Y-axis label
        this.svg.append("text")
            .attr("x", -this.height / 2)
            .attr("y", -40)  // Position left of the Y-axis
            .attr("text-anchor", "middle")
            .style("font-size", "14px")
            .attr("transform", "rotate(-90)")  // Rotate the label to be vertical
            .text(this.yKey);  // Y-axis label (dynamic)

        // Define line generator function
        this.line = d3.line()
            .defined(d => d[this.yKey] !== null)  // Ignore missing/null values
            .x(d => this.xScale(d[this.xKey]))    // Map x values (year is fixed)
            .y(d => this.yScale(d[this.yKey]))    // Map y values
            .curve(d3.curveMonotoneX);            // Apply smoothing to the line

        // Append the path element for the line chart
        this.path = this.svg.append("path")
            .attr("fill", "none")
            .attr("stroke", this.color)  // Set line color
            .attr("stroke-width", 2);    // Set line width

        // Append the chart title at the top
        this.svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("font-weight", "bold")
            .text(this.title);

        // Create tooltip for displaying data on hover
        this.tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid black")
            .style("padding", "5px")
            .style("display", "none");

        // Create dropdown for X-axis filter (selecting X Key)
        this.createAxisFilters();

        // Call updateChart with the initial dataset
        this.updateChart(this.data);
    }

    // Create dynamic filters for X-axis
    createAxisFilters() {
        // X-Axis dropdown
        d3.select(this.container)
            .insert("select", ":first-child")
            .attr("id", "x-axis-select")
            .style("margin-bottom", "5px")
            .style("display", "block")
            .style("font-size", "14px")
            .style("margin-left", "50%")
            .style("transform", "translateX(-50%)")
            .on("change", (event) => {
                this.yKey = event.target.value;  // Update the Y key
                this.updateChart(this.data);     // Update the chart with new selection
                this.updateAxisLabels();         // Update axis labels dynamically
            })
            .selectAll("option")
            .data(["fatal_pc_km", "accid_adj_pc_km", "croad_inv_km", "cgdp"])  // X-axis options
            .enter()
            .append("option")
            .text(d => d)
            .property("selected", d => d === this.yKey);  // Default to selected yKey
    }

    // Function to update axis labels dynamically
    updateAxisLabels() {
        // Update Y-axis label dynamically
        this.svg.select("text")
            .text(this.yKey)   // Dynamically update Y-axis label text
            .attr("x", -this.height / 2)
            .attr("y", -40)
            .attr("transform", "rotate(-90)"); // To keep the Y axis label vertical
    }

    // Function to update the chart with new data
    updateChart(newData) {
        this.data = newData; // Update dataset based on the selected filters

        // Update Y scale domain based on the selected data
        this.yScale.domain([0, d3.max(this.data, d => d[this.yKey] ? d[this.yKey] : 0) * 1.1]); // Scale slightly above max value

        // Update X scale domain (this will remain fixed to year)
        this.xScale = d3.scaleLinear().domain(d3.extent(this.data, d => d[this.xKey])).range([0, this.width]);

        // Update x and y axes with transition effect
        this.xAxis.transition().duration(1000).call(d3.axisBottom(this.xScale).tickFormat(d3.format("d"))); // Format x-axis as integer years
        this.yAxis.transition().duration(1000).call(d3.axisLeft(this.yScale)); // Format y-axis with numeric values

        // Animate the line path update with the new data
        this.path.datum(this.data)
            .transition()
            .duration(1000)
            .attr("d", this.line);

        // Add interactive dots for hover effect
        this.svg.selectAll(".dot")
            .data(this.data)
            .join("circle")
            .attr("class", "dot")
            .attr("r", 4) // Set circle radius
            .attr("fill", this.color) // Set fill color
            .attr("cx", d => this.xScale(d[this.xKey])) // Set x position
            .attr("cy", d => this.yScale(d[this.yKey])) // Set y position
            .on("mouseover", (event, d) => {
                // Display tooltip on hover
                this.tooltip.style("display", "block")
                    .html(`Year: ${d[this.xKey]}<br>${this.yKey}: ${d[this.yKey]}`)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 10}px`);

                // Dispatch a highlight event to other graphs
                this.globalDispatcher.call("highlight", null, d[this.xKey]);
            })
            .on("mouseout", () => {
                // Hide tooltip when mouse leaves
                this.tooltip.style("display", "none");
                // Dispatch an unhighlight event
                this.globalDispatcher.call("unhighlight");
            });
    }
}