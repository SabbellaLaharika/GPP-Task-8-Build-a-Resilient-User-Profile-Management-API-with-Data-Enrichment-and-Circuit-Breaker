const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');

describe('User API Integration Tests', () => {
    let createdUserId;

    beforeAll(async () => {
        // Sync database (create tables)
        await sequelize.sync({ force: true });
    });

    afterAll(async () => {
        await sequelize.close();
    });

    // 1. Test POST /api/users
    it('should create a new user successfully', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({
                name: 'Integration Test User',
                email: 'test@example.com'
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toBe('test@example.com');
        createdUserId = res.body.id;
    });

    it('should return 400 for invalid input', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({
                name: 'Invalid User'
                // email missing
            });
        expect(res.statusCode).toEqual(400);
        expect(res.body.errorCode).toBe('INVALID_INPUT');
    });

    it('should return 409 for duplicate email', async () => {
        const res = await request(app)
            .post('/api/users')
            .send({
                name: 'Duplicate User',
                email: 'test@example.com'
            });
        expect(res.statusCode).toEqual(409);
        expect(res.body.errorCode).toBe('EMAIL_DUPLICATE');
    });

    // 2. Test GET /api/users/:id
    it('should get the user by ID', async () => {
        const res = await request(app).get(`/api/users/${createdUserId}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.id).toBe(createdUserId);
    });

    it('should return 404 for non-existent user', async () => {
        const res = await request(app).get('/api/users/non-existent-id');
        expect(res.statusCode).toEqual(404);
    });

    // 3. Test Enriched Endpoint (Resilience)
    // Note: This depends on the mock service. If mock service is not running during this test, 
    // axios retry will fail and circuit breaker will open, returning "unavailable".
    // This verifies the resilience "fallback" mechanism which is a core requirement.
    it('should return enriched data or fallback status', async () => {
        const res = await request(app).get(`/api/users/${createdUserId}/enriched`);

        // We expect 200 regardless of external service status
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('enrichment');

        // Check structure
        const enrichment = res.body.enrichment;
        if (enrichment.enrichedDataStatus === 'unavailable') {
            console.log("Resilience Test: Circuit Breaker/Fallback triggered successfully.");
        } else {
            console.log("Resilience Test: External Service is UP and returned data.");
            expect(enrichment).toHaveProperty('loyaltyScore');
        }
    });

    // 4. Test DELETE
    it('should delete the user', async () => {
        const res = await request(app).delete(`/api/users/${createdUserId}`);
        expect(res.statusCode).toEqual(204);
    });
});
