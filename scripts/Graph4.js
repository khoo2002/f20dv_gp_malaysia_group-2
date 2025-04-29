import BidirectionalChart from "./BidirectionalChart.js";

export function loadGraph4(filteredData) {
    const container = d3.select("#BidirectionalGraph");

    // Add dropdown filter
    container.insert("div", ":first-child")
        .attr("id", "bi-filter-container")
        .style("margin-bottom", "10px")
        .html(`
            <label for="bi-metric-select"><strong>Select Comparison:</strong></label>
            <select id="bi-metric-select">
                <option value="fatal_pkm_vs_passenger">Fatalities vs. Passenger Km</option>
                <option value="investment_vs_accidents">Investment vs. Accidents</option>
            </select>
        `);

    const chart = new BidirectionalChart({
        parentElement: "#BidirectionalGraph",
        data: [],
        width: 900,
        height: 600
    });

    // Prepare all comparisons
    const prepareData = (metricType) => {
        switch (metricType) {
            case "investment_vs_accidents":
                return Array.from(
                    d3.rollup(
                        filteredData,
                        v => ({
                            investment: d3.mean(v, d => +d.croad_inv_km),
                            accidents: d3.mean(v, d => +d.accid_adj_pc_km)
                        }),
                        d => d.country
                    ),
                    ([country, values]) => ({
                        country: country,
                        fatalities: +values.accidents.toFixed(2),
                        passengerKm: +values.investment.toFixed(2)
                    })
                );
            case "fatal_pkm_vs_passenger":
            default:
                return Array.from(
                    d3.rollup(
                        filteredData,
                        v => ({
                            fatalities: d3.mean(v, d => +d.fatal_pc_km),
                            passengerKm: d3.mean(v, d => +d.p_km)
                        }),
                        d => d.country
                    ),
                    ([country, values]) => ({
                        country: country,
                        fatalities: +values.fatalities.toFixed(2),
                        passengerKm: +values.passengerKm.toFixed(2)
                    })
                );
        }
    };

    const updateChart = (metricType) => {
        const chartData = prepareData(metricType);

        if (metricType === "investment_vs_accidents") {
            chart.config.leftLabel = "Accidents per Km";
            chart.config.rightLabel = "Investment per Km (€)";
            chart.config.chartTitle = "Investment vs. Accidents (Per Km)";
        } else {
            chart.config.leftLabel = "Fatalities per Km";
            chart.config.rightLabel = "Passenger Km";
            chart.config.chartTitle = "Fatalities per Km vs. Passenger Km";
        }

        chart.update(chartData);
    };

    // Initial draw
    updateChart("fatal_pkm_vs_passenger");

    // Event listener
    d3.select("#bi-metric-select").on("change", function () {
        const selected = d3.select(this).property("value");
        updateChart(selected);
    });
}