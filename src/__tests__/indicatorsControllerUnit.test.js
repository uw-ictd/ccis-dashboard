/**
 * @jest-environment jsdom
 */
const { _injectIndicators } = require('../frontend-src/indicatorsController');

beforeEach(() => {
    document.body.innerHTML = '<div id="key-indicators-container"></div>';
});

describe('Indicators unit tests', function () {
    // Make sure that the indicators rendered with expected values
    test('Key Indicators should populate with correct test data values', async () => {
        const testBody = [
            {
                "num_hf": 4,
                "last_updated_ref": "2021-01-08T18:36:08.028Z",
                "last_updated_fac": "2018-12-13T07:22:34.119Z",
                "num_ref": 25,
                "need_maintanance": 10
            }
        ];

        _injectIndicators(testBody);
        const contents = document.getElementById('key-indicators-container').innerHTML;
        expect(contents).toContain("Facilities: 4");
        expect(contents).toContain("CCE Requiring Maintenance: 10");
        expect(contents).toContain("Most Recent Update: Fri Jan 08 2021");
        expect(contents).toContain("CCE: 25");
    });
});
