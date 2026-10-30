const { sendJson } = require('../lib/client');

module.exports = (req, res) => {
  sendJson(res, 200, {
    ok: true,
    endpoints: [
      'GET /api/home',
      'GET /api/ongoing',
      'GET /api/complete',
      'GET /api/search?q=jujutsu',
      'GET /api/anime/:slug',
      'GET /api/episode/:slug',
      'GET /api/debug?path=/ongoing-anime/&sel=.venz ul li'
    ]
  });
};
