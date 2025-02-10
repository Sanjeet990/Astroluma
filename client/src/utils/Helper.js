export const validateOTPAuthURL = (url) => {
  const otpAuthRegex = /^otpauth:\/\/totp\/[^?]+\?secret=([^&]+)(?:&|$)/;
  const match = url.match(otpAuthRegex);
  return match?.[1];
};

export const isValidSecretKey = (secret) => {
  const secretRegex = /^[A-Z2-7]+=*$/i;
  return secret && secret.length >= 16 && secret.length <= 128 && secret.match(secretRegex) ? true : false;
};

export const isLocal = (hostname) => {
  const localIPs = ['localhost', '127.0.0.1'];
  const ipPattern = /^192\.168\.\d{1,3}\.\d{1,3}$/;
  return localIPs.includes(hostname) || ipPattern.test(hostname) ? true : false;
};

export const base64ToBlob = (base64, contentType) => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

export const getMimeType = (url) => {
  const extension = url.split('.').pop();
  const mimeTypes = {
      'svg': 'image/svg+xml',
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'ico': 'image/x-icon',
      // Add more mappings if needed
  };
  return mimeTypes[extension] || 'application/octet-stream';
};