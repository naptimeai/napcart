import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
} from "crypto";

const ENCRYPTION_PREFIX = "enc:v1:";

function getKeyMaterial() {
  return (
    process.env.NAPCART_FIELD_ENCRYPTION_KEY ??
    process.env.APP_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.DATABASE_URL ??
    ""
  );
}

function getEncryptionKey() {
  const keyMaterial = getKeyMaterial();

  if (!keyMaterial) {
    return null;
  }

  return createHash("sha256").update(keyMaterial).digest();
}

export function encryptFieldValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  if (value.startsWith(ENCRYPTION_PREFIX)) {
    return value;
  }

  const key = getEncryptionKey();

  if (!key) {
    return value;
  }

  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return [
    ENCRYPTION_PREFIX.slice(0, -1),
    iv.toString("base64url"),
    tag.toString("base64url"),
    ciphertext.toString("base64url"),
  ].join(":");
}

export function decryptFieldValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  if (!value.startsWith(ENCRYPTION_PREFIX)) {
    return value;
  }

  const key = getEncryptionKey();

  if (!key) {
    return null;
  }

  const [, , ivValue, tagValue, ciphertextValue] = value.split(":");

  if (!ivValue || !tagValue || !ciphertextValue) {
    return null;
  }

  try {
    const decipher = createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(ivValue, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagValue, "base64url"));

    return Buffer.concat([
      decipher.update(Buffer.from(ciphertextValue, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    return null;
  }
}
