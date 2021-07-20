const d3 = require('d3');
const tippy = require('tippy.js').default;
const { createSingleton } = require('tippy.js');
const makeColorScale = require('./colorScale');

/*
 * data: in the format d3.stack expects, which is an Array representation of a
 *     Map. I think of this as having type Array-Map<Array-Map<Object>>, where
 *     the values in the final Object are all Numbers (note: Array-Map isn't a
 *     real thing). See chartDrawer.test.js for more. For example, we might
 *     have:
 *       [
 *         [ 'Gas', [
 *             [ '2013',
 *                 { 'Model 1': 10, 'Model 2': 13, 'Model 3': 0 }
 *             ],
 *             [ '2014',
 *                 { 'Model 1': 0, 'Model 2': 20, 'Model 3': 30 }
 *             ],
 *             [ '2015',
 *                 { 'Model 1': 10, 'Model 2': 13, 'Model 3': 30 }
 *             ],
 *         ] ],
 *         [ 'Electric', [
 *             [ '2013',
 *                 { 'Model 1': 10, 'Model 2': 13, 'Model 3': 20 }
 *             ],
 *             [ '2014',
 *                 { 'Model 1': 10, 'Model 2': 13, 'Model 3': 30 }
 *             ],
 *             [ '2015',
 *                 { 'Model 1': 0, 'Model 2': 0, 'Model 3': 30 }
 *             ],
 *         ] ]
 *       ]
 * fullDomain:        Array of Strings (for the x axis)
 * fullColorDomain:   Array of Strings (for the colors)
 * groupBy:  String to show to user as axis label
 * repeatBy: undefined|String to show to user in titles of small multiple charts
 */
function drawAllCharts(data, { fullDomain, fullColorDomain }, { groupBy, repeatBy, style, colorMap }) {
    const parentElement = d3.select('#chart-container');
    if (!data) return warnNoData(parentElement);

    // Make color scale
    const colorScale = makeColorScale(fullColorDomain, colorMap);

    if (fullColorDomain) {
        // Make color legend for charts
        drawColorLegend(d3.select('#legend-container'),
        fullColorDomain.map(x => x ? x : 'undefined'),
        colorScale);
    }

    const params = {
        parentElement,
        fullDomain,
        fullColorDomain,
        colorScale,
        groupBy,
        style,
        axisWidth: repeatBy ? 200 : 600,
        axisHeight: repeatBy ? 150 : 400
    };

    if (style === 'bar') {
        const allStacks = data.map(([repeatLabel, subChartData]) => {
            // return value is a 2d array that prepares data points to be stacked
            // according to their color
            return d3.stack()
                .keys(fullColorDomain)
                .value(([, value], category) => value[category])
                (subChartData);
        });

        // Max is the highest value in any stack, the tallest bar we're going to
        // draw
        const max = d3.max(allStacks, series =>
            d3.max(series[series.length - 1], d => d[1]));
        params.fullRange = [0, max];

        data.forEach(([repeatLabel, ], index) => {
            drawBarChart(allStacks[index], {
                title: repeatBy ? `${repeatBy}: ${repeatLabel}` : '',
                ...params
            });
        });
    } else if (style === 'pie') {
        if (groupBy) throw new Error('Pie charts do not implement groupBy');
        data.forEach(([repeatLabel, subChartData]) => {
            if (subChartData.length > 1) {
                throw new Error('Pie charts do not implement groupBy');
            }
            drawPieChart(subChartData[0][1], {
                title: repeatBy ? `${repeatBy}: ${repeatLabel}` : '',
                ...params
            });
        });
    } else {
        throw new Error(`Style '${style}' not recognized`);
    }

    // Add tooltips to rects & slices
    createSingleton(tippy('#chart-container svg rect.bar'));
    createSingleton(tippy('#chart-container svg path.slice'));
}

/*
 * series: Again, this is in a strange d3 format, the output format of d3.stack,
 *     where instead of something like '13 refrigerators' we record:
 *         [ n refrigerators, n+13 refrigerators ]
 *     In the example above for drawAllCharts, the series for 'Gas' would be
 *         [
 *           [
 *             [ 0, 10, data: [Array] ],
 *             [ 0, 0, data: [Array] ],
 *             [ 0, 10, data: [Array] ],
 *             key: 'Model 1',
 *             index: 0
 *           ],
 *           [
 *             [ 10, 23, data: [Array] ],
 *             [ 0, 20, data: [Array] ],
 *             [ 10, 23, data: [Array] ],
 *             key: 'Model 2',
 *             index: 1
 *           ],
 *           [
 *             [ 23, 23, data: [Array] ],
 *             [ 20, 50, data: [Array] ],
 *             [ 23, 53, data: [Array] ],
 *             key: 'Model 3',
 *             index: 2
 *           ]
 *         ]
 * parentElement:   D3 selection
 * fullDomain:      Array
 * fullRange:       Array of Numbers, length 2
 * fullColorDomain: Array
 * colorScale:      D3 scale
 * groupBy:         String
 * axisWidth:       Number
 * axisHeight:      Number
 * title:           String
 */
