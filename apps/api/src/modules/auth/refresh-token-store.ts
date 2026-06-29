const refreshTokensByUser = new Map<string, Set<string>>();

export function saveRefreshToken(userId: string, refreshToken: string) {
  const tokens = refreshTokensByUser.get(userId) ?? new Set<string>();
  tokens.add(refreshToken);
  refreshTokensByUser.set(userId, tokens);
}

export function hasRefreshToken(userId: string, refreshToken: string) {
  const tokens = refreshTokensByUser.get(userId);
  return Boolean(tokens?.has(refreshToken));
}

export function revokeRefreshToken(userId: string, refreshToken: string) {
  const tokens = refreshTokensByUser.get(userId);

  if (!tokens) {
    return;
  }

  tokens.delete(refreshToken);
  if (tokens.size === 0) {
    refreshTokensByUser.delete(userId);
  }
}

export function revokeAllRefreshTokens(userId: string) {
  refreshTokensByUser.delete(userId);
}
