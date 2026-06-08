export async function fetchAvatarDataUri(
  url: string,
  token?: string,
): Promise<string | undefined> {
  try {
    const res = await fetch(url, {
      headers: token ? { Authorization: `bearer ${token}` } : {},
    });
    if (!res.ok) return undefined;

    const type = res.headers.get("content-type")?.split(";")[0] || "image/png";
    const base64 = Buffer.from(await res.arrayBuffer()).toString("base64");
    return `data:${type};base64,${base64}`;
  } catch {
    return undefined;
  }
}
