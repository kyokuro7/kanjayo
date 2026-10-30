const { getHtml, sendJson, fail } = require('../../lib/client');
const { parseEpisode } = require('../../lib/scrape');

module.exports = async (req, res) => {
  const slug = String(req.query.slug || '').trim();
  if (!slug) return sendJson(res, 400, { ok: false, error: 'slug wajib' });

  try {
    const data = parseEpisode(await getHtml(`/episode/${slug}/`));
    if (!data.title && data.streams.length === 0) {
      return sendJson(res, 404, { ok: false, error: 'episode tidak ditemukan' });
    }
    sendJson(res, 200, { ok: true, data });
  } catch (e) {
    fail(res, e);
  }
};
