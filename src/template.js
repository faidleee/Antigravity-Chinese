/**
 * TranslateGemini - 注入预加载脚本生成模板
 */

const INJECTION_MARKER = '// --- Antigravity Chinese Localization Injection ---';

function generateInjectionScript(dictionary) {
  const dictJson = JSON.stringify(dictionary, null, 2);

  return `
${INJECTION_MARKER}
(function() {
  const dictionary = ${dictJson};

  function translateText(text) {
    if (!text || typeof text !== 'string') return text;
    const trimmed = text.trim();
    if (!trimmed) return text;

    // 1. 严格全词字典匹配
    if (dictionary[trimmed]) {
      return text.replace(trimmed, dictionary[trimmed]);
    }

    // 2. 动态带参数/数字的模式匹配

    // "Subagents" / "Subagents 0"
    const subagentsMatch = /^Subagents(?:\\s+(\\d+))?(?:\\s*[>›])?$/i.exec(trimmed);
    if (subagentsMatch) {
      return text.replace(trimmed, subagentsMatch[1] !== undefined ? \`子 Agent \${subagentsMatch[1]}\` : '子 Agent');
    }

    // "Files Changed" / "Files Changed 17"
    const filesChangedHeaderMatch = /^(?:Files Changed|files changed)(?:\\s+(\\d+))?(?:\\s*[v˅>›])?$/i.exec(trimmed);
    if (filesChangedHeaderMatch) {
      return text.replace(trimmed, filesChangedHeaderMatch[1] !== undefined ? \`修改的文件 \${filesChangedHeaderMatch[1]}\` : '修改的文件');
    }

    // "Artifacts" / "Artifacts 26"
    const artifactsMatch = /^Artifacts(?:\\s+(\\d+))?(?:\\s*[>›])?$/i.exec(trimmed);
    if (artifactsMatch) {
      return text.replace(trimmed, artifactsMatch[1] !== undefined ? \`产物 \${artifactsMatch[1]}\` : '产物');
    }

    // "Background Tasks" / "Background Tasks 0"
    const bgTasksMatch = /^Background Tasks(?:\\s+(\\d+))?(?:\\s*[>›])?$/i.exec(trimmed);
    if (bgTasksMatch) {
      return text.replace(trimmed, bgTasksMatch[1] !== undefined ? \`后台任务 \${bgTasksMatch[1]}\` : '后台任务');
    }

    // "Skills Used" / "Skills Used 1"
    const skillsUsedMatch = /^Skills Used(?:\\s+(\\d+))?(?:\\s*[>›])?$/i.exec(trimmed);
    if (skillsUsedMatch) {
      return text.replace(trimmed, skillsUsedMatch[1] !== undefined ? \`所用技能 \${skillsUsedMatch[1]}\` : '所用技能');
    }

    // "Ran 3 commands" / "Ran 1 command"
    const ranCommandsMatch = /^Ran\\s+(\\d+)\\s+commands?(?:\\s*[>›])?$/i.exec(trimmed);
    if (ranCommandsMatch) {
      return text.replace(trimmed, \`运行了 \${ranCommandsMatch[1]} 条命令\`);
    }

    // "Media (Today 7:33 AM)" / "Media (Yesterday ...)"
    const mediaMatch = /^Media\\s+\\((.+)\\)$/i.exec(trimmed);
    if (mediaMatch) {
      let timeStr = mediaMatch[1].replace(/Today/gi, '今天').replace(/Yesterday/gi, '昨天');
      return text.replace(trimmed, \`媒体 (\${timeStr})\`);
    }

    // "See all (9)"
    const seeAllMatch = /^See all \\((\\d+)\\)$/i.exec(trimmed);
    if (seeAllMatch) {
      return text.replace(trimmed, \`查看全部 (\${seeAllMatch[1]})\`);
    }

    // "1 file changed" / "3 files changed"
    const filesChangedMatch = /^(\\d+)\\s+files?\\s+changed$/i.exec(trimmed);
    if (filesChangedMatch) {
      return text.replace(trimmed, \`\${filesChangedMatch[1]} 个文件已修改\`);
    }

    // "Worked for 39s" / "Worked for 1m"
    const workedForMatch = /^Worked for\\s+(.+?)(?:\\s*[v˅>›])?$/i.exec(trimmed);
    if (workedForMatch) {
      return text.replace(trimmed, \`耗时 \${workedForMatch[1]}\`);
    }

    // "Thought for 2s"
    const thoughtForMatch = /^Thought for\\s+(.+?)(?:\\s*[v˅>›])?$/i.exec(trimmed);
    if (thoughtForMatch) {
      return text.replace(trimmed, \`思考了 \${thoughtForMatch[1]}\`);
    }

    // "Learn more about Default"
    const learnMoreMatch = /^Learn more about\\s+(.+)$/i.exec(trimmed);
    if (learnMoreMatch) {
      return text.replace(trimmed, \`了解关于 \${learnMoreMatch[1]} 的更多信息\`);
    }

    return text;
  }

  // 免疫检测：判断节点是否处于可编辑区域、输入框或代码块中
  function isIgnoredNode(node) {
    if (!node) return false;
    let el = node.nodeType === 1 ? node : node.parentElement;
    if (!el) return false;

    while (el && el !== document.body) {
      // 1. 占位提示元素例外：若显式包含 placeholder，不跳过
      const className = typeof el.className === 'string' ? el.className : (el.className && el.className.baseVal ? el.className.baseVal : '');
      if (className && className.toLowerCase().includes('placeholder')) {
        return false;
      }

      // 2. 常见不可翻译标签（脚本、样式、输入控件、代码块）
      const tag = el.tagName ? el.tagName.toUpperCase() : '';
      if (['INPUT', 'TEXTAREA', 'SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(tag)) {
        return true;
      }

      // 3. 富文本可编辑区（聊天输入框 contenteditable="true" 或包含 isContentEditable）
      if (el.isContentEditable || (el.getAttribute && (el.getAttribute('contenteditable') === 'true' || el.getAttribute('contenteditable') === ''))) {
        return true;
      }

      // 4. 无障碍可编辑区域
      if (el.getAttribute && el.getAttribute('role') === 'textbox') {
        return true;
      }

      // 5. Monaco 代码编辑器、终端控制台及代码行
      if (className) {
        const lowerClass = className.toLowerCase();
        if (
          lowerClass.includes('monaco-editor') ||
          lowerClass.includes('view-lines') ||
          lowerClass.includes('view-line') ||
          lowerClass.includes('xterm') ||
          lowerClass.includes('terminal')
        ) {
          return true;
        }
      }

      el = el.parentElement || (el.parentNode && el.parentNode.host ? el.parentNode.host : null);
    }
    return false;
  }

  function translateNode(node) {
    if (!node) return;

    if (node.nodeType === 3) { // 文本节点
      // 如果属于输入区、代码区，严格禁止翻译
      if (isIgnoredNode(node)) return;

      const val = node.nodeValue;
      if (val) {
        const newVal = translateText(val);
        if (newVal !== val) {
          node.nodeValue = newVal;
        }
      }
    } else if (node.nodeType === 1) { // 元素节点
      // 先翻译 placeholder 与 title 属性（这些是 UI 提示信息）
      if (node.placeholder) {
        const newPh = translateText(node.placeholder);
        if (newPh !== node.placeholder) {
          node.placeholder = newPh;
        }
      }
      if (node.title) {
        const newTitle = translateText(node.title);
        if (newTitle !== node.title) {
          node.title = newTitle;
        }
      }

      // 如果当前元素本身属于输入框、编辑区或代码块，严禁进入其子节点进行翻译
      if (isIgnoredNode(node)) return;

      if (node.childNodes) {
        for (let i = 0; i < node.childNodes.length; i++) {
          translateNode(node.childNodes[i]);
        }
      }
      if (node.shadowRoot && node.shadowRoot.childNodes) {
        for (let i = 0; i < node.shadowRoot.childNodes.length; i++) {
          translateNode(node.shadowRoot.childNodes[i]);
        }
      }
    }
  }

  function startObserver() {
    if (!document.body) {
      setTimeout(startObserver, 50);
      return;
    }
    translateNode(document.body);

    const observer = new MutationObserver((mutations) => {
      for (let i = 0; i < mutations.length; i++) {
        const m = mutations[i];
        if (m.type === 'childList') {
          for (let j = 0; j < m.addedNodes.length; j++) {
            translateNode(m.addedNodes[j]);
          }
        } else if (m.type === 'characterData') {
          if (!isIgnoredNode(m.target)) {
            translateNode(m.target);
          }
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }
})();
`;
}

module.exports = {
  INJECTION_MARKER,
  generateInjectionScript
};
