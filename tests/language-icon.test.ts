import assert from "node:assert/strict";
import test from "node:test";
import { getLanguageIconSlug, renderLanguageIcon } from "../src/render/language-icon.js";

test("resolves common GitHub language names to simple-icons slugs", () => {
  assert.equal(getLanguageIconSlug("TypeScript"), "typescript");
  assert.equal(getLanguageIconSlug("C#"), "dotnet");
  assert.equal(getLanguageIconSlug("C++"), "cplusplus");
  assert.equal(getLanguageIconSlug("Shell"), "gnubash");
  assert.equal(getLanguageIconSlug("Vue"), "vuedotjs");
  assert.equal(getLanguageIconSlug("Jupyter Notebook"), "jupyter");
});

test("renderLanguageIcon uses simple-icons path when available", () => {
  const svg = renderLanguageIcon("TypeScript", 0, 0, 36, "#3178c6");
  assert.match(svg, /<rect[^>]*stroke-width="1.25"/);
  assert.match(svg, /<svg[^>]*viewBox="0 0 24 24"/);
  assert.match(svg, /<path d="/);
  assert.doesNotMatch(svg, /<circle/);
});

test("renderLanguageIcon falls back to colored circle for unknown languages", () => {
  const svg = renderLanguageIcon("Made Up Lang", 0, 0, 36, "#ff00ff");
  assert.match(svg, /<rect[^>]*stroke-width="1.25"/);
  assert.match(svg, /<circle[^>]*fill="#ff00ff"/);
});
