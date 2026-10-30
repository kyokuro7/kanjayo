const { getHtml, sendJson, fail } = require('../lib/client');
const { parseBody } = require('../lib/scrape');

module.exports = async (req, res) => {
  const path = String(req.query.path || '/');
  const sel = String(req.query.sel || 'body');

  try {
    const html = await getHtml(path);
    sendJson(res, 200, { ok: true, path, selector: sel, htmlLength: html.length, sample: parseBody(html, sel) });
  } catch (e) {
    fail(res, e);
  }
};
