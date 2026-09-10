// Generates swagger-output.json by scanning the routes in index.js.
// Run it after adding/changing routes:  node swagger.js   (or npm run swagger)
// The spec is served by the API at http://localhost:3601/api-docs
const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Apple Asset Tracking API',
    description:
      'Web backend for the RFID asset-management application (port 3601). ' +
      'All endpoints except the public allowlist (login/password flows, RFID device ' +
      'endpoints, downloads) require a JWT: click Authorize and enter "Bearer <token>" ' +
      'using the token field from the POST /login response.',
    version: '5.1',
  },
  host: 'localhost:3601',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      name: 'Authorization',
      in: 'header',
      description: 'Enter: Bearer <token from POST /login>',
    },
  },
  security: [{ bearerAuth: [] }],
};

swaggerAutogen('./swagger-output.json', ['./index.js'], doc).then(() => {
  console.log('swagger-output.json generated');
});
