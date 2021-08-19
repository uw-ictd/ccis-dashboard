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
        });
    });
}

module.exports = {
    makeMap,
    mapboxgl
};
