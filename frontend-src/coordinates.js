const MAP_SEPARATOR = '$';
/*
 * data: We expect an array of objects, each representing a single facility and the corresponding data.
 * Each object must have facility_name, Location_latitude, and Location_longitude attributes, along with
 * the data to be put in the marker.
 * For example, we might have:
 *       [
 *         {facility_name: 'facility1', Location_latitude: 0, Location_longitude: 31, id_health_facilities: 'id1',
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
     *    data[0][0] is null (since there is no repeatLabel).
     *
     * facility is an array of length 2; the first element is facility ID
     *    and the second element is an object with a count for each of the
     *    colorLabel options, e.g.: [ "89072039", { high: 1, medium: 0, low: 2 } ]
     */
    return data
        .map(facility => {
            const lngLat = [
                facility.Location_longitude,
                facility.Location_latitude
            ];
            const title = facility.facility_name;
            let markerInfo;

            if (mapType === 'maintenance_priority') {
                if (!facility[`${mapType}${MAP_SEPARATOR}low`] && !facility[`${mapType}${MAP_SEPARATOR}medium`] && !facility[`${mapType}${MAP_SEPARATOR}high`]){ return null};
                markerInfo = getMaintenancePriorityInfo(facility);
            } else {
                throw new Error(`mapType ${mapType} not recognized`);
            }

            // create a point to plot
            return {
                title,
                'description': markerInfo.description,
                'iconImage':   markerInfo.iconImage,
                'coordinates': lngLat  // [lng, lat]
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
 * output: undefined or an Object with parameters 'description' and 'iconImage'
 *   If the output is undefined, there is nothing to display for this facility
 */
function getMaintenancePriorityInfo(facility) {
    const description = `&#160;low : ${facility[`maintenance_priority${MAP_SEPARATOR}low`]}
        <br>&#160;medium : ${facility[`maintenance_priority${MAP_SEPARATOR}medium`]}
        &#160;&#160;<br>high : ${facility[`maintenance_priority${MAP_SEPARATOR}high`]}`;
    const iconImage = `url(./images/priority-${getHighestMaintenancePriority(facility)}.png)`;
    return { description, iconImage };
}
