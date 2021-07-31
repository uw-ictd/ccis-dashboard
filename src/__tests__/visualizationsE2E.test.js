const { Builder, By, Key, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { getServer, closeServer }  = require('../server');
const { displayViz, logIn, dbOptionsSeeded } = require('../testUtils');
let driver;

const PORT = 30003;
const URL = `http://localhost:${PORT}`;

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
        await logIn(By, until, driver, URL);
    });

    // After logging in, wait for the main page to render, then click `Display`
    test('Visualization should render', async () => {
        const displayButton = driver.wait(until.elementLocated(By.id('display')));
        await displayButton.click();
        const visualization = driver.wait(until.elementLocated(By.css('#chart-wrapper svg')));
        const vizDisplayed = await visualization.isDisplayed();
        expect(vizDisplayed).toBe(true);
    });

    test('Map visualization should render', async () => {
        await displayViz(By, until, driver, 'Maintenance priority by facility');
        const visualization = driver.wait(until.elementLocated(
            By.css('#map-container.mapboxgl-map')
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
        await displayViz(By, until, driver, 'Refrigerators/freezers by working status (pie)');
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
