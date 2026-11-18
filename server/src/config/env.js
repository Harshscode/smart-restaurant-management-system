
import 'dotenv/config';

export function getConfig() {
  const port = Number(process.env.PORT || 4000);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid port number.');
  }

  return {
    port,
    nodeEnv: process.env.NODE_ENV || 'development',
    mongoUri: process.env.MONGODB_URI || '',
    jwtSecret: process.env.JWT_SECRET || '',
    origins: (
      process.env.CLIENT_ORIGINS ||
      'http://localhost:5173,http://127.0.0.1:5173'
    )
      .split(',')
      .map(value => value.trim())
      .filter(Boolean),
    restaurantTimeZone:
      process.env.RESTAURANT_TIME_ZONE || 'America/New_York',
  };
}
