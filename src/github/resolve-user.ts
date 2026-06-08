import { graphql } from "./client.js";

export async function resolveUsername(
  token: string,
  hint?: string,
): Promise<string> {
  const trimmed = hint?.trim();
  if (trimmed) return trimmed;

  const { viewer } = await graphql<{ viewer: { login: string } }>(
    `query { viewer { login } }`,
    {},
    token,
  );

  return viewer.login;
}
