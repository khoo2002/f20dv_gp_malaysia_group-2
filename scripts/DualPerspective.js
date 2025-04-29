import BarChartWithTwinAxis from "./BarChartWithTwinAxis.js";
import HeatMap from "./HeatMap.js";

export default class DualPerspective {
  constructor({
    containerSelector,
    barChartData,     // Array (aggregated time-series data)
    heatmapData,      // Object (pivot data: country x year → value)
    barChartConfig = {},  // Additional configurations for BarChartWithTwinAxis
    heatmapConfig = {},   // Additional configurations for HeatMap
    layoutOptions = {}    // Layout options (e.g., widths, gap)
  }) {
    this.containerSelector = containerSelector;
    this.barChartData = barChartData;
    this.heatmapData = heatmapData;
    this.barChartConfig = barChartConfig;
    this.heatmapConfig = heatmapConfig;
    this.layoutOptions = Object.assign(
      { leftWidth: "50%", rightWidth: "50%", gap: "20px" },
      layoutOptions
    );
  }

  draw() {
    // Clear any existing content in the container.
    d3.select(this.containerSelector).html("");

    // Create a flex container for the two graphs.
    const container = d3.select(this.containerSelector)
      .append("div")
      .style("display", "flex")
      .style("justify-content", "space-between")
      .style("align-items", "flex-start")
      .style("gap", this.layoutOptions.gap);

    // Create left container for the BarChartWithTwinAxis.
    container.append("div")
      .attr("id", "dual-left")
      .style("width", this.layoutOptions.leftWidth);

    // Create right container for the HeatMap.
    container.append("div")
      .attr("id", "dual-right")
      .style("width", this.layoutOptions.rightWidth);

    // Instantiate and draw the BarChartWithTwinAxis.
    const barChart = new BarChartWithTwinAxis(Object.assign({}, {
      containerSelector: "#dual-left",
      data: this.barChartData
    }, this.barChartConfig));
    barChart.draw();

    // Instantiate and draw the HeatMap.
    const heatmap = new HeatMap(Object.assign({}, {
      containerSelector: "#dual-right",
      pivotData: this.heatmapData
    }, this.heatmapConfig));
    heatmap.draw();
  }
}