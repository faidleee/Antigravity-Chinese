/**
 * TranslateGemini - 原版还原器
 */
const fs = require('fs');
const { getAntigravityPaths } = require('./config');

function restoreOriginal() {
  const paths = getAntigravityPaths();

  if (!paths.hasBackup) {
    throw new Error(`未找到原生备份文件：${paths.backupAsarPath}，无法自动还原！`);
  }

  console.log(`[TranslateGemini] 正在将备份 ${paths.backupAsarPath} 还原至 ${paths.asarPath}...`);
  fs.copyFileSync(paths.backupAsarPath, paths.asarPath);
  console.log('[TranslateGemini] 还原成功！软件已恢复为官方原生版本。');

  return {
    success: true,
    restoredPath: paths.asarPath
  };
}

module.exports = {
  restoreOriginal
};
