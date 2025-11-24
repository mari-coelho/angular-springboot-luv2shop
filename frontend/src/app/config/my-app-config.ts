export default {
  auth: {
    domain: 'dev-f0f8kv88nfxt50ot.us.auth0.com',
    clientId: '5w3wMFVMLQPeaYG3EAnf08GCROr8J3Y0',
    authorizationParams: {
      redirect_uri: 'http://localhost:4200',
      audience: 'http://localhost:8080',
    },
  },
  httpInterceptor: {
    allowedList: [
      'http://localhost:8080/api/orders/**',
      'http://localhost:8080/api/checkout/purchase',
    ],
  },
};
