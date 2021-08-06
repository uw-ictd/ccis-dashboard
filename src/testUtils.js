const path = require('path');
const fs = require('fs').promises;
require('./util/env');

const TEST_USER = process.env.ODKX_TEST_USER;
const TEST_PASSWORD = process.env.ODKX_TEST_PASSWORD;

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

async function displayViz(By, until, driver, vizName, tabLabel) {
    const dropdownElt = driver.wait(until.elementLocated(
        By.css(`#${tabLabel} .visualization-selector > option[value='${vizName}']`)
    ));
    await dropdownElt.click();
    return driver.findElement(By.css(`#${tabLabel} .display`)).click();
}

async function logIn(By, until, driver, URL) {
    await driver.get(URL);
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

module.exports = {
    TEST_USER,
    TEST_PASSWORD,
    dbOptionsEmpty,
    dbOptionsSeeded,
    displayViz,
    logIn,
    runSQL,
    silenceErrors,
    mapSeries
};
