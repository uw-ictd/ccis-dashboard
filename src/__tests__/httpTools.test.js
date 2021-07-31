const { post } = require('../frontend-src/httpTools');

beforeEach(() => {
    global.fetch = jest.fn(() => (new Promise(() => {})));
});

describe('post() tests', () => {
    test('post() function calls fetch and returns a promise', () => {
        const result = post('', {});
        expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            body: expect.any(String)
        }));
        expect(result.constructor.name).toBe('Promise')
    });
});
