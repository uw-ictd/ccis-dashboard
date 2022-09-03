const request = require('supertest');
const { getServer, closeServer }  = require('../server');
const { TEST_USER, TEST_PASSWORD, dbOptionsSeeded } = require('../testUtils');
const { URL_PREFIX } = require('../config/routingConstants');
let server;

const PORT = 30006;
beforeAll(async () => {
    server = await getServer(PORT, dbOptionsSeeded);
});

afterAll(async () => {
    await closeServer();
});

// Tests that access the real database may slow when many queries are run
// simultaneously
jest.setTimeout(30000);

describe('Session management tests', () => {
    let authenticatedCookie;

    //get:true --> hit get with cookie, expect the correct data
    test('GET request to / should complete when passed a valid cookie', async () => {
        const logIn = await request(server).post(URL_PREFIX + '/login')
            .send(`username=${TEST_USER}`)
            .send(`password=${TEST_PASSWORD}`);
        authenticatedCookie = logIn.header['set-cookie'];
        const response = await request(server)
            .get(URL_PREFIX + '/')
            .set('Cookie', authenticatedCookie);
        expect(response.statusCode).toBe(200);
    });

    //get:false --> hit get without a cookie, expecting login page
    test('GET request to / should redirect to /login when unauthenticated', async () => {
        const response = await request(server)
            .get(URL_PREFIX + '/');
        expect(response.statusCode).toBe(302);
    });

    //post:true --> hit post  loggedin cookie, expect the correct data
    test('POST request with authenticated session should succeed', async () => {
        const response = await request(server)
            .post(URL_PREFIX + '/api/query')
            .set('Cookie', authenticatedCookie)
            .send({
                visualization: 'CCE utilization',
                filter: null
            });
        expect(response.statusCode).toBe(200);
    });

    //post:false --> hit post without cookie, expect 401
    test('POST request with unauthenticated session should fail', async () => {
        const response = await request(server)
            .post(URL_PREFIX + '/api/query')
            .send({
                visualization: 'CCE utilization',
                filter: null
            });
        expect(response.statusCode).toBe(401);
    });

    test('Sessions should persist across server restarts', async () => {
        await closeServer();
        server = await getServer(PORT, dbOptionsSeeded);
        const response = await request(server)
            .post(URL_PREFIX + '/api/query')
            .set('Cookie', authenticatedCookie)
            .send({
                visualization: 'CCE utilization',
                filter: null
            });
        expect(response.statusCode).toBe(200);
    });
});
