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
        const spanStart = '<span class="indicator-value">'
        _injectIndicators(testBody);
        const contents = document.getElementById('key-indicators-container').innerHTML;
        expect(contents).toContain(`Facilities: ${spanStart}4`);
        expect(contents).toContain(`CCE: ${spanStart}25`);
        expect(contents).toContain(`CCE Requiring Maintenance: ${spanStart}10`);
        expect(contents).toContain(`Most Recent Update: ${spanStart}Fri, 8 Jan 2021`);
    });
});
