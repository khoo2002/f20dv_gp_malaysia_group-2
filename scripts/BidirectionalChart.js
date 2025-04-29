// BidirectionalChart.js

export default class BidirectionalChart {
    constructor(config) {
        this.config = {
            parentElement: config.parentElement,
            data: config.data,
            width: config.width || 900,
            height: config.height || 600,
            margin: config.margin || { top: 80, right: 50, bottom: 60, left: 160 },
            leftLabel: config.leftLabel || "Fatalities per Km",
            rightLabel: config.rightLabel || "Passenger Km",
            leftColor: config.leftColor || "crimson",
            rightColor: config.rightColor || "royalblue",
            chartTitle: config.chartTitle || "Fatalities per Km vs. Passenger Km"
        };

        this.initChart();
    }

    initChart() {
        const cfg = this.config;

        this.svg = d3.select(cfg.parentElement)
            .append("svg")
            .attr("width", cfg.width)
            .attr("height", cfg.height);

        this.chartWidth = cfg.width - cfg.margin.left - cfg.margin.right;
        this.chartHeight = cfg.height - cfg.margin.top - cfg.margin.bottom;

        this.chart = this.svg.append("g")
            .attr("transform", `translate(${cfg.margin.left}, ${cfg.margin.top})`);

        // Chart Title
        this.chartTitleText = this.svg.append("text")
            .attr("x", cfg.width / 2)
            .attr("y", 30)
            .attr("text-anchor", "middle")
            .style("font-size", "18px")
            .style("font-weight", "bold")
            .text(cfg.chartTitle);

        // Axis Labels
        this.leftAxisLabel = this.svg.append("text")
            .attr("x", cfg.margin.left + this.chartWidth * 0.25)
            .attr("y", cfg.height - 15)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text(cfg.leftLabel);

        this.rightAxisLabel = this.svg.append("text")
            .attr("x", cfg.margin.left + this.chartWidth * 0.75)
            .attr("y", cfg.height - 15)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text(cfg.rightLabel);

        // Y-axis label
        this.svg.append("text")
            .attr("transform", `rotate(-90)`)
            .attr("x", -cfg.height / 2)
            .attr("y", 20)
            .attr("text-anchor", "middle")
            .style("font-size", "12px")
            .text("Country");

        this.xLeft = d3.scaleLinear().range([this.chartWidth / 2, 0]);
        this.xRight = d3.scaleLinear().range([0, this.chartWidth / 2]);
        this.y = d3.scaleBand().range([0, this.chartHeight]).padding(0.2);

        this.xAxisLeft = this.chart.append("g")
            .attr("transform", `translate(0, ${this.chartHeight})`);

        this.xAxisRight = this.chart.append("g")
            .attr("transform", `translate(${this.chartWidth / 2}, ${this.chartHeight})`);

        this.yAxis = this.chart.append("g")
            .attr("class", "y-axis");

        // Tooltip
        this.tooltip = d3.select(cfg.parentElement)
            .append("div")
            .attr("class", "bi-tooltip")
            .style("position", "absolute")
            .style("padding", "6px 10px")
            .style("background", "#333")
            .style("color", "#fff")
            .style("border-radius", "4px")
            .style("font-size", "13px")
            .style("pointer-events", "none")
            .style("opacity", 0);
    }

    update(data) {
        this.config.data = data || this.config.data;

        this.xLeft.domain([0, d3.max(this.config.data, d => d.fatalities)]);
        this.xRight.domain([0, d3.max(this.config.data, d => d.passengerKm)]);
        this.y.domain(this.config.data.map(d => d.country));

        // Update labels dynamically
        this.chartTitleText.text(this.config.chartTitle);
        this.leftAxisLabel.text(this.config.leftLabel);
        this.rightAxisLabel.text(this.config.rightLabel);

        this.render();
    }

    render() {
        const self = this;
        const cfg = this.config;

        // Left bars
        const barsLeft = this.chart.selectAll(".bar-left")
            .data(cfg.data, d => d.country);

        barsLeft.join("rect")
            .attr("class", "bar-left")
            .attr("x", d => self.xLeft(d.fatalities))
            .attr("y", d => self.y(d.country))
            .attr("width", d => self.chartWidth / 2 - self.xLeft(d.fatalities))
            .attr("height", self.y.bandwidth())
            .attr("fill", cfg.leftColor)
            .on("mouseover", function (e, d) {
                d3.select(this).classed("bar-glow-red", true);
                self.tooltip.transition().duration(100).style("opacity", 1);
                self.tooltip.html(`<strong>${d.country}</strong><br>${cfg.leftLabel}: ${d.fatalities}`)
                    .style("left", `${e.pageX + 10}px`)
                    .style("top", `${e.pageY - 28}px`);
            })
            .on("mouseout", function () {
                d3.select(this).classed("bar-glow-red", false);
                self.tooltip.transition().duration(200).style("opacity", 0);
            });

        // Right bars
        const barsRight = this.chart.selectAll(".bar-right")
            .data(cfg.data, d => d.country);

        barsRight.join("rect")
            .attr("class", "bar-right")
            .attr("x", self.chartWidth / 2)
            .attr("y", d => self.y(d.country))
            .attr("width", d => self.xRight(d.passengerKm))
            .attr("height", self.y.bandwidth())
            .attr("fill", cfg.rightColor)
            .on("mouseover", function (e, d) {
                d3.select(this).classed("bar-glow-blue", true);
                self.tooltip.transition().duration(100).style("opacity", 1);
                self.tooltip.html(`<strong>${d.country}</strong><br>${cfg.rightLabel}: ${d.passengerKm}`)
                    .style("left", `${e.pageX + 10}px`)
                    .style("top", `${e.pageY - 28}px`);
            })
            .on("mouseout", function () {
                d3.select(this).classed("bar-glow-blue", false);
                self.tooltip.transition().duration(200).style("opacity", 0);
            });

        this.yAxis.call(d3.axisLeft(this.y));
        this.xAxisLeft.call(d3.axisBottom(this.xLeft).ticks(4));
        this.xAxisRight.call(d3.axisBottom(this.xRight).ticks(4));
    }
}