export default class BarChartWithTwinAxis {
  constructor({
    containerSelector,
    data,
    xKey = "year",
    barYKey = "croad_inv_km",
    lineYKey = "fatal_pc_km",
    title = "",
    xLabel = "",
    leftYLabel = "",
    rightYLabel = "",
    width = 1000,
    height = 600,
    options = {} // additional settings
  }) {
    this.containerSelector = containerSelector;
    this.data = data;
    this.xKey = xKey;
    this.barYKey = barYKey;
    this.lineYKey = lineYKey;
    this.title = title;
    this.xLabel = xLabel;
    this.leftYLabel = leftYLabel;
    this.rightYLabel = rightYLabel;
    this.width = width;
    this.height = height;
    this.options = Object.assign(
      {
        margin: { top: 60, right: 80, bottom: 60, left: 60 },
        barColor: "skyblue",
        lineColor: "red",
        lineMarkerRadius: 4,
        titleFontSize: "18px",
        labelFontSize: "14px",
        tickFontSize: "12px"
      },
      options
    );
  }

  draw() {
    // Remove any existing SVG.
    d3.select(this.containerSelector).select("svg").remove();

    const margin = this.options.margin;
    const innerWidth = this.width - margin.left - margin.right;
    const innerHeight = this.height - margin.top - margin.bottom;

    // Create SVG container.
    const svg = d3.select(this.containerSelector)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    // Main group where we draw the chart.
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Create x-scale: using a band scale for discrete x-values.
    const xScale = d3.scaleBand()
      .domain(this.data.map(d => d[this.xKey]))
      .range([0, innerWidth])
      .padding(0.1);

    // Left y-scale for the bar chart.
    const yLeftScale = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => +d[this.barYKey])])
      .range([innerHeight, 0])
      .nice();

    // Right y-scale for the line chart.
    const yRightScale = d3.scaleLinear()
      .domain([0, d3.max(this.data, d => +d[this.lineYKey])])
      .range([innerHeight, 0])
      .nice();

    // Create and append x-axis (positioned at the bottom).
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d => d); // format tick labels as is (e.g. integer years)
    g.append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .style("font-size", this.options.tickFontSize);

    // Create and append left y-axis.
    const yAxisLeft = d3.axisLeft(yLeftScale);
    g.append("g")
      .attr("class", "y axis left")
      .call(yAxisLeft)
      .selectAll("text")
      .style("font-size", this.options.tickFontSize);

    // Create and append right y-axis.
    const yAxisRight = d3.axisRight(yRightScale);
    g.append("g")
      .attr("class", "y axis right")
      .attr("transform", `translate(${innerWidth}, 0)`)
      .call(yAxisRight)
      .selectAll("text")
      .style("font-size", this.options.tickFontSize);

    // Draw bar chart - each bar represents the mean road investment.
    g.selectAll(".bar")
      .data(this.data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", d => xScale(d[this.xKey]))
      .attr("y", d => yLeftScale(+d[this.barYKey]))
      .attr("width", xScale.bandwidth())
      .attr("height", d => innerHeight - yLeftScale(+d[this.barYKey]))
      .style("fill", this.options.barColor);

    // Define a line generator for the fatality rate trend.
    const lineGenerator = d3.line()
      .x(d => xScale(d[this.xKey]) + xScale.bandwidth() / 2)
      .y(d => yRightScale(+d[this.lineYKey]))
      .curve(d3.curveMonotoneX);

    // Draw the line chart.
    g.append("path")
      .datum(this.data)
      .attr("class", "line-chart")
      .attr("fill", "none")
      .attr("stroke", this.options.lineColor)
      .attr("stroke-width", 2)
      .attr("d", lineGenerator);

    // Draw markers for the line chart.
    g.selectAll(".line-marker")
      .data(this.data)
      .enter()
      .append("circle")
      .attr("class", "line-marker")
      .attr("cx", d => xScale(d[this.xKey]) + xScale.bandwidth() / 2)
      .attr("cy", d => yRightScale(+d[this.lineYKey]))
      .attr("r", this.options.lineMarkerRadius)
      .attr("fill", this.options.lineColor);

    // Add legend group with additional top margin.
    const legendGroup = svg.append("g")
      .attr("class", "legend")
      // Adjust the y-offset to add more space from the title and chart.
      .attr("transform", `translate(${margin.left}, ${margin.top / 2 + 10})`);

    // Legend for label 1 (bar chart)
    legendGroup.append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 15)
      .attr("height", 15)
      .style("fill", this.options.barColor);
    legendGroup.append("text")
      .attr("x", 20)
      .attr("y", 12)
      .style("font-size", this.options.labelFontSize)
      .text("Mean Road Investment");

    // Legend for label 2 (line chart)
    legendGroup.append("circle")
      .attr("cx", 200)
      .attr("cy", 7.5)
      .attr("r", this.options.lineMarkerRadius)
      .attr("fill", this.options.lineColor);
    legendGroup.append("line")
      .attr("x1", 195)
      .attr("y1", 7.5)
      .attr("x2", 205)
      .attr("y2", 7.5)
      .attr("stroke", this.options.lineColor)
      .attr("stroke-width", 2);
    legendGroup.append("text")
      .attr("x", 210)
      .attr("y", 12)
      .style("font-size", this.options.labelFontSize)
      .text("Mean Fatality Rate");

    // Add x-axis label.
    svg.append("text")
      .attr("class", "x label")
      .attr("text-anchor", "middle")
      .attr("x", margin.left + innerWidth / 2)
      .attr("y", this.height - margin.bottom / 4)
      .style("font-size", this.options.labelFontSize)
      .text(this.xLabel);

    // Add left y-axis label.
    svg.append("text")
      .attr("class", "y label left")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${margin.left / 4}, ${margin.top + innerHeight / 2}) rotate(-90)`)
      .style("font-size", this.options.labelFontSize)
      .text(this.leftYLabel);

    // Add right y-axis label.
    svg.append("text")
      .attr("class", "y label right")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${this.width - margin.right / 4}, ${margin.top + innerHeight / 2}) rotate(90)`)
      .style("font-size", this.options.labelFontSize)
      .text(this.rightYLabel);

    // Add chart title.
    svg.append("text")
      .attr("class", "chart-title")
      .attr("text-anchor", "middle")
      .attr("x", margin.left + innerWidth / 2)
      .attr("y", margin.top / 2)
      .style("font-size", this.options.titleFontSize)
      .text(this.title);
  }
}