const { Builder, By, Key, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { getServer, closeServer }  = require('../server');
const { logIn, dbOptionsSeeded } = require('../testUtils');
let driver;

const PORT = 30002;

beforeAll(async () => {
    await getServer(PORT, dbOptionsSeeded);

    const options = new firefox.Options();

    driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();
});

afterAll(async () => {
    await driver.quit();
    await closeServer();
}, 15000);

describe('Map end-to-end tests', function () {
    test('Logs in', async () => {
        await logIn(By, until, driver, PORT);
    }, 10000);

    // After logging in, wait for the main page to render
    test('Map should render', async () => {
        const tab = driver.wait(until.elementLocated(By.id('CCE-tab')));
        await tab.click();
        const map = driver.wait(until.elementLocated(By.css('#CCE .map canvas')));
        const { height, width } = await map.getRect();
        expect(height).toBeGreaterThan(0);
        expect(width).toBeGreaterThan(0);
    });
});
