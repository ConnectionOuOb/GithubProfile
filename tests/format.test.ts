import assert from "node:assert/strict";
import test from "node:test";
import { escapeXml, metric, stripXmlWhitespace } from "../src/render/format.js";

test("metric formats SI units like shields", () => {
  assert.equal(metric(999), "999");
  assert.equal(metric(1000), "1k");
  assert.equal(metric(1500), "1.5k");
  assert.equal(metric(999_999), "1M");
  assert.equal(metric(1_200_000), "1.2M");
  assert.equal(metric(-1500), "-1.5k");
});

test("escapeXml escapes apostrophes", () => {
  assert.equal(escapeXml("O'Brien"), "O&apos;Brien");
  assert.equal(escapeXml(`a & b < c > d " e'`), "a &amp; b &lt; c &gt; d &quot; e&apos;");
});

test("stripXmlWhitespace compacts SVG", () => {
  const input = `
    <svg>
      <text> hello </text>
    </svg>
  `;
  assert.equal(stripXmlWhitespace(input), "<svg><text>hello </text></svg>");
});
