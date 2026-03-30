export interface JwtVerifierResult {
  sub: string;
  username: string;
}

export interface JwtVerifier {
  verify: (jwt: string) => Promise<JwtVerifierResult>;
}

export const JWT_VERIFIER_DI = Symbol.for('JWT_VERIFIER');
