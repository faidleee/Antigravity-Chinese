/**
 * TranslateGemini - 注入预加载脚本生成模板
 */

const INJECTION_MARKER = '// --- Antigravity Chinese Localization Injection ---';

function generateInjectionScript(dictionary) {
  const dictJson = JSON.stringify(dictionary, null, 2);

  return `
${INJECTION_MARKER}
(function() {
  if (typeof window !== 'undefined' && window.__ANTIGRAVITY_CHINESE_INJECTED__) return;
  if (typeof window !== 'undefined') {
    window.__ANTIGRAVITY_CHINESE_INJECTED__ = true;
  }

  const dictionary = ${dictJson};
  const skipCache = new WeakMap();
  const translatedNodes = new WeakSet();

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

  // 精准匹配代码编辑器、控制台与语法高亮类名
  const codeClassPattern = /(?:^|[\\s_-])(monaco-editor|editor-instance|hljs|shiki|prism|codemirror|line-content|gutter|codeblock|code-block|code-line|view-line|view-lines|xterm|terminal)(?:$|[\\s_-])/i;

  // 提及菜单 (@ Mentions) 分类白名单
  const MENTION_CATEGORIES = new Set([
    'Rules', '规则', 'Conversation', '对话', 'PDF Document', 'PDF 文档',
    'MCP Resource', 'MCP 资源', 'Browser Page', '浏览器页面', 'Browser Text', '浏览器文本',
    'Directory', '目录', 'Git Commit', 'Git 提交', 'Git Diff', 'Git 差异'
  ]);

  // 全层级免疫检测：严禁误杀用户输入框、用户提问气泡、思考链正文与代码块
  function isIgnoredNode(node) {
    if (!node) return true;
    const el = node.nodeType === 1 ? node : node.parentElement;
    if (!el) return false;

    // 1. WeakMap 记忆化缓存查询
    if (skipCache.has(el)) {
      return skipCache.get(el);
    }

    // 2. 占位提示元素例外：若显式包含 placeholder，放行汉化
    const className = typeof el.className === 'string' ? el.className : (el.className && el.className.baseVal ? el.className.baseVal : '');
    if (className && className.toLowerCase().includes('placeholder')) {
      skipCache.set(el, false);
      return false;
    }

    // 3. 基础不可翻译标签（脚本、样式、按键标签、代码、输入控件）
    const tag = el.tagName ? el.tagName.toUpperCase() : '';
    const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'KBD', 'SAMP', 'VAR', 'CODE', 'PRE', 'INPUT', 'TEXTAREA'];
    if (skipTags.includes(tag)) {
      // 特例放行：步骤执行药丸（Ran, Explored, Edited, Viewed, Thought, Thinking, Working 等）且不在用户提问气泡内
      const textContent = (el.innerText || el.textContent || '').trim();
      const isActionPill = textContent.length <= 25 && /^(Explored|Ran|Viewed|Edited|Thought|Thinking|Working)$/i.test(textContent);
      if (isActionPill) {
        let inUserBubble = false;
        let p = el;
        while (p && p !== document.body) {
          if (p.classList && (p.classList.contains('group/user-input-step') || p.classList.contains('user-message'))) {
            inUserBubble = true;
            break;
          }
          p = p.parentElement;
        }
        if (!inUserBubble) {
          skipCache.set(el, false);
          return false;
        }
      }
      skipCache.set(el, true);
      return true;
    }

    // 4. 特殊放行：折叠栏/思考触发按钮（如 "Thought for 4s"）必须放行汉化
    const isThinkingTrigger = el.closest && el.closest('button[data-testid="thinking-collapsible-trigger"]');
    if (isThinkingTrigger) {
      skipCache.set(el, false);
      return false;
    }

    // 5. 核心保护：斜杠命令与提及建议菜单的触发词标签（保持 /boost 等命令标识原样）
    const isMenuOptionLabel = el.closest && el.closest('[data-testid="menu-option-label"]');
    if (isMenuOptionLabel) {
      const labelText = (isMenuOptionLabel.innerText || isMenuOptionLabel.textContent || '').trim();
      if (MENTION_CATEGORIES.has(labelText)) {
        skipCache.set(el, false);
        return false;
      }
      skipCache.set(el, true);
      return true;
    }

    // 6. 向上递归检查祖先节点
    let cur = el;
    let shouldSkip = false;
    while (cur && cur !== document.body) {
      if (skipCache.has(cur)) {
        shouldSkip = skipCache.get(cur);
        break;
      }

      // A. 绝对核心防御：用户输入与提问气泡（用户发送的消息内容属于用户业务数据，绝对原样保留）
      if (cur.classList && (
        cur.classList.contains('group/user-input-step') ||
        cur.classList.contains('user-message') ||
        cur.classList.contains('user-turn') ||
        cur.classList.contains('user-query') ||
        cur.classList.contains('user-bubble') ||
        cur.classList.contains('chat-bubble-user') ||
        cur.classList.contains('cursor-edit') ||
        cur.classList.contains('cursor-text') ||
        cur.classList.contains('input-area') ||
        cur.classList.contains('chat-input')
      )) {
        shouldSkip = true;
        break;
      }

      // B. 核心防御：富文本可编辑区（聊天输入框正在输入时绝对原样保留）
      if (cur.isContentEditable || (cur.getAttribute && (
        cur.getAttribute('contenteditable') === 'true' ||
        cur.getAttribute('contenteditable') === '' ||
        cur.getAttribute('role') === 'textbox' ||
        cur.getAttribute('data-lexical-editor') === 'true'
      ))) {
        shouldSkip = true;
        break;
      }

      // C. 核心防御：AI 思考链展开正文容器（思考链自由推理流保持原文）
      if (cur.classList && (
        cur.classList.contains('thought-content') ||
        cur.classList.contains('thinking-content') ||
        cur.classList.contains('thought-box')
      )) {
        shouldSkip = true;
        break;
      }
      if (cur.parentElement && cur.parentElement.querySelector) {
        const trigger = cur.parentElement.querySelector(':scope > button[data-testid="thinking-collapsible-trigger"]');
        if (trigger && cur !== trigger && !trigger.contains(cur)) {
          shouldSkip = true;
          break;
        }
      }

      // D. 代码块、编辑器、终端、高亮容器
      if (cur.getAttribute && (
        cur.getAttribute('data-language') ||
        cur.getAttribute('data-code') ||
        cur.getAttribute('data-line') ||
        cur.getAttribute('data-line-number') ||
        cur.getAttribute('role') === 'code'
      )) {
        shouldSkip = true;
        break;
      }

      const curTag = cur.tagName ? cur.tagName.toUpperCase() : '';
      if (['PRE', 'CODE'].includes(curTag)) {
        shouldSkip = true;
        break;
      }

      if (cur.className && typeof cur.className === 'string') {
        if (codeClassPattern.test(cur.className)) {
          shouldSkip = true;
          break;
        }
      }

      cur = cur.parentElement || (cur.parentNode && cur.parentNode.host ? cur.parentNode.host : null);
    }

    skipCache.set(el, shouldSkip);
    return shouldSkip;
  }

  function translateNode(node) {
    if (!node) return;
    if (isIgnoredNode(node)) return;

    if (node.nodeType === 3) { // 文本节点
      if (translatedNodes.has(node)) return;
      const val = node.nodeValue;
      if (val) {
        const newVal = translateText(val);
        if (newVal !== val) {
          node.nodeValue = newVal;
          translatedNodes.add(node);
        } else if (!/[a-zA-Z]/.test(val)) {
          translatedNodes.add(node);
        }
      }
    } else if (node.nodeType === 1) { // 元素节点
      // 先翻译 placeholder、title 与 aria-label 属性（这些是 UI 提示信息）
      ['placeholder', 'title', 'aria-label'].forEach(attr => {
        if (node.hasAttribute && node.hasAttribute(attr)) {
          const original = node.getAttribute(attr);
          if (original) {
            const translated = translateText(original);
            if (original !== translated) {
              node.setAttribute(attr, translated);
            }
          }
        }
      });

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

  if (typeof window !== 'undefined') {
    window.__antigravity_translate_node__ = translateNode;
  }

  function startObserver() {
    if (typeof document === 'undefined' || !document.body) {
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

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', startObserver);
    } else {
      startObserver();
    }
  }
})();
`;
}

module.exports = {
  INJECTION_MARKER,
  generateInjectionScript
};
