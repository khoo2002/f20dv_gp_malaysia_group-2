import LineChart from "./LineChart.js";

export function loadGraph5(data) {
    const countrySelect = d3.select("#country-select");
    const globalDispatcher = d3.dispatch("highlight", "unhighlight");

    // Extract unique country names from data
    const countries = Array.from(new Set(data.map(d => d.country))).sort();

    // Populate the dropdown menu
    countrySelect.selectAll("option")
        .data(["Overall", ...countries])
        .enter()
        .append("option")
        .text(d => d)
        .attr("value", d => d);

    function getFilteredData(selectedCountry) {
        if (selectedCountry === "Overall") {
            // Aggregate data using the mean per year
            const aggregatedData = Array.from(
                d3.group(data, d => d.year),
                ([year, records]) => ({
                    year,
                    fatal_pc_km: d3.mean(records, d => d.fatal_pc_km),
                    accid_adj_pc_km: d3.mean(records, d => d.accid_adj_pc_km),
                    croad_inv_km: d3.mean(records, d => d.croad_inv_km)
                })
            );
            return aggregatedData;
        } else {
            return data.filter(d => d.country === selectedCountry);
        }
    }

    let fatalitiesChart = new LineChart({
        container: "#fatalities-chart",
        data: getFilteredData("Overall"),
        xKey: "year",
        yKey: "fatal_pc_km",
        title: "Fatalities per Billion Passenger-km",
        color: "red",
        globalDispatcher
    });

    let accidentsChart = new LineChart({
        container: "#accidents-chart",
        data: getFilteredData("Overall"),
        xKey: "year",
        yKey: "accid_adj_pc_km",
        title: "Accidents per Billion Passenger-km",
        color: "purple",
        globalDispatcher
    });

    let investmentChart = new LineChart({
        container: "#investment-chart",
        data: getFilteredData("Overall"),
        xKey: "year",
        yKey: "croad_inv_km",
        title: "Investment in Road Construction (€ per km)",
        color: "blue",
        globalDispatcher
    });

    countrySelect.on("change", function () {
        const selectedCountry = this.value;
        fatalitiesChart.updateChart(getFilteredData(selectedCountry));
        accidentsChart.updateChart(getFilteredData(selectedCountry));
        investmentChart.updateChart(getFilteredData(selectedCountry));
    });

    globalDispatcher.on("highlight", year => {
        [fatalitiesChart, accidentsChart, investmentChart].forEach(chart => {
            chart.svg.selectAll(".dot").attr("opacity", d => d[chart.xKey] === year ? 1 : 0.2);
        });
    });

    globalDispatcher.on("unhighlight", () => {
        [fatalitiesChart, accidentsChart, investmentChart].forEach(chart => {
            chart.svg.selectAll(".dot").attr("opacity", 1);
        });
    });
}