const fitCanvasToContents = require('./fitCanvasToContents');

/*
 * parentElement: A d3 selection of a single element; an <svg> will be placed
 *     inside it
 * colorDomainStrings: Array of Strings; the first one will be at the bottom
 *     of the legend
 * colorScale: function that maps elements of colorDomainStrings to d3 colors
 */
function drawColorLegend(parentElement, colorDomainStrings, colorScale, {style, groupBy, colorBy, disableLegend, legendOrder}) {
   if((style === 'bar' && groupBy === colorBy) || disableLegend) {
       return;
   }

  const SQ_WIDTH = 15; // Width of the colored square. In pixels, of course
  const PADDING = 4;
  const FONT_SIZE = 11;
  const index = i => colorDomainStrings.length - 1 - i;
   const orderedOptions = legendOrder ? legendOrder.filter(s => colorDomainStrings.includes(s)): [];
   const unorderedOptions = colorDomainStrings.filter(s => !orderedOptions.includes(s));
   // legendOptions[0] goes at the bottom, so we need to reverse the ordered options 
   const legendOptions = orderedOptions.concat(unorderedOptions).reverse();

  const canvas = parentElement.append('svg');
  const rows = canvas
      .selectAll('g')
      .data(legendOptions)
      .enter()
      .append('g');
  rows.append('rect')
      .attr('y', (d, i) => (SQ_WIDTH + PADDING) * index(i))
      .attr('fill', (d, i) => colorScale(d))
      .attr('width', SQ_WIDTH)
      .attr('height', SQ_WIDTH);
  rows.append('text')
      .attr('y', (d, i) => (SQ_WIDTH + PADDING) * index(i) + SQ_WIDTH - PADDING/2)
      .attr('x', SQ_WIDTH + PADDING)
      .attr('font-size', FONT_SIZE)
      .text((d, i) => d);
  fitCanvasToContents(canvas);
}

module.exports = drawColorLegend;