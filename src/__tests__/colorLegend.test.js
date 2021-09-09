/**
 * @jest-environment jsdom
 */
const drawColorLegend = require('../frontend-src/colorLegend');
const d3 = require('d3');
 
beforeEach(() => {
    window.SVGGraphicsElement.prototype.getBBox = function getBBox() {
        return { x: 0, y: 0, height: 0, width: 0 };
    };
    document.body.innerHTML = `<div class="legend"></div>`;
});
 
describe('Color legend tests', () =>  {
    test('legend does not render when disabled', () => {
        const parentElement = d3.select('.legend');
        drawColorLegend(parentElement, ['test1','test2','test3'], (d) => 'blue', {style: 'pie', groupBy:'model_id', colorBy: 'model_id', disableLegend: true}, []);
        const legend = document.querySelector('.legend svg');
        expect(legend).toBeFalsy();
    });

    test('legend renders in proper order when all options included', () => {
        const parentElement = d3.select('.legend');
        drawColorLegend(parentElement, ['test1','test2','test3'], (d) => 'blue', {style: 'pie', groupBy:'model_id', colorBy: 'model_id', legendOrder: ['test1', 'test3', 'test2']}, []);
        const legend = document.querySelector('.legend svg');
        expect(legend).toBeTruthy();
        // note: these are in the opposite order as displayed on screen
        expect(legend.children.item(0).__data__).toBe('test2');
        expect(legend.children.item(1).__data__).toBe('test3');
        expect(legend.children.item(2).__data__).toBe('test1');
   });

    test('legend renders in proper order when not all options included', () => {
        const parentElement = d3.select('.legend');
        drawColorLegend(parentElement, ['test4','test1','test2','test3'], (d) => 'blue', {style: 'pie', groupBy:'model_id', colorBy: 'model_id', legendOrder: ['test1', 'test3', 'test2']}, []);
        const legend = document.querySelector('.legend svg');
        expect(legend).toBeTruthy();
        // note: these are in the opposite order as displayed on screen
        // options not included should be first here and last on screen ('test4')
        expect(legend.children.item(0).__data__).toBe('test4');
        expect(legend.children.item(1).__data__).toBe('test2');
        expect(legend.children.item(2).__data__).toBe('test3');
        expect(legend.children.item(3).__data__).toBe('test1');
    });
});
 