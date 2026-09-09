# Antigravity-Chinese - Google Antigravity 深度中文汉化工具

专为 **Google Antigravity 桌面端** 打造的轻量、规范、无歧义深度汉化补丁与自动化管理工具包。

---

## 特性

- **词条覆盖**：收录 740+ 界面词条，涵盖菜单导航、设置面板、Agent 行为规则、模型配额与安全沙盒策略。
- **动态模式匹配**：支持带数字徽章、状态参数与折叠箭头的动态文本匹配（如 `Files Changed 17 v`、`Ran 3 commands >`、`Worked for 51s`）。
- **进程管理与备份**：操作前自动退出运行中的应用以避免文件占用；首次注入自动备份原版（`app.asar.bak`），支持一键还原。
- **数据解耦与测试**：字典独立于 `data/dict.json`，便于扩展维护；配套自动化单元测试校验字典有效性与模板生成。
- **纯本地运行**：脚本直接解包与注入，不依赖后台服务及网络端口。

---

## 📂 项目结构

```
antigravity-chinese/
├── README.md                      # 项目说明与使用指南
├── LICENSE                        # MIT 开源许可证
├── package.json                   # Node.js 项目配置清单
├── install.bat                    # Windows 用户双击安装/更新补丁
├── restore.bat                    # Windows 用户双击还原官方英文原版
├── data\
│   └── dict.json                  # 汉化字典 (740+ 词条)
├── src\
│   ├── config.js                  # 路径定位与探测
│   ├── template.js                # 预加载注入脚本生成器
│   ├── injector.js                # 解包注入与打包
│   ├── restorer.js                # 官方原版还原器
│   └── cli.js                     # 命令行管理入口
└── test\
    └── translate.test.js          # 自动化单元测试套件
```

---

## 🚀 快速上手

### 1. 安装 / 更新汉化补丁
双击运行根目录下的 **`install.bat`**，或在终端运行：
```bash
npm start
# 或 node src/cli.js install
```

### 2. 还原官方英文原版
双击运行根目录下的 **`restore.bat`**，或在终端运行：
```bash
npm run restore
# 或 node src/cli.js restore
```

### 3. 执行单元测试
```bash
npm test
```

---

## ⚙️ 路径配置

脚本默认自动识别官方安装路径：
- Windows: `%LOCALAPPDATA%\Programs\antigravity` (`C:\Users\<用户名>\AppData\Local\Programs\antigravity`)

若安装在自定义目录，可通过设置环境变量 `ANTIGRAVITY_HOME` 指定路径：
```bash
# Windows CMD
set ANTIGRAVITY_HOME=D:\Software\antigravity

# PowerShell
$env:ANTIGRAVITY_HOME="D:\Software\antigravity"
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

---

## 🙏 鸣谢 (Acknowledgements)

本项目在词库建设与生态探索过程中，参考并吸收了社区优秀开源项目的贡献：
- [Antigravity-Chinese-Localization](https://github.com/liominsb/Antigravity-Chinese-Localization) (基于 MIT 协议) - 感谢原作者对 Antigravity 汉化生态做出的早期探索与词条贡献。

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 开源。

