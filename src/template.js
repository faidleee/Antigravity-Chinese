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

    // 严格全词字典匹配
    if (dictionary[trimmed]) {
      return text.replace(trimmed, dictionary[trimmed]);
    }

    // 动态模式匹配（如 "See all (9)"）
    const seeAllMatch = /^See all \\((\\d+)\\)$/i.exec(trimmed);
    if (seeAllMatch) {
      return text.replace(trimmed, \`查看全部 (\${seeAllMatch[1]})\`);
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
