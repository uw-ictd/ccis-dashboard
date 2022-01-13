const shapefiles = require('../config/shapefiles');
const default_fill_color = 'purple';
const default_fill_outline_color = '#555';
const default_min_opacity = 0.1;
const default_max_opacity = 0.95;
const missing_data_fill_color = 'gray';
const missing_data_opacity = 0.5;
const { getColorFromName } = require('./colorScale');

module.exports = function makeHeatmap(mapboxgl, map, data, visualization) {
    const regionLevelIndex = shapefiles.levelNames.indexOf(visualization.regionLevel);
    const drawBoundary = _drawLayer.bind({}, map, mapboxgl, data, visualization, regionLevelIndex);

    // Add GeoJSON to the map
    const boundaries = shapefiles.levels[regionLevelIndex].features;
    return Object.fromEntries(boundaries.map(drawBoundary));
};

function _drawLayer(map, mapboxgl, data, visualization, regionLevelIndex, geoJSONFeature) {
    // Get feature name (i.e. district or region name)
    const source = geoJSONFeature.properties[shapefiles.regionNameKeys[regionLevelIndex]];

    // Calculate numbers
    const allFacilities = data.filter(x => x[shapefiles.dbLevelNames[regionLevelIndex].toLowerCase()] === source);
    const total = allFacilities.length;
    const missingData = allFacilities.filter(x => x.colorlabel === 'Missing data').length;
    const denominator = total - missingData;
    const numerator = allFacilities.filter(x => x.colorlabel === 'TRUE').length;

    // Set layer specifications (defines regions/districts with only missing data first)
    let fill_opacity = missing_data_opacity;
    let fill_color = getColorFromName(missing_data_fill_color);
    let fill_outline_color = default_fill_outline_color;
    let description = `<p class='popup-info'>
        Total Number of Facilities: ${total}<br>
        Missing Data: ${missingData}</p>`;

    if (denominator !== 0) {
        const min_opacity = (visualization.fill_specs && visualization.fill_specs.min_opacity) ?
            visualization.fill_specs.min_opacity : default_min_opacity;
        const max_opacity = (visualization.fill_specs && visualization.fill_specs.max_opacity) ?
            visualization.fill_specs.max_opacity : default_max_opacity;
        const fill_color_name = (visualization.fill_specs && visualization.fill_specs.fill_color) ?
        visualization.fill_specs.fill_color : default_fill_color;
        fill_color = getColorFromName(fill_color_name);

        fill_opacity = (numerator / denominator) * (max_opacity - min_opacity) + min_opacity;
        description = `<p class='popup-info'>
            Total Number of Facilities: ${total}<br>
            ${visualization.colorBy}: ${numerator} / ${denominator} = ${Math.floor(numerator / denominator * 100)}%<br>
            Missing Data: ${missingData}</p>`;
    }

    // Add boundary to map
    map.addSource(source, {
        type: 'geojson',
        data: geoJSONFeature
    });
    map.addLayer({
        id: source,
        type: 'fill',
        source: source,
        layout: { visibility: 'visible' },
        paint: {
            'fill-color': fill_color,
            'fill-outline-color': fill_outline_color,
            'fill-opacity': fill_opacity
        }
    });
    // Show popup on click
    const html = `<h3>${source}</h3>${description}`;
    const createPopup = _createPopup.bind({}, map, mapboxgl, html);
    map.on('click', source, createPopup);

    // Add bound function object to maps so that we can remove it
    return [ source, createPopup ];

}

function _createPopup(map, mapboxgl, html, e) {
    new mapboxgl.Popup({closeButton: true, closeOnClick: true})
        .setLngLat(e.lngLat)
        .setHTML(html)
        .addTo(map);
}
