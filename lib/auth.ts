import { SignJWT, jwtVerify } from "jose";

// Simple auth for internal tool - single hardcoded user
const VALID_USERNAME = "Tomas";
const VALID_PASSWORD = "bokoba";

// Secret key for signing JWTs - in production, use environment variable
const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || "bokoba-construcciones-secret-key-2024"
);

const COOKIE_NAME = "bokoba_auth_token";

export type User = {
  username: string;
  name: string;
};

// Validate credentials
export function validateCredentials(username: string, password: string): boolean {
  return username === VALID_USERNAME && password === VALID_PASSWORD;
}

// Create JWT token
export async function createToken(user: User): Promise<string> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d") // 1 year - essentially never expires for internal tool
    .sign(SECRET_KEY);
  
  return token;
}

// Verify JWT token
export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload.user as User;
  } catch {
    return null;
  }
}

// Get cookie name
export function getCookieName(): string {
  return COOKIE_NAME;
}
