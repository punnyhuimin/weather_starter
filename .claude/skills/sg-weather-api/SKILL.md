# sg-weather-api

This skill provides reference information about the Singapore weather API used in this project.

## Base URLs

The project uses two base URLs for weather data:

1. **Primary API**: `https://api-open.data.gov.sg`
   - Modern API endpoints
   - Supports API key authentication via `x-api-key` header
   - Used for most real-time and forecast endpoints

2. **Legacy API**: `https://api.data.gov.sg`
   - Used only for 4-day extended forecast
   - No authentication required

## Available API Endpoints

### Real-Time Station Readings (Current Conditions)

Fetches real-time data from weather stations across Singapore.

- **Base URL**: `https://api-open.data.gov.sg/v2/real-time/api`
- **Endpoints**:
  - `/air-temperature` - Temperature readings in °C
  - `/relative-humidity` - Humidity percentage
  - `/rainfall` - Rainfall in mm
  - `/wind-speed` - Wind speed in knots
  - `/wind-direction` - Wind direction in degrees (0-359)
  - `/uv` - UV index readings
  - `/psi` - Pollutant Standards Index (air quality)
  - `/pm25` - PM2.5 air quality readings

**Response Pattern**: 
- Contains `stations` array with metadata (id, name, location)
- Contains `readings` array with `timestamp` and `data` (array of stationId/value pairs)
- For PSI/PM25: Region-based data instead of stations

### Forecasts

#### Two-Hour Forecast (Current Conditions Forecast)
- **Endpoint**: `GET /v2/real-time/api/two-hr-forecast`
- **Base URL**: `https://api-open.data.gov.sg`
- **Returns**: Near real-time 2-hour forecast by area
- **Data**: Area metadata with forecasts for each named area in Singapore

#### 24-Hour Forecast
- **Endpoint**: `GET /v2/real-time/api/twenty-four-hr-forecast`
- **Base URL**: `https://api-open.data.gov.sg`
- **Returns**: 24-hour weather forecast with 6 time periods
- **Data**: General temperature (low/high) + forecast text by region
- **Regions**: West, North, Central, South, East

#### Extended 4-Day Forecast
- **Endpoint**: `GET /v1/environment/4-day-weather-forecast`
- **Base URL**: `https://api.data.gov.sg` (legacy)
- **Returns**: 4-day daily forecasts
- **Data**: Date, forecast text, high/low temperatures per day

## Data Source

- **Provider**: Singapore government open data API
- **API Key**: Required for authenticated endpoints (set via `WEATHER_API_KEY` environment variable)
- **Coverage**: All endpoints return Singapore-wide data
- **Coordinates**: Valid Singapore bounds are latitude 1.1-1.5, longitude 103.6-104.1
- **Timeout**: Default 8 seconds per request

## Integration in This Project

The `SingaporeWeatherClient` class in `backend/src/weather.ts` orchestrates these endpoints:

1. **getCurrentWeather(latitude, longitude)** - Aggregates all endpoints into one `WeatherSnapshot` object containing:
   - Current condition (2-hour forecast)
   - Station readings (temperature, humidity, rainfall, wind)
   - 24-hour forecast (periods + high/low temps)
   - 4-day extended forecast
   - Air quality metrics (PSI, PM2.5)
   - UV index

The client uses the nearest station/area/region for a given coordinate to return localized data.
