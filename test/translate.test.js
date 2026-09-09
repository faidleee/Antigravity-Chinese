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
  assert.ok(script.includes('isIgnoredNode'), '生成的脚本必须包含输入框与代码编辑区免疫过滤函数');
  console.log('  ✔ [测试_注入模板代码生成有效性] 通过');
}

function 测试_命令行执行环境自检() {
  const packageJsonPath = path.join(__dirname, '..', 'package.json');
  assert.ok(fs.existsSync(packageJsonPath), 'package.json 必须存在');
  const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  assert.strictEqual(pkg.name, 'antigravity-chinese', '项目名称应为 antigravity-chinese');
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
    'global settings', 'General settings', 'Learn more', 'Inherits your',
    'Rename', 'Mark Read', 'Delete', 'Copy', 'Split',
    'Conversation Name', 'Conversation ID', 'Project Name',
    'Split Right', 'Split Down',
    'Agent settings and permissions for conversations outside of projects.',
    'Install Antigravity IDE to run and edit your workspace scripts.',
    'Replace With New', 'Pin', 'Archive', 'Describe the bug you encountered...'
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

function 测试_用户对话气泡与思考链免疫() {
  const vm = require('vm');
  const dict = {
    'Allow': '允许',
    'Settings': '系统设置'
  };
  const script = generateInjectionScript(dict);

  // 1. 静态特征断言
  assert.ok(script.includes('group/user-input-step'), '脚本必须保护 group/user-input-step 用户提问气泡');
  assert.ok(script.includes('user-message'), '脚本必须保护 user-message 用户消息气泡');
  assert.ok(script.includes('thought-content'), '脚本必须保护 thought-content 思考链正文');
  assert.ok(script.includes('skipCache'), '脚本必须包含 WeakMap 缓存加速');

  // 2. 动态沙箱执行断言
  function 创建模拟元素(tagName, attrs = {}, classes = [], parent = null) {
    const el = {
      nodeType: 1,
      tagName: tagName.toUpperCase(),
      attributes: { ...attrs },
      classList: {
        contains: (cls) => classes.includes(cls)
      },
      className: classes.join(' '),
      parentElement: parent,
      childNodes: [],
      getAttribute: (attr) => attrs[attr] || null,
      hasAttribute: (attr) => Boolean(attrs[attr]),
      setAttribute: (attr, val) => { attrs[attr] = val; }
    };
    if (parent && parent.childNodes) {
      parent.childNodes.push(el);
    }
    return el;
  }

  function 创建模拟文本节点(text, parent = null) {
    const node = {
      nodeType: 3,
      nodeValue: text,
      parentElement: parent
    };
    if (parent && parent.childNodes) {
      parent.childNodes.push(node);
    }
    return node;
  }

  const mockDocument = {
    body: 创建模拟元素('body', {}, []),
    readyState: 'complete',
    addEventListener: () => {}
  };
  const mockWindow = {
    document: mockDocument,
    MutationObserver: class {
      observe() {}
    }
  };

  const context = vm.createContext({
    window: mockWindow,
    document: mockDocument,
    MutationObserver: mockWindow.MutationObserver,
    WeakMap: WeakMap,
    WeakSet: WeakSet,
    Set: Set,
    RegExp: RegExp
  });

  vm.runInContext(script, context);

  const sandboxTranslate = mockWindow.__antigravity_translate_node__;
  assert.ok(typeof sandboxTranslate === 'function', '沙箱必须成功暴露 translateNode 函数');

  // 场景 1：用户提问气泡（带 group/user-input-step）中的 "Allow" 绝不应被翻译
  const userBubble = 创建模拟元素('div', {}, ['group/user-input-step'], mockDocument.body);
  const userText = 创建模拟文本节点('Allow', userBubble);
  sandboxTranslate(userBubble);
  assert.strictEqual(userText.nodeValue, 'Allow', '用户提问气泡内的英文 "Allow" 必须保持原样，不可被篡改');

  // 场景 2：用户历史消息（带 user-message）中的 "Allow" 绝不应被翻译
  const userMsg = 创建模拟元素('div', {}, ['user-message'], mockDocument.body);
  const userMsgText = 创建模拟文本节点('Allow', userMsg);
  sandboxTranslate(userMsg);
  assert.strictEqual(userMsgText.nodeValue, 'Allow', '用户消息 user-message 内的 "Allow" 必须保持原样');

  // 场景 3：富文本可编辑区域（contenteditable="true"）中的 "Allow" 绝不应被翻译
  const editor = 创建模拟元素('div', { contenteditable: 'true' }, ['input-area'], mockDocument.body);
  const editorText = 创建模拟文本节点('Allow', editor);
  sandboxTranslate(editor);
  assert.strictEqual(editorText.nodeValue, 'Allow', '输入框与富文本编辑区内的 "Allow" 必须保持原样');

  // 场景 4：AI 思考链展开正文容器（thought-content）中的自由英文绝不应被翻译
  const thoughtBox = 创建模拟元素('div', {}, ['thought-content'], mockDocument.body);
  const thoughtText = 创建模拟文本节点('Thought for 2s', thoughtBox);
  sandboxTranslate(thoughtBox);
  assert.strictEqual(thoughtText.nodeValue, 'Thought for 2s', '思考链展开正文必须保持原样');

  // 场景 5：普通 UI 按钮（非用户气泡内）中的 "Allow" 必须正确汉化为 "允许"
  const uiBtn = 创建模拟元素('button', {}, ['ant-btn'], mockDocument.body);
  const uiBtnText = 创建模拟文本节点('Allow', uiBtn);
  sandboxTranslate(uiBtn);
  assert.strictEqual(uiBtnText.nodeValue, '允许', '系统 UI 按钮中的 "Allow" 必须正确翻译为 "允许"');

  // 场景 6：思考过程触发药丸按钮中的 "Thought for 2s" 必须正确汉化为 "思考了 2s"
  const triggerBtn = 创建模拟元素('button', { 'data-testid': 'thinking-collapsible-trigger' }, [], mockDocument.body);
  triggerBtn.closest = (sel) => sel.includes('thinking-collapsible-trigger') ? triggerBtn : null;
  const triggerText = 创建模拟文本节点('Thought for 2s', triggerBtn);
  sandboxTranslate(triggerBtn);
  assert.strictEqual(triggerText.nodeValue, '思考了 2s', '思考折叠栏标题必须正确汉化为 "思考了 2s"');

  console.log('  ✔ [测试_用户对话气泡与思考链免疫] 通过 (气泡/输入框保护与 UI 汉化验证全部合格)');
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
    测试_动态模式与高频界面词条匹配,
    测试_用户对话气泡与思考链免疫
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
