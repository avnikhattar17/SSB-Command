const configuredApiUrl = import.meta.env.VITE_API_URL || 'https://ssb-command-api.onrender.com';
const normalizedApiUrl = configuredApiUrl.replace(/\/+$/, '');

export const apiBase = /\/api$/i.test(normalizedApiUrl)
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;
