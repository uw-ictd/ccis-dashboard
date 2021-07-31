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
    <select id="facility-selector" multiple>
        <option value="#facility-selector|Test group 1" class="parent"></option>
        <option value="#facility-selector|Another test group" class="parent"></option>
        <option value="#facility-selector|foo" class="child"></option>
        <option value="#facility-selector|bar baz" class="child"></option>
        <option value="#facility-selector|" class="child"></option>
    </select>
    <select id="refrigerator-selector" multiple>
        <option value="#refrigerator-selector|Deselect me" class="parent"></option>
        <option value="#refrigerator-selector|Not this either" class="parent"></option>
        <option value="#refrigerator-selector|Good fridges" class="parent"></option>
        <option value="#refrigerator-selector|lots" class="child"></option>
        <option value="#refrigerator-selector|of" class="child"></option>
        <option value="#refrigerator-selector|fridges" class="child"></option>
        <option value="#refrigerator-selector|that" class="child"></option>
        <option value="#refrigerator-selector|we" class="child"></option>
        <option value="#refrigerator-selector|don't" class="child"></option>
        <option value="#refrigerator-selector|want" class="child"></option>
        <option value="#refrigerator-selector|nope" class="child"></option>
        <option value="#refrigerator-selector|not here" class="child"></option>
        <option value="#refrigerator-selector|just the one" class="child"></option>
    </select>
    <select id="maintenance-selector" multiple>
        <option value="high">high</option>
    </select>
    <select id="visualization-selector">
        <option value=""></option>
    </select>`;
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
        multiselects[2].deselect('#refrigerator-selector|Deselect me');
        multiselects[2].deselect('#refrigerator-selector|nope');
        multiselects[2].deselect('#refrigerator-selector|not here');
        drawVisualization(mapboxDependencyMock, regionSelectorMock);
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
