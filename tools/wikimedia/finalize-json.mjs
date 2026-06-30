import { readFileSync, writeFileSync } from 'fs';
import crypto from 'crypto';

const data = JSON.parse(readFileSync('d:/Hackathons/TrailsMate/scripts/wikimedia-output.json', 'utf8'));

const fixes = {
  'ajanta-caves': {
    primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Ajanta_caves_panorama_2010.jpg/1280px-Ajanta_caves_panorama_2010.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Ajanta_Caves%2C_India%2C_Panoramic_view_of_Ajanta_basalt_cliffs_and_caves.jpg/1280px-Ajanta_Caves%2C_India%2C_Panoramic_view_of_Ajanta_basalt_cliffs_and_caves.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Cave_26%2C_Ajanta.jpg/1280px-Cave_26%2C_Ajanta.jpg'
    ]
  },
  'bhivpuri-waterfall': {
    primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Bhivpuri-Waterfall.jpg/960px-Bhivpuri-Waterfall.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Bhivpuri_View.jpg/1280px-Bhivpuri_View.jpg'
    ]
  },
  'devbagh-backwaters': {
    primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Devbag_Backwaters.jpg/1280px-Devbag_Backwaters.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sangam_at_devbagh_photo_by_Rahul_kharade_(bhandup)_-_panoramio_(2).jpg/1280px-Sangam_at_devbagh_photo_by_Rahul_kharade_(bhandup)_-_panoramio_(2).jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Devbagh.jpg/1280px-Devbagh.jpg'
    ]
  },
  'devkund-waterfall': {
    primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Devkund_waterfalls.jpg/1280px-Devkund_waterfalls.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Devkund_Waterfall.JPG/1280px-Devkund_Waterfall.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Devkund_Ambika_Temple.JPG/1280px-Devkund_Ambika_Temple.JPG'
    ]
  },
  'tapola-shivsagar-lake': {
    primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Tapola.jpg/1280px-Tapola.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Bamnoli_view_at_Shivsagar_lake.jpg/1280px-Bamnoli_view_at_Shivsagar_lake.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Bamnoli_lake%2C_Satara_-_vrvbsatara102k23iph_(1).jpg/1280px-Bamnoli_lake%2C_Satara_-_vrvbsatara102k23iph_(1).jpg'
    ]
  },
  'vihigaon-waterfall': {
    primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Igatpuri_waterfall.jpg/1280px-Igatpuri_waterfall.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Bhavli_Dam_(22).jpg/1280px-Bhavli_Dam_(22).jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Bhavli_Dam_(45).jpg/1280px-Bhavli_Dam_(45).jpg'
    ]
  },
  'kundalika-rafting-kolad': {
    primary: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/River_Kundalika_By_Anis_Shaikh_12.jpg/1280px-River_Kundalika_By_Anis_Shaikh_12.jpg',
    gallery: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Kundalika.jpg/1280px-Kundalika.jpg',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/20/Roha_today.jpg/1280px-Roha_today.jpg'
    ]
  }
};

function toThumb(url, px = 1280) {
  if (!url || !url.includes('upload.wikimedia.org')) return url;
  if (url.includes('/thumb/')) {
    return url.replace(/\/\d+px-/, `/${px}px-`);
  }
  const m = url.match(/\/commons\/([a-f0-9]\/[a-f0-9]{2})\/(.+)$/i);
  if (!m) return url;
  return `https://upload.wikimedia.org/wikipedia/commons/thumb/${m[1]}/${m[2]}/${px}px-${m[2]}`;
}

function cleanEntry(entry) {
  if (!entry?.primary) return null;
  const primary = toThumb(entry.primary);
  const gallery = (entry.gallery || []).map((u) => toThumb(u)).filter(Boolean);
  return { primary, gallery: gallery.slice(0, 2) };
}

const result = {};
for (const [slug, entry] of Object.entries(data)) {
  const fixed = fixes[slug] || entry;
  const cleaned = cleanEntry(fixed);
  if (cleaned) result[slug] = cleaned;
}

writeFileSync('d:/Hackathons/TrailsMate/scripts/wikimedia-places-final.json', JSON.stringify(result, null, 2));
console.log(JSON.stringify(result));
