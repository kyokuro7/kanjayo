const { getHtml, sendJson, fail } = require('../lib/client');
const { parseList } = require('../lib/scrape');

module.exports = async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return sendJson(res, 400, { ok: false, error: 'query q wajib' });

  try {
    const html = await getHtml(`/?s=${encodeURIComponent(q)}&post_type=anime`);
    sendJson(res, 200, { ok: true, query: q, data: parseList(html) });
  } catch (e) {
    fail(res, e);
  }
};
