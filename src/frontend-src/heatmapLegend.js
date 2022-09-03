const d3 = require('d3');

const { getColorFromName, hexToRgb } = require('./colorScale');
const { default_fill_color, default_min_opacity, default_max_opacity } = require('./heatmapVisualization');

const tickSize = 6;
const width = 75 + tickSize;
const height = 320;
const marginTop = 20;
const marginRight = 16 + tickSize;
const marginBottom = 0;
const marginLeft = 40;
const ticks = height / 64;

// Given a parentElement and the visualisation specification for 
// a heatmap, will draw the legend for that heatmap and append
// it to the parent element.
function drawHeatmapLegend(parentElement, visualization, maxNumerator) {
    const fill_color_name = (visualization.fill_specs && visualization.fill_specs.fill_color) ?
    visualization.fill_specs.fill_color : default_fill_color;
    const fill_color_hex = getColorFromName(fill_color_name);
    const fill_color_rgb = hexToRgb(fill_color_hex);

    // this function turns a percent (from 0 to 100) into a color with 
    // opacity scaled based on percent
    const turnPercentToColor = (x) => {
        const min_opacity = (visualization.fill_specs && visualization.fill_specs.min_opacity) ?
        visualization.fill_specs.min_opacity : default_min_opacity;
        const max_opacity = (visualization.fill_specs && visualization.fill_specs.max_opacity) ?
        visualization.fill_specs.max_opacity : default_max_opacity;
        return `rgba(${fill_color_rgb.r},${fill_color_rgb.g},${fill_color_rgb.b},${x * (max_opacity - min_opacity) + min_opacity})`;
    }
    const range = visualization.heatmapType === 'quantity' ? maxNumerator: 100;

    const color = d3.scaleSequentialQuantile(d3.range(range + 1), turnPercentToColor)

    // this function draws the individual pieces of the gradient that
    // each have a different opacity
    function ramp(color, n = 256) {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = n;
      const context = canvas.getContext("2d");
      for (let i = 0; i < n; ++i) {
        context.fillStyle = color(i / (n - 1));
        context.fillRect(0, i, 1, 1);
      }
      return canvas;
    }

    const svg = parentElement.append('svg')
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .style("overflow", "visible")
        .style("display", "block");
  
    // adds gradient rectangle
    svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.interpolator()).toDataURL());

    // create percent scale for left axis
    var scale = d3.scaleLinear()
                  .domain([0, range])
                  .range([marginTop, height - marginBottom]);

    const tickAdjust = g => g.selectAll(".tick line").attr("x1", width - marginLeft - marginRight).attr('stroke', 'black');
    const n = Math.round(ticks + 1);
    const tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1))); 
                
    svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(scale)
          .ticks(ticks)
          .tickFormat(n => `${visualization.heatmapType === 'quantity' ? n.toFixed(2) : `${n}%`}`)
          .tickSize(tickSize)
          .tickValues(tickValues))
      .call(tickAdjust)
      .call(g => g.select(".domain").remove());
  
    return svg.node();
  }

module.exports = drawHeatmapLegend;