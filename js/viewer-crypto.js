/** Shared browser/Node Web Crypto protocol: PBKDF2-SHA256 + AES-256-GCM. */
export async function decryptStatus(envelope, passphrase) {
  if (envelope.version !== 1 || envelope.iterations !== 210000) throw new Error('Unsupported encrypted snapshot');
  const bytes = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: bytes(envelope.salt), iterations: envelope.iterations, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  return JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes(envelope.iv) }, key, bytes(envelope.data))));
}
