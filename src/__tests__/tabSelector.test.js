/**
 * @jest-environment jsdom
 */

// Import tabSelector.js
const tabSelector = require('../frontend-src/tabSelector');
const select = require('../frontend-src/selectors');

// Create a dummy config file for testing
const tabVisualizations = {
    'Export': {
        tabLabel: 'Export',
        includeExport: true
    },
    'tab_1': {
        tabLabel: 'tab_1',
        visualizations: [
            'visualization_1',
            'visualization_2',
        ]
    },
    'tab_2': {
        tabLabel: 'tab_2',
        visualizations: [
            'visualization_3',
            'visualization_4',
        ]
    },
};

beforeEach(() => {
    // Clean up after each test
    document.body.innerHTML = `<nav id="top-tabs">
        <button id="Export-tab" class="tabs">Export</button>
        <button id="tab_1-tab" class="tabs">tab_1</button>
        <button id="tab_2-tab" class="tabs">tab_2</button>
    </nav>
    <div id="Export">
        <div class="map-container">test</div>
        <div class="chart-container">test</div>
        <div class="legend-container">test</div>
    </div>
    <div id="tab_1">
        <div class="map-container">test</div>
        <div class="chart-container">test</div>
        <div class="legend-container">test</div>
    </div>
    <div id="tab_2">
        <div class="map-container">test</div>
        <div class="chart-container">test</div>
        <div class="legend-container">test</div>
    </div>`;
});

function checkDisplayStyle(bool, tabName) {
    expect(select.tabContent(tabName).classList.contains('hidden')).toBe(bool);
}
const expectVisible = checkDisplayStyle.bind({}, false);
const expectHidden = checkDisplayStyle.bind({}, true);

function checkTabActive(bool, tabName) {
    expect(select.tab(tabName).classList.contains('active')).toBe(bool);
}
const expectActive = checkTabActive.bind({}, true);
const expectInactive = checkTabActive.bind({}, false);

function checkExportTab() {
    // Check tabs
    expectActive('Export');
    expectInactive('tab_1');
    expectInactive('tab_2');

    // Check tab content
    expectVisible('Export');
    expectHidden('tab_1');
    expectHidden('tab_2');
}

function checkTab1() {
    // Check tabs
    expectActive('tab_1');
    expectInactive('Export');
    expectInactive('tab_2');

    // Check tab content
    expectVisible('tab_1');
    expectHidden('Export');
    expectHidden('tab_2');
}

function checkTab2() {
    // Check tabs
    expectActive('tab_2');
    expectInactive('Export');
    expectInactive('tab_1');

    // Check tab content
    expectVisible('tab_2');
    expectHidden('Export');
    expectHidden('tab_1');
}

describe('Unit tests for tabSelector', () => {
    test('Check that elements are shown/hidden properly', () => {
        tabSelector(tabVisualizations, 'Export');
        checkExportTab();

        tabSelector(tabVisualizations, 'tab_1');
        checkTab1();

        tabSelector(tabVisualizations, 'Export');
        checkExportTab();

        tabSelector(tabVisualizations, 'tab_2');
        checkTab2();

        tabSelector(tabVisualizations, 'Export');
        checkExportTab();
    });
});
