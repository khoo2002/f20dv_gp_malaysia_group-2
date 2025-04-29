import ChoroplethMapComponent from "./ChoroplethMapComponent.js";

export default class ChoroplethMapComponentWithAddViewsNTimeSlicer {
  constructor({ containerSelector, geoData, data, initialAttr, initialYear, widthMultiplier = 0.3, legendOffset = 350 }) {
    // Save configuration.
    this.containerSelector = containerSelector;
    this.geoData = geoData;
    this.data = data;
    this.initialAttr = initialAttr;
    this.initialYear = initialYear;
    this.widthMultiplier = widthMultiplier;
    this.legendOffset = legendOffset;

    // Determine available years.
    const years = Array.from(new Set(this.data.map(d => d.year))).sort((a, b) => a - b);
    this.minYear = d3.min(years);
    this.maxYear = d3.max(years);
    this.currentYear = this.initialYear || this.minYear;

    // Create the main container.
    this.container = d3.select(this.containerSelector);

    // ===== Header Section (top): Add View button at left and Title input =====
    this.headerContainer = this.container.append("div")
      .attr("id", "component-header")
      .style("display", "flex")
      .style("align-items", "center")
      .style("justify-content", "flex-start")
      .style("margin-bottom", "10px")
      .style("margin-top", "20px");

    // Add View button at the top left.
    this.headerContainer.append("button")
      .attr("id", "add-view-btn")
      .text("Add View")
      .on("click", () => this.addView());

    // Title input field (to the right of the Add View button).
    this.titleInput = this.headerContainer.append("input")
      .attr("id", "title-input")
      .attr("placeholder", "Enter title")
      .style("margin-left", "10px")
      .style("flex-grow", "1");

    // ===== Views Section (middle): container for individual views =====
    this.viewsContainer = this.container.append("div")
      .attr("id", "views-container")
      .style("display", "flex")
      .style("flex-direction", "row")
      .style("overflow-x", "auto")
      .style("flex-wrap", "nowrap")

      .style("width", "100%");

    this.views = [];

    // ===== Time Controls Section (bottom): play button, slider, year display =====
    this.timeControlsContainer = this.container.append("div")
      .attr("id", "time-controls")
      .style("display", "flex")
      .style("align-items", "center")
      .style("justify-content", "space-between")
      .style("margin-left", "3%")
      .style("margin-right", "3%")
      .style("margin-top", "10px");

    // Play button on the left.
    this.playButton = this.timeControlsContainer.append("button")
      .attr("id", "play-btn")
      .text("▶ Play")
      .on("click", () => this.play());

    // Global year slider in the center.
    this.slider = this.timeControlsContainer.append("input")
      .attr("type", "range")
      .attr("id", "globalYearSlider")
      .attr("min", this.minYear)
      .attr("max", this.maxYear)
      .attr("value", this.currentYear)
      .attr("step", 1)
      .style("flex-grow", "1")
      .style("margin", "0 10px")
      .on("input", (event) => {
        this.currentYear = +event.target.value;
        this.updateYear(this.currentYear);
      });

    // Year display at the right.
    this.yearDisplay = this.timeControlsContainer.append("span")
      .attr("id", "globalCurrentYear")
      .style("font-size", "1.5em")
      .text(this.currentYear);

    // Add initial view.
    this.addView();
  }

  // Method to broadcast hover events to all views
  broadcastHover(countryName, isHovering) {
    this.views.forEach(view => {
      view.handleExternalHover(countryName, isHovering);
    });
  }

  addView() {
    let self = this;
    const onDelete = () => {
      if (self.views.length === 1) {
        alert("Cannot delete the last view.");
        return;
      }
      view.container.remove();
      self.views = self.views.filter(v => v !== view);
      self.updateViewWidths();
    };

    // Pass a callback for hover events
    const view = new ChoroplethMapComponent({
      containerSelector: "#views-container",
      geoData: this.geoData,
      data: this.data,
      initialAttr: this.initialAttr,
      initialYear: this.currentYear,
      widthMultiplier: this.widthMultiplier,
      legendOffset: this.legendOffset,
      onDelete: onDelete,
      onHover: (countryName, isHovering) => this.broadcastHover(countryName, isHovering) // New callback
    });
    this.views.push(view);
    this.updateViewWidths();
  }

  updateViewWidths() {
    let newWidthMultiplier, newLegendOffset, widthPercent;
    if (this.views.length === 1) {
      newWidthMultiplier = 0.9;
      newLegendOffset = 1000;
      widthPercent = 100; // one view takes full width
    } else if (this.views.length === 2) {
      newWidthMultiplier = 0.4;
      newLegendOffset = 500;
      widthPercent = 50;  // two views take 50% each
    } else {
      newWidthMultiplier = 0.3;
      newLegendOffset = 350;
      widthPercent = 100 / 3; // three or more views: each 33.33%
    }
    this.views.forEach(v => {
      v.container.style("width", widthPercent + "%");
      v.updateDimensions(newWidthMultiplier, newLegendOffset);
    });
  }



  updateYear(newYear) {
    this.yearDisplay.text(newYear);
    this.views.forEach(v => v.updateYear(newYear));
  }

  play() {
    let currentYear = this.currentYear;
    const stepTime = 1000;
    const loop = () => {
      if (currentYear < this.maxYear) {
        currentYear += 1;
        this.slider.property("value", currentYear);
        this.updateYear(currentYear);
        setTimeout(loop, stepTime);
      }
    };
    loop();
  }
}