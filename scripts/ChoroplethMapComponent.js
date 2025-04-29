export default class ChoroplethMapComponent {
  constructor({ containerSelector, geoData, data, initialAttr, initialYear, widthMultiplier = 0.3, legendOffset = 350, onDelete, onHover }) {
    this.currentAttr = initialAttr;
    this.currentYear = initialYear || d3.min(data, d => d.year);
    this.data = data;
    this.geoData = geoData;
    this.widthMultiplier = widthMultiplier;
    this.legendOffset = legendOffset;
    this.onDelete = onDelete;
    this.onHover = onHover;
    this.hoveredCountry = null; // Track the currently hovered country

    // Create container for this view.
    this.container = d3.select(containerSelector)
      .append("div")
      .attr("class", "choropleth-value")
      .style("border", "1px solid black")
      .style("padding", "10px")
      .style("margin", "5px")
      .style("position", "relative");

    // Compute dimensions.
    this.compWidth = window.innerWidth * this.widthMultiplier;
    this.compHeight = window.innerHeight * 0.7;

    // Create header inside view: attribute selection and delete button.
    const headerDiv = this.container.append("div")
      .attr("class", "header")
      .style("display", "flex")
      .style("justify-content", "space-between")
      .style("align-items", "center")
      .style("margin-bottom", "10px");

    const leftDiv = headerDiv.append("div").attr("class", "header-left");
    leftDiv.append("span").text("");
    const select = leftDiv.append("select").attr("id", "attrSelect");
    Object.keys(window.attributeDescriptions).forEach(attrCode => {
      select.append("option")
        .attr("value", attrCode)
        .text(window.attributeDescriptions[attrCode]);
    });
    select.property("value", this.currentAttr);
    select.on("change", () => {
      this.currentAttr = select.property("value");
      this.updateMap();
    });

    if (typeof this.onDelete === "function") {
      headerDiv.append("button")
        .text("Delete")
        .style("margin-left", "auto")
        .on("click", this.onDelete);
    }

    // Create SVG for the map.
    this.localSvg = this.container.append("svg")
      .attr("width", this.compWidth)
      .attr("height", this.compHeight);

    // Create instance-specific tooltip.
    this.tooltip = this.container.append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "rgba(255,255,255,0.9)")
      .style("padding", "8px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("visibility", "hidden")
      .style("z-index", "1000")
      .style("font-size", "12px");

    this.svgBoundingRect = this.localSvg.node().getBoundingClientRect();
    this.drawMap();
    this.updateMap();
  }

  drawMap() {
    this.localSvg.selectAll("path")
      .data(this.geoData.features)
      .enter().append("path")
      .attr("d", d3.geoPath().projection(
        d3.geoMercator().fitSize([this.compWidth, this.compHeight], this.geoData)
      ))
      .attr("fill", "#ccc")
      .attr("stroke", "#fff")
      .attr("stroke-width", 0.5)
      .on("mouseover", (event, d) => {
        const countryName = d.properties.NAME;
        this.hoveredCountry = countryName;
        d3.select(event.currentTarget).style("stroke-width", 2);
        this.updateTooltip(d);
        if (this.onHover) this.onHover(countryName, true);
      })
      .on("mousemove", (event) => {
        this.svgBoundingRect = this.localSvg.node().getBoundingClientRect();
        const svgX = event.clientX - this.svgBoundingRect.left;
        const svgY = event.clientY - this.svgBoundingRect.top;
        this.tooltip.style("top", (svgY + 10) + "px")
          .style("left", (svgX + 10) + "px");
      })
      .on("mouseout", (event, d) => {
        const countryName = d.properties.NAME;
        this.hoveredCountry = null;
        d3.select(event.currentTarget).style("stroke-width", 0.5);
        this.tooltip.style("visibility", "hidden");
        if (this.onHover) this.onHover(countryName, false);
      });
  }

  handleExternalHover(countryName, isHovering) {
    this.hoveredCountry = isHovering ? countryName : null;
    this.svgBoundingRect = this.localSvg.node().getBoundingClientRect();
    this.localSvg.selectAll("path")
      .filter(d => d.properties.NAME === countryName)
      .style("stroke-width", isHovering ? 2 : 0.5);

    if (isHovering) {
      const feature = this.geoData.features.find(f => f.properties.NAME === countryName);
      if (feature) {
        this.updateTooltip(feature);
        this.tooltip.style("top", (this.svgBoundingRect.height / 2 + 10) + "px")
          .style("left", (this.svgBoundingRect.width / 2 + 10) + "px");
      }
    } else {
      this.tooltip.style("visibility", "hidden");
    }
  }

  updateTooltip(d) {
    if (!d) return;
    const countryName = d.properties.NAME;
    const currentYearData = this.data.filter(d => d.year === this.currentYear);
    const previousYearData = this.data.filter(d => d.year === this.currentYear - 1);
    const currentDataMap = new Map(currentYearData.map(d => [d.country, +d[this.currentAttr]]));
    const previousDataMap = new Map(previousYearData.map(d => [d.country, +d[this.currentAttr]]));

    // Use explicit checks for undefined to handle 0 as a valid value
    let currentValue = currentDataMap.get(countryName);
    if (currentValue === undefined) {
      currentValue = currentDataMap.get(countryName.toLowerCase());
    }
    let previousValue = previousDataMap.get(countryName);
    if (previousValue === undefined) {
      previousValue = previousDataMap.get(countryName.toLowerCase());
    }
    if (previousValue === undefined) {
      previousValue = null;
    }

    let changeIndicator = '';
    if (currentValue === null || currentValue === "No data available") {
      changeIndicator = '<span style="font-size: 30px; vertical-align: middle;">∅</span>'; // Empty if current year has no data
    } else if (previousValue === null || previousValue === "No data available") {
      changeIndicator = '<span style="font-size: 30px; vertical-align: middle;">∅</span>'; // Empty if previous year has no data
    } else if (currentValue > previousValue) {
      changeIndicator = '<span style="font-size: 30px; vertical-align: middle; color: green;">↑</span>'; // Increase
    } else if (currentValue < previousValue) {
      changeIndicator = '<span style="font-size: 30px; vertical-align: middle; color: red;">↓</span>'; // Decrease
    } else {
      changeIndicator = '<span style="font-size: 30px; vertical-align: middle; color: blue;">→</span>'; // Same
    }

    const attributeName = window.attributeDescriptions[this.currentAttr] || this.currentAttr;
    let value = (currentValue !== undefined && currentValue !== null) ? currentValue : "No data available";
    if (attributeName == "Demerit Point System (0: no; 1: yes)" && value === 0.000001) {
      value = 0;
    }//fix for dps
    let content = `<strong>${countryName}</strong><br>`;
    content += `${attributeName}: ${value} ${changeIndicator}<br>`;
    this.tooltip.html(content)
      .style("visibility", "visible");
  }

  updateMap() {
    const dataYear = this.data.filter(d => d.year === this.currentYear);
    const dataMap = new Map(dataYear.map(d => [d.country, +d[this.currentAttr]]));
    const maxVal = d3.max(dataYear, d => d[this.currentAttr]) || 1;
    const colorScale = d3.scaleSequential(d3.interpolateYlOrRd)
      .domain([0, maxVal]);
    const self = this;

    this.localSvg.selectAll("path")
      .interrupt()
      .transition().duration(50)
      .attr("fill", d => {
        const value = dataMap.get(d.properties.NAME) || dataMap.get(d.properties.NAME.toLowerCase());
        return value ? colorScale(value) : "#ccc";
      })
      .each(function (d) {
        if (d3.select(this).classed("hovered-country")) {
          self.updateTooltip(d);
        }
      });

    this.localSvg.selectAll("path")
      .on("mouseover", (event, d) => {
        const countryName = d.properties.NAME;
        this.hoveredCountry = countryName;
        d3.select(event.currentTarget)
          .classed("hovered-country", true)
          .style("stroke-width", 2);
        this.updateTooltip(d);
        if (this.onHover) this.onHover(countryName, true);
      })
      .on("mousemove", (event) => {
        this.svgBoundingRect = this.localSvg.node().getBoundingClientRect();
        const svgX = event.clientX - this.svgBoundingRect.left;
        const svgY = event.clientY - this.svgBoundingRect.top;
        this.tooltip.style("top", (svgY + 10) + "px")
          .style("left", (svgX + 10) + "px");
      })
      .on("mouseout", (event, d) => {
        const countryName = d.properties.NAME;
        this.hoveredCountry = null;
        d3.select(event.currentTarget)
          .classed("hovered-country", false)
          .style("stroke-width", 0.5);
        this.tooltip.style("visibility", "hidden");
        if (this.onHover) this.onHover(countryName, false);
      });

    this.updateLegend(colorScale);
  }

  updateLegend(colorScale) {
    this.localSvg.selectAll(".legend").remove();
    const legend = this.localSvg.append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${this.compWidth - this.legendOffset}, 20)`);
    const legendScale = d3.scaleLinear()
      .domain(colorScale.domain())
      .range([100, 0]);
    legend.selectAll("rect")
      .data(d3.range(10))
      .enter().append("rect")
      .attr("x", -100)
      .attr("y", d => legendScale(d / 10 * colorScale.domain()[1]) - 50)
      .attr("width", 20)
      .attr("height", 10)
      .attr("fill", d => colorScale(d / 10 * colorScale.domain()[1]));
    legend.append("text")
      .attr("x", -75)
      .attr("y", -8)
      .text("High " + this.currentAttr);
    legend.append("text")
      .attr("x", -75)
      .attr("y", 60)
      .text("Low " + this.currentAttr);
  }


  updateHoveredTooltip() {
    const hoveredElement = this.localSvg.select(".hovered-country");
    if (!hoveredElement.empty()) {
      const countryData = hoveredElement.datum();
      this.updateTooltip(countryData);
    }
  }

  updateYear(newYear) {
    this.currentYear = newYear;
    this.updateMap();
    // Update tooltip for hovered country with new year's data
    if (this.hoveredCountry) {
      const feature = this.geoData.features.find(f => f.properties.NAME === this.hoveredCountry);
      if (feature) {
        this.updateTooltip(feature);
      }
    }
  }

  updateDimensions(newWidthMultiplier, newLegendOffset) {
    this.widthMultiplier = newWidthMultiplier;
    this.legendOffset = newLegendOffset;
    this.compWidth = window.innerWidth * this.widthMultiplier;
    this.compHeight = window.innerHeight * 0.7;
    this.localSvg.attr("width", this.compWidth).attr("height", this.compHeight);
    const projection = d3.geoMercator().fitSize([this.compWidth, this.compHeight], this.geoData);
    const pathGenerator = d3.geoPath().projection(projection);
    this.localSvg.selectAll("path")
      .attr("d", pathGenerator);
    this.updateLegend(d3.scaleSequential(d3.interpolateYlOrRd).domain([0, 1]));
    this.svgBoundingRect = this.localSvg.node().getBoundingClientRect();
    if (this.hoveredCountry) {
      const feature = this.geoData.features.find(f => f.properties.NAME === this.hoveredCountry);
      if (feature) {
        this.updateTooltip(feature);
        this.tooltip.style("top", (this.svgBoundingRect.height / 2 + 10) + "px")
          .style("left", (this.svgBoundingRect.width / 2 + 10) + "px");
      }
    }
  }

  updateAttr(newAttr) {
    this.currentAttr = newAttr;
    this.updateMap();
  }


}