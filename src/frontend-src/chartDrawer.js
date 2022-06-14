const d3 = require('d3');
const tippy = require('tippy.js').default;
const { createSingleton } = require('tippy.js');
const { makeColorScale } = require('./colorScale');
const select = require('./selectors');
const barNumCheckboxTemplate = require('./views/barNumsCheckbox.ejs');
const fitCanvasToContents = require('./fitCanvasToContents');
const drawColorLegend = require('./colorLegend');
const { selectAll } = require('d3');

const MIN_AXIS_HEIGHT = 50; // pixels

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
function drawAllCharts(data, { fullDomain, fullColorDomain }, { groupBy, repeatBy, type, style, sum, colorMap, colorBy, disableLegend, legendNonzeroOnly, legendOrder, disableBarNumbers}, {tabName, multi , index}) {
    const parentElement = d3.select(select.chartContainerStr(tabName, index));
    const colorDomain = !disableLegend && legendNonzeroOnly ? getNonZeroOptions(data) : fullColorDomain;
    // Make color scale
    const colorScale = makeColorScale(colorDomain, colorMap);

    const params = {
        parentElement,
        fullDomain,
        colorDomain,
        colorScale,
        groupBy,
        type,
        style,
        sum,
        disableBarNumbers,
        parentWidth: parseInt(parentElement.style('width')),
        parentHeight: parseInt(parentElement.style('height'))
    };

    if (style === 'bar' || style === 'normalized-bar') {
        const allStacks = data.map(([repeatlabel, subChartData]) => {
            // return value is a 2d array that prepares data points to be stacked
            // according to their color
            return d3.stack()
                .keys(colorDomain)
                .value(([, value], category) => value[category])
                (subChartData);
        });

        // Max is the highest value in any stack, the tallest bar we're going to
        // draw
        const max = d3.max(allStacks, series =>
            d3.max(series[series.length - 1], d => d[1]));
        params.fullRange = [0, max];

        data.forEach(([repeatlabel, ], index) => {
            drawBarChart(allStacks[index], {
                title: repeatBy ? `${repeatBy}: ${repeatlabel}` : '',
                ...params
            }, {tabName, multi});
        });
    } else if (style === 'pie') {
        if (groupBy) throw new Error('Pie charts do not implement groupBy');
        data.forEach(([repeatlabel, subChartData]) => {
            if (subChartData.length > 1) {
                throw new Error('Pie charts do not implement groupBy');
            }
            drawPieChart(subChartData[0][1], {
                title: repeatBy ? `${repeatBy}: ${repeatlabel}` : '',
                ...params
            });
        });
    } else {
        throw new Error(`Style '${style}' not recognized`);
    }

    if (colorDomain) {
        // Make color legend for charts
        drawColorLegend(d3.select(select.legendContainerStr(tabName, index)),
            colorDomain.map(x => x ? x : 'undefined'),
            colorScale,
            {style, groupBy, colorBy, disableLegend, legendOrder}
        );
    }

    // Add tooltips to rects & slices
    const rectBarStr = select.chartContainerStr(tabName, index) + ' svg rect.bar';
    const pathSliceStr = select.chartContainerStr(tabName, index) + ' svg path.slice';
    createSingleton(tippy(rectBarStr));
    createSingleton(tippy(pathSliceStr));
}

