const request = require('supertest');
const { getServer, closeServer }  = require('../server');
const { TEST_USER, TEST_PASSWORD, dbOptionsSeeded, silenceErrors, mapSeries } = require('../testUtils');
const visualizations = require('../config/visualizations');
let agent;

beforeAll(async () => {
    const server = await getServer(30001, dbOptionsSeeded);
    // Using agent like this automatically handles cookies, so the agent has an
    // authenticated cookie for all requests after the first successful POST to
    // /login
    agent = request.agent(server);
});

afterAll(() => {
    return closeServer();
});

// Tests that access the real database may slow when many queries are run
// simultaneously
jest.setTimeout(30000);

describe('Login tests', () => {
    test('Response should be login page', async () => {
        const response = await agent.get('/')
            .redirects(5)
            .expect(200);
        expect(response.text).toContain('<h5 class="card-title text-center">CCIS Dashboard Sign In</h5>');
    });

    test('Response should be unsuccessful login', async () => {
        const response = await agent.post('/login')
            .send('username=test')
            .send('password=test')
            .expect(401);
        expect(response.text).toContain('Unauthorized');
    });

    test('Response should be successful login', async () => {
        const response = await agent.post('/login')
            .send(`username=${TEST_USER}`)
            .send(`password=${TEST_PASSWORD}`)
            .redirects(5)
            .expect(200);
        expect(response.text).toContain('<div class="map"');
    });
});

describe('/api/query integration tests', () => {
   test('A normal visualization should return some data', async () => {
        const response = await agent.post('/api/query')
            .send({
                visualization: 'CCE utilization',
                filter: null
            });
        expect(response.statusCode).toBe(200);
        const responseBody = JSON.parse(response.text);
        expect(responseBody).toHaveProperty('data');
        expect(responseBody).toHaveProperty('metadata');
        const { data, metadata } = responseBody;
        expect(data.length).toBeGreaterThan(0);
        expect(data[0].length).toBe(2);
        expect(data[0][1].length).toBeGreaterThan(0);
        expect(metadata).toHaveProperty('fullDomain');
        expect(metadata).toHaveProperty('fullColorDomain');
    });

    test('Server responds when a filter is specified', async () => {
        const response = await agent.post('/api/query')
            .send({
                visualization: 'CCE utilization',
                filter: {
                    facilityTypes: [ 'hcii' ],
                    refrigeratorTypes: [ 'VLS 054 SDD Greenline' ],
                    maintenancePriorities: [ 'low', 'high', 'not_applicable', '' ],
                    regions: [
                        [ 'UGANDA', 'KAMPALA', 'KAMPALA DISTRICT' ],
                        [ 'UGANDA', 'LANGO', 'APAC DISTRICT'],
                        [ 'UGANDA', 'SOUTH CENTRAL', 'WAKISO DISTRICT' ]
                    ]
                }
            });
        expect(response.statusCode).toBe(200);
        const responseBody = JSON.parse(response.text);
        expect(responseBody).toHaveProperty('data');
        expect(responseBody).toHaveProperty('metadata');
        const { data, metadata } = responseBody;
        expect(data.length).toBeGreaterThan(0);
        expect(data[0].length).toBe(2);
        expect(metadata).toHaveProperty('fullDomain');
        expect(metadata).toHaveProperty('fullColorDomain');
    });

    test('Server responds when part of filter is empty', async () => {
        const response = await agent.post('/api/query')
            .send({
                visualization: 'Refrigerator/freezer utilization',
                filter: {
                    facilityTypes: [],
                    refrigeratorTypes: [ 'MKF 074' ],
                    maintenancePriorities: [ 'low', 'high', 'not_applicable', '' ],
                    regions: [
                        [ 'KAMPALA', 'KAMPALA DISTRICT' ],
                        [ 'LANGO', 'APAC DISTRICT'],
                        [ 'WEST NILE', 'ARUA DISTRICT' ]
                    ]
                }
            });
        expect(response.statusCode).toBe(200);
        const responseBody = JSON.parse(response.text);
        expect(responseBody).toHaveProperty('data');
        expect(responseBody).toHaveProperty('metadata');
        const { data, metadata } = responseBody;
        expect(data.length).toBe(0);
    });

    test('Server should reply with error when no visualization specified', async () => {
        silenceErrors();
        const response = await agent.post('/api/query').send({});
        expect(response.statusCode).toBe(400);
        const responseBody = JSON.parse(response.text);
        expect(responseBody).toHaveProperty('error');
        expect(responseBody.error).toContain('"visualization" is required');
    });

    const vizNames = Object.keys(visualizations);
    vizNames.forEach((vizName, index) => {
        test(`[${index+1}/${vizNames.length}] Visualization should run without error: ${vizName}`, async () => {
            const response = await agent.post('/api/query')
                .send({
                    visualization: vizName,
                    filter: null
                });
            expect(response.statusCode).toBe(200);
        });
    });
});
