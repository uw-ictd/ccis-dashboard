const { Builder, By, Key, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { getServer, closeServer }  = require('../server');
const { displayViz, logIn, dbOptionsSeeded } = require('../testUtils');
let driver;

const PORT = 30003;

jest.setTimeout(20000); // These tests are a bit slow

beforeAll(async () => {
    await getServer(PORT, dbOptionsSeeded);
    /*
     * These tests can't run in Firefox headless because of this issue upstream
     * [1] which I reproduced here [2]
     * [1] https://github.com/mapbox/mapbox-gl-js/issues/10003
     * [2] https://github.com/pgarrison/mapboxgl-bug-mwe
     */
    const options = new firefox.Options();
    driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();
});

afterAll(async () => {
    await driver.quit();
    await closeServer();
}, 20000);

describe('Visualization end-to-end tests', function () {
    test('Logs in', async () => {
        await logIn(By, until, driver, PORT);
    });

    // Need to click on other non-export tabs after main page renders.
    // Check that there is a visualization already rendered when we click on another tab.
    test('Check for visualization after clicking on non-export tab', async () => {
        const tab = driver.wait(until.elementLocated(By.id('CCE-tab')));
        await tab.click();
        const visualization = driver.wait(until.elementLocated(By.css('#CCE .chart-container svg')));
        const vizDisplayed = await visualization.isDisplayed();
        expect(vizDisplayed).toBe(true);
    });

    // Need to choose a non-default viz and make sure that it changes.
    test('Map visualization should render', async () => {
        // Check default rendered
        const tab = driver.wait(until.elementLocated(By.id('CCE-tab')));
        await tab.click();
        const defaultVisualization = driver.wait(until.elementLocated(By.css('#CCE .chart-container svg')));
        const defaultVizDisplayed = await defaultVisualization.isDisplayed();
        expect(defaultVizDisplayed).toBe(true);
        // Check non-default map should render
        await displayViz(By, until, driver, 'Maintenance priority by facility', 'CCE');
        const visualization = driver.wait(until.elementLocated(
            By.css('#CCE .map-container.mapboxgl-map')
        ));
        const vizDisplayed = await visualization.isDisplayed();
        expect(vizDisplayed).toBe(true);
    });

    // This test sometimes triggers erroneous behavior that is never observed
    // in the wild, outside of Selenium. Specifically, sometimes the mapbox
    // ".remove()" function fails to actually remove the map from the DOM,
    // instead leaving it invisible with "display: none". In this test, that
    // makes the second driver.wait call timeout because we have
    //   elts.length = 2
    // Since this has been unable to be reproduced outside of the test, this
    // test is now skipped
    test.skip('Map visualization should go away', async () => {
        await displayViz(By, until, driver, 'CCE by working status (pie)');
        const visualization = driver.wait(until.elementLocated(By.css('#chart-wrapper svg .slice')));
        const vizDisplayed = await visualization.isDisplayed();
        expect(vizDisplayed).toBe(true);
        console.log('Waiting for map to leave');
        await driver.wait(() => {
            // Removing the map from the page is an asynchronous operation
            // It's quite fast, but the test can be faster if it doesn't know to
            // wait for the map to finish being removed
            return driver.findElements(By.css('.mapboxgl-map'))
                .then(elts => elts.length <= 1);
        }, 5000);
        const maps = await driver.findElements(By.css('.mapboxgl-map'));
        expect(maps.length).toBe(1); // The only map now is the region selector
    });
});
