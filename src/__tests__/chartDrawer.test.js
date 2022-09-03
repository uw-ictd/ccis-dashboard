/**
 * @jest-environment jsdom
 */
const drawAllCharts = require('../frontend-src/chartDrawer');
const visualizations = require('../config/visualizations');
const { mockGetBBox } = require('../testUtils');

const viz = 'CCE utilization';
const metadata = {
    fullDomain: [
        'MK 074',                'MKF 074',
        'MK 304',                'RCW 42 EG/CF',
        'VLS 200 Greenline',
    ],
    fullColorDomain: [
        'installed_in_use',
        ' ',
        'missing',
        'installed_not_in_use',
        'not_installed_removed_from_service'
    ]
};
const data = [ [ null, [
    [ 'MK 074', {
        installed_in_use: 102,
        ' ': 37,
        missing: 7,
        installed_not_in_use: 6,
        not_installed_removed_from_service: 2
    } ],
    [ 'MKF 074', {
        installed_in_use: 53,
        installed_not_in_use: 4,
        ' ': 0,
        missing: 0,
        not_installed_removed_from_service: 0
    } ],
    [ 'MK 304', {
        installed_in_use: 47,
        ' ': 13,
        installed_not_in_use: 1,
        missing: 1,
        not_installed_removed_from_service: 0
    } ],
    [ 'RCW 42 EG/CF', {
        installed_in_use: 31,
        ' ': 15,
        missing: 6,
        installed_not_in_use: 5,
        not_installed_removed_from_service: 4
    } ],
    [ 'VLS 200 Greenline', {
        installed_in_use: 14,
        ' ': 1,
        missing: 0,
        installed_not_in_use: 0,
        not_installed_removed_from_service: 0
    } ]
] ] ];

const pieSpec = visualizations['CCE by working status (pie)'];
const pieData = [ [ null, [ [ null, {
    ' ': 4,
    functioning: 400,
    not_functioning: 58
} ] ] ] ];

const pieMetadata = {
    fullDomain: [ null ],
    fullColorDomain: [ ' ', 'functioning', 'not_functioning' ]
};

beforeEach(() => {
    // Clean up after other tests
    document.body.innerHTML = `<div id="test">
    <div class="bar-numbers-container"></div>
    <div class="chart-wrapper-0">
        <div class="legend-container legend-container-0"></div>
        <div class="chart-container chart-container-0"></div>
    </div>
    </div>`;
    mockGetBBox();
});

describe('Unit tests for drawAllCharts', () => {
    test('Tests should be setup correctly', () => {
        expect(document.querySelectorAll('div').length).toBe(5);
        const container = document.querySelectorAll('#test .chart-container');
        expect(container.length).toBe(1);
    });

    test('Should produce a chart with the right number of rect\'s', () => {
        drawAllCharts(data, metadata, visualizations[viz], {tabName: 'test', multi: false, index: 0});
        const bars = document.querySelectorAll('#test .chart-container svg rect.bar');
        expect(bars.length).toBe(5*5);
    });

    test('Should produce a legend with the right number of rect\'s', () => {
        drawAllCharts(data, metadata, visualizations[viz], {tabName: 'test', multi: false, index: 0});
        const squares = document.querySelectorAll('#test .legend-container svg rect');
        expect(squares.length).toBe(metadata.fullColorDomain.length);
    });

    test('Should produce a legend even when only one color is used', () => {
        const metadata = {
            fullDomain: [
                'MK 074',
                'MKF 074'
            ],
            fullColorDomain: [
                'installed_in_use'
            ]
        };
        const data = [ [ null, [
            [ 'MK 074', {
                installed_in_use: 102,
                ' ': 0,
                missing: 0,
                installed_not_in_use: 0,
                not_installed_removed_from_service: 0
            } ],
            [ 'MKF 074', {
                installed_in_use: 53,
                installed_not_in_use: 0,
                ' ': 0,
                missing: 0,
                not_installed_removed_from_service: 0
            } ]
        ] ] ];
        drawAllCharts(data, metadata, visualizations[viz], {tabName: 'test', multi: false, index: 0});
        const squares = document.querySelectorAll('#test .legend-container svg rect');
        expect(squares.length).toBe(metadata.fullColorDomain.length);
    });

    test('Pie chart should render arcs', () => {
        drawAllCharts(pieData, pieMetadata, pieSpec, {tabName: 'test', multi: false, index: 0});
        const arcs = document.querySelectorAll('#test .chart-container svg path.slice');
        expect(arcs.length).toBe(3);
    });

    test('Bar chart should have tooltips', () => {
        drawAllCharts(data, metadata, visualizations[viz], {tabName: 'test', multi: false, index: 0});
        document.querySelectorAll('#test .chart-container svg rect.bar')
            .forEach(slice => {
                expect(slice._tippy).toBeTruthy();
            });
    });

    test('Pie chart should have tooltips', () => {
        drawAllCharts(pieData, pieMetadata, pieSpec, {tabName: 'test', multi: false, index: 0});
        document.querySelectorAll('#test .chart-container svg path.slice')
            .forEach(slice => {
                expect(slice._tippy).toBeTruthy();
            });
    });
});

afterAll(() => {
    delete window.SVGGraphicsElement.prototype.getBBox;
});
