/**
 * @jest-environment jsdom
 */
const { drawVisualization } = require('../frontend-src/visualizationController');
const { setupFilters } = require('../frontend-src/filter');

const regionSelectorMock = {
    getSelectedRegions: () => [ [ 'Uganda', 'Kampala' ] ]
};

const mapboxDependencyMock = {};

beforeEach(() => {
    global.fetch = jest.fn(() => (new Promise(() => {})));
    window.SVGGraphicsElement.prototype.getBBox = function getBBox() {
        return { x: 0, y: 0, height: 0, width: 0 };
    };
    document.body.innerHTML = `
    <div id="Facilities">
        <select id="Facilities-facilityTypes-selector" multiple>
            <option value="#Facilities-facilityTypes-selector|Test group 1" class="parent"></option>
            <option value="#Facilities-facilityTypes-selector|Another test group" class="parent"></option>
            <option value="#Facilities-facilityTypes-selector|foo" class="child"></option>
            <option value="#Facilities-facilityTypes-selector|bar baz" class="child"></option>
            <option value="#Facilities-facilityTypes-selector|" class="child"></option>
        </select>
        <select id="Facilities-refrigeratorTypes-selector" multiple>
            <option value="#Facilities-refrigeratorTypes-selector|Deselect me" class="parent"></option>
            <option value="#Facilities-refrigeratorTypes-selector|Not this either" class="parent"></option>
            <option value="#Facilities-refrigeratorTypes-selector|Good fridges" class="parent"></option>
            <option value="#Facilities-refrigeratorTypes-selector|lots" class="child"></option>
            <option value="#Facilities-refrigeratorTypes-selector|of" class="child"></option>
            <option value="#Facilities-refrigeratorTypes-selector|fridges" class="child"></option>
            <option value="#Facilities-refrigeratorTypes-selector|that" class="child"></option>
            <option value="#Facilities-refrigeratorTypes-selector|we" class="child"></option>
            <option value="#Facilities-refrigeratorTypes-selector|don't" class="child"></option>
            <option value="#Facilities-refrigeratorTypes-selector|want" class="child"></option>
            <option value="#Facilities-refrigeratorTypes-selector|nope" class="child"></option>
            <option value="#Facilities-refrigeratorTypes-selector|not here" class="child"></option>
            <option value="#Facilities-refrigeratorTypes-selector|just the one" class="child"></option>
        </select>
        <select id="Facilities-maintenancePriorities-selector" multiple>
            <option value="high">high</option>
        </select>
        <select class="visualization-selector">
            <option value="Age by CCE model"></option>
        </select>
        <div class="bar-numbers-container"></div>
        <div class="chart-wrapper-0">
            <div class="map-container-0"></div>
            <div class="chart-container-0"></div>
            <div class="list-wrapper-0"></div>
        </div>
    </div>
    <div id="CCE">
        <select id="CCE-facilityTypes-selector" multiple></select>
        <select id="CCE-refrigeratorTypes-selector" multiple></select>
        <select id="CCE-maintenancePriorities-selector" multiple></select>
    </div>
    <div id="Vaccines">
        <select id="Vaccines-facilityTypes-selector" multiple></select>
        <select id="Vaccines-refrigeratorTypes-selector" multiple></select>
        <select id="Vaccines-maintenancePriorities-selector" multiple></select>
    </div>
    <div id="System-Use">
        <select id="System-Use-facilityTypes-selector" multiple></select>
        <select id="System-Use-refrigeratorTypes-selector" multiple></select>
        <select id="System-Use-maintenancePriorities-selector" multiple></select>
    </div>
    <div id="Temp-Alarms">
        <select id="Temp-Alarms-facilityTypes-selector" multiple></select>
        <select id="Temp-Alarms-refrigeratorTypes-selector" multiple></select>
        <select id="Temp-Alarms-maintenancePriorities-selector" multiple></select>
    </div>
    <div id="Maintenance">
        <select id="Maintenance-facilityTypes-selector" multiple></select>
        <select id="Maintenance-refrigeratorTypes-selector" multiple></select>
        <select id="Maintenance-maintenancePriorities-selector" multiple></select>
    </div>`;
});

describe('Filter UI tests', () =>  {
    test('When filter is picked, query should include it', () => {
        const filters = {
            'maintenancePriorities': {
                options: [ 'high' ],
                useInDropdowns: true
            },
            'facilityTypes': {
                grouped: true,
                classes:  {
                    'Test group 1': [ 'foo', 'bar baz' ],
                    'Another test group': [ '' ]
                },
                useInDropdowns: true
            },
            'refrigeratorTypes': {
                grouped: true,
                classes: {
                    'Deselect me': [ 'lots', 'of', 'fridges', 'that', 'we', 'don\'t', 'want' ],
                    'Not this either': [ 'nope', 'not here' ],
                    'Good fridges': [ 'just the one' ]
                },
                useInDropdowns: true
            }
        };
        const tabToFilters = {
            'Facilities': {
                enabledFilters: ['maintenancePriorities', 'facilityTypes', 'refrigeratorTypes']
            },
            'CCE': {
                enabledFilters: []
            },
            'Vaccines': {
                enabledFilters: []
            },
            'System-Use': {
                enabledFilters: []
            },
            'Temp-Alarms': {
                enabledFilters: []
            },
            'Maintenance': {
                enabledFilters: []
            }
        };
        // Set up the dropdowns, this calls selectAll
        setupFilters(filters, tabToFilters);
        // Deselect this whole group
        multiselects[2].deselect('#Facilities-refrigeratorTypes-selector|Deselect me');
        multiselects[2].deselect('#Facilities-refrigeratorTypes-selector|nope');
        multiselects[2].deselect('#Facilities-refrigeratorTypes-selector|not here');
        drawVisualization(mapboxDependencyMock, filters, regionSelectorMock, 'Facilities', tabToFilters, 0);
        expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            body: expect.any(String)
        }));
        // The one and only time fetch has been called
        const [ _, arg2 ] = fetch.mock.calls[0];
        expect(JSON.parse(arg2.body)).toMatchObject({
            filter: {
                regions: [ [ 'Uganda', 'Kampala' ] ],
                facilityTypes: [ 'foo', 'bar baz', '' ],
                refrigeratorTypes: [ 'just the one' ],
                maintenancePriorities: [ 'high' ]
            }
        });
    });
});
