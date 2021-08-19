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
module.exports = function(data, mapType) {

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
        if (mapType === 'maintenance_priority') {
            if (!facility[`${mapType}${MAP_SEPARATOR}low`] && !facility[`${mapType}${MAP_SEPARATOR}medium`] && !facility[`${mapType}${MAP_SEPARATOR}high`]){ return null};
            markerInfo = getMaintenancePriorityInfo(facility);
        } else if (mapType === 'facility_details') {
            markerInfo = getFacilityDetails(facility);
        } else if (mapType === 'alarm_counts'){
            markerInfo = getAlarmCountInfo(facility);
        } else {
            throw new Error(`mapType ${mapType} not recognized`);
        }

        // create a point to plot
        return {
            title,
            'description': markerInfo.description,
            'iconImage':   markerInfo.iconImage,
            'coordinates': lngLat,  // [lng, lat]
            'iconSize': markerInfo.iconSize // [width, height]
        }
    });
}

/*
 * priorities: Object mapping the strings 'maintenance_priority$high', 'maintenance_priority$medium',
 *   and 'maintenance_priority$low' to Numbers, representing the number of refrigerators with that
 *   maintenance priority
 * output: 'high'|'medium'|'low'|'none', the highest priority with positive count
 */
function getHighestMaintenancePriority(priorities) {
    if (priorities[`maintenance_priority${MAP_SEPARATOR}high`] > 0) return 'high';
    if (priorities[`maintenance_priority${MAP_SEPARATOR}medium`] > 0) return 'medium';
    if (priorities[`maintenance_priority${MAP_SEPARATOR}low`] > 0) return 'low';
}

/*
 * input: <what format should facility have?>
 * output: undefined or an Object with parameters 'description', 'iconImage', and 'iconSize'
 *   If the output is undefined, there is nothing to display for this facility
 */
function getMaintenancePriorityInfo(facility) {
    const description = `low: ${facility[`maintenance_priority${MAP_SEPARATOR}low`]}
        <br>medium: ${facility[`maintenance_priority${MAP_SEPARATOR}medium`]}
        <br>high: ${facility[`maintenance_priority${MAP_SEPARATOR}high`]}`;
    let color;
    const priority = getHighestMaintenancePriority(facility);
    if (priority === 'high') color = 'red';
    if (priority === 'medium') color = 'orange';
    if (priority === 'low') color = 'yellow';
    const iconImage = coloredCircle(color, 0.8);
    const iconSize = [ CIRCLE_DIAMETER, CIRCLE_DIAMETER ];
    return { description, iconImage, iconSize };
}

const classifictationDisplayInfo = Object.keys(refrigeratorClasses);

function getRefrigeratorCountsDisplay(facility) {
    const filteredList = classifictationDisplayInfo.filter(classification => facility[`refrigerator_class${MAP_SEPARATOR}${classification}`] > 0);
    if (!filteredList.length) {
        return 'No Refrigerators Here';
    }
    const list = filteredList.map(classification => `<li>${classification} : ${facility[`refrigerator_class${MAP_SEPARATOR}${classification}`]}</li>`).join('');
    return `<ul class =\'ref-counts\'>${list}</ul>`;
}

/*
 * input: facility information to display
 * output: object with parameters 'description', 'iconImage', and 'iconSize'
 */
function getFacilityDetails(facility) {
    const description = `<p class='facility-info'> Ownership : ${facility['ownership']}
    <br>Level : ${facility['facility_level']}<br>
    Refrigerator Counts: </p>
    ${getRefrigeratorCountsDisplay(facility)}`;
    const iconImage = coloredCircle('purple', '0.5');
    const iconSize = [ CIRCLE_DIAMETER, CIRCLE_DIAMETER ];
    return { description, iconImage, iconSize };
}

function getAlarmImage(alarms) {
    if (alarms > 10) {
        return 'url(./images/high-plusplus.png)'
    }
    const formattedNum = alarms.toLocaleString('en-US', {
        minimumIntegerDigits: 2
    });
    return `url(./images/high${formattedNum}.png)`

}

function getAlarmCountInfo(facility) {
    const description = `<p class='facility-info'>${facility['id_refrigerators']} faulty refrigerator(s)</p>`;
    const iconImage = getAlarmImage(facility['id_refrigerators']);
    const iconSize = ['32px', '32px'];
    return { description, iconImage, iconSize };
}

function coloredCircle(color, opacity) {
    if (!colorScheme[colorNameToIndex[color]]) throw new Error(`Color ${color} not recognized`);
    if (!opacity) opacity = '0.5';
    const svgStr = '<svg width="30px" height="30px" xmlns="http://www.w3.org/2000/svg">' +
        `<circle style="fill:${colorScheme[colorNameToIndex[color]]};fill-opacity:${0.5}" cx="15" cy="15" r="15"/>` +
        '</svg>';
    const encoded = encodeURIComponent(svgStr);
    return `url('data:image/svg+xml;utf8,${encoded}')`;
}
