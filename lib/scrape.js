const cheerio = require('cheerio');
const { BASE } = require('./client');

function text($el) {
  return ($el && $el.text ? $el.text() : '').replace(/\s+/g, ' ').trim();
}

function absUrl(href) {
  if (!href) return null;
  try {
    return new URL(href, BASE).toString();
  } catch {
    return null;
  }
}

function slugFromUrl(url) {
  if (!url) return null;
  const parts = url.split('/').filter(Boolean);
  return parts[parts.length - 1] || null;
}

function parseList(html) {
  const $ = cheerio.load(html);
  const items = [];

  $('.venz ul li .detpost, .col-anime, .animepost').each((i, el) => {
    const $el = $(el);
    const link = $el.find('a').first();
    const url = absUrl(link.attr('href'));
    if (!url) return;

    const title =
      text($el.find('.jdlflm, .tt, h2, h3').first()) ||
      link.attr('title') ||
      text(link);

    items.push({
      title: title || null,
      slug: slugFromUrl(url),
      url,
      thumb: absUrl($el.find('img').first().attr('src') || $el.find('img').first().attr('data-src')),
      episode: text($el.find('.epz, .ep').first()) || null,
      day: text($el.find('.epztipe, .newnime').first()) || null
    });
  });

  return items;
}

function parseDetail(html) {
  const $ = cheerio.load(html);

  const info = {};
  $('.infozingle p').each((i, el) => {
    const raw = text($(el));
    const idx = raw.indexOf(':');
    if (idx > -1) info[raw.slice(0, idx).trim().toLowerCase()] = raw.slice(idx + 1).trim();
  });

  const episodes = [];
  $('.episodelist ul li, .episodelist .epsi').each((i, el) => {
    const a = $(el).find('a').first();
    const url = absUrl(a.attr('href'));
    if (!url) return;
    episodes.push({
      title: text(a) || null,
      slug: slugFromUrl(url),
      url,
      date: text($(el).find('.zeebr').first()) || null
    });
  });

  return {
    title: text($('.jdlrx, .infozingle h1, h1').first()) || null,
    thumb: absUrl($('.fotoanime img').first().attr('src')),
    synopsis: text($('.sinopc, .sinopsis').first()) || null,
    info,
    episodes
  };
}

function parseEpisode(html) {
  const $ = cheerio.load(html);

  const streams = [];
  $('.responsive-player iframe, .player iframe, iframe').each((i, el) => {
    const src = $(el).attr('src');
    if (!src) return;
    const abs = absUrl(src);
    if (!abs) return;
    streams.push({ host: new URL(abs).hostname, url: abs });
  });

  const downloads = [];
  $('.download ul li').each((i, el) => {
    const $el = $(el);
    const links = [];
    $el.find('a').each((j, a) => {
      links.push({ provider: text($(a)) || null, url: $(a).attr('href') || null });
    });
    if (links.length) downloads.push({ quality: text($el.find('strong, b').first()) || null, links });
  });

  return {
    title: text($('h1.posttl, .posttl').first()) || null,
    streams,
    downloads,
    prev: absUrl($('a:contains("Sebelumnya")').first().attr('href')),
    next: absUrl($('a:contains("Selanjutnya")').first().attr('href'))
  };
}

function parseBody(html, selector) {
  const $ = cheerio.load(html);
  return $(selector).slice(0, 5).map((i, el) => {
    const $el = $(el);
    return { tag: el.tagName, class: $el.attr('class') || null, html: $.html($el).slice(0, 400) };
  }).get();
}

module.exports = { text, parseList, parseDetail, parseEpisode, parseBody };
