#!/usr/bin/env node
/**
 * Seed the `blog/` folder in Storyblok with the 6 articles + index story,
 * using the copy currently hardcoded in src/pages/blog/article/page.tsx.
 *
 * Idempotent — re-running updates existing stories matched by full_slug.
 *
 * Prereq: a `blog` folder must exist in the Storyblok space (default content
 * type `article`). If it doesn't, this script creates it.
 *
 * Usage:
 *   STORYBLOK_OAUTH_TOKEN=<personal-access-token> npm run storyblok:seed-articles
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

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
  console.error('Missing STORYBLOK_OAUTH_TOKEN.');
  process.exit(1);
}
const host = REGION_HOSTS[REGION];
if (!host) {
  console.error(`Unknown region: ${REGION}`);
  process.exit(1);
}

const baseUrl = `https://${host}/v1/spaces/${SPACE_ID}`;
const headers = { Authorization: TOKEN, 'Content-Type': 'application/json' };

// ──────────────────────────────────────────────────────────────
// Article copy — one-shot migration from src/pages/blog/article/page.tsx
// ──────────────────────────────────────────────────────────────

const articles = {
  'essential-plumbing-maintenance-checklist': {
    title: 'Essential Plumbing Maintenance Checklist for Every Homeowner',
    excerpt: 'Prevent costly repairs with this comprehensive guide to seasonal plumbing maintenance. Learn what to check, when to check it, and how to spot early warning signs.',
    category: 'Plumbing',
    image: 'https://readdy.ai/api/search-image?query=modern%20residential%20plumbing%20system%20with%20clean%20pipes%20and%20fixtures%20in%20bright%20well%20lit%20utility%20room%20showing%20professional%20installation%20and%20maintenance%20work%20with%20tools%20and%20equipment%20organized%20neatly%20on%20clean%20white%20background&width=1200&height=600&seq=article1&orientation=landscape',
    publishedDate: '2025-01-15',
    readTime: '8 min read',
    keywords: 'plumbing maintenance, home repair checklist, plumbing tips, preventive maintenance, homeowner guide, pipe inspection',
    intro: 'Regular plumbing maintenance can save you thousands of dollars in emergency repairs and water damage. This comprehensive guide will help you establish a routine maintenance schedule and identify potential issues before they become major problems.',
    sections: [
      {
        heading: 'Monthly Plumbing Checks',
        content: 'These quick monthly inspections take less than 30 minutes but can prevent costly repairs down the line. Make these checks part of your regular home maintenance routine.',
        list: ['Check all faucets for drips or leaks and repair immediately', 'Inspect under sinks for moisture or water stains', 'Test all drains for slow drainage and clear if necessary', 'Check toilet tanks for silent leaks by adding food coloring', 'Inspect exposed pipes for corrosion or damage', 'Test water pressure at multiple fixtures'],
      },
      {
        heading: 'Seasonal Maintenance Tasks',
        content: 'Different seasons bring different plumbing challenges. Follow this seasonal guide to keep your plumbing system in top condition throughout the year.',
        list: ['Spring: Inspect outdoor faucets and hoses after winter freeze', 'Summer: Check sprinkler systems and outdoor plumbing', 'Fall: Drain and winterize outdoor plumbing before first freeze', 'Winter: Insulate exposed pipes and maintain proper heating'],
      },
      {
        heading: 'Warning Signs to Watch For',
        content: 'Early detection is key to preventing major plumbing disasters. Contact a professional plumber immediately if you notice any of these warning signs.',
        list: ['Sudden increase in water bills without explanation', 'Persistent sewage odors in or around your home', 'Water stains on ceilings, walls, or floors', 'Reduced water pressure throughout the house', 'Gurgling sounds from drains or toilets', 'Visible corrosion on pipes or fixtures'],
      },
    ],
  },
  'electrical-safety-tips-older-homes': {
    title: 'Electrical Safety Tips for Older Homes: What You Need to Know',
    excerpt: 'Older homes have unique electrical challenges. Discover the warning signs of outdated wiring and when it\'s time to call a professional electrician.',
    category: 'Electrical',
    image: 'https://readdy.ai/api/search-image?query=vintage%20electrical%20panel%20and%20modern%20circuit%20breaker%20comparison%20showing%20home%20electrical%20safety%20upgrade%20with%20professional%20electrician%20tools%20on%20clean%20neutral%20background%20emphasizing%20safety%20and%20quality&width=1200&height=600&seq=article2&orientation=landscape',
    publishedDate: '2025-01-12',
    readTime: '6 min read',
    keywords: 'electrical safety, older homes, home wiring, electrical upgrade, circuit breaker, GFCI outlets',
    intro: 'Homes built before 1980 often have electrical systems that don\'t meet modern safety standards. Understanding the unique challenges of older electrical systems can help you protect your home and family from potential hazards.',
    sections: [
      {
        heading: 'Common Electrical Issues in Older Homes',
        content: 'Older homes were built when electrical demands were much lower. Today\'s appliances and devices can overload outdated systems, creating serious safety risks.',
        list: ['Outdated wiring types like knob-and-tube or aluminum wiring', 'Insufficient number of outlets leading to overuse of extension cords', 'Lack of ground fault circuit interrupters in wet areas', 'Undersized electrical panels for modern power needs', 'Deteriorating insulation on old wiring', 'Two-prong outlets without proper grounding'],
      },
      {
        heading: 'Warning Signs of Electrical Problems',
        content: 'Never ignore these warning signs. They indicate serious electrical issues that require immediate professional attention.',
        list: ['Frequent circuit breaker trips or blown fuses', 'Flickering or dimming lights when appliances run', 'Burning smell near outlets or switches', 'Discolored or warm outlet covers', 'Buzzing or crackling sounds from electrical fixtures', 'Sparks when plugging in devices'],
      },
      {
        heading: 'Recommended Upgrades for Safety',
        content: 'These upgrades can significantly improve the safety and functionality of your home\'s electrical system. Consult with a licensed electrician to prioritize improvements based on your specific situation.',
        list: ['Replace outdated electrical panel with modern circuit breakers', 'Install GFCI outlets in bathrooms, kitchens, and outdoor areas', 'Upgrade to three-prong grounded outlets throughout the home', 'Add dedicated circuits for major appliances', 'Install whole-house surge protection', 'Replace old wiring with modern copper wiring'],
      },
    ],
  },
  'roof-inspection-guide-homeowners': {
    title: 'The Complete Roof Inspection Guide for Homeowners',
    excerpt: 'Learn how to inspect your roof for damage, understand common roofing problems, and know when to schedule professional maintenance.',
    category: 'Roofing',
    image: 'https://readdy.ai/api/search-image?query=residential%20roof%20inspection%20showing%20quality%20asphalt%20shingles%20and%20roofing%20materials%20with%20professional%20contractor%20examining%20roof%20condition%20on%20sunny%20day%20with%20clear%20blue%20sky%20background%20emphasizing%20home%20maintenance%20and%20safety&width=1200&height=600&seq=article3&orientation=landscape',
    publishedDate: '2025-01-10',
    readTime: '10 min read',
    keywords: 'roof inspection, roofing maintenance, shingle damage, roof repair, home inspection, roof replacement, gutter cleaning',
    intro: 'Your roof is your home\'s first line of defense against the elements. Regular inspections can extend its lifespan by years and help you catch small problems before they become expensive repairs. This comprehensive guide will teach you how to inspect your roof safely and know when to call in the professionals.',
    sections: [
      { heading: 'Ground-Level Inspection Basics', content: 'You can identify many roofing issues without ever climbing a ladder. Start your inspection from the ground using binoculars to get a closer look at potential problem areas.', list: ['Look for missing, cracked, or curling shingles from multiple angles', 'Check for visible sagging or uneven areas on the roof surface', 'Inspect flashing around chimneys, vents, and skylights for gaps', 'Examine gutters for granule buildup indicating shingle wear', 'Look for moss, algae, or dark streaks that indicate moisture issues', 'Check for debris accumulation in valleys and around penetrations'] },
      { heading: 'Interior Warning Signs', content: 'Sometimes the first signs of roof damage appear inside your home. Regular attic inspections can reveal problems before they cause significant damage to your living spaces.', list: ['Water stains or discoloration on ceilings and walls', 'Daylight visible through roof boards in the attic', 'Musty odors indicating mold or mildew growth', 'Sagging or soft spots in the roof decking', 'Increased energy bills from poor insulation or ventilation', 'Peeling paint or wallpaper near the roofline'] },
      { heading: 'Seasonal Roof Maintenance Tasks', content: 'Different seasons present unique challenges for your roof. Following a seasonal maintenance schedule helps prevent damage and extends your roof\'s lifespan.', list: ['Spring: Clear debris and inspect for winter storm damage', 'Summer: Check for heat damage, blistering, and proper ventilation', 'Fall: Clean gutters, trim overhanging branches, prepare for winter', 'Winter: Monitor for ice dams and remove heavy snow accumulation'] },
      { heading: 'When to Call a Professional Roofer', content: 'While regular inspections help you stay informed, some situations require professional expertise. Don\'t hesitate to call a licensed roofing contractor when you encounter these issues.', list: ['Roof is more than 20 years old and showing wear signs', 'Multiple missing or damaged shingles after a storm', 'Active leaks or water intrusion into your home', 'Significant granule loss indicating shingle deterioration', 'Structural concerns like sagging or visible damage', 'Planning to sell your home and need a professional assessment'] },
      { heading: 'Understanding Roof Lifespan by Material', content: 'Different roofing materials have varying lifespans. Knowing what to expect helps you plan for eventual replacement and budget accordingly.', list: ['Asphalt shingles: 15-30 years depending on quality', 'Metal roofing: 40-70 years with proper maintenance', 'Clay or concrete tiles: 50-100 years in ideal conditions', 'Wood shakes: 20-40 years with regular treatment', 'Slate roofing: 75-150 years, one of the longest-lasting options', 'Flat roofing membranes: 15-25 years depending on material'] },
    ],
  },
  'kitchen-remodel-planning-guide': {
    title: 'Kitchen Remodel Planning: A Step-by-Step Guide',
    excerpt: 'Planning a kitchen renovation? This comprehensive guide walks you through budgeting, design decisions, contractor selection, and project timelines.',
    category: 'Remodel Planning',
    image: 'https://readdy.ai/api/search-image?query=modern%20kitchen%20renovation%20in%20progress%20showing%20beautiful%20white%20cabinetry%20installation%20and%20marble%20countertop%20work%20with%20design%20blueprints%20and%20material%20samples%20on%20clean%20surface%20emphasizing%20quality%20craftsmanship%20and%20elegant%20design&width=1200&height=600&seq=article4&orientation=landscape',
    publishedDate: '2025-01-08',
    readTime: '12 min read',
    keywords: 'kitchen remodel, renovation planning, kitchen design, contractor selection, remodel budget, kitchen cabinets, countertops',
    intro: 'A kitchen remodel is one of the most impactful home improvements you can make, both for daily living and resale value. However, without proper planning, costs can spiral and timelines can stretch indefinitely. This comprehensive guide walks you through every step of planning a successful kitchen renovation, from initial budgeting to final walkthrough.',
    sections: [
      { heading: 'Setting a Realistic Budget', content: 'The foundation of any successful remodel is a well-planned budget. Understanding where your money goes helps you make informed decisions and avoid costly surprises.', list: ['Cabinets typically consume 30-35% of your total budget', 'Countertops and backsplash account for 10-15% of costs', 'Appliances range from 15-20% depending on brand choices', 'Labor and installation usually represent 20-25% of the total', 'Always reserve 15-20% contingency for unexpected issues', 'Permits and design fees add 5-10% to overall costs'] },
      { heading: 'Design Considerations and Layout', content: 'The best kitchen designs balance aesthetics with functionality. Consider how you actually use your kitchen before making major layout decisions.', list: ['The work triangle: optimize distance between sink, stove, and refrigerator', 'Plan for adequate counter space near cooking and prep areas', 'Consider traffic flow and how multiple people use the space', 'Maximize storage with corner solutions and vertical space', 'Ensure proper lighting for tasks, ambiance, and safety', 'Account for electrical needs including outlets and appliance circuits'] },
      { heading: 'Selecting Materials and Finishes', content: 'Material choices impact both the look and longevity of your kitchen. Balance your aesthetic preferences with practical considerations like durability and maintenance.', list: ['Countertops: quartz offers durability, granite provides natural beauty', 'Cabinets: solid wood lasts longest, but quality plywood is cost-effective', 'Flooring: tile and luxury vinyl handle moisture and traffic well', 'Backsplash: subway tile is timeless, while natural stone adds luxury', 'Hardware: brushed nickel and matte black are trending finishes', 'Sinks: stainless steel is practical, farmhouse sinks add character'] },
      { heading: 'Hiring the Right Contractor', content: 'Your contractor can make or break your remodel experience. Take time to find someone who communicates well and has a proven track record.', list: ['Get at least three detailed quotes for comparison', 'Verify licenses, insurance, and bonding requirements', 'Check references and view completed projects in person', 'Review contracts carefully before signing anything', 'Establish clear communication expectations and schedules', 'Understand payment terms and never pay everything upfront'] },
      { heading: 'Managing the Renovation Timeline', content: 'Kitchen remodels typically take 6-12 weeks depending on scope. Understanding the sequence of work helps you plan for disruption and stay on schedule.', list: ['Week 1-2: Demolition and rough-in work for plumbing and electrical', 'Week 3-4: Drywall, painting, and flooring installation', 'Week 5-6: Cabinet installation and countertop templating', 'Week 7-8: Countertop installation and backsplash work', 'Week 9-10: Appliance installation and electrical finishing', 'Week 11-12: Final touches, punch list items, and cleanup'] },
      { heading: 'Living Through a Kitchen Remodel', content: 'Surviving without a kitchen requires planning. Set up a temporary kitchen space to maintain some normalcy during construction.', list: ['Set up a mini kitchen with microwave, toaster oven, and coffee maker', 'Use a utility sink or bathroom for basic dish washing', 'Stock up on paper plates and disposable utensils', 'Plan simple meals and budget for occasional takeout', 'Protect other areas of your home from dust and debris', 'Communicate daily with your contractor about progress and concerns'] },
    ],
  },
  'seasonal-home-maintenance-calendar': {
    title: 'Your Seasonal Home Maintenance Calendar',
    excerpt: 'Stay ahead of repairs with this month-by-month maintenance schedule. Know exactly what to check and when to protect your home year-round.',
    category: 'Maintenance Tips',
    image: 'https://readdy.ai/api/search-image?query=home%20maintenance%20tools%20and%20seasonal%20checklist%20with%20calendar%20showing%20organized%20property%20care%20schedule%20including%20cleaning%20supplies%20and%20inspection%20equipment%20arranged%20neatly%20on%20bright%20clean%20white%20background%20emphasizing%20organization%20and%20planning&width=1200&height=600&seq=article5&orientation=landscape',
    publishedDate: '2025-01-05',
    readTime: '7 min read',
    keywords: 'home maintenance, seasonal checklist, property care, preventive maintenance, home inspection, maintenance calendar, homeowner tips',
    intro: 'Consistent home maintenance prevents small issues from becoming expensive emergencies. This month-by-month calendar gives you a clear roadmap for protecting your investment and keeping your home in peak condition year-round. Print it out, set reminders, and stay ahead of repairs.',
    sections: [
      { heading: 'Spring Maintenance (March - May)', content: 'Spring is the perfect time to assess winter damage and prepare your home for warmer months. Focus on exterior inspections and cleaning tasks.', list: ['Inspect roof for winter damage, missing shingles, and debris', 'Clean gutters and downspouts, check for proper drainage', 'Service air conditioning system before summer heat arrives', 'Check exterior paint and caulking for cracks or peeling', 'Test outdoor faucets and irrigation systems for leaks', 'Power wash decks, patios, and siding to remove winter grime', 'Inspect foundation for cracks and ensure proper grading', 'Replace batteries in smoke and carbon monoxide detectors'] },
      { heading: 'Summer Maintenance (June - August)', content: 'Summer maintenance focuses on keeping your home cool and addressing outdoor living spaces. Take advantage of good weather for exterior projects.', list: ['Replace or clean HVAC filters monthly during heavy use', 'Inspect and clean dryer vents to prevent fire hazards', 'Check window and door screens for tears and damage', 'Trim trees and shrubs away from the house and power lines', 'Inspect deck and patio for loose boards or structural issues', 'Clean and seal wood decks to protect from sun damage', 'Check attic ventilation and insulation effectiveness', 'Test garage door safety features and lubricate moving parts'] },
      { heading: 'Fall Maintenance (September - November)', content: 'Fall is critical for winterization. Prepare your home for cold weather to prevent frozen pipes, ice dams, and heating system failures.', list: ['Schedule furnace inspection and tune-up before heating season', 'Clean gutters after leaves fall and install gutter guards', 'Drain and winterize outdoor faucets and irrigation systems', 'Seal gaps around windows and doors with weatherstripping', 'Inspect chimney and fireplace, schedule professional cleaning', 'Test heating system and replace furnace filter', 'Check insulation in attic and add more if needed', 'Store outdoor furniture and prepare lawn equipment for winter'] },
      { heading: 'Winter Maintenance (December - February)', content: 'Winter maintenance is about monitoring and prevention. Stay vigilant for ice dams, frozen pipes, and heating system issues.', list: ['Monitor for ice dams and remove snow from roof edges safely', 'Keep walkways clear of ice and snow for safety', 'Check for drafts around windows and doors during cold snaps', 'Inspect pipes in unheated areas for freezing risk', 'Test sump pump to ensure it operates during thaws', 'Change furnace filters monthly during heavy heating use', 'Check carbon monoxide detectors with increased heating use', 'Plan spring projects and get contractor quotes during slow season'] },
      { heading: 'Monthly Tasks Year-Round', content: 'Some maintenance tasks should be performed monthly regardless of season. Build these into your regular routine for consistent home care.', list: ['Test smoke and carbon monoxide detectors', 'Check HVAC filters and replace as needed', 'Inspect plumbing under sinks for leaks', 'Clean garbage disposal with ice and citrus', 'Check water heater for leaks or unusual sounds', 'Run water in unused fixtures to prevent drain traps from drying', 'Inspect fire extinguishers and ensure easy access', 'Walk around exterior looking for new damage or issues'] },
      { heading: 'Annual Professional Inspections', content: 'Some systems require professional attention annually. Budget for these inspections to catch problems early and maintain warranties.', list: ['HVAC system tune-up (spring for AC, fall for heating)', 'Chimney inspection and cleaning if you use fireplace', 'Termite and pest inspection, especially in humid climates', 'Septic system pumping every 3-5 years if applicable', 'Roof inspection by professional every 3-5 years', 'Electrical panel inspection if home is over 25 years old'] },
    ],
  },
  'hvac-efficiency-tips-save-money': {
    title: 'HVAC Efficiency Tips to Save Money on Energy Bills',
    excerpt: 'Reduce your energy costs with these proven HVAC maintenance tips. Learn how to optimize your heating and cooling system for maximum efficiency.',
    category: 'Maintenance Tips',
    image: 'https://readdy.ai/api/search-image?query=modern%20hvac%20system%20installation%20showing%20clean%20air%20conditioning%20unit%20and%20heating%20equipment%20with%20professional%20technician%20performing%20maintenance%20work%20on%20neutral%20light%20gray%20background%20emphasizing%20energy%20efficiency%20and%20professional%20service&width=1200&height=600&seq=article6&orientation=landscape',
    publishedDate: '2025-01-03',
    readTime: '9 min read',
    keywords: 'HVAC efficiency, energy savings, heating and cooling, air conditioning maintenance, furnace tips, thermostat settings, energy bills',
    intro: 'Heating and cooling account for nearly half of the average home\'s energy consumption. Small improvements to your HVAC system\'s efficiency can translate to significant savings on your monthly bills. This guide covers practical tips that any homeowner can implement, from simple filter changes to smart thermostat strategies.',
    sections: [
      { heading: 'Filter Maintenance Fundamentals', content: 'Your HVAC filter is the simplest and most impactful maintenance item. A dirty filter forces your system to work harder, increasing energy use and wear on components.', list: ['Check filters monthly and replace every 1-3 months', 'Use the correct filter size and MERV rating for your system', 'Higher MERV ratings catch more particles but may restrict airflow', 'Consider upgrading to pleated filters for better filtration', 'Mark your calendar or set phone reminders for filter checks', 'Keep spare filters on hand so you never delay replacement'] },
      { heading: 'Thermostat Optimization Strategies', content: 'How you set your thermostat has a major impact on energy consumption. Smart programming can save 10-15% on heating and cooling costs without sacrificing comfort.', list: ['Set temperature back 7-10 degrees when away or sleeping', 'Use programmable or smart thermostats for automatic adjustments', 'Avoid drastic temperature changes that make systems work harder', 'Keep thermostat away from heat sources and direct sunlight', 'Consider zoning systems for multi-story or large homes', 'Use fan-only mode to circulate air without heating or cooling'] },
      { heading: 'Sealing and Insulation Improvements', content: 'Even the most efficient HVAC system wastes energy if your home leaks conditioned air. Sealing and insulation improvements often pay for themselves within a few years.', list: ['Seal gaps around windows and doors with weatherstripping', 'Caulk cracks in exterior walls and around penetrations', 'Insulate attic to recommended R-value for your climate zone', 'Seal and insulate ductwork, especially in unconditioned spaces', 'Add insulation to basement rim joists and crawl spaces', 'Consider professional energy audit to identify problem areas'] },
      { heading: 'Ductwork Efficiency', content: 'Leaky or poorly designed ductwork can waste 20-30% of conditioned air before it reaches your living spaces. Addressing duct issues dramatically improves system efficiency.', list: ['Have ducts professionally inspected for leaks and damage', 'Seal duct joints with mastic sealant or metal tape, not duct tape', 'Insulate ducts running through unconditioned spaces', 'Ensure all supply and return vents are unobstructed', 'Consider duct cleaning if you notice dust or airflow issues', 'Balance airflow by adjusting dampers in branch ducts'] },
      { heading: 'Seasonal Maintenance Checklist', content: 'Professional maintenance twice yearly keeps your system running at peak efficiency. Schedule tune-ups in spring for cooling and fall for heating.', list: ['Spring AC tune-up: refrigerant check, coil cleaning, electrical inspection', 'Fall heating tune-up: heat exchanger inspection, burner cleaning, safety check', 'Clean outdoor condenser coils and remove debris from around unit', 'Clear condensate drain lines to prevent clogs and water damage', 'Lubricate moving parts and check belt tension on older systems', 'Verify thermostat calibration and test all system modes'] },
      { heading: 'When to Consider System Replacement', content: 'Older systems become less efficient over time. Knowing when to repair versus replace helps you make cost-effective decisions for long-term savings.', list: ['Systems over 15 years old may benefit from replacement', 'Frequent repairs costing more than half of replacement value', 'Rising energy bills despite regular maintenance', 'Uneven temperatures or humidity control problems', 'R-22 refrigerant systems should be replaced due to phase-out', 'New systems can be 20-40% more efficient than older models'] },
      { heading: 'Additional Energy-Saving Tips', content: 'Beyond HVAC-specific improvements, these general strategies help reduce your heating and cooling load, making your system\'s job easier.', list: ['Use ceiling fans to supplement cooling and improve circulation', 'Close blinds and curtains during hot afternoons to block solar heat', 'Plant shade trees on south and west sides of your home', 'Use exhaust fans in kitchens and bathrooms to remove heat and humidity', 'Avoid using heat-generating appliances during peak cooling hours', 'Consider window films or treatments to reduce solar heat gain'] },
    ],
  },
};

const indexContent = {
  component: 'blog_index',
  headline: 'Emporva Blog',
  subhead: 'Guides, checklists, and real world insights to help you care for your property with confidence.',
  seo_title: 'Emporva Blog - Property Maintenance Guides & Home Repair Tips',
  seo_description: 'Guides, checklists, and real world insights to help you care for your property with confidence. Expert advice on plumbing, electrical, roofing, HVAC, and home maintenance.',
};

// ──────────────────────────────────────────────────────────────
// Richtext builders (Storyblok ProseMirror format)
// ──────────────────────────────────────────────────────────────

const text = (str) => ({ type: 'text', text: str });
const paragraph = (str) => ({ type: 'paragraph', content: [text(str)] });
const heading = (str, level = 2) => ({ type: 'heading', attrs: { level }, content: [text(str)] });
const bulletList = (items) => ({
  type: 'bullet_list',
  content: items.map((item) => ({
    type: 'list_item',
    content: [paragraph(item)],
  })),
});

function buildArticleBody(article) {
  const nodes = [paragraph(article.intro)];
  for (const section of article.sections) {
    nodes.push(heading(section.heading, 2));
    nodes.push(paragraph(section.content));
    if (section.list && section.list.length > 0) {
      nodes.push(bulletList(section.list));
    }
  }
  return { type: 'doc', content: nodes };
}

function buildArticleContent(article) {
  return {
    component: 'article',
    title: article.title,
    excerpt: article.excerpt,
    category: article.category,
    hero_image: { filename: article.image, alt: article.title },
    author: '',
    published_date: `${article.publishedDate} 00:00`,
    read_time: article.readTime,
    keywords: article.keywords,
    body: buildArticleBody(article),
    seo_title: `${article.title} - Emporva Blog`,
    seo_description: article.excerpt,
  };
}

// ──────────────────────────────────────────────────────────────
// API helpers
// ──────────────────────────────────────────────────────────────

async function api(path, init = {}) {
  const res = await fetch(`${baseUrl}${path}`, { ...init, headers: { ...headers, ...(init.headers || {}) } });
  const body = await res.text();
  const data = body ? JSON.parse(body) : null;
  if (!res.ok) {
    const err = new Error(`${init.method || 'GET'} ${path} → ${res.status}: ${body}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function findStoryByFullSlug(fullSlug, folderOnly = false) {
  const qs = new URLSearchParams({ with_slug: fullSlug });
  if (folderOnly) qs.set('folder_only', '1');
  const data = await api(`/stories?${qs.toString()}`);
  return data.stories?.[0] || null;
}

async function ensureBlogFolder() {
  const existing = await findStoryByFullSlug('blog', true);
  if (existing) return existing;
  console.log("Creating 'blog' folder...");
  const data = await api('/stories', {
    method: 'POST',
    body: JSON.stringify({
      story: {
        name: 'Blog',
        slug: 'blog',
        is_folder: true,
        default_root: 'article',
      },
    }),
  });
  return data.story;
}

async function upsertStory({ name, slug, parentId, content, isStartpage = false }) {
  const fullSlug = `${parentFullSlug}/${slug}`;
  const existing = await findStoryByFullSlug(fullSlug);
  const story = {
    name,
    slug,
    parent_id: parentId,
    content,
    is_folder: false,
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

let parentFullSlug = '';

async function main() {
  console.log(`Seeding blog stories in space ${SPACE_ID} (${REGION} region)...\n`);

  const folder = await ensureBlogFolder();
  parentFullSlug = 'blog';
  console.log(`Using blog folder (id: ${folder.id}).\n`);

  console.log('Index story:');
  await upsertStory({
    name: 'Blog Landing',
    slug: 'home',
    parentId: folder.id,
    content: indexContent,
    isStartpage: true,
  });

  console.log('\nArticles:');
  for (const [slug, article] of Object.entries(articles)) {
    await upsertStory({
      name: article.title,
      slug,
      parentId: folder.id,
      content: buildArticleContent(article),
    });
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  if (err.data) console.error(JSON.stringify(err.data, null, 2));
  process.exit(1);
});
