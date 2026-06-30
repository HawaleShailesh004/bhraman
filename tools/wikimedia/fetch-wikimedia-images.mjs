import { writeFileSync, readFileSync, existsSync } from 'fs';

const places = [
  'ajanta-caves', 'andharban-forest', 'anjaneri-fort', 'bhandardara-arthur-lake', 'bhivpuri-waterfall',
  'bhimashankar', 'daulatabad-fort', 'devbagh-backwaters', 'devkund-waterfall', 'ellora-caves',
  'ganpatipule-beach', 'hadsar-fort', 'harihar-fort', 'harishchandragad-fort', 'kaas-plateau',
  'kalsubai-peak', 'kamshet-paragliding', 'karla-caves-lonavala', 'karnala-fort', 'korigad-fort',
  'kothaligad-fort', 'kundalika-rafting-kolad', 'lenyadri-caves', 'lohagad-fort', 'mahuli-fort',
  'malshej-ghat', 'naneghat-pass', 'panchgani-paragliding', 'panhala-fort', 'pawna-lake',
  'prabalgad-kalavantin', 'raigad-fort', 'rajgad-fort', 'rajmachi-fort', 'ratangad-fort',
  'salher-fort', 'sandhan-valley', 'sarasgad-fort', 'shivneri-fort', 'sinhagad-fort',
  'sudhagad-fort', 'tapola-shivsagar-lake', 'tarkarli-coast', 'thoseghar-waterfall', 'tikona-fort',
  'torna-fort', 'tungareshwar-sanctuary', 'vasota-fort', 'vihigaon-waterfall', 'visapur-fort'
];

const searchTerms = {
  'ajanta-caves': ['Ajanta Caves', 'Ajanta cave painting'],
  'andharban-forest': ['Andharban', 'Andharban forest trek'],
  'anjaneri-fort': ['Anjaneri fort', 'Anjaneri hill'],
  'bhandardara-arthur-lake': ['Arthur Lake Bhandardara', 'Bhandardara lake'],
  'bhivpuri-waterfall': ['Bhivpuri waterfall', 'Bhivpuri'],
  'bhimashankar': ['Bhimashankar temple', 'Bhimashankar wildlife'],
  'daulatabad-fort': ['Daulatabad fort', 'Devagiri fort'],
  'devbagh-backwaters': ['Devbagh Karwar', 'Devbagh beach Karnataka'],
  'devkund-waterfall': ['Devkund waterfall', 'Devkund Maharashtra'],
  'ellora-caves': ['Ellora Caves', 'Kailasa temple Ellora'],
  'ganpatipule-beach': ['Ganpatipule beach', 'Ganpatipule temple'],
  'hadsar-fort': ['Hadsar fort', 'Hadsar Maharashtra'],
  'harihar-fort': ['Harihar fort', 'Harihar gad'],
  'harishchandragad-fort': ['Harishchandragad', 'Konkan Kada'],
  'kaas-plateau': ['Kaas plateau', 'Kaas pathar'],
  'kalsubai-peak': ['Kalsubai peak', 'Kalsubai temple'],
  'kamshet-paragliding': ['Kamshet', 'Kamshet paragliding'],
  'karla-caves-lonavala': ['Karla caves', 'Karla Buddhist caves'],
  'karnala-fort': ['Karnala fort', 'Karnala bird sanctuary'],
  'korigad-fort': ['Korigad fort', 'Korigad'],
  'kothaligad-fort': ['Kothaligad fort', 'Peth fort Maharashtra'],
  'kundalika-rafting-kolad': ['Kundalika river', 'Kolad Maharashtra'],
  'lenyadri-caves': ['Lenyadri caves', 'Girijatmaj Lenyadri'],
  'lohagad-fort': ['Lohagad fort', 'Lohagad'],
  'mahuli-fort': ['Mahuli fort', 'Mahuli Maharashtra'],
  'malshej-ghat': ['Malshej Ghat', 'Malshej'],
  'naneghat-pass': ['Naneghat', 'Naneghat pass'],
  'panchgani-paragliding': ['Panchgani', 'Table Land Panchgani'],
  'panhala-fort': ['Panhala fort', 'Panhala Kolhapur'],
  'pawna-lake': ['Pawna lake', 'Pawna dam'],
  'prabalgad-kalavantin': ['Kalavantin Durg', 'Prabalgad fort'],
  'raigad-fort': ['Raigad fort', 'Raigad Maharashtra'],
  'rajgad-fort': ['Rajgad fort', 'Rajgad Pune'],
  'rajmachi-fort': ['Rajmachi fort', 'Rajmachi'],
  'ratangad-fort': ['Ratangad fort', 'Ratangad'],
  'salher-fort': ['Salher fort', 'Salher Maharashtra'],
  'sandhan-valley': ['Sandhan valley', 'Sandhan valley trek'],
  'sarasgad-fort': ['Sarasgad fort', 'Sarasgad'],
  'shivneri-fort': ['Shivneri fort', 'Shivneri Junnar'],
  'sinhagad-fort': ['Sinhagad fort', 'Sinhagad'],
  'sudhagad-fort': ['Sudhagad fort', 'Sudhagad'],
  'tapola-shivsagar-lake': ['Tapola lake', 'Shivsagar lake Tapola'],
  'tarkarli-coast': ['Tarkarli beach', 'Tarkarli'],
  'thoseghar-waterfall': ['Thoseghar waterfall', 'Thoseghar'],
  'tikona-fort': ['Tikona fort', 'Tikona'],
  'torna-fort': ['Torna fort', 'Torna Maharashtra'],
  'tungareshwar-sanctuary': ['Tungareshwar wildlife sanctuary', 'Tungareshwar'],
  'vasota-fort': ['Vasota fort', 'Vyaghragad'],
  'vihigaon-waterfall': ['Vihigaon waterfall', 'Ashoka waterfall Vihigaon'],
  'visapur-fort': ['Visapur fort', 'Visapur']
};

