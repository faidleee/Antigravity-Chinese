/**
 * TranslateGemini - 未翻译词条提取器
 */
const fs = require('fs');
const path = require('path');
const { getAntigravityPaths } = require('./config');

function collectUntranslatedStrings() {
  const paths = getAntigravityPaths();
  const dbDir = paths.localStorageDir;

  if (!fs.existsSync(dbDir)) {
    console.log('[TranslateGemini] 未找到 Local Storage 缓存目录，可能尚未启动过软件。');
    return [];
  }

  const files = fs.readdirSync(dbDir).filter(f => f.endsWith('.log') || f.endsWith('.ldb'));
  const collected = new Set();

  files.forEach(file => {
    try {
      const fullPath = path.join(dbDir, file);
      const buf = fs.readFileSync(fullPath);

      // 提取 UTF-16 编码片段
      const strUtf16 = buf.toString('utf16le');
      const utf16Matches = strUtf16.match(/"([^"\r\n]{2,100})"\s*:\s*true/g);
      if (utf16Matches) {
        utf16Matches.forEach(m => {
          const k = m.match(/"([^"\r\n]{2,100})"\s*:\s*true/);
          if (k && k[1]) collected.add(k[1].trim());
        });
      }

      // 提取 UTF-8 编码片段
      const strUtf8 = buf.toString('utf8');
      const utf8Matches = strUtf8.match(/"([^"\r\n]{2,100})"\s*:\s*true/g);
      if (utf8Matches) {
        utf8Matches.forEach(m => {
          const k = m.match(/"([^"\r\n]{2,100})"\s*:\s*true/);
          if (k && k[1]) collected.add(k[1].trim());
        });
      }
    } catch (e) {}
  });

  const resultList = Array.from(collected);
  console.log(`[TranslateGemini] 共发现 ${resultList.length} 条已捕获的候选词条`);
  return resultList;
}

module.exports = {
  collectUntranslatedStrings
};
