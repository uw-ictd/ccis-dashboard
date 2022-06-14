const d3 = require('d3-array');
const { uniq, uniqWith, fromPairs } = require('lodash');
const visualizations = require('../config/visualizations.js');

function formatResponse(vizSpec, dataTSQL, legendDataTSQL) {
    const metadata = makeMetadata(vizSpec, dataTSQL, legendDataTSQL);
    if (vizSpec.style === 'map' || vizSpec.style === 'list' || vizSpec.style === 'heatmap') {
        return {
            data: dataTSQL,
            metadata
        };
    }
    return {
        data: formatForD3Stack(dataTSQL, metadata.fullColorDomain),
        metadata
    };
}

/*
 * Takes an array of objects and creates nested arrays, first grouping by
 * repeatlabel and then xlabel inside that
 * For the future, this could become a bit more generic instead of expecting
 * fields named 'colorlabel', 'repeatlabel', and 'xlabel'
 * See queryTools.test.js for examples
 */
function formatForD3Stack(data, fullColorDomain) {
    return d3.rollups(data, colorlabelAsKeys.bind({}, fullColorDomain),
        data => data.repeatlabel, data => data.xlabel);
}

/*
 * Takes an array of objects and makes a single object with keys
 * corresponding to the values of `colorlabel` in `rowSubset` and values
 * corresponding to the value of `count` for the unique(!) item in
 * `rowSubset` with that color label. The returned object will have a
 * value for every key listed in fullColorDomain, filling with zeros where
 * necessary.
 *
 * @param rowSubset array
 *   rowSubset must be an array of objects, where no two object share the
 *   same colorlabel.
 * @param fullColorDomain array of strings
 *
 * For example, given:
 *   fullColorDomain = ['Model 1', 'Model 2', 'Model 3', 'Model 4']
 * and rowSubset =
 *   [
 *     { xlabel: "2015", repeatlabel: "Gas", colorlabel: "Model 1", count: 10 },
 *     { xlabel: "2015", repeatlabel: "Gas", colorlabel: "Model 2", count: 13 },
 *     { xlabel: "2015", repeatlabel: "Gas", colorlabel: "Model 3", count: 30 }
 *   ]
 * The output will be the following javascript map
 *   {
 *       "Model 1": 10,
 *       "Model 2": 13,
 *       "Model 3": 30,
 *       "Model 4": 0
 *   }
 */
function colorlabelAsKeys(fullColorDomain, rowSubset) {
    // Because of our requirement that the categories are unique, we know
    // that the reduce function can assume the input is an array of length 1
    const returnObj = d3.rollup(rowSubset, ([row]) => row.count, row => row.colorlabel);
    fullColorDomain.forEach(colorlabel => {
        if (!returnObj.has(colorlabel)) returnObj.set(colorlabel, 0);
    });
    // Need to convert to a normal object for JSON serialization
    return mapToObject(returnObj);
}

/*
 * input: a Javascript Map
 * output: a Javascript Object
 */
function mapToObject(map) {
    return fromPairs(Array.from(map));
}


function makeMetadata(vizSpec, dataTSQL, legendDataTSQL) {
    let legendOptions = legendDataTSQL.map(d => d.colorlabel);
    if (vizSpec.legendOrder) {
        legendOptions = legendOptions.concat(vizSpec.legendOrder);
    }
    const result = {
        fullDomain: uniq(dataTSQL.map(d => d.xlabel)),
        fullColorDomain: uniq(legendOptions)
    };
    return result;
}

formatResponse._test = {
    formatForD3Stack,
    makeMetadata,
    colorlabelAsKeys,
    mapToObject
};

module.exports = formatResponse;
