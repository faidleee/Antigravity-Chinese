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
    const subagentsMatch = /^Subagents(?:\\s+(\\d+))?$/i.exec(trimmed);
    if (subagentsMatch) {
      return text.replace(trimmed, subagentsMatch[1] !== undefined ? \`子 Agent \${subagentsMatch[1]}\` : '子 Agent');
    }

    // "Files Changed" / "Files Changed 17"
    const filesChangedHeaderMatch = /^Files Changed(?:\\s+(\\d+))?$/i.exec(trimmed);
    if (filesChangedHeaderMatch) {
      return text.replace(trimmed, filesChangedHeaderMatch[1] !== undefined ? \`修改的文件 \${filesChangedHeaderMatch[1]}\` : '修改的文件');
    }

    // "Artifacts" / "Artifacts 26"
    const artifactsMatch = /^Artifacts(?:\\s+(\\d+))?$/i.exec(trimmed);
    if (artifactsMatch) {
      return text.replace(trimmed, artifactsMatch[1] !== undefined ? \`产物 \${artifactsMatch[1]}\` : '产物');
    }

    // "Background Tasks" / "Background Tasks 0"
    const bgTasksMatch = /^Background Tasks(?:\\s+(\\d+))?$/i.exec(trimmed);
    if (bgTasksMatch) {
      return text.replace(trimmed, bgTasksMatch[1] !== undefined ? \`后台任务 \${bgTasksMatch[1]}\` : '后台任务');
    }

    // "Skills Used" / "Skills Used 1"
    const skillsUsedMatch = /^Skills Used(?:\\s+(\\d+))?$/i.exec(trimmed);
    if (skillsUsedMatch) {
      return text.replace(trimmed, skillsUsedMatch[1] !== undefined ? \`所用技能 \${skillsUsedMatch[1]}\` : '所用技能');
    }

    // "Ran 3 commands" / "Ran 1 command"
    const ranCommandsMatch = /^Ran\\s+(\\d+)\\s+commands?$/i.exec(trimmed);
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
    const workedForMatch = /^Worked for\\s+(.+)$/i.exec(trimmed);
    if (workedForMatch) {
      return text.replace(trimmed, \`耗时 \${workedForMatch[1]}\`);
    }

    // "Thought for 2s"
    const thoughtForMatch = /^Thought for\\s+(.+)$/i.exec(trimmed);
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

  function translateNode(node) {
    if (!node) return;
    if (node.nodeType === 3) { // 文本节点
      const val = node.nodeValue;
      if (val) {
        const newVal = translateText(val);
        if (newVal !== val) {
          node.nodeValue = newVal;
        }
      }
    } else if (node.nodeType === 1) { // 元素节点
      const tag = node.tagName ? node.tagName.toUpperCase() : '';
      if (['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT'].includes(tag)) return;

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
          translateNode(m.target);
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
