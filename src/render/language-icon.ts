import * as simpleIcons from "simple-icons";
import { escapeXml } from "./format.js";
import { theme as t } from "./theme.js";

interface SimpleIcon {
  title: string;
  slug: string;
  hex: string;
  path: string;
}

/** GitHub linguist names that do not map cleanly to simple-icons slugs. */
const GITHUB_LANGUAGE_SLUGS: Record<string, string> = {
  "c#": "dotnet",
  "c++": "cplusplus",
  "f#": "fsharp",
  "objective-c": "objectivec",
  "objective-c++": "objectivec",
  "jupyter notebook": "jupyter",
  "jupyter lab": "jupyter",
  vue: "vuedotjs",
  "vue.js": "vuedotjs",
  react: "react",
  "react native": "react",
  dockerfile: "docker",
  shell: "gnubash",
  bash: "gnubash",
  powershell: "powershell",
  hcl: "terraform",
  "plpgsql": "postgresql",
  "pl/sql": "oracle",
  tex: "latex",
  "c/c++": "cplusplus",
  "jupyter nbconvert": "jupyter",
  "jupyter templates": "jupyter",
  "microsoft developer studio project": "visualstudio",
  "microsoft visual studio solution": "visualstudio",
  "visual basic .net": "dotnet",
  "vb.net": "dotnet",
  "asp.net": "dotnet",
  "classic asp": "dotnet",
  cmake: "cmake",
  groovy: "apachegroovy",
  haskell: "haskell",
  kotlin: "kotlin",
  swift: "swift",
  dart: "dart",
  scala: "scala",
  elixir: "elixir",
  erlang: "erlang",
  clojure: "clojure",
  crystal: "crystal",
  nim: "nim",
  zig: "zig",
  v: "v",
  ocaml: "ocaml",
  fsharp: "fsharp",
  fortran: "fortran",
  matlab: "matlab",
  julia: "julia",
  r: "r",
  lua: "lua",
  perl: "perl",
  php: "php",
  ruby: "ruby",
  rust: "rust",
  go: "go",
  java: "java",
  kotlinscript: "kotlin",
  typescript: "typescript",
  javascript: "javascript",
  html: "html5",
  css: "css3",
  scss: "sass",
  sass: "sass",
  less: "less",
  stylus: "stylus",
  markdown: "markdown",
  json: "json",
  yaml: "yaml",
  xml: "xml",
  svg: "svg",
  wasm: "webassembly",
  "web assembly": "webassembly",
  solidity: "solidity",
  graphql: "graphql",
  svelte: "svelte",
  astro: "astro",
  nix: "nixos",
  docker: "docker",
  makefile: "gnu",
  batchfile: "windows11",
  "vim script": "vim",
  "viml": "vim",
  "emacs lisp": "gnuemacs",
  "common lisp": "commonlisp",
  lisp: "commonlisp",
  prolog: "swi-prolog",
  cuda: "nvidia",
  "opencl": "opencl",
  glsl: "opengl",
  hlsl: "directx",
  "protocol buffer": "protobuf",
  protobuf: "protobuf",
  thrift: "apachethrift",
  capnproto: "capnp",
  toml: "toml",
  ini: "ini",
  csv: "csv",
  sql: "mysql",
  plsql: "oracle",
  tsql: "microsoftsqlserver",
  mysql: "mysql",
  postgresql: "postgresql",
  mongodb: "mongodb",
  redis: "redis",
  terraform: "terraform",
  ansible: "ansible",
  puppet: "puppet",
  chef: "chef",
  gradle: "gradle",
  maven: "apachemaven",
  sbt: "sbt",
  npm: "npm",
  yarn: "yarn",
  pnpm: "pnpm",
  bun: "bun",
  deno: "deno",
  node: "nodedotjs",
  "node.js": "nodedotjs",
  express: "express",
  fastapi: "fastapi",
  django: "django",
  flask: "flask",
  rails: "rubyonrails",
  laravel: "laravel",
  spring: "spring",
  "asp.net core": "dotnet",
  dotnet: "dotnet",
  ".net": "dotnet",
  csharp: "csharp",
  c: "c",
  "c header": "c",
  "c++ header": "cplusplus",
  assembly: "assemblyscript",
  "gnu assembler": "gnu",
  verilog: "verilog",
  vhdl: "vhdl",
  arduino: "arduino",
  processing: "processingfoundation",
  pascal: "pascal",
  delphi: "delphi",
  cobol: "cobol",
  ada: "ada",
  d: "d",
  hack: "hack",
  haxe: "haxe",
  purescript: "purescript",
  reason: "reason",
  rescript: "rescript",
  elm: "elm",
  purebasic: "purebasic",
  actionscript: "actionscript",
  coldfusion: "adobecoldfusion",
  apex: "salesforce",
  abap: "sap",
  gdscript: "godotengine",
  "game maker language": "gamedeveloper",
  shaderlab: "unity",
  "unrealscript": "unrealengine",
  ziglang: "zig",
};

const iconByKey = new Map<string, SimpleIcon>();

for (const key of Object.keys(simpleIcons)) {
  if (!key.startsWith("si")) continue;
  const icon = (simpleIcons as unknown as Record<string, SimpleIcon>)[key];
  iconByKey.set(icon.slug, icon);
  iconByKey.set(icon.title.toLowerCase(), icon);
  iconByKey.set(icon.title.toLowerCase().replace(/ /g, "-"), icon);
}

function normalizeLanguageKey(name: string): string {
  return name.trim().toLowerCase();
}

function languageToSlug(name: string): string | undefined {
  const key = normalizeLanguageKey(name);
  const mapped = GITHUB_LANGUAGE_SLUGS[key];
  if (mapped && iconByKey.has(mapped)) return mapped;

  const hyphenated = key.replace(/\+/g, "plus").replace(/#/g, "sharp").replace(/ /g, "-");
  if (iconByKey.has(hyphenated)) return hyphenated;

  if (iconByKey.has(key)) return key;

  const compact = key.replace(/[^a-z0-9]/g, "");
  if (iconByKey.has(compact)) return compact;

  return undefined;
}

function resolveIcon(name: string): SimpleIcon | undefined {
  const slug = languageToSlug(name);
  return slug ? iconByKey.get(slug) : undefined;
}

/** Bordered icon box placed before the language progress bar. */
export function renderLanguageIcon(
  name: string,
  boxX: number,
  boxY: number,
  size: number,
  fallbackColor: string,
): string {
  const pad = 2;
  const inner = size - pad * 2;
  const border = `<rect x="${boxX}" y="${boxY}" width="${size}" height="${size}" rx="4" fill="rgba(255,255,255,0.1)" stroke="${t.panelBorder}" stroke-width="1.25"/>`;

  const icon = resolveIcon(name);
  if (!icon) {
    const cx = boxX + size / 2;
    const cy = boxY + size / 2;
    return `${border}<circle cx="${cx}" cy="${cy}" r="${inner / 2 - 0.5}" fill="${escapeXml(fallbackColor)}"/>`;
  }

  const fill = `#${icon.hex}`;
  const ix = boxX + pad;
  const iy = boxY + pad;
  return `${border}<svg x="${ix}" y="${iy}" width="${inner}" height="${inner}" viewBox="0 0 24 24" role="img" aria-hidden="true"><path d="${escapeXml(icon.path)}" fill="${fill}"/></svg>`;
}

/** Exposed for tests. */
export function getLanguageIconSlug(name: string): string | undefined {
  return languageToSlug(name);
}
