const { getHtml, sendJson, fail } = require('../lib/client');
const { parseList } = require('../lib/scrape');

module.exports = async (req, res) => {
  try {
    sendJson(res, 200, { ok: true, page: 1, data: parseList(await getHtml('/complete-anime/')) });
  } catch (e) {
    fail(res, e);
  }
};
