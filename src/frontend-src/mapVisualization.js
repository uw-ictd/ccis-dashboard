const eachSeries = require('async/eachSeries');
const makeMarkerInfo = require('./coordinates');
const { makeColorScale } = require('./colorScale');
const { makeHeatmap } = require('./heatmapVisualization');
const select = require('./selectors');
const d3 = require('d3');
const drawColorLegend = require('./colorLegend');
const drawHeatmapLegend = require('./heatmapLegend');
const maps = {};

function _drawMarker(mapboxgl, tabName, index, map, marker) {
    // create a DOM element for the marker
    const el = document.createElement('div');
    el.className = 'marker';
    el.style.backgroundImage = marker.iconImage;
    el.style.backgroundSize = 'contain';
    el.style.width = marker.iconSize[0];
    el.style.height = marker.iconSize[1];
    // add marker to map
    const markerObj = new mapboxgl.Marker({element: el})
        .setLngLat(marker.coordinates)
        .setPopup(new mapboxgl.Popup({
            offset: 10,
            closeButton: true,
            closeOnClick: true
        }).setHTML(`<h3> ${marker.title}
            </h3><p> ${marker.description} </p>`))
        .addTo(map);
    maps[tabName][index].markers.push(markerObj);
}

/*
 * If a map already exists for this tab, this will clear all
 * markers. Otherwise, creates a map from the makeMap function.
*/
async function setUpMap(makeMap, mapConfig, tabName, vizIndex) {
    if (!maps[tabName]) {
        maps[tabName] = {};
    }
    if (!maps[tabName][vizIndex]) {
        maps[tabName][vizIndex] = {
            map: await makeMap(mapConfig, select.mapContainer(tabName, vizIndex)),
            markers: [],
            sources: {}
        };
    } else {
        maps[tabName][vizIndex].markers.forEach(marker => marker.remove());
        Object.keys(maps[tabName][vizIndex].sources).forEach(source => {
            maps[tabName][vizIndex].map.off('click', source, maps[tabName][vizIndex].sources[source]);  // remove event listener for popup
            maps[tabName][vizIndex].map.removeLayer(source);  // Remove geoJSON layer
            maps[tabName][vizIndex].map.removeSource(source);  // Remove geoJSON source
        });
        maps[tabName][vizIndex].sources = {};
    }
    return maps[tabName][vizIndex].map;
}

/*
 * mapboxgl: [Injected dependency] The object exported by the mapbox-gl package;
 *     we pass it as a parameter instead of requiring it to support testing
 * makeMap: [Injected dependency] The function exported by map.js
 * data: array of data in map format, see coordinates.js for more info
 * mapType: String, currently only 'maintenance_priority' is supported
 */
async function mapVisualization({ mapboxgl, makeMap }, data, { fullColorDomain }, visualization, tabName, mapConfig, vizIndex) {
    const map = await setUpMap(makeMap, mapConfig, tabName, vizIndex);
    const drawMarker = _drawMarker.bind({}, mapboxgl, tabName, vizIndex, map);

    // Add markers 250 at a time
    const BATCH_SIZE = 250;
    const markerBatches = Array();
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
        markerBatches.push(data.slice(i, i + BATCH_SIZE));
    }

    const colorScale = makeColorScale(fullColorDomain, visualization.colorMap, visualization.singleColor);

    // Draw the legend if it's enabled and has colors to draw
    if (!(visualization.colorSpecs && visualization.colorSpecs.disableLegend) &&
        !visualization.singleColor) {
        drawColorLegend(d3.select(select.legendContainerStr(tabName, vizIndex)),
            fullColorDomain.map(x => x ? x : 'undefined'),
            colorScale,
            visualization
        );
    }

    // Note: we return the map object before these asynchronous operations
    // complete
    eachSeries(markerBatches, (batch, next) => {
        const markers = makeMarkerInfo(batch, visualization, colorScale);
        markers.filter(x => x !== null).forEach(drawMarker);
        setTimeout(next, 0);
    });
    return map;
}

async function heatmapVisualization({ mapboxgl, makeMap }, data, visualization, tabName, mapConfig, vizIndex) {
    const map = await setUpMap(makeMap, mapConfig, tabName, vizIndex);
    const {heatmapData, maxNumerator} = makeHeatmap(mapboxgl, map, data, visualization, vizIndex);
    maps[tabName][vizIndex].sources = heatmapData;
    drawHeatmapLegend(d3.select(select.legendContainerStr(tabName, vizIndex)), visualization, maxNumerator)
    return map;
}

function removeMap(tabName, vizIndex) {
    if (maps[tabName]) {
        delete maps[tabName][vizIndex];
    }
}

module.exports = { mapVisualization, heatmapVisualization, removeMap };
