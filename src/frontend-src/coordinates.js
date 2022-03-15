const refrigeratorClasses = require('../model/refrigeratorClasses.json');
const { colorNameToIndex, colorScheme } = require('../config/colorScheme');

const MAP_SEPARATOR = '$';
const CIRCLE_DIAMETER = '15px';

/*
 * data: We expect an array of objects, each representing a single facility and the corresponding data.
 * Each object must have facility_name, location_latitude, and location_longitude attributes, along with
 * the data to be put in the marker.
 * For example, we might have:
 *       [
 *         {facility_name: 'facility1', location_latitude: 0, location_longitude: 31, id_health_facilities: 'id1',
 *           maintenance_priority$high: 1, maintenance_priority$medium: 0, maintenance_priority$low: 1,
 *           maintenance_priority$missing_data: 0, maintenance_priority$not_applicable: 0
 *         },
 *         {facility_name: 'facility2', ...
 *         }, ...
 *       ]
 *
 * Returns an array of Objects with the following parameters:
 *     {
 *         title: String
 *         description: String
 *         iconImage: String
 *         coordinates: Array of Strings, length 2, first longitude then
 *             latitude
 *     }
 *
 * Throws an error if facilities is missing or mapType is not implemented
 */
module.exports = function makeMarkerInfo(data, visualization, colorScale) {
    /*
     * A map visualization cannot use repeatBy, so data has length 1, and
     *    data[0][0] is null (since there is no repeatlabel).
     *
     * facility is an array of length 2; the first element is facility ID
     *    and the second element is an object with a count for each of the
     *    colorlabel options, e.g.: [ "89072039", { high: 1, medium: 0, low: 2 } ]
     */
    return data.map(facility => {
        const lngLat = [
            facility.location_longitude,
            facility.location_latitude
        ];
        const title = facility.facility_name;

        let markerInfo;
        if (visualization.mapType === 'alarm_counts') {
            markerInfo = getAlarmCountInfo(facility, visualization);
        } else if (visualization.mapType === 'colored_facilities') {
            markerInfo = getFacilityColorInfo(facility, visualization, colorScale);
        } else {
            throw new Error(`mapType ${visualization.mapType} not recognized`);
        }

        // create a point to plot
        return {
            title,
            'description': markerInfo.description,
            'iconImage':   markerInfo.iconImage,
            'coordinates': lngLat,  // [lng, lat]
            'iconSize': markerInfo.iconSize // [width, height]
        };
    });
};

function getAlarmImage(alarms) {
    if (alarms > 10) {
        return 'url(./images/high-plusplus.png)';
    }
    const formattedNum = alarms.toLocaleString('en-US', {
        minimumIntegerDigits: 2
    });
    return `url(./images/high${formattedNum}.png)`;

}

function getAlarmCountInfo(facility, visualization) {
    const description = getPopupText(facility, visualization);
    const iconImage = getAlarmImage(facility['faulty_refrigerator_id']);
    const iconSize = ['32px', '32px'];
    return { description, iconImage, iconSize };
}

function getPopupTextItem(facilityData, [ propertyName, propertyType ]) {
    if (Array.isArray(propertyType)) {
        // This is actually a list of properties
        return propertyType.map(item => {
            const key = `${propertyName}${MAP_SEPARATOR}${item}`;
            return `${propertyName} ${item}: ${facilityData[key]}`;
        });
    } else if (propertyType === 'BY_FACILITY') {
        // Normal single property
        return `${propertyName}: ${facilityData[propertyName]}`;
    } else if (propertyType === 'COUNT') {
        return `Number of ${propertyName}: ${facilityData[propertyName]}`;
    } else {
        throw new Error(`propertyType ${propertyType} not recognized`);
    }
}

function getPopupText(facility, visualization) {
    return "<p class='facility-info'>" +
        Object.entries(visualization.facilityPopup)
            .flatMap(getPopupTextItem.bind({}, facility))
            .join('<br>') +
        '</p>';
}

function getFacilityColorInfo(facility, visualization, colorScale) {
    const description = getPopupText(facility, visualization);
    const opacity = (visualization.colorSpecs && visualization.colorSpecs.opacity) ?
        visualization.colorSpecs.opacity : 0.5;
    let iconImage;
    if (visualization.colorBy) {
        iconImage = coloredCircleHex(colorScale(facility[visualization.colorBy]), opacity);
    } else {
        if (!visualization.colorSpecs.singleColor) throw new Error('Map visualization with no `colorBy` is missing `colorSpecs.singleColor` attribute');
        iconImage = coloredCircle(visualization.colorSpecs.singleColor, opacity);
    }
    const iconSize = [ CIRCLE_DIAMETER, CIRCLE_DIAMETER ];
    return { description, iconImage, iconSize };
}

function coloredCircle(colorName, opacity) {
    if (!colorScheme[colorNameToIndex[colorName]]) throw new Error(`Color ${color} not recognized`);
    return coloredCircleHex(colorScheme[colorNameToIndex[colorName]], opacity);
}

function coloredCircleHex(hexCode, opacity) {
    if (!opacity) opacity = '0.5';
    const svgStr = '<svg width="30px" height="30px" xmlns="http://www.w3.org/2000/svg">' +
        `<circle style="fill:${hexCode};fill-opacity:${opacity}" cx="15" cy="15" r="15"/>` +
        '</svg>';
    const encoded = encodeURIComponent(svgStr);
    return `url('data:image/svg+xml;utf8,${encoded}')`;
}
