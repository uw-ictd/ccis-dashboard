function fitCanvasToContents(svg) {
  const bBox = svg.node().getBBox();
  svg.attr('viewBox', `${bBox.x-1} ${bBox.y-1} ${bBox.width+2} ${bBox.height+2}`);
}

module.exports = fitCanvasToContents;