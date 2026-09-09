# Antigravity-Chinese - Google Antigravity 深度中文汉化工具

专为 **Google Antigravity 桌面端** 打造的轻量、规范、无歧义深度汉化补丁与自动化管理工具包。

---

## 🌟 核心特性

- **740+ 高频词条全量覆盖**：全量汉化菜单导航、系统偏好设置、Agent 行为规则、模型配额与额度、安全沙盒与权限策略、官方插件生态等核心文案。
- **纯本地运行，零端口占用**：摒弃后台常驻 Web 服务，双击批处理脚本 2 秒极速完成解包注入与封装，干净纯粹。
- **复合动态模式匹配**：内置独创的动态正则引擎，完美解决 `Files Changed 17 v`、`Ran 3 commands >`、`Worked for 51s` 等带数字徽章及折叠箭头的 DOM 难题。
- **防进程占用与安全备份**：注入前自动解除进程占用，首次运行自动创建官方纯正 `app.asar.bak` 备份，支持随时一键无损还原原生英文版。
- **独立 JSON 字典与测试护航**：数据与逻辑完全解耦，字典采用标准 `data/dict.json` 便于社区贡献 PR，配套 6 组自动化单元测试保障代码质量。

---

## 📂 项目结构

```
antigravity-chinese/
├── README.md                      # 项目说明与使用指南
├── LICENSE                        # MIT 开源许可证
├── package.json                   # Node.js 项目配置清单
├── install.bat                    # Windows 用户双击一键安装/更新汉化
├── restore.bat                    # Windows 用户双击一键还原官方英文原版
├── data\
│   └── dict.json                  # 标准化汉化字典 (740+ 精准词条)
├── src\
│   ├── config.js                  # 安装路径自动定位与探测
│   ├── template.js                # 预加载注入脚本与动态正则生成引擎
│   ├── injector.js                # 解包、补丁追加与重包流水线
│   ├── restorer.js                # 官方原生备份无损还原器
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

### 3. 执行单元测试
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

---

## 🙏 鸣谢 (Acknowledgements)

本项目在词库建设与生态探索过程中，参考并吸收了社区优秀开源项目的贡献：
- [Antigravity-Chinese-Localization](https://github.com/liominsb/Antigravity-Chinese-Localization) (基于 MIT 协议) - 感谢原作者对 Antigravity 汉化生态做出的早期探索与词条贡献。

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 开源。