const OUT = 'd:/Hackathons/TrailsMate/scripts/wikimedia-raw.json';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function to1200pxUrl(thumburl) {
  return thumburl.replace(/\/\d+px-/, '/1200px-');
}

async function apiFetch(params, retries = 5) {
  const url = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams(params);
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, { headers: { 'User-Agent': 'TrailsMate/1.0 (educational; contact@example.com)' } });
    const text = await res.text();
    if (text.startsWith('You are making')) {
      const wait = 5000 * (i + 1);
      console.error(`Rate limited, waiting ${wait}ms...`);
      await sleep(wait);
      continue;
    }
    try {
      return JSON.parse(text);
    } catch {
      console.error('Bad JSON:', text.slice(0, 100));
      await sleep(3000);
    }
  }
  throw new Error('API failed after retries');
}

async function searchImages(term) {
  const data = await apiFetch({
    action: 'query',
    generator: 'search',
    gsrsearch: term,
    gsrnamespace: '6',
    gsrlimit: '15',
    prop: 'imageinfo',
    iiprop: 'url|thumburl|size|mime',
    iiurlwidth: '1200',
    format: 'json'
  });
  const pages = data.query?.pages || {};
  return Object.values(pages)
    .filter(p => p.imageinfo?.[0]?.thumburl && p.imageinfo[0].mime?.startsWith('image/'))
    .filter(p => !/\.(svg|gif)$/i.test(p.title))
    .map(p => ({
      title: p.title,
      thumburl: to1200pxUrl(p.imageinfo[0].thumburl)
    }));
}

async function verifyUrl(url) {
  try {
    const res = await fetch(url, { method: 'HEAD', headers: { 'User-Agent': 'TrailsMate/1.0' } });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  let raw = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};

  for (const slug of places) {
    if (raw[slug]?.length >= 3) {
      console.error(`${slug}: cached (${raw[slug].length})`);
      continue;
    }
    const terms = searchTerms[slug] || [slug.replace(/-/g, ' ')];
    const seen = new Set((raw[slug] || []).map(i => i.title));
    const all = [...(raw[slug] || [])];

    for (const term of terms) {
      console.error(`Searching ${slug}: "${term}"`);
      const images = await searchImages(term);
      for (const img of images) {
        if (!seen.has(img.title)) {
          seen.add(img.title);
          all.push(img);
        }
      }
      await sleep(1200);
      if (all.length >= 5) break;
    }
    raw[slug] = all;
    writeFileSync(OUT, JSON.stringify(raw, null, 2));
    console.error(`${slug}: total ${all.length}`);
    await sleep(800);
  }

  const results = {};
  for (const slug of places) {
    const images = raw[slug] || [];
    const verified = [];
    for (const img of images) {
      if (await verifyUrl(img.thumburl)) {
        verified.push(img);
        if (verified.length >= 3) break;
      }
      await sleep(100);
    }
    results[slug] = verified.length > 0
      ? { primary: verified[0].thumburl, gallery: verified.slice(1, 3).map(i => i.thumburl), _titles: verified.map(i => i.title) }
      : { primary: null, gallery: [], _missing: true, _candidates: images.slice(0, 3).map(i => i.title) };
    console.error(`${slug}: verified ${verified.length}`);
  }

  writeFileSync('d:/Hackathons/TrailsMate/scripts/wikimedia-final.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
