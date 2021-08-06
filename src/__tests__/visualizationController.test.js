/**
 * @jest-environment jsdom
 */
const drawVisualization = require('../frontend-src/visualizationController');

const regionSelectorMock = {
    getSelectedRegions: () => [ [ 'Uganda', 'Kampala' ] ]
};

const mapboxDependencyMock = {};

beforeEach(() => {
    global.fetch = jest.fn(() => (new Promise(() => {})));
    document.body.innerHTML = `
    <div id="Export">
        <select id="Export-facility-selector" multiple></select>
        <select id="Export-refrigerator-selector" multiple></select>
        <select id="Export-maintenance-selector" multiple></select>
    </div>
    <div id="Facilities">
        <select id="Facilities-facility-selector" multiple>
            <option value="#Facilities-facility-selector|Test group 1" class="parent"></option>
            <option value="#Facilities-facility-selector|Another test group" class="parent"></option>
            <option value="#Facilities-facility-selector|foo" class="child"></option>
            <option value="#Facilities-facility-selector|bar baz" class="child"></option>
            <option value="#Facilities-facility-selector|" class="child"></option>
        </select>
        <select id="Facilities-refrigerator-selector" multiple>
            <option value="#Facilities-refrigerator-selector|Deselect me" class="parent"></option>
            <option value="#Facilities-refrigerator-selector|Not this either" class="parent"></option>
            <option value="#Facilities-refrigerator-selector|Good fridges" class="parent"></option>
            <option value="#Facilities-refrigerator-selector|lots" class="child"></option>
            <option value="#Facilities-refrigerator-selector|of" class="child"></option>
            <option value="#Facilities-refrigerator-selector|fridges" class="child"></option>
            <option value="#Facilities-refrigerator-selector|that" class="child"></option>
            <option value="#Facilities-refrigerator-selector|we" class="child"></option>
            <option value="#Facilities-refrigerator-selector|don't" class="child"></option>
            <option value="#Facilities-refrigerator-selector|want" class="child"></option>
            <option value="#Facilities-refrigerator-selector|nope" class="child"></option>
            <option value="#Facilities-refrigerator-selector|not here" class="child"></option>
            <option value="#Facilities-refrigerator-selector|just the one" class="child"></option>
        </select>
        <select id="Facilities-maintenance-selector" multiple>
            <option value="high">high</option>
        </select>
        <select class="visualization-selector">
            <option value=""></option>
        </select>
    </div>
    <div id="CCE">
        <select id="CCE-facility-selector" multiple></select>
        <select id="CCE-refrigerator-selector" multiple></select>
        <select id="CCE-maintenance-selector" multiple></select>
    </div>
    <div id="Vaccines">
        <select id="Vaccines-facility-selector" multiple></select>
        <select id="Vaccines-refrigerator-selector" multiple></select>
        <select id="Vaccines-maintenance-selector" multiple></select>
    </div>
    <div id="System-Use">
        <select id="System-Use-facility-selector" multiple></select>
        <select id="System-Use-refrigerator-selector" multiple></select>
        <select id="System-Use-maintenance-selector" multiple></select>
    </div>
    <div id="Temp-Alarms">
        <select id="Temp-Alarms-facility-selector" multiple></select>
        <select id="Temp-Alarms-refrigerator-selector" multiple></select>
        <select id="Temp-Alarms-maintenance-selector" multiple></select>
    </div>
    <div id="Maintenance">
        <select id="Maintenance-facility-selector" multiple></select>
        <select id="Maintenance-refrigerator-selector" multiple></select>
        <select id="Maintenance-maintenance-selector" multiple></select>
    </div>`;
});

describe('Filter UI tests', () =>  {
    test('When filter is picked, query should include it', () => {
        window.facilityClasses = {
            'Test group 1': [ 'foo', 'bar baz' ],
            'Another test group': [ '' ]
        };
        window.refrigeratorClasses = {
            'Deselect me': [ 'lots', 'of', 'fridges', 'that', 'we', 'don\'t', 'want' ],
            'Not this either': [ 'nope', 'not here' ],
            'Good fridges': [ 'just the one' ]
        };
        window.maintenancePriorities = [ 'high' ];
        // Set up the dropdowns, this calls selectAll
        require('../frontend-src/filter');
        // Deselect this whole group
        multiselects[5].deselect('#Facilities-refrigerator-selector|Deselect me');
        multiselects[5].deselect('#Facilities-refrigerator-selector|nope');
        multiselects[5].deselect('#Facilities-refrigerator-selector|not here');
        drawVisualization(mapboxDependencyMock, regionSelectorMock, 'Facilities');
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
        delete window.facilityClasses;
        delete window.refrigeratorClasses;
        delete window.maintenancePriorities;
    });
});
