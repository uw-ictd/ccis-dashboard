const { fromPairs } = require('lodash');
const { formatForD3Stack, makeMetadata, colorlabelAsKeys, mapToObject } = require('../controller/formatResponse')._test;

describe('formatForD3Stack tests', () => {
    test('mapToObject should convert to native javascript objects', () => {
        const a = new Map();
        const b = new Map().set('foo', 1).set('bar', 2);
        const c = new Map().set('', null).set(null, Number('f'));
        expect(mapToObject(a)).toEqual({});
        expect(mapToObject(b)).toEqual({ foo: 1, bar: 2 });
        expect(mapToObject(c)).toEqual({ '': null, null: Number('f') });
    });

    const fullColorDomain = ['Model 1', 'Model 2', 'Model 3', 'Model 4'];
    const rowSubset = [
        { xlabel: '2015', repeatlabel: 'Gas', colorlabel: 'Model 1', count: 10 },
        { xlabel: '2015', repeatlabel: 'Gas', colorlabel: 'Model 2', count: 13 },
        { xlabel: '2015', repeatlabel: 'Gas', colorlabel: 'Model 3', count: 30 }
    ];

    test('colorlabelAsKeys should aggregate data', () => {
        expect(colorlabelAsKeys(fullColorDomain, rowSubset)).toEqual( {
            'Model 1': 10,
            'Model 2': 13,
            'Model 3': 30,
            'Model 4': 0
        });
    });

    test('colorlabelAsKeys should return a JSON serializable object', () => {
        const output = colorlabelAsKeys(fullColorDomain, rowSubset);
        expect(JSON.parse(JSON.stringify(output))).toEqual(output);
    });

    // Note: this test is a little too brittle, in that it cares about the order
    // of elements in the arrays. In fact, it is okay if 'Gas' and 'Electric'
    // appear in any order. The same goes for '2013', '2014', and '2015'.
    // The second `expect` here, using _.fromPairs, is more flexible but
    // obscures the real return value of formatForD3Stack
    test('formatForD3Stack should return a multiply-nested array', () => {
        const fullColorDomain = [ 'Model 1', 'Model 2', 'Model 3' ];
        const rows = [
            { xlabel: '2013', repeatlabel: 'Gas', colorlabel: 'Model 1', count: 10 },
            { xlabel: '2013', repeatlabel: 'Gas', colorlabel: 'Model 2', count: 13 },
            { xlabel: '2014', repeatlabel: 'Gas', colorlabel: 'Model 2', count: 20 },
            { xlabel: '2014', repeatlabel: 'Gas', colorlabel: 'Model 3', count: 30 },
            { xlabel: '2015', repeatlabel: 'Gas', colorlabel: 'Model 1', count: 10 },
            { xlabel: '2015', repeatlabel: 'Gas', colorlabel: 'Model 2', count: 13 },
            { xlabel: '2015', repeatlabel: 'Gas', colorlabel: 'Model 3', count: 30 },
            { xlabel: '2013', repeatlabel: 'Electric', colorlabel: 'Model 1', count: 10 },
            { xlabel: '2013', repeatlabel: 'Electric', colorlabel: 'Model 2', count: 13 },
            { xlabel: '2013', repeatlabel: 'Electric', colorlabel: 'Model 3', count: 20 },
            { xlabel: '2014', repeatlabel: 'Electric', colorlabel: 'Model 1', count: 10 },
            { xlabel: '2014', repeatlabel: 'Electric', colorlabel: 'Model 2', count: 13 },
            { xlabel: '2014', repeatlabel: 'Electric', colorlabel: 'Model 3', count: 30 },
            { xlabel: '2015', repeatlabel: 'Electric', colorlabel: 'Model 3', count: 30 }
        ];
        expect(formatForD3Stack(rows, fullColorDomain)).toEqual([
            [ 'Gas', [
                [ '2013',
                    { 'Model 1': 10, 'Model 2': 13, 'Model 3': 0 }
                ],
                [ '2014',
                    { 'Model 1': 0, 'Model 2': 20, 'Model 3': 30 }
                ],
                [ '2015',
                    { 'Model 1': 10, 'Model 2': 13, 'Model 3': 30 }
                ],
            ] ],
            [ 'Electric', [
                [ '2013',
                    { 'Model 1': 10, 'Model 2': 13, 'Model 3': 20 }
                ],
                [ '2014',
                    { 'Model 1': 10, 'Model 2': 13, 'Model 3': 30 }
                ],
                [ '2015',
                    { 'Model 1': 0, 'Model 2': 0, 'Model 3': 30 }
                ],
            ] ]
        ]);
        expect(
            fromPairs(formatForD3Stack(rows, fullColorDomain)
                .map(([k, v]) => [k, fromPairs(v)]))
        ).toEqual({
            'Gas': {
                '2013': { 'Model 1': 10, 'Model 2': 13, 'Model 3': 0 },
                '2014': { 'Model 1': 0, 'Model 2': 20, 'Model 3': 30 },
                '2015': { 'Model 1': 10, 'Model 2': 13, 'Model 3': 30 }
            },
            'Electric': {
                '2013': { 'Model 1': 10, 'Model 2': 13, 'Model 3': 20 },
                '2014': { 'Model 1': 10, 'Model 2': 13, 'Model 3': 30 },
                '2015': { 'Model 1': 0, 'Model 2': 0, 'Model 3': 30 }
            }
        });
    });

    test('formatForD3Stack should insert zeros for missing data', () => {
        const rows = [
            { xlabel: '2013', repeatlabel: 'Gas', colorlabel: 'Model 1', count: 10 }
        ];
        expect(formatForD3Stack(rows, fullColorDomain)).toEqual([
            [ 'Gas', [
                [ '2013',
                    { 'Model 1': 10, 'Model 2': 0, 'Model 3': 0, 'Model 4': 0 }
                ]
            ] ]
        ]);
    });
});

describe('makeMetadata tests', () => {
    test('makeMetadata should make fullDomain and fullColorDomain', () => {
        const rows = [
            { xlabel: '2013', repeatlabel: 'Gas', colorlabel: 'Model 1', count: 10 },
            { xlabel: '2013', repeatlabel: 'Gas', colorlabel: 'Model 2', count: 13 },
            { xlabel: '2014', repeatlabel: 'Gas', colorlabel: 'Model 2', count: 20 },
            { xlabel: '2014', repeatlabel: 'Electric', colorlabel: 'Model 2', count: 13 },
            { xlabel: '2014', repeatlabel: 'Electric', colorlabel: 'Model 3', count: 30 },
            { xlabel: '2015', repeatlabel: 'Electric', colorlabel: 'Model 3', count: 30 }
        ];
        const legendData = [
            { colorlabel: 'Model 1' },
            { colorlabel: 'Model 2' },
            { colorlabel: 'Model 3' },
            { colorlabel: 'Model 4' }
        ];
        expect(makeMetadata({}, rows, legendData)).toEqual({
            fullDomain: [ '2013', '2014', '2015' ],
            fullColorDomain: [ 'Model 1', 'Model 2', 'Model 3', 'Model 4' ]
        });
    });
});
