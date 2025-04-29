export default class ScatterPlot {
    constructor({ container, data, xKey, yKey, title, colorScale, globalDispatcher, width = 1200, height = 800 }) {
        this.container = container;
        this.fullData = data; // Store full dataset for filtering
        this.data = data;
        this.xKey = xKey;
        this.yKey = yKey;
        this.title = title;
        this.colorScale = colorScale;
        this.globalDispatcher = globalDispatcher;

        this.margin = { top: 50, right: 250, bottom: 60, left: 80 };
        this.width = width - this.margin.left - this.margin.right;
        this.height = height - this.margin.top - this.margin.bottom;

        this.createFilterDropdown();
        this.initChart();
    }

    createFilterDropdown() {
        const uniqueCountries = ["Show All", ...new Set(this.fullData.map(d => d.country))];

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
                this.xKey = event.target.value;
                this.updateChart();
            })
            .selectAll("option")
            .data(["cgdp", "populat", "den_populat", "croad_inv_km"])
            .enter()
            .append("option")
            .text(d => d)
            .property("selected", d => d === this.xKey);

        // Y-Axis dropdown
        d3.select(this.container)
            .insert("select", ":first-child")
            .attr("id", "y-axis-select")
            .style("margin-bottom", "5px")
            .style("display", "block")
            .style("font-size", "14px")
            .style("margin-left", "50%")
            .style("transform", "translateX(-50%)")
            .on("change", (event) => {
                this.yKey = event.target.value;
                this.updateChart();
            })
            .selectAll("option")
            .data(["fatal_pc_km", "accid_adj_pc_km", "croad_inv_km"])
            .enter()
            .append("option")
            .text(d => d)
            .property("selected", d => d === this.yKey);

        // Multi-select country filter
        const countryFilterContainer = d3.select(this.container)
            .insert("div", ":first-child")
            .attr("id", "country-filter-container")
            .style("display", "flex")
            .style("flex-wrap", "wrap")
            .style("justify-content", "center")
            .style("gap", "10px")
            .style("margin-bottom", "10px");

        // Create checkboxes
        uniqueCountries.forEach(country => {
            const label = countryFilterContainer.append("label")
                .style("margin-right", "10px");

            const checkbox = label.append("input")
                .attr("type", "checkbox")
                .attr("value", country)
                .property("checked", country === "Show All")
                .on("change", (event) => {
                    const selectedValue = event.target.value;
                    const isChecked = event.target.checked;

                    if (selectedValue === "Show All") {
                        if (isChecked) {
                            // Uncheck others
                            countryFilterContainer.selectAll("input[type='checkbox']")
                                .property("checked", function () {
                                    return this.value === "Show All";
                                });
                            this.filterByCountry(["Show All"]);
                        }
                    } else {
                        // Uncheck "Show All" if another country is selected
                        countryFilterContainer.selectAll("input[value='Show All']")
                            .property("checked", false);

                        const selectedCountries = countryFilterContainer
                            .selectAll("input[type='checkbox']")
                            .nodes()
                            .filter(cb => cb.checked)
                            .map(cb => cb.value);

                        if (selectedCountries.length === 0) {
                            // If nothing is selected, check "Show All"
                            countryFilterContainer.selectAll("input[type='checkbox']")
                                .property("checked", function () {
                                    return this.value === "Show All";
                                });
                            this.filterByCountry(["Show All"]);
                        } else {
                            this.filterByCountry(selectedCountries);
                        }
                    }
                });

            label.append("span").text(` ${country}`);
        });
    }
    filterByCountry(countries) {
        this.data = countries.includes("Show All") ? this.fullData : this.fullData.filter(d => countries.includes(d.country));

        // Clear previous points, regression line, and legend before updating
        this.svg.selectAll(".dot").remove();
        this.svg.selectAll(".regression-line").remove();
        this.legend.selectAll("*").remove();

        this.updateChart();
    }

    initChart() {
        this.svg = d3.select(this.container)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

        // Scales
        this.xScale = d3.scaleLinear().range([0, this.width]);
        this.yScale = d3.scaleLinear().range([this.height, 0]);

        // Axes
        this.xAxis = this.svg.append("g").attr("transform", `translate(0, ${this.height})`);
        this.yAxis = this.svg.append("g");

        // X & Y Labels (dynamic placeholders)
        this.xAxisLabel = this.svg.append("text")
            .attr("class", "x-label")
            .attr("transform", `translate(${this.width / 2}, ${this.height + 40})`)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(this.xKey);

        this.yAxisLabel = this.svg.append("text")
            .attr("class", "y-label")
            .attr("transform", "rotate(-90)")
            .attr("y", -50)
            .attr("x", -this.height / 2)
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .text(this.yKey);

        // Chart Title
        this.svg.append("text")
            .attr("x", this.width / 2)
            .attr("y", -20)
            .attr("text-anchor", "middle")
            .style("font-size", "20px")
            .style("font-weight", "bold")
            .text(this.title);

        // Tooltip
        this.tooltip = d3.select(this.container)
            .append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("background", "white")
            .style("border", "1px solid black")
            .style("padding", "5px")
            .style("display", "none");

        // Legend
        this.legend = this.svg.append("g")
            .attr("transform", `translate(${this.width + 20}, 50)`)
            .attr("class", "legend");

        this.updateChart();
    }

    updateChart() {
        this.xScale.domain(d3.extent(this.data, d => d[this.xKey])).nice();
        this.yScale.domain(d3.extent(this.data, d => d[this.yKey])).nice();

        this.xAxis.transition().duration(1000).call(d3.axisBottom(this.xScale));
        this.yAxis.transition().duration(1000).call(d3.axisLeft(this.yScale));

        // Update axis labels
        this.xAxisLabel.text(this.xKey);
        this.yAxisLabel.text(this.yKey);

        this.svg.selectAll(".regression-line").remove();
        let regressionData = this.calculateRegression(this.data);
        if (regressionData.length > 1) {
            this.svg.append("path")
                .datum(regressionData)
                .attr("class", "regression-line")
                .attr("fill", "none")
                .attr("stroke", "black")
                .attr("stroke-width", 3)
                .attr("d", d3.line()
                    .x(d => this.xScale(d.x))
                    .y(d => this.yScale(d.y))
                );
        }

        this.svg.selectAll(".dot")
            .data(this.data)
            .join("circle")
            .attr("class", "dot")
            .attr("r", 6)
            .attr("fill", d => this.colorScale(d.country))
            .attr("cx", d => this.xScale(d[this.xKey]))
            .attr("cy", d => this.yScale(d[this.yKey]))
            .on("mouseover", (event, d) => {
                this.tooltip.style("display", "block")
                    .html(`Year: ${d.year}<br>Country: ${d.country}<br>${this.yKey}: ${d[this.yKey]}`)
                    .style("left", `${event.pageX + 10}px`)
                    .style("top", `${event.pageY - 10}px`);

                this.svg.selectAll(".dot")
                    .attr("opacity", p => p.country === d.country ? 1 : 0.3);
            })
            .on("mouseout", () => {
                this.tooltip.style("display", "none");
                this.svg.selectAll(".dot").attr("opacity", 1);
            });

        this.updateLegend();
    }

    updateLegend() {
        let countries = [...new Set(this.data.map(d => d.country))];
        let legendItems = this.legend.selectAll(".legend-item").data(countries);

        legendItems.exit().remove();
        let newItems = legendItems.enter().append("g").attr("class", "legend-item");

        newItems.append("circle")
            .attr("r", 8)
            .attr("cx", 10)
            .attr("cy", (d, i) => i * 22)
            .attr("fill", d => this.colorScale(d));

        newItems.append("text")
            .attr("x", 25)
            .attr("y", (d, i) => i * 22 + 5)
            .style("font-size", "14px")
            .text(d => d);
    }

    calculateRegression(data) {
        if (data.length < 2) return [];

        let xMean = d3.mean(data, d => d[this.xKey]);
        let yMean = d3.mean(data, d => d[this.yKey]);

        let numerator = d3.sum(data, d => (d[this.xKey] - xMean) * (d[this.yKey] - yMean));
        let denominator = d3.sum(data, d => Math.pow(d[this.xKey] - xMean, 2));

        if (denominator === 0) return [];

        let slope = numerator / denominator;
        let intercept = yMean - slope * xMean;

        return data.map(d => ({ x: d[this.xKey], y: slope * d[this.xKey] + intercept }));
    }
}