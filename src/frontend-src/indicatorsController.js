const { post } = require('./httpTools');

function getIndicators() {
     post('/api/keyIndicators', {}).then(injectIndicators);
}

function injectIndicators(body){
    const refUpdate = new Date(body[0].last_updated_ref);
    const facUpdate = new Date(body[0].last_updated_fac);
    const update = new Date(facUpdate > refUpdate ? facUpdate : refUpdate);
    const dateFormat = new Intl.DateTimeFormat('en-UG', {
        year: 'numeric',
        timeZoneName: 'short',
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });
    const mostRecentStr = dateFormat.format(update);

    // Note: these indicator titles are tested in _tests_/indicators.Controller.test.js, if you would like to update or
    // add titles, please update the test file
    const indicatorResults = {
        'Facilities': body[0].num_hf,
        'CCE': body[0].num_ref,
        'CCE Requiring Maintenance': body[0].need_maintanance,
        'Most Recent Update': mostRecentStr
    };
    const html = Object.entries(indicatorResults).map(([key, value]) =>
       `<span> ${key}: <span class="indicator-value">${value}</span> </span>`
    ).join('\n');
    document.getElementById('key-indicators-container').innerHTML = html;
}

// injectIndicators exposed for testing purposes
module.exports = {
    getIndicators,
    _injectIndicators: injectIndicators
};
