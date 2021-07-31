const makeColorScale = require('../frontend-src/colorScale');

// Hex codes from d3.schemeSet1
const hexCodes = {
    red:    '#e41a1c',
    blue:   '#377eb8',
    green:  '#4daf4a',
    purple: '#984ea3',
    orange: '#ff7f00',
    yellow: '#ffff33',
    brown:  '#a65628',
    pink:   '#f781bf',
    gray:   '#999999'
};


describe('colorScale tests', () => {
    test('makeColorScale returns a function', () => {
        const fullColorDomain = [ 'foo', 'bar' ];
        const colorMap = null;
        const colorScale = makeColorScale(fullColorDomain, colorMap);
        expect(typeof colorScale).toBe('function');
        expect(typeof colorScale('foo')).toBe('string');
    });

    test('colorScale is a function when colorMap is set', () => {
        const fullColorDomain = [ 'foo', 'bar' ];
        const colorMap = {
            'foo': 'red',
            'bar': 'yellow'
        };
        const colorScale = makeColorScale(fullColorDomain, colorMap);
        expect(typeof colorScale).toBe('function');
    });

    test('colorScale sets default values when colorMap is incomplete', () => {
        const fullColorDomain = [ 'foo', 'bar' ];
        const colorMap = {
            'foo': 'red'
        };
        const colorScale = makeColorScale(fullColorDomain, colorMap);
        expect(typeof colorScale('bar')).toBe('string');
        expect(colorScale('bar')).not.toBe(hexCodes.red);
    });

    test('colorScale sets distinct default values', () => {
        const fullColorDomain = [ 'foo', 'bar' ];
        const colorMap = { };
        const colorScale = makeColorScale(fullColorDomain, colorMap);
        expect(colorScale('foo')).not.toBe(colorScale('bar'));
    });

    test('colorScale agrees with everything specified in colorMap', () => {
        const fullColorDomain = [ 'foo', 'bar', ' ', 'baz' ];
        const colorMap = {
            'foo': 'red',
            'bar': 'yellow',
            ' ': 'blue',
            'baz': ' '
        }
        const colorScale = makeColorScale(fullColorDomain, colorMap);
        expect(colorScale('foo')).toBe(hexCodes.red);
        expect(colorScale('bar')).toBe(hexCodes.yellow);
        expect(colorScale(' ')).toBe(hexCodes.blue);
        expect(colorScale('baz')).not.toBe(hexCodes.red);
        expect(colorScale('baz')).not.toBe(hexCodes.yellow);
        expect(colorScale('baz')).not.toBe(hexCodes.blue);
    });
})
