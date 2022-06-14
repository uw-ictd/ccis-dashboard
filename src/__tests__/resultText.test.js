/**
 * @jest-environment jsdom
 */
 const writeTextInsteadOfChart = require('../frontend-src/resultText');
 beforeEach(() => {
     window.SVGGraphicsElement.prototype.getBBox = function getBBox() {
      return { x: 0, y: 0, height: 0, width: 0 };
    };
     document.body.innerHTML = `
     <div id="Vaccines">
        <div class="left-wrapper"></div>
        <div class="main-wrapper main-wrapper-0">
          <div class="viz-title viz-title-0">CCE utilization (bar)</div>
          <div class="viz-wrapper viz-wrapper-0">
            <div class="map-container map-container-0"></div>
            <div class="chart-wrapper chart-wrapper-0"></div>
          </div>
        </div>
     </div>`;
 });

 describe('Result text tests', () =>  {
     test('Adds svg with text to chartwrapper when function is called', () => {
        writeTextInsteadOfChart("test text", "Vaccines", 0);
        const textContainer = document.querySelector('.chart-wrapper-0 .result-text');
        expect(textContainer).toBeTruthy();
     });
 });


