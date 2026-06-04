export const environment = {
  production: false,
  apiUrl: '/api',
  hubUrl: '/hubs/entities',
  identityUrl: '/identity',
  identityIssuer: 'https://localhost:5001', // 🔥 ВАЖНО
  // ВАЖНО: Redirect URI должен совпадать с тем, что ты открываешь в браузере.
  // Если заходишь через ngrok, тут должен быть ngrok-адрес!
  redirectUri: 'https://c469-217-19-214-254.ngrok-free.app/auth/callback'
};
