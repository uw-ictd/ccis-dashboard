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
        this.setPaintProperty = () => {};
        this.addSource = () => {};
        this.addLayer = () => {};
        this.on = function(eventName, layerID, callback) {
            if (typeof layerID === 'function') {
                callback = layerID;
                layerID = undefined;
            }
            this.addListener(eventName, function(eventLayerID) {
                if (!layerID || layerID === eventLayerID) callback();
            });
        };
    }
    click(layerID) {
        this.emit('click', layerID);
    }
    dblclick(layerID) {
        this.emit('dblclick', layerID);
    }
}

function mockLayers(regionNameKeys, layerSpecs) {
    return layerSpecs.map(layerSpec => {
        return { features: layerSpec.map(jj) }
    });
}

const levelMock = [
    { features: [ { properties: { 1: 'top', 2: '', 3: '',
                                  4: '', 5: '', 6: ''  } } ] },
    { features: [ { properties: { 1: 'top', 2: 'Country', 3: '',
                                  4: '', 5: '', 6: ''  } } ] },
    { features: [ { properties: { 1: 'top', 2: 'Country', 3: 'Region',
                                  4: '', 5: '', 6: '' } },
                  { properties: { 1: 'top', 2: 'Country', 3: 'Another region',
                                  4: '', 5: '', 6: ''  } } ] },
    { features: [ { properties: { 1: 'top', 2: 'Country', 3: 'Region',
                                  4: 'City', 5: '', 6: '' } },
                  { properties: { 1: 'top', 2: 'Country', 3: 'Region',
                                  4: 'Brass City', 5: '', 6: '' } },
                  { properties: { 1: 'top', 2: 'Country', 3: 'Another region',
                                  4: 'Lil city', 5: '', 6: ''  } } ] },
    { features: [ { properties: { 1: 'top', 2: 'Country', 3: 'Region',
                                  4: 'City', 5: 'Neighborhood', 6: '' } },
                  { properties: { 1: 'top', 2: 'Country', 3: 'Region',
                                  4: 'Brass City', 5: 'Neighborhood', 6: '' } },
                  { properties: { 1: 'top', 2: 'Country', 3: 'Another region',
                                  4: 'Lil city', 5: 'Neighborhood', 6: ''  } } ] },
    { features: [ { properties: { 1: 'top', 2: 'Country', 3: 'Region',
                                  4: 'City', 5: 'Neighborhood', 6: 'Where we at' } },
                  { properties: { 1: 'top', 2: 'Country', 3: 'Region',
                                  4: 'Brass City', 5: 'Neighborhood', 6: 'My house' } },
                  { properties: { 1: 'top', 2: 'Country', 3: 'Region',
                                  4: 'Brass City', 5: 'Neighborhood', 6: 'Livin here' } },
                  { properties: { 1: 'top', 2: 'Country', 3: 'Region',
                                  4: 'Brass City', 5: 'Neighborhood', 6: 'Tiny place' } },
                  { properties: { 1: 'top', 2: 'Country', 3: 'Another region',
                                  4: 'Lil city', 5: 'Neighborhood', 6: 'Look, people'  } } ] },
];

const shapesMock = {
    levelNames: [ 'Level 1', '2', '3', '4', '5', 'Lowest level (6)' ],
    regionNameKeys: [ '1', '2', '3', '4', '5', '6' ],
    topLevel: '3',
    bottomLevel: '5',
    levels: levelMock
};

describe('Region selection tests', () => {
    test('After deselecting regions, getSelectedRegions is correct', async () => {
        const map = new MapMock();
        const regionSelector = new RegionSelector(map, shapesMock);
        // Start at level 3, deselect 'Region'
        map.click(['top', 'Country', 'Region'].join(regionSelector._SEPARATOR));
        await nextTick();
        expect(regionSelector.getSelectedRegions().sort()).toEqual([
            [ 'top', 'Country', 'Another region' ]
        ]);
    });

    test('After deselecting and selecting regions, getSelectedRegions is correct', async () => {
        const map = new MapMock();
        const regionSelector = new RegionSelector(map, shapesMock);
        map.click(['top', 'Country', 'Region'].join(regionSelector._SEPARATOR));
        map.click(['top', 'Country', 'Another region'].join(regionSelector._SEPARATOR));
        map.click(['top', 'Country', 'Another region'].join(regionSelector._SEPARATOR));
        await nextTick();
        expect(regionSelector.getSelectedRegions().sort()).toEqual([
            [ 'top', 'Country', 'Another region' ]
        ]);
    });

    test('When all the children are selected, the parent is too', () => {
        const map = new MapMock();
        const regionSelector = new RegionSelector(map, shapesMock);
        expect(regionSelector.getSelectedRegions().sort()).toEqual([
            [ 'top' ],
            [ 'top', 'Country' ],
            [ 'top', 'Country', 'Another region' ],
            [ 'top', 'Country', 'Region' ]
        ]);
    });

    test('RegionSelector can change levels and select new regions', async () => {
        const map = new MapMock();
        const regionSelector = new RegionSelector(map, shapesMock);
        map.dblclick(['top', 'Country', 'Region'].join(regionSelector._SEPARATOR));
        await nextTick();
        // Now at Level 4
        map.dblclick(['top', 'Country', 'Region', 'City'].join(regionSelector._SEPARATOR));
        await nextTick();
        // Now at Level 5
        expect(regionSelector.getSelectedRegions().sort()).toEqual([
            [ 'top', 'Country', 'Region', 'City' ],
            [ 'top', 'Country', 'Region', 'City', 'Neighborhood' ]
        ]);
        map.dblclick(['top', 'Country', 'Region', 'City', 'Neighborhood'].join(regionSelector._SEPARATOR));
        await nextTick();
        // Now we looped back around to Level 3
        map.click(['top', 'Country', 'Region'].join(regionSelector._SEPARATOR));
        await nextTick();
        expect(regionSelector.getSelectedRegions().sort()).toEqual([
            [ 'top', 'Country', 'Another region' ]
        ]);
    });
});
