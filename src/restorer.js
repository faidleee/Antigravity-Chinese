/**
 * TranslateGemini - 官方原版还原器
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { getAntigravityPaths } = require('./config');
const { INJECTION_MARKER } = require('./template');

function closeRunningApp() {
  try {
    if (process.platform === 'win32') {
      const output = execSync('tasklist', { encoding: 'utf8' }).toLowerCase();
      if (output.includes('antigravity.exe')) {
        console.log('[Antigravity-Chinese] 检测到 Antigravity 正在运行，正在自动退出以解除文件占用...');
        try { execSync('taskkill /F /IM Antigravity.exe', { stdio: 'ignore' }); } catch (e) {}
      }
    }
  } catch (e) {}
}

function restoreOriginal() {
  const paths = getAntigravityPaths();

  if (!paths.hasAsar) {
    throw new Error(`未找到目标核心包 app.asar：${paths.asarPath}`);
  }

  // 确保进程解除占用
  closeRunningApp();

  // 模式 1：如果存在原生备份且备份未被打补丁，直接还原备份
  if (paths.hasBackup) {
    console.log(`[Antigravity-Chinese] 正在从原生备份 ${paths.backupAsarPath} 还原至 ${paths.asarPath}...`);
    fs.copyFileSync(paths.backupAsarPath, paths.asarPath);
    console.log('[Antigravity-Chinese] 备份还原完成！');
    return { success: true, restoredPath: paths.asarPath };
  }

  // 模式 2：若无备份，直接从现有 asar 解包并物理剥离汉化补丁
  console.log('[Antigravity-Chinese] 未检测到 .bak 备份，正在直接从当前 app.asar 中剥离补丁...');
  const extractedDir = path.join(paths.resourcesDir, 'app_extracted_restore');
  if (fs.existsSync(extractedDir)) {
    fs.rmSync(extractedDir, { recursive: true, force: true });
  }

  execSync(`npx asar extract "${paths.asarPath}" "${extractedDir}"`, { stdio: 'pipe' });
  const preloadFile = path.join(extractedDir, 'dist', 'preload.js');

  if (fs.existsSync(preloadFile)) {
    let content = fs.readFileSync(preloadFile, 'utf8');
    if (content.includes(INJECTION_MARKER)) {
      content = content.split(INJECTION_MARKER)[0].trim();
      fs.writeFileSync(preloadFile, content, 'utf8');
      console.log('[Antigravity-Chinese] 成功剥离 preload.js 中的汉化注入代码。');
    }
  }

  execSync(`npx asar pack "${extractedDir}" "${paths.asarPath}"`, { stdio: 'pipe' });
  fs.rmSync(extractedDir, { recursive: true, force: true });

  console.log('[Antigravity-Chinese] 物理剥离还原完成！软件已完全恢复为官方纯正英文原版。');
  return { success: true, restoredPath: paths.asarPath };
}

module.exports = {
  restoreOriginal
};
