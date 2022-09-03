const { logIn, dbOptionsSeeded, checkFileDownloadedWithData } = require('../testUtils');
const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const fs = require('fs/promises');
const { getServer, closeServer } = require('../server');
const path = require('path');
const exportOptions = require('../shared/exportOptions');
const filePath = path.join(__dirname, 'exportTest');
let driver;

const PORT = 30004;

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

describe('Export tests', function () {
    test('Logs in', async () => {
        await logIn(By, until, driver, PORT);
    }, 10000);

    // After logging in, wait for the main page to render, then click `export`
    test('Export button should render', async () => {
        const tab = driver.wait(until.elementLocated(By.id('Export-tab')));
        await tab.click();
        const exportButton = driver.wait(until.elementLocated(By.id('export-1')));
    }, 10000);

    // Check that a file is downloading and contains data when the corresponding
    // export button is clicked for each option in exportOptions.js
    // can only test those without input fields
    exportOptions.filter(obj => !obj.inputFields || obj.inputFields.length === 0).forEach(obj => Object.keys(obj.options).forEach(tableName => {
        if (tableName === 'all_odkx_tables') return;
        const index = exportOptions.indexOf(obj);
        test(`${tableName} downloaded with data`, async () => {
            await selectAndExportTable(tableName, index);
        }, 60000);
    }));

    // checks to make sure main ODK-X tables are downloaded when this is clicked. Other tables not seeded
    test('All raw tables downloaded with data', async () => {
        const dropdownElement = await driver.wait(until.elementLocated(By.css('[value=all_odkx_tables]')));
        dropdownElement.click();

        const exportButton = await driver.wait(until.elementLocated(By.css('[id=export-0]')));
        exportButton.click();
        await checkFileDownloadedWithData(driver, filePath, 'health_facilities2_odkx');
        await checkFileDownloadedWithData(driver, filePath, 'refrigerators_odkx');
        await checkFileDownloadedWithData(driver, filePath, 'refrigerator_types_odkx');
        await checkFileDownloadedWithData(driver, filePath, 'geographic_regions_odkx');
        await checkFileDownloadedWithData(driver, filePath, 'maintenance_logs_odkx');
        // Tests for refrigerator_moves_odkx and refrigerator_temperature_data_odkx
        // skipped because the tables are empty
        //await checkFileDownloadedWithData(driver, filePath, 'refrigerator_moves_odkx');
        //await checkFileDownloadedWithData(driver, filePath, 'refrigerator_temperature_data_odkx);
    }, 60000);
});

/*
 * Selects specified table from the dropdown, exports the file, reads file to ensure presence of
 * data, and finally deletes the exported file.
 * @param table the table to be exported. must be a key in exportOptions.js
 *
*/
async function selectAndExportTable(table, index) {
    const dropdownElement = await driver.wait(until.elementLocated(By.css('[value=' + table + ']')));
    dropdownElement.click();
    const exportButton = await driver.wait(until.elementLocated(By.css(`[id=export-${index}]`)));
    exportButton.click();
    // check if file exists in download folder
    await checkFileDownloadedWithData(driver, filePath, table);
}
