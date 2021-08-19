const select = require('./selectors');
const d3 = require('d3');
const fitCanvasToContents = require('./fitCanvasToContents');

function writeTextInsteadOfChart(text, tabName) {
  select.resultTextContainer(tabName).style.display = 'flex'
  const parentElement = d3.select(select.resultTextContainer(tabName));
  const canvas = parentElement.append('svg');
  canvas.attr('width', 300)
      .attr('height', 150);

  canvas.append('text')
      .attr('fill', 'currentColor')
      .style('text-anchor', 'middle')
      .attr('font-size', 30)
      .text(text);
  fitCanvasToContents(canvas);
}

module.exports = writeTextInsteadOfChart;