#!/usr/bin/env node

/**
 * TranslateGemini - 命令行控制台入口
 */
const { installPatch } = require('./injector');
const { restoreOriginal } = require('./restorer');

const command = (process.argv[2] || 'install').toLowerCase();

console.log('====================================================');
console.log('       Antigravity-Chinese - 汉化管理系统           ');
console.log('====================================================\n');

try {
  switch (command) {
    case 'install':
    case 'patch':
      console.log('正在执行汉化注入...');
      const res = installPatch();
      console.log(`\n🎉 汉化成功！已注入 ${res.termCount} 个精准词条。`);
      console.log('已解除进程占用，直接重新打开 Antigravity 即可生效。\n');
      break;

    case 'restore':
    case 'uninstall':
      console.log('正在还原官方原生版本...');
      restoreOriginal();
      console.log('\n🎉 还原成功！已恢复官方原生英文版本。');
      console.log('直接重新打开 Antigravity 即可。\n');
      break;

    default:
      console.log(`未知命令: ${command}`);
      console.log('可用命令:');
      console.log('  node src/cli.js install  - 注入汉化补丁');
      console.log('  node src/cli.js restore  - 还原官方英文原版');
      break;
  }
} catch (error) {
  console.error('\n❌ 操作失败:', error.message);
  process.exit(1);
}
