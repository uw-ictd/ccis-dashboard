function select(str) {
    const result = document.querySelector(str);
    if (!result) throw new Error(`No DOM element found matching ${str}`);
    return result;
}

module.exports = {
    filterStr: (tabName, key) => `#${tabName}-${key}-selector`,
    chartContainerStr: tabName => `#${tabName} .chart-container`,
    legendContainerStr: tabName => `#${tabName} .legend-container`,
    chartWrapperStr: tabName => `#${tabName} .chart-wrapper`,
    resultTextContainerStr: tabName => `#${tabName} .result-text-container`,
    tab: tabName => select(`#${tabName}-tab`), /* A button in the nav bar */
    tabContent: tabName => select(`#${tabName}`),
    mapSelector: tabName => select(`#${tabName} .map`),
    chartContainer: tabName => select(`#${tabName} .chart-container`),
    legendContainer: tabName => select(`#${tabName} .legend-container`),
    resultTextContainer: tabName => select(`#${tabName} .result-text-container`),
    mapContainer: tabName => select(`#${tabName} .map-container`),
    chartWrapper: tabName => select(`#${tabName} .chart-wrapper`),
    vizTitleElt: tabName => select(`#${tabName} .viz-title`),
    vizSelector: tabName => select(`#${tabName} .visualization-selector`),
    displayButton: tabName => select(`#${tabName} .display`),
    regionNamesContainer: tabName => select(`#${tabName} .region-list`)
};
