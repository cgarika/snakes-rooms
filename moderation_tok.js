/* (moderation.js's) BERT's uncased WordPiece tokenizer (as Hugging Face's BertTokenizer with do_lower_case: lower case, accents off,
   punctuation and CJK characters split off, then the longest pieces in vocab.txt, "##" inside a word). */
"use strict";
const fs = require("fs");
function load(vocabFile) {
  const vocab = new Map(fs.readFileSync(vocabFile, "utf8").split("\n").map((w, i) => [w.replace(/\r$/, ""), i]));
  const id = (t) => vocab.get(t);
  const UNK = id("[UNK]"), CLS = id("[CLS]"), SEP = id("[SEP]");
  const isPunct = (c) => { const n = c.codePointAt(0); return (n >= 33 && n <= 47) || (n >= 58 && n <= 64) || (n >= 91 && n <= 96) || (n >= 123 && n <= 126) || /\p{P}/u.test(c); };
  const isCjk = (n) => (n >= 0x4e00 && n <= 0x9fff) || (n >= 0x3400 && n <= 0x4dbf) || (n >= 0x20000 && n <= 0x2a6df) || (n >= 0xf900 && n <= 0xfaff) || (n >= 0x2f800 && n <= 0x2fa1f);
  function words(text) {
    let s = "";
    for (const c of text) {
      const n = c.codePointAt(0);
      if (n === 0 || n === 0xfffd || (/\p{C}/u.test(c) && !/[\t\n\r]/.test(c))) continue;
      s += /\s/.test(c) ? " " : isCjk(n) ? ` ${c} ` : c;
    }
    s = s.toLowerCase().normalize("NFD").replace(/\p{Mn}/gu, "");
    const out = [];
    for (const w of s.split(" ").filter(Boolean)) {
      let cur = "";
      for (const c of w) { if (isPunct(c)) { if (cur) out.push(cur); out.push(c); cur = ""; } else cur += c; }
      if (cur) out.push(cur);
    }
    return out;
  }
  function wordpiece(w) {
    if ([...w].length > 100) return [UNK];
    const out = [];
    let start = 0;
    while (start < w.length) {
      let end = w.length, found = null;
      while (start < end) {
        const sub = (start > 0 ? "##" : "") + w.slice(start, end);
        if (vocab.has(sub)) { found = vocab.get(sub); break; }
        end--;
      }
      if (found === null) return [UNK];
      out.push(found); start = end;
    }
    return out;
  }
  /* [CLS] the text's pieces [SEP], at most max ids. */
  function encode(text, max = 128) {
    const ids = [CLS];
    for (const w of words(text)) for (const p of wordpiece(w)) { if (ids.length >= max - 1) break; ids.push(p); }
    ids.push(SEP);
    return ids;
  }
  return { encode, words };
}
module.exports = { load };
