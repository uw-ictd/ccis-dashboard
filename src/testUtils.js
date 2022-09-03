const path = require('path');
const fs = require('fs').promises;
const { URL_PREFIX } = require('./config/routingConstants');
require('./util/env');

const TEST_USER = process.env.ODKX_TEST_USER;
const TEST_PASSWORD = process.env.ODKX_TEST_PASSWORD;

function url(port) {
    return `http://localhost:${port}${URL_PREFIX}`;
}

const dbOptionsEmpty = {
    user: 'tester',
    password: 'UnsafeLocalTestPassword!',
    database: 'localhost',
    host: 'localhost',
    port: 5439,
    ssl: false
};

const dbOptionsSeeded = {
    user: 'dashboard',
    password: 'EnsureFirewallConfigured',
    database: 'coldchain',
    host: 'localhost',
    port: 5438,
    ssl: false
};

/*
 * Given an the name of a table, it will check to
 * make sure a file exists for the table and contains
 * more than 1 row of contents. It then deletes the file
*/
async function checkFileDownloadedWithData(driver, filePath, table) {
    await driver.wait(() => fs.stat(path.join(filePath, table + '.csv')).catch(() => {}), 30000);
    await fs.readFile(path.join(filePath, table + '.csv'), (data) => {
        // check to make sure the file has data beyond the header row
        expect(data.indexOf(`\n`,0)).toBeGreaterThan(-1);
        expect(data.indexOf(`\n`,0)).toBeLessThan(data.length);
    });
    await fs.rm(path.join(filePath, table + '.csv'));
}

async function displayViz(By, until, driver, vizName, tabLabel) {
    const dropdownElt = driver.wait(until.elementLocated(
        By.css(`#${tabLabel} .visualization-selector > option[value='${vizName}']`)
    ));
    await dropdownElt.click();
    return driver.findElement(By.css(`#${tabLabel} .display`)).click();
}

async function logIn(By, until, driver, port) {
    await driver.get(url(port));
    const username = driver.wait(until.elementLocated(By.id('username')));
    const password = driver.findElement(By.id('password'));
    const loginSubmit = driver.findElement(By.id('login-submit'));
    await username.sendKeys(TEST_USER);
    await password.sendKeys(TEST_PASSWORD);
    await loginSubmit.click();
}

function runSQL(db, fileName) {
    const filePath = path.join(__dirname, '..', 'docker-database', 'sql', fileName)
    return fs.readFile(filePath, { encoding: 'utf8' })
        .then(sql => db.query(sql));
}

function silenceErrors() {
    jest.spyOn(console, 'error').mockImplementation(() => {});
}

function mapSeries(arr, fn) {
    return arr.reduce(async (accumulator, current) => {
        const prevResults = await accumulator;
        const currResult = await fn(current);
        return prevResults + [currResult];
    }, Promise.resolve([]));
}

function mockGetBBox() {
    // JSDOM doesn't implement SVG standards, including getBBox, which is
    // used in drawAllCharts
    function getBBox() {
        return { x: 0, y: 0, height: 0, width: 0 };
    }
    window.SVGGraphicsElement.prototype.getBBox = getBBox;
    window.SVGElement.prototype.getBBox = getBBox;
}

module.exports = {
    TEST_USER,
    TEST_PASSWORD,
    checkFileDownloadedWithData,
    dbOptionsEmpty,
    dbOptionsSeeded,
    displayViz,
    logIn,
    runSQL,
    silenceErrors,
    mapSeries,
    mockGetBBox
};
