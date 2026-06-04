export const environment = {
  production: true,
  apiUrl: 'https://api.webparser.com/api',
  hubUrl: 'https://api.webparser.com/hubs/entities',
  identityUrl: 'https://id.webparser.com/',
  identityIssuer: 'https://id.webparser.com/', // 🔥 ВАЖНО
  // Здесь должен быть адрес, где будет лежать твой фронтенд на проде
  redirectUri: 'https://webparser.com/auth/callback'
};
