/**
 * TranslateGemini - 路径配置与自动探测模块
 */
const fs = require('fs');
const path = require('path');

function getAntigravityPaths() {
  const localAppData = process.env.LOCALAPPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Local');
  const roamingAppData = process.env.APPDATA || path.join(process.env.USERPROFILE || '', 'AppData', 'Roaming');

  // 默认探测安装目录
  const defaultInstallDir = path.join(localAppData, 'Programs', 'antigravity');
  const installDir = process.env.ANTIGRAVITY_HOME || defaultInstallDir;

  const resourcesDir = path.join(installDir, 'resources');
  const asarPath = path.join(resourcesDir, 'app.asar');
  const backupAsarPath = path.join(resourcesDir, 'app.asar.bak');

  // 本地存储目录 (用于未翻译词条提取)
  const localStorageDir = path.join(roamingAppData, 'Antigravity', 'Local Storage', 'leveldb');

  return {
    installDir,
    resourcesDir,
    asarPath,
    backupAsarPath,
    localStorageDir,
    isInstalled: fs.existsSync(installDir) && fs.existsSync(resourcesDir),
    hasAsar: fs.existsSync(asarPath),
    hasBackup: fs.existsSync(backupAsarPath)
  };
}

module.exports = {
  getAntigravityPaths
};
