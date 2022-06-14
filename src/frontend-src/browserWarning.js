/*
 * The dashboard heavily uses flexbox. To test for flexbox support, we check for
 * the newest flexbox feature we use: gap
 */
function gapSupported() {
    // Add a flexbox element with gap to the page
    const outer = document.createElement('div');
    const inner1 = document.createElement('div');
    const inner2 = document.createElement('div');
    outer.appendChild(inner1);
    outer.appendChild(inner2);
    outer.style.display = 'flex';
    outer.style.flexDirection = 'column';
    outer.style.gap = '1px';
    outer.style.position = 'absolute';
    document.getElementById('top-wrapper').appendChild(outer);

    // Check its height: 1px if gap is supported, 0px if not
    const elementHeight = outer.scrollHeight;

    // Clean up
    outer.parentNode.removeChild(outer);

    return elementHeight === 1;
}

/*
 * One of the more recent javascript features we depend on is the
 * Array.prototype.flat() function
 */
function flatSupported() {
    return 'function' === typeof Array.prototype.flat;
}

function display() {
    if (!gapSupported() ||
        !flatSupported()) {
        document.getElementById('browser-support').style.display = 'block';
    }
}

function dismiss() {
    document.getElementById('browser-support').style.display = 'none';
}

module.exports = {
    display,
    dismiss
}
