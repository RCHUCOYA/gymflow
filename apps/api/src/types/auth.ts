export type AuthTokenPayload = {
  sub: string;
  role: string;
  permissions: string[];
};

export type AuthenticatedUser = {
  id: string;
  role: string;
  permissions: string[];
};
