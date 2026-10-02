#!/usr/bin/env node
// Lists every English literal passed to tx(...) / N_(...) under src/ (used by ui-strings.test.ts and for authoring).
const fs = require("fs"), path = require("path")
function walk(d, out = []) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p, out); else if (/\.tsx?$/.test(e.name) && !/\.test\./.test(e.name)) out.push(p) } return out }
const keys = new Set()
const re = /(?<![\w$.])(?:tx|N_)\(\s*("(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)/g
for (const f of walk("src")) { const s = fs.readFileSync(f, "utf8"); let m; while ((m = re.exec(s))) { try { keys.add(m[1][0] === "`" ? m[1].slice(1, -1).replace(/\$\{[^}]*\}/g, "{}") : JSON.parse(m[1])) } catch { keys.add(m[1].slice(1, -1)) } } }
module.exports = [...keys]
if (require.main === module) console.log(JSON.stringify(module.exports, null, 1))
