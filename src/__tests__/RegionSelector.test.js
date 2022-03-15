/**
 * @jest-environment jsdom
 */

const EventEmitter = require('events');
const RegionSelector = require('../frontend-src/RegionSelector')

function nextTick() {
    return new Promise(resolve => {
        process.nextTick(resolve);
    });
}

class MapMock extends EventEmitter {
    constructor() {
        super();
        this.setLayoutProperty = () => {};
        this.getLayer = () => {};
        this.setPaintProperty = () => {};
        this.addSource = () => {};
        this.addLayer = () => {};
        this.addControl = () => {};
        this.on = function(eventName, layerID, callback) {
            if (typeof layerID === 'function') {
                callback = layerID;
                layerID = undefined;
            }
            this.addListener(eventName, function(eventLayerID) {
                if (!layerID || layerID === eventLayerID) callback({ lngLat: [ 32.0, 32.0 ] });
            });
        };
    }
    click(layerID) {
        this.emit('click', layerID);
    }
    dblclick(layerID) {
        this.emit('dblclick', layerID, null);
    }
}

function mockLayers(regionNameKeys, layerSpecs) {
    return layerSpecs.map(layerSpec => {
        return { features: layerSpec.map(jj) }
    });
}

const levelMock = [
    null,
    { features: [ { properties: { 2: 'Country', 3: '',
                                  4: '', 5: '', 6: ''  } } ] },
    { features: [ { properties: { 2: 'Country', 3: 'Region',
                                  4: '', 5: '', 6: '' } },
                  { properties: { 2: 'Country', 3: 'Another region',
                                  4: '', 5: '', 6: ''  } } ] },
    { features: [ { properties: { 2: 'Country', 3: 'Region',
                                  4: 'City', 5: '', 6: '' } },
                  { properties: { 2: 'Country', 3: 'Region',
                                  4: 'Brass City', 5: '', 6: '' } },
                  { properties: { 2: 'Country', 3: 'Another region',
                                  4: 'Lil city', 5: '', 6: ''  } } ] },
    { features: [ { properties: { 2: 'Country', 3: 'Region',
                                  4: 'City', 5: 'Neighborhood', 6: '' } },
                  { properties: { 2: 'Country', 3: 'Region',
                                  4: 'Brass City', 5: 'Neighborhood', 6: '' } },
                  { properties: { 2: 'Country', 3: 'Another region',
                                  4: 'Lil city', 5: 'Neighborhood', 6: ''  } } ] },
    { features: [ { properties: { 2: 'Country', 3: 'Region',
                                  4: 'City', 5: 'Neighborhood', 6: 'Where we at' } },
                  { properties: { 2: 'Country', 3: 'Region',
                                  4: 'Brass City', 5: 'Neighborhood', 6: 'My house' } },
                  { properties: { 2: 'Country', 3: 'Region',
                                  4: 'Brass City', 5: 'Neighborhood', 6: 'Livin here' } },
                  { properties: { 2: 'Country', 3: 'Region',
                                  4: 'Brass City', 5: 'Neighborhood', 6: 'Tiny place' } },
                  { properties: { 2: 'Country', 3: 'Another region',
                                  4: 'Lil city', 5: 'Neighborhood', 6: 'Look, people'  } } ] },
];

const shapesMock = {
    topLevel: 'Level 1',
    topLevelName: 'top',
    bottomLevel: '5',
    levels: [
        {
            levelName: 'Level 1',
            regionNameKey: null,
            geoJson: levelMock[0]
        },
        {
            levelName: '2',
            regionNameKey: '2',
            geoJson: levelMock[1]
        },
        {
            levelName: '3',
            regionNameKey: '3',
            geoJson: levelMock[2]
        },
        {
            levelName: '4',
            regionNameKey: '4',
            geoJson: levelMock[3]
        },
        {
            levelName: '5',
            regionNameKey: '5',
            geoJson: levelMock[4]
        },
        {
            levelName: 'Lower level (6)',
            regionNameKey: '6',
            geoJson: levelMock[5]
        }
    ]
};

const mapboxMock = {
    makeMap: function () {},
    mapboxgl: {
        AttributionControl: function() {},
    }
};

