import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WeatherProviderError, type WeatherSnapshot } from '../weather.js';

const weather: WeatherSnapshot = {
  condition: 'Cloudy',
  observed_at: '2026-05-04T00:00:00Z',
  source: 'test',
  area: 'Bishan',
  valid_period_text: 'Now',
  temperature_c: 29,
  humidity_percent: 80,
  rainfall_mm: 0,
  wind_speed_knots: 4,
  wind_direction_degrees: 180,
  forecast_low_c: 25,
  forecast_high_c: 32,
  uv_index: 7,
  psi_twenty_four_hourly: 42,
  pm25_one_hourly: 9,
  air_quality_region: 'central',
  forecast_periods: [{ label: 'Now', forecast: 'Cloudy' }],
  daily_forecast: [
    {
      date: '2026-05-04',
      forecast: 'Cloudy',
      temperature_low_c: 25,
      temperature_high_c: 32,
    },
  ],
};

describe('locations API', () => {
  let tempDir: string;
  let app: Awaited<ReturnType<typeof import('../server.js').createApp>>;

  beforeAll(
    async () => {
      tempDir = await mkdtemp(join(tmpdir(), 'weather-starter-test-'));
      process.env.DATABASE_PATH = join(tempDir, 'weather.db');
      process.env.LOG_LEVEL = 'silent';

      const { createApp } = await import('../server.js');
      app = await createApp({
        serveFrontend: false,
        enableRequestLogging: false,
        weatherClient: {
          async getCurrentWeather() {
            return weather;
          },
        },
      });
    },
    30000
  );

  afterAll(
    async () => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await rm(tempDir, { recursive: true, force: true }).catch(() => {});
    },
    10000
  );

  describe('POST /api/locations', () => {
    it('creates a location with valid coordinates', async () => {
      const response = await request(app)
        .post('/api/locations')
        .send({ latitude: 1.35, longitude: 103.85 })
        .expect(201);

      expect(response.body).toMatchObject({
        id: 1,
        latitude: 1.35,
        longitude: 103.85,
        weather: {
          condition: 'Cloudy',
          area: 'Bishan',
          temperature_c: 29,
        },
      });
    });

    it('refreshes weather when a location is created', async () => {
      const response = await request(app)
        .post('/api/locations')
        .send({ latitude: 1.36, longitude: 103.86 })
        .expect(201);

      expect(response.body).toMatchObject({
        latitude: 1.36,
        longitude: 103.86,
        weather: {
          condition: 'Cloudy',
          temperature_c: 29,
        },
      });
    });

    it('returns 422 for missing latitude', async () => {
      const response = await request(app)
        .post('/api/locations')
        .send({ longitude: 103.85 })
        .expect(422);

      expect(response.body).toEqual({
        detail: 'latitude and longitude are required',
      });
    });

    it('returns 422 for missing longitude', async () => {
      const response = await request(app)
        .post('/api/locations')
        .send({ latitude: 1.35 })
        .expect(422);

      expect(response.body).toEqual({
        detail: 'latitude and longitude are required',
      });
    });

    it('returns 422 for non-numeric latitude', async () => {
      const response = await request(app)
        .post('/api/locations')
        .send({ latitude: 'abc', longitude: 103.85 })
        .expect(422);

      expect(response.body).toEqual({
        detail: 'latitude and longitude are required',
      });
    });

    it('returns 422 for non-numeric longitude', async () => {
      const response = await request(app)
        .post('/api/locations')
        .send({ latitude: 1.35, longitude: 'xyz' })
        .expect(422);

      expect(response.body).toEqual({
        detail: 'latitude and longitude are required',
      });
    });

    it('returns 422 for coordinates outside Singapore bounds', async () => {
      const response = await request(app)
        .post('/api/locations')
        .send({ latitude: 0.5, longitude: 103.85 })
        .expect(422);

      expect(response.body).toEqual({
        detail:
          'Coordinates must be within Singapore (lat 1.1-1.5, lon 103.6-104.1)',
      });
    });

    it('returns 422 for longitude outside Singapore bounds', async () => {
      const response = await request(app)
        .post('/api/locations')
        .send({ latitude: 1.35, longitude: 105.0 })
        .expect(422);

      expect(response.body).toEqual({
        detail:
          'Coordinates must be within Singapore (lat 1.1-1.5, lon 103.6-104.1)',
      });
    });

    it('returns 422 for coordinates outside northern bound', async () => {
      const response = await request(app)
        .post('/api/locations')
        .send({ latitude: 1.6, longitude: 103.85 })
        .expect(422);

      expect(response.body).toEqual({
        detail:
          'Coordinates must be within Singapore (lat 1.1-1.5, lon 103.6-104.1)',
      });
    });

    it('returns 422 for coordinates outside western bound', async () => {
      const response = await request(app)
        .post('/api/locations')
        .send({ latitude: 1.35, longitude: 103.5 })
        .expect(422);

      expect(response.body).toEqual({
        detail:
          'Coordinates must be within Singapore (lat 1.1-1.5, lon 103.6-104.1)',
      });
    });

    it('returns 201 with location only when weather refresh fails', async () => {
      const failingTempDir = await mkdtemp(
        join(tmpdir(), 'weather-starter-test-failing-')
      );
      const originalDatabasePath = process.env.DATABASE_PATH;

      try {
        process.env.DATABASE_PATH = join(failingTempDir, 'weather.db');

        const { createApp } = await import('../server.js');
        const failingWeatherApp = await createApp({
          serveFrontend: false,
          enableRequestLogging: false,
          weatherClient: {
            async getCurrentWeather() {
              throw new WeatherProviderError('API temporarily unavailable');
            },
          },
        });

        const response = await request(failingWeatherApp)
          .post('/api/locations')
          .send({ latitude: 1.3, longitude: 103.7 })
          .expect(201);

        expect(response.body).toMatchObject({
          latitude: 1.3,
          longitude: 103.7,
        });
        expect(response.body.weather.condition).toBe('Not refreshed');
      } finally {
        process.env.DATABASE_PATH = originalDatabasePath;
        await new Promise((resolve) => setTimeout(resolve, 500));
        await rm(failingTempDir, { recursive: true, force: true }).catch(
          () => {}
        );
      }
    });

    it('prevents duplicate locations', async () => {
      await request(app)
        .post('/api/locations')
        .send({ latitude: 1.37, longitude: 103.87 })
        .expect(201);

      const response = await request(app)
        .post('/api/locations')
        .send({ latitude: 1.37, longitude: 103.87 })
        .expect(409);

      expect(response.body).toEqual({
        detail: expect.stringContaining('already exists'),
      });
    });
  });

  describe('GET /api/locations', () => {
    it('lists all locations with proper structure', async () => {
      const createResponse = await request(app)
        .post('/api/locations')
        .send({ latitude: 1.38, longitude: 103.88 })
        .expect(201);

      const response = await request(app).get('/api/locations').expect(200);

      expect(Array.isArray(response.body.locations)).toBe(true);
      expect(response.body.locations.length).toBeGreaterThan(0);

      const location = response.body.locations.find(
        (l: { id: number }) => l.id === createResponse.body.id
      );
      expect(location).toBeDefined();
      expect(location).toHaveProperty('id');
      expect(location).toHaveProperty('latitude');
      expect(location).toHaveProperty('longitude');
      expect(location).toHaveProperty('weather');
      expect(location.weather).toHaveProperty('condition');
    });

    it('includes weather data in location list', async () => {
      const response = await request(app).get('/api/locations').expect(200);

      expect(Array.isArray(response.body.locations)).toBe(true);
      if (response.body.locations.length > 0) {
        const firstLocation = response.body.locations[0];
        expect(firstLocation.weather).toHaveProperty('temperature_c');
        expect(firstLocation.weather).toHaveProperty('condition');
        expect(firstLocation.weather).toHaveProperty('observed_at');
      }
    });
  });

  describe('GET /api/locations/:locationId', () => {
    it('retrieves a specific location', async () => {
      const createResponse = await request(app)
        .post('/api/locations')
        .send({ latitude: 1.39, longitude: 103.89 })
        .expect(201);

      const locationId = createResponse.body.id;

      const response = await request(app)
        .get(`/api/locations/${locationId}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: locationId,
        latitude: 1.39,
        longitude: 103.89,
      });
    });

    it('returns 404 for non-existent location', async () => {
      const response = await request(app)
        .get('/api/locations/99999')
        .expect(404);

      expect(response.body).toEqual({
        detail: 'Location not found',
      });
    });
  });

  describe('DELETE /api/locations/:locationId', () => {
    it('deletes a location', async () => {
      const createResponse = await request(app)
        .post('/api/locations')
        .send({ latitude: 1.4, longitude: 103.9 })
        .expect(201);

      const locationId = Number(createResponse.body.id);

      await request(app).delete(`/api/locations/${locationId}`).expect(204);
      await request(app).get(`/api/locations/${locationId}`).expect(404);

      const listResponse = await request(app).get('/api/locations').expect(200);
      expect(
        listResponse.body.locations.some(
          (location: { id: number }) => location.id === locationId
        )
      ).toBe(false);
    });

    it('returns 404 when deleting a missing location', async () => {
      const response = await request(app).delete('/api/locations/9999').expect(404);

      expect(response.body).toEqual({
        detail: 'Location not found',
      });
    });
  });

  describe('POST /api/locations/:locationId/refresh', () => {
    it('refreshes weather for a location', async () => {
      const createResponse = await request(app)
        .post('/api/locations')
        .send({ latitude: 1.41, longitude: 103.91 })
        .expect(201);

      const locationId = createResponse.body.id;

      const refreshResponse = await request(app)
        .post(`/api/locations/${locationId}/refresh`)
        .expect(200);

      expect(refreshResponse.body).toMatchObject({
        id: locationId,
        weather: {
          condition: 'Cloudy',
          temperature_c: 29,
        },
      });
    });

    it('returns 404 for non-existent location', async () => {
      const response = await request(app)
        .post('/api/locations/99999/refresh')
        .expect(404);

      expect(response.body).toEqual({
        detail: 'Location not found',
      });
    });

    it('returns 502 when weather provider fails', async () => {
      const failingTempDir = await mkdtemp(
        join(tmpdir(), 'weather-starter-test-refresh-fail-')
      );
      const originalDatabasePath = process.env.DATABASE_PATH;

      try {
        process.env.DATABASE_PATH = join(failingTempDir, 'weather.db');

        const { createApp } = await import('../server.js');
        const failingWeatherApp = await createApp({
          serveFrontend: false,
          enableRequestLogging: false,
          weatherClient: {
            async getCurrentWeather() {
              throw new WeatherProviderError('Rate limit exceeded');
            },
          },
        });

        const createResponse = await request(failingWeatherApp)
          .post('/api/locations')
          .send({ latitude: 1.42, longitude: 103.92 })
          .expect(201);

        const locationId = createResponse.body.id;

        const response = await request(failingWeatherApp)
          .post(`/api/locations/${locationId}/refresh`)
          .expect(502);

        expect(response.body).toEqual({
          detail: 'Rate limit exceeded',
        });
      } finally {
        process.env.DATABASE_PATH = originalDatabasePath;
        await new Promise((resolve) => setTimeout(resolve, 500));
        await rm(failingTempDir, { recursive: true, force: true }).catch(
          () => {}
        );
      }
    });
  });
});
