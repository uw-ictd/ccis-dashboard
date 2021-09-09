const { json2csv } = require('json-2-csv');

function download(csv, fileName) {
    const csvBlob = new Blob([csv], { type: 'text/csv' });
    // empty element a that when clicked downloads csv to computer
    const a = window.document.createElement("a");
    a.href = window.URL.createObjectURL(csvBlob);
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

module.exports = function(rowArray, fileName) {
    json2csv(rowArray, (err, csv) => {
        if (err) return console.error(err);
        download(csv, fileName);
    });
};
