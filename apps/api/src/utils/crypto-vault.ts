import crypto from 'crypto';

const SEPARATOR = ':';

export interface EncryptedSecretParts {
  version: string;
  iv: string;
  authTag: string;
  ciphertext: string;
}

export class CryptoVault {
  private currentKey: Buffer;
  private currentVersion: string;
  private keys: Map<string, Buffer>;

  constructor(
    currentKey: string,
    currentVersion: string = '1',
    oldKeys: Record<string, string> = {}
  ) {
    this.currentVersion = currentVersion;
    this.currentKey = this.deriveKey(currentKey);
    this.keys = new Map([[currentVersion, this.currentKey]]);

    for (const [version, key] of Object.entries(oldKeys)) {
      this.keys.set(version, this.deriveKey(key));
    }
  }

  private deriveKey(key: string): Buffer {
    // Ensure consistent 32-byte key for AES-256-GCM
    const safeKey = key || 'default_master_encryption_key_32bytes_long!';
    return crypto.createHash('sha256').update(safeKey).digest();
  }

  encryptParts(plaintext: string): EncryptedSecretParts {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.currentKey, iv);
    const ciphertext = Buffer.concat([
      cipher.update(plaintext, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();

    return {
      version: this.currentVersion,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
      ciphertext: ciphertext.toString('base64'),
    };
  }

  encrypt(plaintext: string): string {
    const parts = this.encryptParts(plaintext);
    return [
      parts.version,
      parts.iv,
      parts.authTag,
      parts.ciphertext,
    ].join(SEPARATOR);
  }

  decryptParts(parts: {
    version?: string | number;
    keyVersion?: string | number;
    iv?: string;
    secretIv?: string;
    authTag?: string;
    secretAuthTag?: string;
    ciphertext?: string;
    secretCiphertext?: string;
  }): string {
    const version = String(parts.version ?? parts.keyVersion ?? '');
    const iv = parts.iv ?? parts.secretIv ?? '';
    const authTag = parts.authTag ?? parts.secretAuthTag ?? '';
    const ciphertext = parts.ciphertext ?? parts.secretCiphertext ?? '';

    if (!version || !iv || !authTag || !ciphertext) {
      throw new Error('Invalid encrypted secret format');
    }

    const key = this.keys.get(version);
    if (!key) {
      throw new Error(`Unknown encryption key version: ${version}`);
    }

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(iv, 'base64')
    );
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(ciphertext, 'base64')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  decrypt(encrypted: string): string {
    const parts = encrypted.split(SEPARATOR);
    if (parts.length !== 4) {
      throw new Error('Invalid encrypted secret format');
    }

    const [version, iv, authTag, ciphertext] = parts;
    return this.decryptParts({ version, iv, authTag, ciphertext });
  }

  reencrypt(encrypted: string): string {
    const plaintext = this.decrypt(encrypted);
    return this.encrypt(plaintext);
  }

  reencryptParts(parts: {
    version?: string | number;
    keyVersion?: string | number;
    iv?: string;
    secretIv?: string;
    authTag?: string;
    secretAuthTag?: string;
    ciphertext?: string;
    secretCiphertext?: string;
  }): EncryptedSecretParts {
    const plaintext = this.decryptParts(parts);
    return this.encryptParts(plaintext);
  }
}

let parsedOldKeys: Record<string, string> = {};
try {
  if (process.env.MASTER_ENCRYPTION_OLD_KEYS) {
    parsedOldKeys = JSON.parse(process.env.MASTER_ENCRYPTION_OLD_KEYS);
  }
} catch (e) {
  parsedOldKeys = {};
}

export const cryptoVault = new CryptoVault(
  process.env.MASTER_ENCRYPTION_KEY || 'default_master_encryption_key_32bytes_long!',
  process.env.MASTER_ENCRYPTION_KEY_VERSION ?? '1',
  parsedOldKeys
);
