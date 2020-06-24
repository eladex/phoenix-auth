import dotenv from 'dotenv';
// load .env file
dotenv.config({ path: '.env' });
const config = {
  server: {
    port: +(process.env.PORT || 3000),
  },
  authentication: {
    token: process.env.TOKEN || 'phx-token',
    secret: process.env.SECRET_KEY || 'blue-nitro-the-jello',
    minutesExpires: +(process.env.TOKEN_MINUTES_EXPIRE || 2),
    shragaURL: process.env.SHRAGA_URL || 'http://localhost:3000',
  },
  clientEndpoint: process.env.CLIENT_ENDPOINT || '/',
};

export default config;
