// Importing CSS relies on the webpack css-loader
require('mapbox-gl/dist/mapbox-gl.css');
const mapboxgl = require('mapbox-gl');

mapboxgl.accessToken = process.env.MAPBOX_API_TOKEN;

function makeMap(mapOptions, container) {
    // Make the map
    const map = new mapboxgl.Map({
        ...mapOptions,
        container,
        style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
        doubleClickZoom: false, // We use double-click to change levels and zoom
        attributionControl: false
    });

    return new Promise(function (resolve, reject) {
        map.on('load', function () {
            map.resize();
            resolve(map);
            const layers_to_remove = ['road', 'bridge', 'golf', 'airport',
                'aerial','ferry','tunnel','building','aeroway', 'transit',
                'hillshade', 'pitch-outline'];
            // Make unwanted layers invisible
            // Change color of water and parks/reserves/labels
            map.getStyle().layers.map(function (layer) {
                if (layers_to_remove.some(x => layer.id.indexOf(x) >= 0)) {
                    map.setLayoutProperty(layer.id, 'visibility', 'none');
                } else if (layer.id == 'water') {
                    map.setPaintProperty(layer.id, 'fill-color', '#c1e1ec');
                } else if (layer.id == 'national-park' || layer.id == 'landuse') {
                    map.setPaintProperty(layer.id, 'fill-color', '#d3d3d3');
                } else if (layer.id == 'poi-label') {
                    map.setPaintProperty(layer.id, 'text-color', '#4c4c4c');
                }
            });
        });
    });
}

module.exports = {
    makeMap,
    mapboxgl
};
