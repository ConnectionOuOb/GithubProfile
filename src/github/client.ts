const GITHUB_API = "https://api.github.com/graphql";

export class GitHubError extends Error {
  constructor(
    message: string,
    readonly status = 500,
  ) {
    super(message);
    this.name = "GitHubError";
  }
}

export async function graphql<T>(
  query: string,
  variables: Record<string, unknown>,
  token: string,
): Promise<T> {
  const res = await fetch(GITHUB_API, {
    method: "POST",
    headers: {
      Authorization: `bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  const json = (await res.json()) as {
    data?: T;
    errors?: { message: string; type?: string }[];
  };

  if (json.errors?.length) {
    const err = json.errors[0];
    if (err.type === "NOT_FOUND") {
      throw new GitHubError("User not found.", 404);
    }
    throw new GitHubError(err.message);
  }

  if (!json.data) {
    throw new GitHubError("Empty response from GitHub API.");
  }

  return json.data;
}
