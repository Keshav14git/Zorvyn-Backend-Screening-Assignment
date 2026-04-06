const request = require('supertest');
const app = require('../src/app');

describe('API Integration Tests', () => {

  describe('Health Check API', () => {
    it('GET /api/health should return 200 and success status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('message', 'Finance Dashboard API is running.');
      expect(res.body.data).toHaveProperty('environment');
      expect(res.body.data).toHaveProperty('uptime');
    });
  });

  describe('404 Not Found Handler', () => {
    it('GET /api/unknown-route should return 404', async () => {
      const res = await request(app).get('/api/unknown-route');
      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body).toHaveProperty('message', 'The requested endpoint does not exist.');
    });
  });

});
