/**
 * TranslateGemini - 核心补丁注入器
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { getAntigravityPaths } = require('./config');
const { INJECTION_MARKER, generateInjectionScript } = require('./template');

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

function installPatch(customDictPath) {
  const paths = getAntigravityPaths();

  if (!paths.isInstalled) {
    throw new Error(`未检测到 Antigravity 安装目录：${paths.installDir}`);
  }

  if (!paths.hasAsar) {
    throw new Error(`未找到目标核心包 app.asar：${paths.asarPath}`);
  }

  const dictFile = customDictPath || path.join(__dirname, '..', 'data', 'dict.json');
  if (!fs.existsSync(dictFile)) {
    throw new Error(`未找到汉化字典文件：${dictFile}`);
  }

  // 确保进程解除占用
  closeRunningApp();

  const dictionary = JSON.parse(fs.readFileSync(dictFile, 'utf8'));
  const termCount = Object.keys(dictionary).length;
  console.log(`[Antigravity-Chinese] 已加载字典：包含 ${termCount} 个精准词条`);

  // 1. 解包到临时目录
  const extractedDir = path.join(paths.resourcesDir, 'app_extracted_patch');
  if (fs.existsSync(extractedDir)) {
    fs.rmSync(extractedDir, { recursive: true, force: true });
  }

  console.log('[Antigravity-Chinese] 正在解包 app.asar...');
  execSync(`npx asar extract "${paths.asarPath}" "${extractedDir}"`, { stdio: 'pipe' });

  const preloadFile = path.join(extractedDir, 'dist', 'preload.js');
  if (!fs.existsSync(preloadFile)) {
    fs.rmSync(extractedDir, { recursive: true, force: true });
    throw new Error(`解包文件中未找到 dist/preload.js：${preloadFile}`);
  }

  let content = fs.readFileSync(preloadFile, 'utf8');

  // 如果当前尚未打过补丁且尚未备份，则立即创建纯净的原版备份
  if (!content.includes(INJECTION_MARKER) && !paths.hasBackup) {
    console.log(`[Antigravity-Chinese] 检测到原生官方版本，创建纯正备份 -> ${paths.backupAsarPath}`);
    fs.copyFileSync(paths.asarPath, paths.backupAsarPath);
  } else if (paths.hasBackup) {
    console.log(`[Antigravity-Chinese] 检查到已有原生备份：${paths.backupAsarPath}`);
  }

  // 2. 清理旧补丁，追加新补丁
  if (content.includes(INJECTION_MARKER)) {
    content = content.split(INJECTION_MARKER)[0].trim();
  }

  const scriptToInject = generateInjectionScript(dictionary);
  content += '\n' + scriptToInject;
  fs.writeFileSync(preloadFile, content, 'utf8');
  console.log('[Antigravity-Chinese] 汉化脚本与严格字典已注入到 preload.js');

  // 3. 重新打包
  console.log('[Antigravity-Chinese] 正在重新打包 app.asar...');
  execSync(`npx asar pack "${extractedDir}" "${paths.asarPath}"`, { stdio: 'pipe' });

  // 4. 清理临时解包目录
  fs.rmSync(extractedDir, { recursive: true, force: true });
  console.log('[Antigravity-Chinese] 临时目录已清理，注入打包完成！');

  return {
    success: true,
    termCount,
    asarPath: paths.asarPath
  };
}

module.exports = {
  installPatch
};
