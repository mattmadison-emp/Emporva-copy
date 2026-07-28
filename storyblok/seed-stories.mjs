#!/usr/bin/env node
/**
 * Seed the `services/` folder in Storyblok with the 6 service stories + index
 * story, using the copy currently hardcoded in src/pages/services/page.tsx.
 *
 * Idempotent — re-running updates existing stories matched by full_slug.
 *
 * Prereq: the `services` folder must already exist in the Storyblok space.
 *
 * Usage:
 *   STORYBLOK_OAUTH_TOKEN=<personal-access-token> npm run storyblok:seed
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadDotEnv() {
  const envPath = resolve(__dirname, '..', '.env');
  if (!existsSync(envPath)) return;
  const raw = readFileSync(envPath, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadDotEnv();

const SPACE_ID = process.env.STORYBLOK_SPACE_ID || '290960764133094';
const REGION = (process.env.STORYBLOK_REGION || 'eu').toLowerCase();
const TOKEN = process.env.STORYBLOK_OAUTH_TOKEN;

const REGION_HOSTS = {
  eu: 'mapi.storyblok.com',
  us: 'api-us.storyblok.com',
  ap: 'api-ap.storyblok.com',
  ca: 'api-ca.storyblok.com',
  cn: 'app.storyblokchina.cn',
};

if (!TOKEN) {
  console.error('Missing STORYBLOK_OAUTH_TOKEN in environment or .env file.');
  process.exit(1);
}

const host = REGION_HOSTS[REGION];
if (!host) {
  console.error(`Unknown region: ${REGION}`);
  process.exit(1);
}

const baseUrl = `https://${host}/v1/spaces/${SPACE_ID}`;
const headers = {
  Authorization: TOKEN,
  'Content-Type': 'application/json',
};

const bullet = (text) => ({ _uid: randomUUID(), component: 'bullet', text });

const services = {
  plumbing: {
    title: 'Plumbing Repair Services',
    description: 'Expert plumbing solutions for leaks, clogs, installations, and emergency repairs',
    icon: 'ri-drop-line',
    image: 'https://readdy.ai/api/search-image?query=Professional%20plumber%20working%20on%20residential%20plumbing%20repair%20with%20tools%20and%20pipes%20in%20modern%20home%20setting%20with%20clean%20simple%20background&width=1920&height=600&seq=service-plumbing-hero&orientation=landscape',
    commonIssues: [
      'Leaking pipes and faucets',
      'Clogged drains and toilets',
      'Water heater problems',
      'Low water pressure',
      'Burst pipes',
      'Sewer line issues',
    ],
    process: [
      'Upload photos of the plumbing issue',
      'AI analyzes the problem and severity',
      'Get matched with licensed plumbers',
      'Receive detailed quotes',
      'Schedule repair at your convenience',
    ],
    avgCost: '$150 - $500',
    urgency: 'Often requires same-day service',
  },
  electrical: {
    title: 'Electrical Troubleshooting & Repair',
    description: 'Safe, certified electrical services for all your home and business needs',
    icon: 'ri-flashlight-line',
    image: 'https://readdy.ai/api/search-image?query=Licensed%20electrician%20working%20on%20electrical%20panel%20and%20wiring%20in%20residential%20home%20with%20professional%20tools%20and%20safety%20equipment%20with%20clean%20background&width=1920&height=600&seq=service-electrical-hero&orientation=landscape',
    commonIssues: [
      'Outlets not working or sparking',
      'Circuit breaker tripping',
      'Flickering lights',
      'Buzzing sounds from outlets',
      'Electrical panel upgrades',
      'Wiring problems',
    ],
    process: [
      'Describe electrical symptoms',
      'AI assesses potential safety risks',
      'Connect with certified electricians',
      'Get safety-focused quotes',
      'Professional diagnosis and repair',
    ],
    avgCost: '$100 - $400',
    urgency: 'Safety-critical - often same-day',
  },
  roofing: {
    title: 'Roof Leak Assessment & Repair',
    description: 'Comprehensive roofing services from leak detection to full replacement',
    icon: 'ri-home-heart-line',
    image: 'https://readdy.ai/api/search-image?query=Professional%20roofer%20inspecting%20and%20repairing%20residential%20roof%20with%20shingles%20and%20roofing%20materials%20on%20sunny%20day%20with%20clean%20sky%20background&width=1920&height=600&seq=service-roofing-hero&orientation=landscape',
    commonIssues: [
      'Roof leaks and water damage',
      'Missing or damaged shingles',
      'Flashing problems',
      'Gutter issues',
      'Storm damage',
      'Aging roof replacement',
    ],
    process: [
      'Upload photos of roof damage',
      'AI identifies problem areas',
      'Match with experienced roofers',
      'Get inspection and quotes',
      'Schedule repair or replacement',
    ],
    avgCost: '$300 - $1,500 (repairs)',
    urgency: 'Address quickly to prevent water damage',
  },
  hvac: {
    title: 'HVAC Diagnostic & Repair',
    description: 'Heating and cooling system repair, maintenance, and installation',
    icon: 'ri-temp-cold-line',
    image: 'https://readdy.ai/api/search-image?query=HVAC%20technician%20servicing%20residential%20heating%20and%20cooling%20system%20with%20professional%20tools%20in%20modern%20home%20with%20clean%20simple%20background&width=1920&height=600&seq=service-hvac-hero&orientation=landscape',
    commonIssues: [
      'Heat not working',
      'AC not cooling',
      'Strange noises from system',
      'High energy bills',
      'Thermostat problems',
      'Poor air quality',
    ],
    process: [
      'Describe heating/cooling issue',
      'AI diagnoses likely causes',
      'Connect with HVAC specialists',
      'Get diagnostic and repair quotes',
      'Professional service and maintenance',
    ],
    avgCost: '$150 - $600',
    urgency: 'Critical in extreme weather',
  },
  remodel: {
    title: 'Kitchen & Bathroom Remodel Planning',
    description: 'Complete remodeling services from design to final installation',
    icon: 'ri-paint-brush-line',
    image: 'https://readdy.ai/api/search-image?query=Beautiful%20modern%20kitchen%20and%20bathroom%20remodel%20in%20progress%20showing%20renovation%20work%20with%20professional%20contractors%20and%20clean%20organized%20workspace&width=1920&height=600&seq=service-remodel-hero&orientation=landscape',
    commonIssues: [
      'Outdated kitchen or bathroom',
      'Poor layout and functionality',
      'Damaged cabinets or counters',
      'Plumbing fixture upgrades',
      'Tile and flooring replacement',
      'Complete renovation planning',
    ],
    process: [
      'Share your remodel vision and photos',
      'AI creates project workflow',
      'Match with remodeling contractors',
      'Get detailed project quotes',
      'Manage entire remodel process',
    ],
    avgCost: '$5,000 - $50,000+',
    urgency: 'Plan ahead - typically 2-8 weeks',
  },
  drainage: {
    title: 'Yard Drainage Solutions',
    description: 'Professional drainage systems to protect your property from water damage',
    icon: 'ri-water-flash-line',
    image: 'https://readdy.ai/api/search-image?query=Residential%20yard%20drainage%20system%20installation%20with%20professional%20landscaping%20and%20water%20management%20solutions%20in%20suburban%20home%20setting%20with%20clean%20background&width=1920&height=600&seq=service-drainage-hero&orientation=landscape',
    commonIssues: [
      'Standing water in yard',
      'Basement flooding',
      'Erosion problems',
      'Foundation water damage',
      'Poor grading',
      'Clogged drainage systems',
    ],
    process: [
      'Upload photos of drainage issues',
      'AI assesses water flow problems',
      'Connect with drainage specialists',
      'Get grading and system quotes',
      'Professional installation',
    ],
    avgCost: '$500 - $5,000',
    urgency: 'Address before heavy rain season',
  },
};

function buildServiceContent(slug, data) {
  return {
    component: 'service',
    title: data.title,
    description: data.description,
    icon: data.icon,
    hero_image: { filename: data.image, alt: data.title },
    common_issues: data.commonIssues.map(bullet),
    process_steps: data.process.map(bullet),
    avg_cost: data.avgCost,
    urgency: data.urgency,
    seo_title: `${data.title} - Emporva`,
    seo_description: data.description,
    keywords: `${slug}, ${data.title.toLowerCase()}, home repair, contractor services, property maintenance`,
    body: { type: 'doc', content: [] },
  };
}

const indexContent = {
  component: 'services_index',
  headline: 'Our Services',
  subhead: 'From plumbing to remodels, find verified contractors for every home improvement need.',
  body: { type: 'doc', content: [] },
  seo_title: 'Home Improvement Services - Emporva',
  seo_description: 'Browse all the home improvement services available through Emporva. Get matched with verified, licensed contractors for plumbing, electrical, HVAC, roofing, remodels, and more.',
};

async function api(path, init = {}) {
  const res = await fetch(`${baseUrl}${path}`, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error(`${init.method || 'GET'} ${path} → ${res.status}: ${text}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function findStoryByFullSlug(fullSlug) {
  const data = await api(`/stories?with_slug=${encodeURIComponent(fullSlug)}`);
  return data.stories?.[0] || null;
}

async function findFolderByFullSlug(fullSlug) {
  const data = await api(`/stories?with_slug=${encodeURIComponent(fullSlug)}&folder_only=1`);
  return data.stories?.[0] || null;
}

async function upsertStory({ name, slug, parentId, content, isStartpage = false, isFolder = false }) {
  const fullSlug = parentId ? `${parentFullSlugs.get(parentId)}/${slug}` : slug;
  const existing = isFolder ? await findFolderByFullSlug(fullSlug) : await findStoryByFullSlug(fullSlug);

  const story = {
    name,
    slug,
    parent_id: parentId || 0,
    content,
    is_folder: isFolder,
    is_startpage: isStartpage,
  };

  if (existing) {
    await api(`/stories/${existing.id}`, {
      method: 'PUT',
      body: JSON.stringify({ story, publish: 1 }),
    });
    console.log(`  ↻ updated: ${fullSlug}`);
    return existing;
  }

  const data = await api('/stories', {
    method: 'POST',
    body: JSON.stringify({ story, publish: 1 }),
  });
  console.log(`  + created: ${fullSlug}`);
  return data.story;
}

const parentFullSlugs = new Map();

async function main() {
  console.log(`Seeding stories in space ${SPACE_ID} (${REGION} region)...\n`);

  const folder = await findFolderByFullSlug('services');
  if (!folder) {
    console.error("Couldn't find folder with slug 'services'. Create it in the Storyblok UI first.");
    process.exit(1);
  }
  parentFullSlugs.set(folder.id, 'services');
  console.log(`Found services folder (id: ${folder.id}).\n`);

  console.log('Index story:');
  await upsertStory({
    name: 'Services Landing',
    slug: 'home',
    parentId: folder.id,
    content: indexContent,
    isStartpage: true,
  });

  console.log('\nService stories:');
  for (const [slug, data] of Object.entries(services)) {
    await upsertStory({
      name: data.title,
      slug,
      parentId: folder.id,
      content: buildServiceContent(slug, data),
    });
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  if (err.data) console.error(JSON.stringify(err.data, null, 2));
  process.exit(1);
});
