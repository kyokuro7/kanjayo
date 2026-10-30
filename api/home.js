const { getHtml, sendJson, fail } = require('../lib/client');
const { parseList } = require('../lib/scrape');

module.exports = async (req, res) => {
  try {
    sendJson(res, 200, { ok: true, data: parseList(await getHtml('/')) });
  } catch (e) {
    fail(res, e);
  }
};
