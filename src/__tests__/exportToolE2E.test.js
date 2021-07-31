const { logIn, dbOptionsSeeded } = require('../testUtils');
const { Builder, By, until } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const fs = require('fs/promises');
const { getServer, closeServer } = require('../server');
const path = require('path');
const exportOptions = require('../shared/exportOptions');
const filePath = path.join(__dirname, 'exportTest');
let driver;

const PORT = 30004;
const URL = 'http://localhost:' + PORT;

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
        await logIn(By, until, driver, URL);
    }, 10000);

    // After logging in, wait for the main page to render, then click `export`
    test('Export button should render', async () => {
        const exportButton = driver.wait(until.elementLocated(By.id('export')));
    }, 10000);

    // Check that a file is downloading and contains data when the corresponding
    // export button is clicked for each option in exportOptions.js
    test('Refrigerators big table downloaded with data', async () => {
        await selectAndExportTable('refrigerator_big_table');
    }, 60000);

    test('Facilities big table downloaded with data', async () => {
        await selectAndExportTable('facility_big_table');
    }, 60000);

    test('Health facilities raw table downloaded with data', async () => {
        await selectAndExportTable('health_facilities2_odkx');
    }, 60000);

    test('Refrigerator raw table downloaded with data', async () => {
        await selectAndExportTable('refrigerators_odkx');
    }, 60000);

    test('Refrigerator types raw table downloaded with data', async () => {
        await selectAndExportTable('refrigerator_types_odkx');
    }, 60000);

    test('Geographic regions raw table downloaded with data', async () => {
        await selectAndExportTable('geographic_regions_odkx');
    }, 60000);

    test('Maintenance logs raw table downloaded with data', async () => {
        await selectAndExportTable('maintenance_logs_odkx');
    }, 60000);

    // checks to make sure all 4 ODK-X tables are downloaded when this is clicked
    test('All raw tables downloaded with data', async () => {
        const dropdownElement = await driver.wait(until.elementLocated(By.css('[value=all_odkx_tables]')));
        dropdownElement.click();

        const exportButton = await driver.wait(until.elementLocated(By.css('[id=export]')));
        exportButton.click();
        await checkFileDownloadedWithData('health_facilities2_odkx');
        await checkFileDownloadedWithData('refrigerators_odkx');
        await checkFileDownloadedWithData('refrigerator_types_odkx');
        await checkFileDownloadedWithData('geographic_regions_odkx');
        await checkFileDownloadedWithData('maintenance_logs_odkx');
        // Tests for refrigerator_moves_odkx and refrigerator_temperature_data_odkx
        // skipped because the tables are empty
        //await checkFileDownloadedWithData('refrigerator_moves_odkx');
        //await checkFileDownloadedWithData('refrigerator_temperature_data_odkx);
    }, 60000);
});

/*
 * Selects specified table from the dropdown, exports the file, reads file to ensure presence of
 * data, and finally deletes the exported file.
 * @param table the table to be exported. must be a key in exportOptions.js
 *
*/
async function selectAndExportTable(table) {
    const dropdownElement = await driver.wait(until.elementLocated(By.css('[value=' + table + ']')));
    dropdownElement.click();

    const exportButton = await driver.wait(until.elementLocated(By.css('[id=export]')));
    exportButton.click();
    // check if file exists in download folder
    await checkFileDownloadedWithData(table);
}

/*
 * Given an the name of a table, it will check to
 * make sure a file exists for the table and contains
 * more than 1 row of contents. It then deletes the file
*/
async function checkFileDownloadedWithData(table) {
    await driver.wait(() => fs.stat(path.join(filePath, table + '.csv')).catch(() => {}), 30000);

    await fs.readFile(path.join(filePath, table + '.csv'), (data) => {
        // check to make sure the file has data beyond the header row
        expect(data.indexOf(`\n`,0)).toBeGreaterThan(-1);
        expect(data.indexOf(`\n`,0)).toBeLessThan(data.length);
    });
    await fs.rm(path.join(filePath, table + '.csv'));
}

