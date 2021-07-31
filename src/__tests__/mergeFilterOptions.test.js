const mergeFilterOptions = require('../util/mergeFilterOptions');
describe('mergeFilterOptions tests', () => {
    test('mergeFilterOptions has the right types', () => {
        const knownFilterValues = { 'foo': [ 'bar', 'baz' ] };
        const allFilterOptions = [ 'bar', 'baz', 'box' ];
        const res = mergeFilterOptions(knownFilterValues, allFilterOptions);
        expect(typeof res).toBe('object');
        Object.values(res).forEach(array => {
            expect(Array.isArray(array)).toBe(true);
            array.forEach(str => {
                expect(typeof str).toBe('string');
            });
        });
    });

    test('mergeFilterOptions retains the values in knownFilterValues', () => {
        const knownFilterValues = {
            'group 1': [ 'bar', 'baz' ],
            'group 2': [ 'something' ]
        };
        const allFilterOptions = [ 'bar', 'baz' ];
        const res = mergeFilterOptions(knownFilterValues, allFilterOptions);
        expect(res).toEqual(knownFilterValues);
    });

    test('mergeFilterOptions adds all missing values from allFilterOptions', () => {
        const knownFilterValues = {
            'group 1': [ 'bar', 'baz' ],
            'group 2': [ 'something' ]
        };
        const allFilterOptions = [ 'bar', 'baz', 'box' ];
        const res = mergeFilterOptions(knownFilterValues, allFilterOptions);
        expect(res).toEqual({
            'group 1': [ 'bar', 'baz' ],
            'group 2': [ 'something' ],
            'No group': [ 'box' ]
        });
    });

    test('mergeFilterOptions works with empty inputs', () => {
        const empty = mergeFilterOptions({}, []);
        expect(empty).toEqual({});

        const emptyKnownClasses = mergeFilterOptions({}, [ 'foo' ]);
        expect(emptyKnownClasses).toEqual({
            'No group': [ 'foo' ]
        });

        const knownFilterValues = { 'foo': [ 'bar' ] };
        const emptyAllOptions = mergeFilterOptions(knownFilterValues, {});
        expect(emptyAllOptions).toEqual(knownFilterValues);
    });
});
