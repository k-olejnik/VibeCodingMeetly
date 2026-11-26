import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";

const read = path => readFileSync(new URL(path, import.meta.url), "utf8");
const out = new URL("./dist/server/", import.meta.url);
mkdirSync(out, { recursive: true });
const localCss = new URL("./app.css", import.meta.url);
const base = read(existsSync(localCss) ? "./app.css" : "../../src/app.css");
writeFileSync(new URL("index.js", out),
    `const STYLE = ${JSON.stringify(base + "\n" + read("./demo.css"))};\nconst CLIENT = ${JSON.stringify(read("./client.js"))};\n` +
    read("./worker.js"));