function drawBarChart(series, { parentElement, axisWidth, axisHeight, title,
    fullDomain, fullRange, fullColorDomain, colorScale, groupBy }) {
    const canvas = parentElement.append('svg');
    makeTitle(canvas, axisWidth, title);

    // Scales map values in the domain to values in the range
    const xScale = d3.scaleBand()
        .domain(fullDomain)
        .range([0, axisWidth])
        .padding(0.1);

    // An axis is a visual element
    const xAxis = d3.axisBottom()
        .scale(xScale);
    canvas.append('g')
        .attr('class', 'bar-label')
        .attr('transform', `translate(0, ${axisHeight})`)
        .call(xAxis);

    canvas.selectAll('.bar-label text')
        .style('text-anchor', 'end')
        .attr('dx', '-.8em')
        .attr('dy', '-.15em')
        .attr('transform', 'rotate(-65)');

    canvas.append('text')
        .attr('transform', `translate(${axisWidth/2}, ${axisHeight + 100})`)
        .attr('dy', '4ex')
        .attr('fill', 'currentColor')
        .style('text-anchor', 'middle')
        .text(groupBy);

    // Make y-scale
    const yScale = d3.scaleLinear()
        .domain(fullRange)
        .range([axisHeight, 0]);

    // Make y-axis and add to canvas
    const yAxis = d3.axisLeft()
        .scale(yScale);
    canvas.append('g')
        .call(yAxis)
      .append('text')
        .attr('transform', `translate(0,${axisHeight/2}) rotate(-90)`)
        .attr('dy', '2ex')
        .attr('fill', 'currentColor')
        .style('text-anchor', 'middle')
        .text('Number of Refrigerators');

    // Render bars
    canvas.selectAll('.barStack')
        .data(series)
        .enter()
        .append('g')
            .attr('fill', d => colorScale(d.key))
        .selectAll('.bar')
        // Next we move down to the second level of the array
        .data(d => d)
        .enter()
        .append('rect')
            .attr('class', 'bar')
            // The format of a datum d, if groupBy = 'Year', is like:
            //   [ 0, 103, data: [ '1998', { ... } ] ]
            .attr('x', (d, i) => xScale(d.data[0]))
            .attr('width', xScale.bandwidth)
            .attr('y', (d, i) => yScale(d[1]))
            .attr('height', (d, i) => yScale(d[0]) - yScale(d[1]))
            // For tooltips
            .attr('tabindex', '0')
            .attr('data-tippy-content', (d, i) => d[1] - d[0]);
    fitCanvasToContents(canvas);
}

function drawPieChart(data, { parentElement, title, colorScale }) {
    const canvas = parentElement.append('svg');
    const RADIUS = 100;
    makeTitle(canvas, 2*RADIUS, title);
    const arcs = d3.pie()
        // each datum has the form [key, value]
        .value(d => d[1])
        (Object.entries(data))
    canvas.selectAll('g')
        .data(arcs)
        .enter()
        .append('path')
            .attr('class', 'slice')
            .attr('d', d3.arc()
                .innerRadius(0)
                .outerRadius(RADIUS)
            )
            .attr('fill', d => colorScale(d.data[0]))
            .attr('stroke', 'white')
            .style('stroke-width', '1px')
            // For tooltips
            .attr('tabindex', '0')
            // d.data has the same [key, value] format as in arcs
            .attr('data-tippy-content', (d, i) => `${d.data[0]}: ${d.data[1]}`);
    fitCanvasToContents(canvas);
}

/*
 * parentElement: A d3 selection of a single element; an <svg> will be placed
 *     inside it
 * colorDomainStrings: Array of Strings; the first one will be at the bottom
 *     of the legend
 * colorScale: function that maps elements of colorDomainStrings to d3 colors
 */
function drawColorLegend(parentElement, colorDomainStrings, colorScale) {
    const SQ_WIDTH = 15; // Width of the colored square. In pixels, of course
    const PADDING = 4;
    const FONT_SIZE = 11;
    const index = i => colorDomainStrings.length - 1 - i;
    // fullColorDomain[0] goes at the bottom because the bars are stacked from
    // the bottom up
    const canvas = parentElement.append('svg');
    const rows = canvas
        .selectAll('g')
        .data(colorDomainStrings)
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

function makeTitle(canvas, width, title) {
    if (title) {
        canvas.append('text')
            .attr('transform', `translate(${width/2}, 0)`)
            .attr('fill', 'currentColor')
            .style('text-anchor', 'middle')
            .text(title);
    }
}

function fitCanvasToContents(svg) {
    const bBox = svg.node().getBBox();
    svg.attr('viewBox', `${bBox.x-1} ${bBox.y-1} ${bBox.width+2} ${bBox.height+2}`);
}

function warnNoData(parentElement) {
    const canvas = parentElement.append('svg');
    canvas.attr('width', 300)
        .attr('height', 150)
        .append('text')
            .attr('fill', 'currentColor')
            .style('text-anchor', 'middle')
            .attr('font-size', 30)
            .text('No data match your chosen filters');
    fitCanvasToContents(canvas);
}

module.exports = drawAllCharts;
