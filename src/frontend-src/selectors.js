function select(str) {
    const result = document.querySelector(str);
    if (!result) throw new Error(`No DOM element found matching ${str}`);
    return result;
}

module.exports = {
    filterStr: (tabName, key) => `#${tabName}-${key}-selector`,
    chartContainerStr: (tabName, index) => `#${tabName} .chart-container-${index}`,
    legendContainerStr: (tabName, index) => `#${tabName} .legend-container-${index}`,
    chartWrapperStr: (tabName, index) => `#${tabName} .chart-wrapper-${index}`,
    vizWrapperStr: (tabName, index) => `#${tabName} .viz-wrapper-${index}`,
    resultTextContainerStr: (tabName, index) => `#${tabName} .result-text-container-${index}`,
    tab: tabName => select(`#${tabName}-tab`), /* A button in the nav bar */
    tabContent: tabName => select(`#${tabName}`),
    mapSelector: tabName => select(`#${tabName} .map`),
    chartContainer: (tabName, index) => select(`#${tabName} .chart-container-${index}`),
    legendContainer: (tabName, index) => select(`#${tabName} .legend-container-${index}`),
    resultTextContainer: (tabName, index) => select(`#${tabName} .result-text-container-${index}`),
    mapContainer: (tabName, index) => select(`#${tabName} .map-container-${index}`),
    chartWrapper: (tabName, index) => select(`#${tabName} .chart-wrapper-${index}`),
    listWrapper: (tabName, index) => select(`#${tabName} .list-wrapper-${index}`),
    vizTitleElt: (tabName, index) => select(`#${tabName} .viz-title-${index}`),
    vizSelector: tabName => select(`#${tabName} .visualization-selector`),
    displayButton: tabName => select(`#${tabName} .display`),
    lineListButton: tabName => select(`#${tabName} .line-list-download`),
    regionNamesContainer: tabName => select(`#${tabName} .region-list`)
};
