# TranslateGemini - Google Antigravity 中文汉化增强工程

专为 **Google Antigravity 桌面端应用** 打造的无歧义精准汉化补丁与工程化工具包。

---

## 🌟 项目特性

- **零误伤严格匹配**：采用剥离头尾空白的全词/全句精准映射算法，杜绝正则通配造成的误伤与排版歧义。
- **沙盒安全兼容**：纯 JavaScript DOM 运行时动态拦截，深度支持 Shadow DOM 穿透与 Chromium 安全沙盒隔离。
- **一键安装与还原**：双击即可完成安全注入或一键恢复官方原生英文版本。
- **结构化字典**：内置 240+ 核心界面词条，支持随时在 `data/dict.json` 中扩展自定义翻译。
- **未翻译词条收集器**：可自动提取用户在软件中触碰到的未翻译英文句子。

---

## 📂 项目结构

```
D:\Project\TranslateGemini\
├── README.md                      # 本说明文档
├── package.json                   # Node.js 项目清单
├── install.bat                    # 双击一键安装汉化
├── restore.bat                    # 双击一键还原原版
├── data\
│   └── dict.json                  # 标准化汉化字典 (240+ 词条)
├── src\
│   ├── config.js                  # 路径定位与自适应探测
│   ├── template.js                # 注入预加载模板引擎
│   ├── injector.js                # 核心注入与重包器
│   ├── restorer.js                # 官方原版还原器
│   ├── collector.js               # 词条扫描提取器
│   └── cli.js                     # 命令行管理入口
└── test\
    └── translate.test.js          # 自动化单元测试套件
```

---

## 🚀 快速上手

### 1. 安装 / 更新汉化补丁
双击运行项目根目录下的 **`install.bat`**。  
或者在终端中运行：
```bash
npm start
# 或
node src/cli.js install
```

### 2. 还原官方英文原版
双击运行项目根目录下的 **`restore.bat`**。  
或者在终端中运行：
```bash
npm run restore
# 或
node src/cli.js restore
```

### 3. 查看扫描未翻译词条
如果开启过收集模式，可以运行以下命令扫描本地捕获的未翻译句子：
```bash
npm run collect
```

### 4. 执行单元测试
```bash
npm test
```

---

## 📝 自定义与扩展词条

如果您在使用过程中发现新的未翻译英文菜单，只需用文本编辑器打开：
👉 `data/dict.json`

在末尾添加对应的键值对：
```json
{
  "Your English Term": "您的中文翻译"
}
```
保存后，双击运行 `install.bat` 重新应用即可！

---

## 🛡️ 安全与备份机制

在每次执行汉化注入前，工具会自动对原生 `app.asar` 进行备份（保存为 `app.asar.bak`），确保任何情况下都能无损一键还原官方状态。
