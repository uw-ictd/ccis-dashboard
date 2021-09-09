/**
 * @jest-environment jsdom
 */
const drawLineList = require('../frontend-src/lineList');

beforeEach(() => {
    document.body.innerHTML = `<div id="someTab">
        <div class="list-wrapper"></div>
    </div>`;
});

describe('Line list visualization tests', () => {
    const columns = [ 'colA', 'colB' ];
    const rows = [
        { colA: 1, colB: 2 },
        { colA: 2, colB: 4 }
    ];

    test('lineList makes a table', () => {
        drawLineList(rows, { columns }, 'someTab', 'someViz');
        const table = document.querySelector('.list-wrapper table');
        expect(table).toBeTruthy;
        const tableRows = document.querySelectorAll('.list-wrapper table tr');
        expect(tableRows.length).toBe(rows.length + 1); // One row for the header
    });
});
