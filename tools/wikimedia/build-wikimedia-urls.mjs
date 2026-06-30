import { readFileSync, writeFileSync } from 'fs';
import crypto from 'crypto';

const raw = JSON.parse(readFileSync('d:/Hackathons/TrailsMate/scripts/wikimedia-raw.json', 'utf8'));

// Curated preferred file titles per slug (location-specific, skip irrelevant)
const preferred = {
  'ajanta-caves': ['Ajanta caves panorama 2010.jpg', 'Ajanta Caves, India, Panoramic view of Ajanta basalt cliffs and caves.jpg', 'Cave 26, Ajanta.jpg'],
  'andharban-forest': ['AndharBan valley.jpg', 'Andharban Forest.jpg', 'Andharban Jungle Valley Pune.jpg'],
  'anjaneri-fort': ['Anjaneri Fort.jpg', 'Anjaneri fort.jpg', 'Anjaneri hill.jpg'],
  'bhandardara-arthur-lake': ['Bhandardara Lake.jpg', 'Arthur Lake.jpg', 'Arthur Lake.JPG'],
  'bhivpuri-waterfall': ['Bhivpuri-Waterfall.jpg', 'Bhivpuri waterfall.jpg'],
  'bhimashankar': ['Bhimashankar.jpg', 'Bhimashankar Temple.jpg', 'Bhimashankar Wildlife Sanctuary.jpg'],
  'daulatabad-fort': ['Daulatabad Fort vrvbajel0924 (248).jpg', 'Daulatabad Fort.jpg', 'Daulatabad fort.jpg'],
  'devbagh-backwaters': ['Devbagh.jpg', 'Devbagh Beach.jpg'],
  'devkund-waterfall': ['Devkund Waterfall.JPG', 'Devkund waterfall Maharashtra.jpg'],
  'ellora-caves': ['Ellora Caves, India, Kailasanatha Temple 2.jpg', 'Ellora cave 16.jpg', 'Kailasa temple, Ellora.jpg'],
  'ganpatipule-beach': ['Ganpatipule - panoramio.jpg', 'Ganpatipule sea (4).jpg', 'Ganpatipule Beach.jpg'],
  'hadsar-fort': ['Hadsar fort.jpg', 'Hadsar1.jpg', 'Hadsar3.jpg'],
  'harihar-fort': ['Harihar fort 1.jpg', 'Hariharfort.jpg', 'Harihar - First Views (11253834036).jpg'],
  'harishchandragad-fort': ['Konkan kada.jpg', 'Harishchandragad Konkan Kada.jpg', 'Kalbhairav pinnacle Scj.jpg'],
  'kaas-plateau': ['Kas plateau.JPG', 'Kaas Plateau.jpg', 'Impatiens Lawii Kaas Plateau (107933135).jpeg'],
  'kalsubai-peak': ['Kalsubai summit.jpg', 'Kalasubai top temple.jpg', 'Kalasubai from base.jpg'],
  'kamshet-paragliding': ['Paragliding in Kamshet.jpg', 'Kamshet paragliding.jpg', 'Near Kamshet 2 tunnel on Mumbai Pune Expressway.JPG'],
  'karla-caves-lonavala': ['Entrance of Karla Caves.jpg', 'KARLA\'S CAVES.JPG', 'Karla Caves - 2025 - 02.jpg'],
  'karnala-fort': ['Karnala fort 2.jpg', 'Karnala fort walls.jpg', 'Karnala fort bastion.jpg'],
  'korigad-fort': ['Korigad Fort 20180923 135720.jpg', 'Korigad Fort 20180923 135817.jpg', 'Korigad sometimes.jpg'],
  'kothaligad-fort': ['Kothaligad with Cannon gun.JPG', 'Citadel of Peth Fort (Kothaligad) in Western Ghats.png', 'Flora near Peth Fort (Kothaligad) in Western Ghats.jpg'],
  'kundalika-rafting-kolad': ['River Kundalika By Anis Shaikh 12.jpg', 'Kundalika river.jpg', 'Kolad Maharashtra.jpg'],
  'lenyadri-caves': ['Lenyadri Group Of Caves.JPG', 'Lenyadri interior.jpg', 'Lenyadri crop.jpg'],
  'lohagad-fort': ['Lohagad Fort.jpg', 'Lohagad fort in August.JPG', 'Lohagad fort N-MH-M8-6.JPG'],
  'mahuli-fort': ['Mahuli fort.jpg', 'Mahuli Fort From Pivali End.JPG', 'Mahuli Fort View From Pivali Village.JPG'],
  'malshej-ghat': ['Malshej Hills.jpg', 'NH222 Highway through Malshej Ghat Maharashtra India.jpg', 'Malshej Ghat.jpg'],
  'naneghat-pass': ['Naneghat Junnar Pune (1) 01.jpg', 'Naneghat Junnar Pune (1) 05.jpg', 'Naneghat Junnar Pune (1) 06.jpg'],
  'panchgani-paragliding': ['Panchghani Hill.jpg', 'Table Land Panchgani.jpg', 'Panchgani.jpg'],
  'panhala-fort': ['Panhala vaghdarwaja.jpg', 'Remotest Rampart on Panhala.jpg', 'Bajiprabhu Deshpande Statue in Panhala Fort.JPG'],
  'pawna-lake': ['Beautiful view at Pawna Lake, Lonavala.jpg', 'Pawna Lake near Lohagadh Fort by NishantAChavan.JPG', 'Pawna lake as seen from Lohagadh Fort,Pune.JPG'],
  'prabalgad-kalavantin': ['Kalavantinicha Durga.jpg', '... Kalavantin from Prabalgad (7544768190).jpg', '... Kalavantin and Prabalgad (6781298373).jpg'],
  'raigad-fort': ['Raigad fort towers.jpg', 'Raigad-fort-entrance.jpg', 'Shivaji Maharaj Raigad.jpg'],
  'rajgad-fort': ['Rajgad after monsoon.jpg', 'One rajgad gate.jpg', 'Rajgad 2012.JPG'],
  'rajmachi-fort': ['Rajmachi Fort.JPG', 'RajmachiView from Trek Point.JPG', 'RajmachiView from Rajmachi Village.JPG'],
  'ratangad-fort': ['Ratangad entrance.jpg', 'Ratangad fort.jpg', 'Chor Darwaza.jpg'],
  'salher-fort': ['Salher Fort.jpg', 'Salher fort.jpg', 'Salher Fort KADA.jpg'],
  'sandhan-valley': ['Sandan3.jpg', 'Welcome to Vally of Shadow...!.jpg', 'Sandhan valley.jpg'],
  'sarasgad-fort': ['... fort entrance of Sarasgad (5025627374).jpg', 'Sarasgad fort.jpg', 'Sunsetviewpali.jpg'],
  'shivneri-fort': ['Shivneri Fort.jpg', 'Shivneri Fort3 by Bajirao Nawale.jpg', 'Trupti Sarode 2 Kadelot point at Shivneri fort.jpg'],
  'sinhagad-fort': ['Sinhagad Fort (47642).jpg', 'Sinhagad Fort (25824).jpg', 'Sinhagad Fort (90210).jpg'],
  'sudhagad-fort': ['Sudhagad entrance.jpg', 'Chor vaat sudhagad.jpg', 'Sudhagad fort.jpg'],
  'tapola-shivsagar-lake': ['Tapola lake.jpg', 'Shivsagar Lake Tapola.jpg', 'Tapola.jpg'],
  'tarkarli-coast': ['Tarkarli beach.JPG', 'Tarkarli Beach.JPG', 'Beaches in India, Tarkarli Maharashtra 2012.jpg'],
  'thoseghar-waterfall': ['Thoseghar Waterfalls - Satara, Pune.jpg', 'Thoseghar waterfall.jpg', 'Monsoon Waterfall.jpg'],
  'tikona-fort': ['Tikona fort.jpg', 'Tikona fort ramparts.jpg', 'Tikona-fort-rain.JPG'],
  'torna-fort': ['Torna Fort.JPG', 'Torna entrance.jpg', 'Torna Fort.png'],
  'tungareshwar-sanctuary': ['Tungareshwar Wildlife Sanctuary (28673818300).jpg', 'Tungareshwar Wildlife Sanctuary (28883262071).jpg', 'Tungareshwar Wildlife Sanctuary (28343357103).jpg'],
  'vasota-fort': ['Vasota.jpg', 'View from vasota fort.jpg', 'Vasota fort.jpg'],
  'vihigaon-waterfall': ['Vihigaon waterfall.jpg', 'Ashoka waterfall.jpg', 'Vihigaon.jpg'],
  'visapur-fort': ['Visapur Fort.JPG', 'Visapur fort Ramparts.JPG', 'Visapur.JPG']
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function md5Path(filename) {
  const hash = crypto.createHash('md5').update(filename).digest('hex');
  return `${hash[0]}/${hash.slice(0, 2)}`;
}

function toThumb1200(filename) {
  const encoded = encodeURIComponent(filename).replace(/%20/g, '_').replace(/'/g, '%27');
  // Wikimedia uses underscores in URLs
  const wikiName = filename.replace(/ /g, '_');
  const path = md5Path(wikiName);
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${encodeURIComponent(wikiName).replace(/%2F/g, '/')}/1200px-${encodeURIComponent(wikiName).replace(/%2F/g, '/')}`;
}

async function getThumbViaApi(titles) {
  const data = await fetch('https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
    action: 'query',
    titles: titles.map(t => 'File:' + t).join('|'),
    prop: 'imageinfo',
    iiprop: 'thumburl|url|size|mime',
    iiurlwidth: '1200',
    format: 'json'
  }), { headers: { 'User-Agent': 'TrailsMate/1.0' } }).then(r => r.json());

  const result = {};
  for (const p of Object.values(data.query?.pages || {})) {
    if (p.title && p.imageinfo?.[0]) {
      const name = p.title.replace('File:', '');
      let url = p.imageinfo[0].thumburl || p.imageinfo[0].url;
      url = url.replace(/\/\d+px-/, '/1200px-');
      if (!url.includes('/thumb/')) {
        const wikiName = name.replace(/ /g, '_');
        const path = md5Path(wikiName);
        url = `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${wikiName}/${1200}px-${wikiName}`;
      }
      result[name] = url;
    }
  }
  return result;
}

async function verifyGet(url) {
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'User-Agent': 'TrailsMate/1.0', 'Range': 'bytes=0-0' }
    });
    return res.status === 200 || res.status === 206;
  } catch { return false; }
}

async function resolveSlug(slug, candidates) {
  const pref = preferred[slug] || [];
  const rawTitles = (raw[slug] || []).map(i => i.title.replace('File:', ''));
  const allTitles = [...new Set([...pref, ...rawTitles])];

  // Filter obviously wrong titles
  const filtered = allTitles.filter(t => {
    const lower = t.toLowerCase();
    if (slug === 'devbagh-backwaters' && (lower.includes('ocypoda') || lower.includes('dotilla'))) return false;
    if (slug === 'tapola-shivsagar-lake' && lower.includes('helvetin')) return false;
    if (slug === 'sarasgad-fort' && lower.includes('burmannia')) return false;
    if (slug === 'sandhan-valley' && lower === 'dry snake.jpg') return false;
    return true;
  });

  const verified = [];
  for (let i = 0; i < filtered.length && verified.length < 3; i += 40) {
    const batch = filtered.slice(i, i + 40);
    const thumbs = await getThumbViaApi(batch);
    await sleep(500);
    for (const title of batch) {
      const url = thumbs[title];
      if (!url) continue;
      if (await verifyGet(url)) {
        verified.push(url);
        if (verified.length >= 3) break;
      }
      await sleep(50);
    }
  }
  return verified;
}

async function main() {
  const slugs = Object.keys(preferred);
  const results = {};

  for (const slug of slugs) {
    console.error(`Resolving ${slug}...`);
    const urls = await resolveSlug(slug, raw[slug]);
    if (urls.length > 0) {
      results[slug] = { primary: urls[0], gallery: urls.slice(1, 3) };
      console.error(`  OK: ${urls.length} urls`);
    } else {
      results[slug] = { primary: null, gallery: [], _failed: true };
      console.error(`  FAILED`);
    }
    await sleep(300);
  }

  writeFileSync('d:/Hackathons/TrailsMate/scripts/wikimedia-output.json', JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
}

main();
