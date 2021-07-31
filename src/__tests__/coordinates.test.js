const makeMarkerInfo = require('../frontend-src/coordinates');

const zeroData = [{
    Location_latitude: '0',
    Location_longitude: '0',
    facility_name: 'A hospital',
    id_health_facilities: '1234',
    maintenance_priority$high: 0,
    maintenance_priority$low: 0,
    maintenance_priority$medium: 0,
    maintenance_priority$missing_data: 0,
    maintenance_priority$not_applicable: 0,
}];

const populatedData = [{
    Location_latitude: '0',
    Location_longitude: '0',
    facility_name: 'Facility1',
    id_health_facilities: 'id1',
    maintenance_priority$high: 1,
    maintenance_priority$low: 0,
    maintenance_priority$medium: 0,
    maintenance_priority$missing_data: 0,
    maintenance_priority$not_applicable: 0,
},
{
    Location_latitude: '0',
    Location_longitude: '0',
    facility_name: 'Facility2',
    id_health_facilities: 'id2',
    maintenance_priority$high: 0,
    maintenance_priority$low: 1,
    maintenance_priority$medium: 0,
    maintenance_priority$missing_data: 0,
    maintenance_priority$not_applicable: 0,
},
{
    Location_latitude: '0',
    Location_longitude: '0',
    facility_name: 'Facility3',
    id_health_facilities: 'id3',
    maintenance_priority$high: 0,
    maintenance_priority$low: 0,
    maintenance_priority$medium: 1,
    maintenance_priority$missing_data: 0,
    maintenance_priority$not_applicable: 0,
}
]

const ANY_STRING = expect.stringContaining('');

describe('makeMarkerInfo tests', () => {
    test('makeMarkerInfo returns values of the right type', () => {
        const markers = makeMarkerInfo(populatedData, 'maintenance_priority');
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
        const markers = makeMarkerInfo(populatedData, 'maintenance_priority');
        const icon1 = markers[0].iconImage;
        const icon2 = markers[1].iconImage;
        const icon3 = markers[2].iconImage;
        expect(icon1).not.toStrictEqual(icon2);
        expect(icon1).not.toStrictEqual(icon3);
        expect(icon2).not.toStrictEqual(icon3);
    })

    test('makeMarkerInfo returns null for facilities with no marker to display', () => {
        const markers = makeMarkerInfo(zeroData,'maintenance_priority');
        expect(markers).toMatchObject([ null ]);
    });
});

