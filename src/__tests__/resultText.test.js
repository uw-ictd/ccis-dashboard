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
        <div class="main-wrapper">
          <div class="viz-title">CCE utilization (bar)</div>
          <div class="viz-wrapper"> 
            <div class="map-container"></div>
            <div class="chart-wrapper"></div>
            <div class="result-text-container"></div>
          </div>
        </div>
     </div>`;
 });
 
 describe('Result text tests', () =>  {
     test('Adds svg with text when function is called', () => {
        writeTextInsteadOfChart("test text", "Vaccines");
        const textContainer = document.querySelector('.result-text-container svg text');
        expect(textContainer).toBeTruthy();
     });
 });
 