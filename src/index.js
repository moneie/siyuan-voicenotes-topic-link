import { Plugin, fetchPost, showMessage } from 'siyuan';

const TOPIC_PATTERN = /\[\[([^\[\]\r\n]+)\]\]/g;

export default class VoiceNotesTopicLinkPlugin extends Plugin {
  onload() {
    this.eventBus.on('paste', this.handlePaste);
    console.log('[VoiceNotes Topic Link 0.1.4] loaded; paste listener registered');
    showMessage('VoiceNotes 主题双链转换已启动（0.1.4）', 4000);
  }

  onunload() {
    this.eventBus.off('paste', this.handlePaste);
  }

  handlePaste = async (event) => {
    const detail = event?.detail;
    if (!detail || typeof detail.resolve !== 'function') return;

    const plain = typeof detail.textPlain === 'string' ? detail.textPlain : '';
    const html = typeof detail.textHTML === 'string' ? detail.textHTML : '';
    let original = plain;
    let sourceKind = '纯文本';

    if (!original.includes('[[') && html.includes('[[')) {
      try {
        const parsed = new DOMParser().parseFromString(html, 'text/html');
        original = parsed.body?.innerText || parsed.body?.textContent || '';
        sourceKind = '富文本';
      } catch (error) {
        console.warn('[VoiceNotes Topic Link] unable to read HTML clipboard', error);
      }
    }

    const topics = [...original.matchAll(TOPIC_PATTERN)]
      .map((m) => m[1].trim())
      .filter(Boolean);
    if (topics.length === 0) return;

    event.preventDefault();
    showMessage(`VoiceNotes 双链：检测到 ${topics.length} 个主题标记（${sourceKind}），正在匹配…`, 4000);

    try {
      const replacements = new Map();
      const notFound = [];
      const ambiguous = [];

      for (const topic of [...new Set(topics)]) {
        const matches = await this.findExactTitle(topic);
        if (matches.length === 1 && matches[0]?.id) {
          replacements.set(topic, `((${matches[0].id} "${this.escapeRefTitle(topic)}"))`);
        } else if (matches.length === 0) {
          notFound.push(topic);
        } else {
          ambiguous.push(topic);
        }
      }

      const transformed = original.replace(TOPIC_PATTERN, (whole, rawTitle) => {
        const title = rawTitle.trim();
        return replacements.get(title) || whole;
      });

      detail.resolve({ textPlain: transformed });

      const notes = [];
      if (replacements.size) notes.push(`转换 ${replacements.size} 个`);
      if (notFound.length) notes.push(`未找到 ${notFound.length} 个`);
      if (ambiguous.length) notes.push(`重名 ${ambiguous.length} 个`);
      showMessage(`VoiceNotes 双链结果：${notes.join('；') || '没有可转换的主题'}`, 5000);
      if (notFound.length) console.info('[VoiceNotes Topic Link] titles not found:', notFound);
      if (ambiguous.length) console.info('[VoiceNotes Topic Link] ambiguous titles:', ambiguous);
    } catch (error) {
      console.error('[VoiceNotes Topic Link] paste conversion failed', error);
      detail.resolve({ textPlain: original });
      showMessage('VoiceNotes 双链转换失败，已按原文粘贴。请查看开发者工具控制台。', 6000, 'error');
    }
  };

  escapeRefTitle(title) {
    return String(title)
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/[\r\n]/g, ' ');
  }

  async findExactTitle(title) {
    const safeTitle = String(title).replace(/'/g, "''");
    const stmt = `SELECT id, content FROM blocks WHERE type = 'd' AND content = '${safeTitle}' LIMIT 3`;
    return await new Promise((resolve, reject) => {
      let settled = false;
      const timer = setTimeout(() => {
        if (!settled) {
          settled = true;
          reject(new Error('查询主题超时'));
        }
      }, 8000);
      fetchPost('/api/query/sql', { stmt }, (response) => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        if (!response || response.code !== 0 || !Array.isArray(response.data)) {
          reject(new Error(response?.msg || '查询主题失败'));
          return;
        }
        resolve(response.data.map((row) => ({ id: row.id, title: row.content })));
      });
    });
  }
}
