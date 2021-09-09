/**
 * @jest-environment jsdom
 */
const visualizations = require('../config/visualizations');
const {mapVisualization} = require('../frontend-src/mapVisualization');

const mapboxMock = {
    makeMap: function () {},
    mapboxgl: {
        Marker: MarkerMock,
        Popup: PopupMock
    }
};

function MarkerMock() {
    this.setLngLat = () => { return this; };
    this.setPopup = () => { return this; };
    this.addTo = addToSpy;
}

function PopupMock() {
    this.setHTML = () => { return this; };
}

const addToSpy = jest.fn(() => {});

beforeEach(() => {
    // Clean up after other tests
    document.body.innerHTML = `<div id="test">
        <div class="map-container"></div>
    </div>`;
});

describe('Map visualization tests', () => {
    test('Map visualization should render markers', async () => {

        const data =
        [
            {   location_latitude: "0.45408",
                location_longitude: "32.53021",
                facility_name: "Facility Name 1",
                id_health_facilities: "000",
                maintenance_priority$high: 1,
                maintenance_priority$low: 0,
                maintenance_priority$medium: 0,
                maintenance_priority$not_applicable: 1,
                maintenance_priority$missing_data: 2},
            {   location_latitude: "0.71743",
                location_longitude: "32.39919",
                facility_name: "Facility name 2",
                id_health_facilities: "6122-2002",
                maintenance_priority$high: 0,
                maintenance_priority$low: 0,
                maintenance_priority$medium: 0,
                maintenance_priority$missing_data: 3,
                maintenance_priority$not_applicable: 1},
            {   location_latitude: "0.25555",
                location_longitude: "32.62629",
                facility_name: "A Medical Centre",
                id_health_facilities: "6120-0010",
                maintenance_priority$high: 0,
                maintenance_priority$low: 2,
                maintenance_priority$medium: 1,
                maintenance_priority$missing_data: 0,
                maintenance_priority$not_applicable: 0,
                ' ': 0},
            {   location_latitude: "0.32850",
                location_longitude: "32.57553",
                facility_name: "ANOTHER MEDICAL CENTER",
                id_health_facilities: "uuid:22305235",
                maintenance_priority$high: 0,
                maintenance_priority$low: 1,
                maintenance_priority$medium: 0,
                maintenance_priority$missing_data: 0,
                maintenance_priority$not_applicable: 0},
        ];

        const metadata = {
            fullDomain: [],
            fullColorDomain: []
        };

        const mapSpec = visualizations['Maintenance priority by facility'];
        await mapVisualization(mapboxMock, data, metadata, mapSpec, 'test');
        const markers = document.querySelectorAll('.marker');
        expect(addToSpy).toHaveBeenCalledTimes(3);
    });
});
