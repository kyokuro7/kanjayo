const { getHtml, sendJson, fail } = require('../../lib/client');
const { parseDetail } = require('../../lib/scrape');

module.exports = async (req, res) => {
  const slug = String(req.query.slug || '').trim();
  if (!slug) return sendJson(res, 400, { ok: false, error: 'slug wajib' });

  try {
    const data = parseDetail(await getHtml(`/anime/${slug}/`));
    if (!data.title) return sendJson(res, 404, { ok: false, error: 'anime tidak ditemukan' });
    sendJson(res, 200, { ok: true, data });
  } catch (e) {
    fail(res, e);
  }
};
