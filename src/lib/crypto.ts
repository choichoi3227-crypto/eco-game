const ENCODER = new TextEncoder();

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey('raw', ENCODER.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  const hash = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, keyMaterial, 256);
  return `100000:${btoa(String.fromCharCode(...salt))}:${btoa(String.fromCharCode(...new Uint8Array(hash)))}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [iter, saltB64, hashB64] = storedHash.split(':');
  const salt = new Uint8Array(atob(saltB64).split('').map(c => c.charCodeAt(0)));
  const keyMaterial = await crypto.subtle.importKey('raw', ENCODER.encode(password), { name: 'PBKDF2' }, false, ['deriveBits']);
  const derivedHash = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: parseInt(iter), hash: 'SHA-256' }, keyMaterial, 256);
  return btoa(String.fromCharCode(...new Uint8Array(derivedHash))) === hashB64;
}
