export default class HeatMap {
  constructor({
    containerSelector,
    pivotData,
    title = "",
    xLabel = "",
    yLabel = "",
    width = 800,
    height = 600,
    options = {} // additional options to override defaults
  }) {
    this.containerSelector = containerSelector;
    this.pivotData = pivotData;
    this.title = title;
    this.xLabel = xLabel;
    this.yLabel = yLabel;
    this.width = width;
    this.height = height;
    // Default options.
    this.options = Object.assign(
      {
        colorScheme: d3.interpolateYlOrRd,
        annotations: true,
        titleFontSize: "16px",
        labelFontSize: "12px",
        cellBorderColor: "white",
        noDataColor: "#ccc",
        legendWidth: 20,
        legendTickSize: 6
      },
      options
    );
  }

  draw() {
    // Clear any previous svg.
    d3.select(this.containerSelector).select("svg").remove();

    // Extract row and column keys.
    const rows = Object.keys(this.pivotData);
    const colsSet = new Set();
    rows.forEach(row => {
      Object.keys(this.pivotData[row]).forEach(col => colsSet.add(col));
    });
    const cols = Array.from(colsSet).sort((a, b) => +a - +b);

    // Define margins and inner dimensions.
    const margin = { top: 50, right: 90, bottom: 70, left: 100 };
    const innerWidth = this.width - margin.left - margin.right;
    const innerHeight = this.height - margin.top - margin.bottom;
    const cellWidth = innerWidth / cols.length;
    const cellHeight = innerHeight / rows.length;

    // Compute the extent of values to create a color scale.
    const values = [];
    rows.forEach(row => {
      cols.forEach(col => {
        const cellValue = this.pivotData[row][col];
        if (cellValue !== undefined) {
          values.push(+cellValue);
        }
      });
    });
    const valueExtent = d3.extent(values);
    const colorScale = d3.scaleSequential()
      .domain(valueExtent)
      .interpolator(this.options.colorScheme);

    // Create SVG.
    const svg = d3.select(this.containerSelector)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    // Add a defs element for the legend gradient.
    const defs = svg.append("defs");
    const legendGradient = defs.append("linearGradient")
      .attr("id", "legend-gradient")
      .attr("x1", "0%").attr("y1", "100%")
      .attr("x2", "0%").attr("y2", "0%");

    // Create gradient stops.
    const stops = 10;
    d3.range(stops).forEach(i => {
      const t = i / (stops - 1);
      legendGradient.append("stop")
        .attr("offset", `${t * 100}%`)
        .attr("stop-color", colorScale(valueExtent[0] + t * (valueExtent[1] - valueExtent[0])));
    });

    // Main group for heatmap cells.
    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Draw each cell.
    rows.forEach((row, i) => {
      cols.forEach((col, j) => {
        const cellValue = this.pivotData[row][col];
        g.append("rect")
          .attr("x", j * cellWidth)
          .attr("y", i * cellHeight)
          .attr("width", cellWidth)
          .attr("height", cellHeight)
          .style("fill", cellValue !== undefined ? colorScale(cellValue) : this.options.noDataColor)
          .style("stroke", this.options.cellBorderColor);

        // Optionally add annotation.
        if (this.options.annotations && cellValue !== undefined) {
          g.append("text")
            .attr("x", j * cellWidth + cellWidth / 2)
            .attr("y", i * cellHeight + cellHeight / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .style("fill", "black")
            .style("font-size", this.options.labelFontSize)
            .text(d3.format(".1f")(cellValue));
        }
      });
    });

    // Add row labels to the left.
    const yAxisG = svg.append("g")
      .attr("transform", `translate(${margin.left - 5},${margin.top})`);
    yAxisG.selectAll("text")
      .data(rows)
      .enter()
      .append("text")
      .attr("x", 0)
      .attr("y", (d, i) => i * cellHeight + cellHeight / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", "end")
      .style("font-size", this.options.labelFontSize)
      .text(d => d);

    // Add column (year) labels at the bottom.
    const xAxisG = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top + innerHeight + 5})`);
    xAxisG.selectAll("text")
      .data(cols)
      .enter()
      .append("text")
      .attr("x", (d, i) => i * cellWidth + cellWidth / 2)
      .attr("y", 0)
      .attr("dy", "0.8em")
      .attr("text-anchor", "middle")
      .style("font-size", this.options.labelFontSize)
      .text(d => d);

    // Add title centered at the top.
    svg.append("text")
      .attr("x", this.width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .style("font-size", this.options.titleFontSize)
      .text(this.title);

    // Add x-axis label (at the bottom of x-axis labels).
    svg.append("text")
      .attr("x", this.width / 2)
      .attr("y", this.height - margin.bottom / 6)
      .attr("text-anchor", "middle")
      .style("font-size", this.options.labelFontSize)
      .text(this.xLabel);

    // Add y-axis label (rotated) on the left.
    svg.append("text")
      .attr("transform", `rotate(-90)`)
      .attr("x", -this.height / 2)
      .attr("y", margin.left / 3)
      .attr("dy", "1em")
      .attr("text-anchor", "middle")
      .style("font-size", this.options.labelFontSize)
      .text(this.yLabel);

    // Create a legend group at the right of the heatmap.
    const legendX = margin.left + innerWidth + 20;
    const legendY = margin.top;
    const legendHeight = innerHeight;
    const legendG = svg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${legendX},${legendY})`);

    // Draw the legend rectangle.
    legendG.append("rect")
      .attr("width", this.options.legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#legend-gradient)")
      .style("stroke", "#000");

    // Create a scale for the legend.
    const legendScale = d3.scaleLinear()
      .domain(valueExtent)
      .range([legendHeight, 0]);

    // Create a legend axis.
    const legendAxis = d3.axisRight(legendScale)
      .ticks(6)
      .tickSize(this.options.legendTickSize);

    legendG.append("g")
      .attr("transform", `translate(${this.options.legendWidth},0)`)
      .call(legendAxis);

    // Add text labels for the min and max values of the legend.
    legendG.append("text")
      .attr("class", "legend-min")
      .attr("x", this.options.legendWidth + 5)
      .attr("y", legendHeight)
      .attr("dy", "0.35em")
      .style("font-size", this.options.labelFontSize)
      .text(d3.format(".2f")(valueExtent[0]));

    legendG.append("text")
      .attr("class", "legend-max")
      .attr("x", this.options.legendWidth + 5)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .style("font-size", this.options.labelFontSize)
      .text(d3.format(".2f")(valueExtent[1]));
  }
}