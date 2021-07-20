const makeMarkerInfo = require('./coordinates');

/*
 * mapboxgl: [Injected dependency] The object exported by the mapbox-gl package;
 *     we pass it as a parameter instead of requiring it to support testing
 * makeMap: [Injected dependency] The function exported by map.js
 * data: array of data in map format, see coordinates.js for more info
 * mapType: String, currently only 'maintenance_priority' is supported
 */
module.exports = async function({ mapboxgl, makeMap }, data, { mapType }) {
    const map = await makeMap({
        center: [32, 1], // starting position [lng, lat]
        zoom: 6 // starting zoom
    }, 'map-container');

    const markers = makeMarkerInfo(data, mapType);
    markers.filter(x => x!== null).forEach(function (marker) {
        // create a DOM element for the marker
        var el = document.createElement('div');
        el.className = 'marker';
        el.style.backgroundImage = marker.iconImage;
        el.style.backgroundSize = 'contain';

        // add marker to map
        new mapboxgl.Marker(el)
            .setLngLat(marker.coordinates)
            .setPopup(new mapboxgl.Popup({
                offset: 10,
                closeButton: true,
                closeOnClick: true
            }).setHTML(`<h3 align="left"> ${marker.title}
                </h3><p align="center"> ${marker.description} </p>`))
            .addTo(map);
    });
    return map;
};
