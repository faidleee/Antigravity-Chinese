/**
 * TranslateGemini 单元测试套件
 * 规则遵循：测试项目函数必须使用中文命名
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { getAntigravityPaths } = require('../src/config');
const { generateInjectionScript, INJECTION_MARKER } = require('../src/template');

function 测试_字典文件格式与非空校验() {
  const dictPath = path.join(__dirname, '..', 'data', 'dict.json');
  assert.ok(fs.existsSync(dictPath), '字典文件 data/dict.json 必须存在');

  const content = fs.readFileSync(dictPath, 'utf8');
  let data;
  assert.doesNotThrow(() => {
    data = JSON.parse(content);
  }, '字典文件必须是合法的 JSON 格式');

  assert.strictEqual(typeof data, 'object', '字典必须是一个键值对对象');
  const count = Object.keys(data).length;
  assert.ok(count >= 200, `字典词条数量应不小于 200 条，当前为 ${count} 条`);
  console.log(`  ✔ [测试_字典文件格式与非空校验] 通过 (包含 ${count} 个有效词条)`);
}

function 测试_字典键值有效性与无空白异常() {
  const dictPath = path.join(__dirname, '..', 'data', 'dict.json');
  const data = JSON.parse(fs.readFileSync(dictPath, 'utf8'));

  for (const [key, value] of Object.entries(data)) {
    assert.ok(key && key.trim().length > 0, `英文键名不能为空: "${key}"`);
    assert.ok(value && value.trim().length > 0, `中文译文不能为空: "${key}" -> "${value}"`);
    // 确保没有误把相同的值填进去
    assert.strictEqual(typeof key, 'string', `键名必须为字符串: ${key}`);
    assert.strictEqual(typeof value, 'string', `值必须为字符串: ${value}`);
  }
  console.log('  ✔ [测试_字典键值有效性与无空白异常] 通过');
}

function 测试_路径自动探测逻辑() {
  const paths = getAntigravityPaths();
  assert.ok(paths.installDir, '安装目录路径必须被正确解析');
  assert.ok(paths.resourcesDir, 'resources 目录路径必须被正确解析');
  assert.ok(paths.asarPath, 'asar 包路径必须被正确解析');
  console.log(`  ✔ [测试_路径自动探测逻辑] 通过 (探测目标: ${paths.installDir})`);
}

function 测试_注入模板代码生成有效性() {
  const mockDict = {
    "New Conversation": "新建对话",
    "Settings": "系统设置"
  };

  const script = generateInjectionScript(mockDict);
  assert.ok(script.includes(INJECTION_MARKER), '生成的脚本必须包含专属注入标记');
  assert.ok(script.includes('"New Conversation": "新建对话"'), '生成的脚本中必须内嵌字典内容');
  assert.ok(script.includes('MutationObserver'), '生成的脚本必须包含 DOM 监听引擎');
  assert.ok(script.includes('translateText'), '生成的脚本必须包含严格匹配转换函数');
  console.log('  ✔ [测试_注入模板代码生成有效性] 通过');
}

function 测试_命令行执行环境自检() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  assert.ok(fs.existsSync(packageJsonPath), 'package.json 必须存在');
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  assert.strictEqual(pkg.name, 'translate-gemini', '项目名称应为 translate-gemini');
  assert.ok(pkg.scripts.test, '必须配置 test 测试脚本');
  assert.ok(pkg.scripts.start, '必须配置 start 启动脚本');
  console.log('  ✔ [测试_命令行执行环境自检] 通过');
}

function 测试_动态模式与高频界面词条匹配() {
  const dictPath = path.join(__dirname, '..', 'data', 'dict.json');
  const dict = JSON.parse(fs.readFileSync(dictPath, 'utf8'));

  // 必须覆盖的词条
  const requiredTerms = [
    'files changed', 'Worked for', 'Review', 'Edited', 'Learn more about',
    'Commands', 'See less', 'Inherits your General settings when working in this project.',
    'Allow', 'Deny', 'Always Allow', 'Always Deny', 'Ask', 'Block',
    'Also includes global settings when working in this project. Learn more.',
    'global settings', 'General settings', 'Learn more', 'Inherits your'
  ];

  for (const term of requiredTerms) {
    assert.ok(dict[term], `字典中必须包含关键词条: "${term}"`);
  }

  // 验证注入模板对动态模式的提取与替换逻辑
  const script = generateInjectionScript(dict);
  assert.ok(script.includes('Subagents'), '脚本应包含 Subagents 动态匹配规则');
  assert.ok(script.includes('Files Changed'), '脚本应包含 Files Changed 动态匹配规则');
  assert.ok(script.includes('Ran'), '脚本应包含 Ran 命令条数匹配规则');
  assert.ok(script.includes('Worked for'), '脚本应包含 Worked for 耗时匹配规则');
  assert.ok(script.includes('Thought for'), '脚本应包含 Thought for 思考匹配规则');
  console.log('  ✔ [测试_动态模式与高频界面词条匹配] 通过');
}

// 执行所有测试函数
function 运行全部测试() {
  console.log('\n--- 开始执行 TranslateGemini 自动化单元测试 ---');
  let passed = 0;
  const testSuite = [
    测试_字典文件格式与非空校验,
    测试_字典键值有效性与无空白异常,
    测试_路径自动探测逻辑,
    测试_注入模板代码生成有效性,
    测试_命令行执行环境自检,
    测试_动态模式与高频界面词条匹配
  ];

  for (const testFn of testSuite) {
    try {
      testFn();
      passed++;
    } catch (err) {
      console.error(`  ❌ [${testFn.name}] 失败:`, err.message);
      process.exit(1);
    }
  }

  console.log(`\n🎉 全部测试通过！共完成 ${passed} 组测试，无任何异常。\n`);
}

运行全部测试();