/*
* data: in the format d3 expects, as described above
* returns an array containing each of the nonzero options for
* the groupBy
*/
function getNonZeroOptions(data) {
    const nonZero = new Set(
        data.flatMap(([repeatlabel, subChartData]) => subChartData)
            .flatMap(temp => Object.keys(temp[1]).filter((option) => temp[1][option] > 0)));

    return [...nonZero];
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
 * colorDomain: Array
 * colorScale:      D3 scale
 * groupBy:         String
 * parentWidth:     Number
 * parentHeight:    Number
 * title:           String
 */
function drawBarChart(series, { parentElement, parentWidth, parentHeight, title,
    fullDomain, fullRange, colorDomain, colorScale, groupBy, type, style, sum, disableBarNumbers}, {tabName, multi} ) {
    const axisWidth = parentWidth - 60; // When the y-axis measures things with 4 digits, it takes up about 60 pixels

    /*
     * First, time to calculate some sizes for the x-axis
     */
    // Magic constants here were determined experimentally
    // Regardless of how the labels are laid out, there's about 60 pixels used
    // up. E.g., by the main x-axis label
    let barNumsOffset = 35; // vertical offset above bars
    let normalizedBarNumsOffset = 0;
    if (style === 'normalized-bar') {
        normalizedBarNumsOffset = 20; // vertical offset between odd/even bar numbers
        barNumsOffset += normalizedBarNumsOffset;
    }
    const USED_VERTICAL_SPACE = 60 + barNumsOffset;
    const longestXLabel = Math.max(...fullDomain.map(str => str.length));
    let axisHeight = parentHeight - USED_VERTICAL_SPACE - 8.5*longestXLabel;
    let angle = '-65';
    let xOffset = '-.8em';
    let yOffset = '-.15em';
    let anchor = 'end';
    let smallFont = false;
    if (series[0].length === 1) { // Number of x-axis items
        angle = '0';
        xOffset = '0em';
        yOffset = '2ex';
        anchor = 'middle';
        axisHeight = parentHeight - USED_VERTICAL_SPACE;
    } else if (series[0].length < 20) {
        angle = '-40';
        xOffset = '0em';
        yOffset = '.6em';
        axisHeight = parentHeight - USED_VERTICAL_SPACE - 6*longestXLabel;
    } else if (series[0].length > 30) {
        smallFont = true;
    }
    // Y axis should get a tiny positive value, at minimum
    axisHeight = Math.max(axisHeight, MIN_AXIS_HEIGHT);

    const canvas = parentElement.append('svg');
    makeTitle(canvas, axisWidth, title);

    // A scale maps values in the domain to values in the range
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
        .style('text-anchor', anchor)
        .attr('dx', xOffset)
        .attr('dy', yOffset)
        .attr('transform', `rotate(${angle})`);

    // If there are too many bars, make the x-axis labels small
    if (smallFont) {
        canvas.selectAll('.bar-label text')
            .classed('small', true);
    }

    const { height } = canvas.selectAll('.bar-label').node().getBBox();
    canvas.append('text')
        .attr('transform', `translate(${axisWidth/2}, ${height + axisHeight - 18})`)
        .attr('dy', '4ex')
        .attr('fill', 'currentColor')
        .style('text-anchor', 'middle')
        .text(groupBy);

    // Make y-scale
    if (style == 'normalized-bar') {
        fullRange = [0,1];
    }
    const yScale = d3.scaleLinear()
        .domain(fullRange)
        .range([axisHeight, 0]);

    let yLabel;
    if (sum) {
        yLabel = `Sum of ${sum}`;
    } else if (type === 'refrigerator') {
        yLabel = 'Number of CCE';
    } else if (type === 'facility') {
        yLabel = 'Number of Facilities';
    } else {
        throw new Error(`Visualization type ${type} not recognized`);
    }

    // Make y-axis and add to canvas
    const yAxis = d3.axisLeft()
        .scale(yScale)
        .ticks(Math.max(axisHeight/30,2)); // Limit the number of ticks based on available space
    canvas.append('g')
        .attr('class', 'y-axis')
        .call(yAxis)

    const { width } = canvas.selectAll('.y-axis').node().getBBox();
    canvas.append('text')
        .attr('transform', `translate(-${width+27},${axisHeight/2}) rotate(-90)`)
        .attr('dy', '2ex')
        .attr('fill', 'currentColor')
        .style('text-anchor', 'middle')
        .text(yLabel);

    const max = series[series.length - 1].map(d => d[1]);
    // Render bars
    canvas.selectAll('.barStack')
        .data(series)
        .enter()
        .append('g')
            .attr('fill', d => colorScale(d.key))
        .selectAll('.bar')
        // Next we move down to the second level of the array
        .data(d => {
            // Save the key (i.e. colorLabel) of the parent in each of the
            // children
            const parentInfo = { key: d.key };
            return d.map(innerData => Object.assign({}, innerData, parentInfo));
        })
        .enter()
        .append('rect')
            .attr('class', 'bar')
            // The format of a datum d, if groupBy = 'Year', is like:
            //   [ 0, 103, data: [ '1998', { ... } ] ]
            .attr('x', d => xScale(d.data[0]))
            .attr('width', xScale.bandwidth)
            .attr('y', (d, i) => getY(style, yScale, d, i, max))
            .attr('height', (d, i) => getHeight(style, yScale, d, i, max))
            // For tooltips
            .attr('tabindex', '0')
            .attr('data-tippy-content', d => `${d.key}: ${d[1]-d[0]}`)
            .style('outline', 'none');

    canvas.selectAll('.bar-numbers')
        .data(series[series.length - 1])
        .enter()
        .append('text')
            .attr('class','bar-numbers')
            .attr('x', d => xScale(d.data[0]) + xScale.bandwidth() / 2)
            .attr('y',  (d, i) => {
                let offset = 0;
                if (style === "normalized-bar" && i % 2 === 0) {
                    offset = 20;
                }
                return getY(style, yScale, d, i, max) - 15 - offset;
            })
            .attr('fill', 'black')
            .attr('text-anchor', 'middle')
            .text((d, i) => max[i]);

    if (smallFont) {
        canvas.selectAll('.bar-numbers')
            .classed('small', true);
    }

    if (!multi) {
        const checkboxContainer = select.showBarNumsContainer(tabName);
        checkboxContainer.innerHTML = barNumCheckboxTemplate({ tabName});
        const showBarNumsCheckbox = select.showBarNumsCheckbox(tabName);

        if (disableBarNumbers) {
            showBarNumsCheckbox.checked = false;
            changeBarNumDisplay("none", tabName);
        }

        showBarNumsCheckbox.addEventListener("click", function(e) {
            const displayVal = e.target.checked ? "block" : "none";
            changeBarNumDisplay(displayVal, tabName);
            fitCanvasToContents(canvas);
        });
    }

    fitCanvasToContents(canvas);
}

function changeBarNumDisplay(displayVal, tabName) {
    select.barNumbers(tabName).forEach(barNum => {
        barNum.style.display = displayVal;
    });
}

// Get height of bar depending on graph style
function getHeight(style, yScale, d, i, max) {
    if (style === 'bar') {
        return yScale(d[0]) - yScale(d[1]);
    } else if (style === 'normalized-bar') {
        return (yScale(d[0]) - yScale(d[1])) / (max[i]);
    } else {
        throw new Error("Style not supported.");
    }
}

// Get y value of bar depending on graph style
function getY(style, yScale, d, i, max) {
    if (style === 'bar') {
        return yScale(d[1]);
    } else if (style === 'normalized-bar') {
        return yScale(d[1] / max[i]);
    } else {
        throw new Error("Style not supported.");
    }
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
            .style('outline', 'none')
            // For tooltips
            .attr('tabindex', '0')
            // d.data has the same [key, value] format as in arcs
            .attr('data-tippy-content', (d, i) => `${d.data[0]}: ${d.data[1]}`);
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


module.exports = drawAllCharts;
