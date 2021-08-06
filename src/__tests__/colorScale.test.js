const makeColorScale = require('../frontend-src/colorScale');

// Hex codes from d3.schemeSet1
const hexCodes = {
    red:    '#e15759',
    blue:   '#4e79a7',
    lightblue: '#76b7b2',
    green:  '#59a14f',
    purple: '#af7aa1',
    orange: '#f28e2c',
    yellow: '#edc949',
    brown:  '#9c755f',
    pink:   '#ff9da7',
    gray:   '#bab0ab'
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
