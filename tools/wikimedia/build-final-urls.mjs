import { readFileSync, writeFileSync } from 'fs';

const raw = JSON.parse(readFileSync('d:/Hackathons/TrailsMate/scripts/wikimedia-raw.json', 'utf8'));

const skipPatterns = {
  'devbagh-backwaters': /ocypoda|dotilla/i,
  'tapola-shivsagar-lake': /helvetin|timber floating|mahabaleshwar/i,
  'sarasgad-fort': /burmannia/i,
  'sandhan-valley': /^dry snake/i,
  'kundalika-rafting-kolad': /konkan railway/i,
};

const extraTitles = {
  'anjaneri-fort': ['Anjaneri Fort.jpg', 'Anjaneri fort view.jpg'],
  'devbagh-backwaters': ['Devbagh.jpg'],
  'devkund-waterfall': ['Devkund Waterfall.JPG'],
  'harishchandragad-fort': ['Konkan Kada Harishchandragad.jpg', 'Harishchandragad.jpg'],
  'kamshet-paragliding': ['Paragliding in Kamshet.jpg', 'Kamshet.jpg'],
  'tapola-shivsagar-lake': ['Tapola lake.jpg', 'Tapola.jpg', 'Shivsagar Lake.jpg'],
  'vihigaon-waterfall': ['Vihigaon waterfall.jpg', 'Ashoka Waterfall.jpg', 'Vihigaon.jpg'],
  'kaas-plateau': ['Kaas Plateau.jpg'],
  'bhimashankar': ['Bhimashankar Temple.jpg'],
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function normalizeThumb(url) {
  // Wikimedia standard sizes: 1200 requests map to 1280px
  return url.replace(/\/\d+px-/, '/1280px-');
}

async function apiBatch(titles) {
  if (!titles.length) return {};
  const params = new URLSearchParams({
    action: 'query',
    titles: titles.map(t => 'File:' + t).join('|'),
    prop: 'imageinfo',
    iiprop: 'thumburl|url|size|mime',
    iiurlwidth: '1200',
    format: 'json'
  });
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch('https://commons.wikimedia.org/w/api.php?' + params, {
      headers: { 'User-Agent': 'TrailsMate/1.0 (educational project)' }
    });
    const text = await res.text();
    if (text.includes('too many requests')) {
      await sleep(5000 * (attempt + 1));
      continue;
    }
    const data = JSON.parse(text);
    const out = {};
    for (const p of Object.values(data.query?.pages || {})) {
      if (!p.imageinfo?.[0]?.thumburl) continue;
      const name = p.title.replace('File:', '');
      if (!p.imageinfo[0].mime?.startsWith('image/')) continue;
      if (/\.(svg|gif)$/i.test(name)) continue;
      out[name] = normalizeThumb(p.imageinfo[0].thumburl);
    }
    return out;
  }
  return {};
}

async function main() {
  const slugs = Object.keys(raw);
  const results = {};

  for (const slug of slugs) {
    const skip = skipPatterns[slug];
    let titles = [
      ...(extraTitles[slug] || []),
      ...(raw[slug] || []).map(i => i.title.replace('File:', ''))
    ];
    titles = [...new Set(titles)].filter(t => !skip || !skip.test(t));

    const urls = [];
    const seen = new Set();
    for (let i = 0; i < titles.length && urls.length < 3; i += 45) {
      const batch = titles.slice(i, i + 45);
      const thumbs = await apiBatch(batch);
      for (const t of batch) {
        const url = thumbs[t];
        if (url && !seen.has(url)) {
          seen.add(url);
          urls.push(url);
          if (urls.length >= 3) break;
        }
      }
      await sleep(800);
    }

    results[slug] = urls.length
      ? { primary: urls[0], gallery: urls.slice(1, 3) }
      : { primary: null, gallery: [], _titles: titles.slice(0, 5) };

    console.error(`${slug}: ${urls.length} urls`);
  }

  writeFileSync('d:/Hackathons/TrailsMate/scripts/wikimedia-output.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
}

main();
