const makeMarkerInfo = require('../frontend-src/coordinates');

const populatedData = [{
    location_latitude: '0',
    location_longitude: '0',
    facility_name: 'Facility1',
    id_health_facilities: 'id1',
    facility_maintenance_priority: 'high',
    maintenance_priority$high: 1,
    maintenance_priority$low: 0,
    maintenance_priority$medium: 0,
    maintenance_priority$missing_data: 0,
    maintenance_priority$not_applicable: 0,
},
{
    location_latitude: '0',
    location_longitude: '0',
    facility_name: 'Facility2',
    id_health_facilities: 'id2',
    facility_maintenance_priority: 'low',
    maintenance_priority$high: 0,
    maintenance_priority$low: 1,
    maintenance_priority$medium: 0,
    maintenance_priority$missing_data: 0,
    maintenance_priority$not_applicable: 0,
},
{
    location_latitude: '0',
    location_longitude: '0',
    facility_name: 'Facility3',
    id_health_facilities: 'id3',
    facility_maintenance_priority: 'medium',
    maintenance_priority$high: 0,
    maintenance_priority$low: 0,
    maintenance_priority$medium: 1,
    maintenance_priority$missing_data: 0,
    maintenance_priority$not_applicable: 0,
}
];

const vizSpec = {
    mapType: 'colored_facilities',
    facilityPopup: {
        'maintenance_priority': [ 'high', 'low', 'medium' ],
    },
    colorBy: 'facility_maintenance_priority'
};

function colorScale(maintenancePriority) {
    return {
        high: '#FF0000',
        medium: '#00FF00',
        low: '#0000FF'
    }[maintenancePriority];
}

const ANY_STRING = expect.stringContaining('');

describe('makeMarkerInfo tests', () => {
    test('makeMarkerInfo returns values of the right type', () => {
        const markers = makeMarkerInfo(populatedData, vizSpec, colorScale);
        expect(markers).toMatchObject([
            {
                title: populatedData[0].facility_name,
                description: ANY_STRING,
                iconImage: ANY_STRING,
                coordinates: [ ANY_STRING, ANY_STRING ]
            },
            {
                title: populatedData[1].facility_name,
                description: ANY_STRING,
                iconImage: ANY_STRING,
                coordinates: [ ANY_STRING, ANY_STRING ]
            },
            {
                title: populatedData[2].facility_name,
                description: ANY_STRING,
                iconImage: ANY_STRING,
                coordinates: [ ANY_STRING, ANY_STRING ]
            }
        ]);
    });

    test('makeMarkerInfo has correct icon images', () => {
        const markers = makeMarkerInfo(populatedData, vizSpec, colorScale);
        const icon1 = markers[0].iconImage;
        const icon2 = markers[1].iconImage;
        const icon3 = markers[2].iconImage;
        expect(icon1).not.toStrictEqual(icon2);
        expect(icon1).not.toStrictEqual(icon3);
        expect(icon2).not.toStrictEqual(icon3);
    });
});

