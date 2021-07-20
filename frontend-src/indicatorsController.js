const { post } = require('./httpTools');

function getIndicators() {
     post('/api/keyIndicators', {}).then(injectIndicators);
}

function injectIndicators(body){
    const refUpdate = new Date(body[0].last_updated_ref);
    const facUpdate = new Date(body[0].last_updated_fac);
    const mostRecent = facUpdate > refUpdate ? facUpdate : refUpdate;

    // Note: these indicator titles are tested in _tests_/indicators.Controller.test.js, if you would like to update or
        // add titles, please update the test file
    const indicatorResults = { 'Facilities': body[0].num_hf,
                                'CCE': body[0].num_ref,
                                'CCE Requiring Maintenance': body[0].need_maintanance,
                                'Most Recent Update': String(mostRecent).split(' ', 4).join(' ') };
    const html = Object.entries(indicatorResults).map(([ key, name ]) => "<p>" + key + ": " + name + "</p>").join(' ');
    document.getElementById('key-indicators-container').innerHTML = html;
    document.getElementById('key-indicators-container').style.display = 'block';
}

// injectIndicators exposed for testing purposes
module.exports = {getIndicators,
                  _injectIndicators: injectIndicators};