describe('Region selection tests', () => {
    // As the same document is used for multiple tests, the tests implicitly
    // test if the document is cleared everytime a new regionSelector is created.
    document.body.innerHTML ="<ul id='region-list'></ul>";
    const regionNamesContainer = document.getElementById('region-list');

    test('Test should be setup correctly', () => {
        expect(document.querySelectorAll('ul').length).toBe(1);
    });

    test('After generating map, region names are displayed', () => {
        const map = new MapMock();
        const regionSelector = new RegionSelector(mapboxMock, map, shapesMock, regionNamesContainer);
        const regions = document.querySelectorAll("li");
        expect(regions[0].innerHTML).toBe('top.');
    });


    test('After deselecting the regions, the list of displayed regions updates', async () => {
        const map = new MapMock();
        const regionSelector = new RegionSelector(mapboxMock, map, shapesMock, regionNamesContainer);
        map.click(['Country'].join(regionSelector._SEPARATOR));
        const regions = document.querySelectorAll("li");
        expect(regions[0].innerHTML).toBe("None.");
    });

    test('After selecting a region, the list of displayed regions updates', async () => {
        const map = new MapMock();
        const regionSelector = new RegionSelector(mapboxMock, map, shapesMock, regionNamesContainer);
        map.click(['Country'].join(regionSelector._SEPARATOR));
        map.click(['Country'].join(regionSelector._SEPARATOR));
        const regions = document.querySelectorAll("li");
        expect(regions[0].innerHTML).toBe('top.');
    });

    test('After changing levels, the list of displayed regions updates', async () => {
        const map = new MapMock();
        const regionSelector = new RegionSelector(mapboxMock, map, shapesMock, regionNamesContainer);
        map.dblclick(['Country'].join(regionSelector._SEPARATOR));
        const regions = document.querySelectorAll("li");
        expect(regions[0].innerHTML).toBe("Country.");
    });

    test('After deselecting regions, getSelectedRegions is correct', async () => {
        const map = new MapMock();
        const regionSelector = new RegionSelector(mapboxMock, map, shapesMock, regionNamesContainer);
        // Go to level 3
        map.dblclick(['Country'].join(regionSelector._SEPARATOR));
        map.dblclick(['Country', 'Region'].join(regionSelector._SEPARATOR));
        // Deselect Region
        map.click(['Country', 'Region', 'City'].join(regionSelector._SEPARATOR));
        // Select Another Region
        map.click(['Country', 'Another region', 'Lil city'].join(regionSelector._SEPARATOR));
        expect(regionSelector.getSelectedRegions().sort()).toEqual([
            [ 'top', 'Country', 'Another region' ]
        ]);
    });

    test('After deselecting and selecting regions, getSelectedRegions is correct', async () => {
        const map = new MapMock();
        const regionSelector = new RegionSelector(mapboxMock, map, shapesMock, regionNamesContainer);
        map.dblclick(['Country'].join(regionSelector._SEPARATOR));
        map.dblclick(['Country', 'Region'].join(regionSelector._SEPARATOR));
        map.click(['Country', 'Region', 'City'].join(regionSelector._SEPARATOR));
        map.click(['Country', 'Region', 'City'].join(regionSelector._SEPARATOR));
        expect(regionSelector.getSelectedRegions().sort()).toEqual([
            [ 'top', 'Country', 'Region' ]
        ]);
    });

    test('When levels change, the single region is selected', () => {
        const map = new MapMock();
        const regionSelector = new RegionSelector(mapboxMock, map, shapesMock, regionNamesContainer);
        map.dblclick(['Country'].join(regionSelector._SEPARATOR));
        map.dblclick(['Country', 'Region'].join(regionSelector._SEPARATOR));
        expect(regionSelector.getSelectedRegions().sort()).toEqual([
            [ 'top', 'Country', 'Region' ]
        ]);
    });

    test('RegionSelector can change levels and select new regions', async () => {
        const map = new MapMock();
        const regionSelector = new RegionSelector(mapboxMock, map, shapesMock, regionNamesContainer);
        map.dblclick(['Country'].join(regionSelector._SEPARATOR));
        map.dblclick(['Country', 'Region'].join(regionSelector._SEPARATOR));
        map.dblclick(['Country', 'Region', 'City'].join(regionSelector._SEPARATOR));
        map.dblclick(['Country', 'Region', 'City', 'Neighborhood'].join(regionSelector._SEPARATOR));
        expect(regionSelector.getSelectedRegions().sort()).toEqual([
            [ 'top', 'Country', 'Region', 'City' ],
            [ 'top', 'Country', 'Region', 'City', 'Neighborhood' ]
        ]);
        map.dblclick(['Country', 'Region', 'City', 'Neighborhood'].join(regionSelector._SEPARATOR));
        // Now we looped back around to Level 1
        expect(regionSelector.getSelectedRegions().sort()).toEqual([
            [ 'top']
        ]);
    });
});
