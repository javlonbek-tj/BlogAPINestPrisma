export type CookieOptions = {
  maxAge: number;
  httpOnly: boolean;
  sameSite: 'strict' | 'lax' | 'none';
  secure?: boolean;
};
