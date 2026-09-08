#!/usr/bin/env node

/**
 * TranslateGemini - 命令行控制台入口
 */
const fs = require('fs');
const path = require('path');
const { installPatch } = require('./injector');
const { restoreOriginal } = require('./restorer');
const { collectUntranslatedStrings } = require('./collector');

const command = (process.argv[2] || 'install').toLowerCase();

console.log('====================================================');
console.log('         TranslateGemini - 汉化管理系统              ');
console.log('====================================================\n');

try {
  switch (command) {
    case 'install':
    case 'patch':
      console.log('正在执行汉化注入...');
      const res = installPatch();
      console.log(`\n🎉 汉化成功！已注入 ${res.termCount} 个精准词条。`);
      console.log('请在任务栏右下角托盘彻底退出 Antigravity 并重新打开生效。\n');
      break;

    case 'restore':
    case 'uninstall':
      console.log('正在还原官方原生版本...');
      restoreOriginal();
      console.log('\n🎉 还原成功！已恢复官方原生英文版本。');
      console.log('请彻底退出 Antigravity 并重新打开。\n');
      break;

    case 'collect':
      console.log('正在扫描未翻译词条...');
      const list = collectUntranslatedStrings();
      const outputPath = path.join(__dirname, '..', 'data', 'untranslated.json');
      fs.writeFileSync(outputPath, JSON.stringify(list, null, 2), 'utf8');
      
      console.log(`\n✅ 扫描完成！共发现 ${list.length} 个候选词条。`);
      console.log(`📄 结果已自动保存至文件: data/untranslated.json\n`);
      
      if (list.length > 0) {
        console.log('部分候选词条预览：');
        list.slice(0, 15).forEach((item, index) => {
          console.log(`  ${index + 1}. ${item}`);
        });
        if (list.length > 15) {
          console.log(`  ... 其余请在 data/untranslated.json 中查看`);
        }
      }
      break;

    default:
      console.log(`未知命令: ${command}`);
      console.log('可用命令:');
      console.log('  node src/cli.js install  - 注入汉化补丁');
      console.log('  node src/cli.js restore  - 还原官方英文原版');
      console.log('  node src/cli.js collect  - 扫描未翻译词条并导出为 JSON');
      break;
  }
} catch (error) {
  console.error('\n❌ 操作失败:', error.message);
  process.exit(1);
}
