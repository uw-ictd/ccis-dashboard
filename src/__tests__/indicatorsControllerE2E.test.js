const { logIn, dbOptionsSeeded } = require('../testUtils');
const { Builder, By, until } = require('selenium-webdriver');
const { getServer, closeServer } = require('../server');
let driver;

const PORT = 30005;

beforeAll(async () => {
    await getServer(PORT, dbOptionsSeeded);

    driver = await new Builder()
        .forBrowser('firefox')
        .build();

    await logIn(By, until, driver, PORT);
}, 50000);

afterAll(async () => {
    await driver.quit();
    await closeServer();
}, 50000);

describe('Indicators end-to-end tests', function () {
    // After logging in, make sure that the indicators rendered
    test('Key Indicators should render with server data', async () => {
        const element = await driver.wait(until.elementLocated(By.id("key-indicators-container")));
        await driver.wait(() => {
            return element.getAttribute("innerHTML")
                .then(str => str.length >= 2); // By default it is " "
        });
        const contents = await element.getAttribute("innerHTML");

        expect(contents).toContain("Facilities: ");
        expect(contents).toContain("CCE Requiring Maintenance: ");
        expect(contents).toContain("Most Recent Update: ");
        expect(contents).toContain("CCE: ");
    }, 10000);
});
