const { Builder, By, Key, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { getServer, closeServer }  = require('../server');
const { displayViz, logIn, dbOptionsSeeded, checkFileDownloadedWithData } = require('../testUtils');
const fs = require('fs/promises');
const path = require('path');
let driver;

const PORT = 30007;
const filePath = path.join(__dirname, 'lineListTest');

beforeAll(async () => {
    await getServer(PORT, dbOptionsSeeded);

    await fs.mkdir(filePath, { recursive: true });

    const options = await new firefox.Options()
        .setPreference('browser.download.manager.showWhenStarting', false)
        .setPreference('browser.download.manager.showAlertOnComplete', false)
        .setPreference('browser.download.folderList', 2)
        .setPreference('browser.download.dir', filePath)
        .setPreference('browser.helperApps.neverAsk.saveToDisk', 'text/csv');

    driver = await new Builder()
        .forBrowser('firefox')
        .setFirefoxOptions(options)
        .build();
}, 15000);

afterAll(async () => {
    await driver.quit();
    await closeServer();

    await fs.rmdir(filePath, { recursive: true }, (err) => {
        if (err) throw err;
    });
}, 15000);

describe('Line list visualization end-to-end tests', () => {
    test('Logs in', async () => {
        await logIn(By, until, driver, PORT);
    });

    test('lineList can download as CSV', async () => {
        const vizName = 'Non-functional CCE list';
        // Render the line list
        const tab = driver.wait(until.elementLocated(By.id('Maintenance-tab')));
        await tab.click();
        await displayViz(By, until, driver, vizName, 'Maintenance');
        const button = driver.wait(until.elementLocated(By.css('#Maintenance .list-wrapper button')));
        await button.click();
        await checkFileDownloadedWithData(driver, filePath, vizName);
    }, 40000);
});
