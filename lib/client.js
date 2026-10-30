const axios = require('axios');

const BASE = 'https://otakudesu.blog';

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  'Referer': BASE + '/',
  'Upgrade-Insecure-Requests': '1'
};

const cache = new Map();
const TTL = 5 * 60 * 1000;

let cloudscraper = null;
try {
  cloudscraper = require('cloudscraper');
} catch (_) {
  cloudscraper = null;
}

async function viaAxios(path) {
  const res = await axios.get(BASE + path, {
    headers: HEADERS,
    timeout: 20000,
    validateStatus: () => true
  });
  if (res.status >= 400) {
    const err = new Error(`HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.data;
}

async function viaCloudscraper(path) {
  if (!cloudscraper) {
    const err = new Error('cloudscraper tidak terpasang');
    err.status = 0;
    throw err;
  }
  try {
    return await cloudscraper.get(BASE + path, {
      headers: HEADERS,
      timeout: 20000
    });
  } catch (e) {
    const err = new Error(e.message || 'cloudscraper gagal');
    err.status = e.statusCode || 0;
    throw err;
  }
}

async function getHtml(path) {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < TTL) return hit.html;

  let html;
  try {
    html = await viaAxios(path);
  } catch (e) {
    const blocked = !e.status || e.status === 403 || e.status === 503 || e.status === 429;
    if (!blocked) throw e;
    html = await viaCloudscraper(path);
  }

  cache.set(path, { html, at: Date.now() });
  return html;
}

function sendJson(res, status, payload) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (status === 200) {
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
  } else {
    res.setHeader('Cache-Control', 'no-store');
  }
  res.status(status).send(JSON.stringify(payload));
}

function fail(res, e, fallback) {
  const status = e.status === 403 ? 502 : e.status && e.status >= 400 ? e.status : 500;
  sendJson(res, status, {
    ok: false,
    error: e.message || 'gagal ambil data',
    hint: e.status === 403 ? 'Cloudflare blokir request. Butuh cloudscraper/Puppeteer.' : fallback
  });
}

module.exports = { BASE, getHtml, sendJson, fail };
