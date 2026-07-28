#!/usr/bin/env node
/**
 * Seed the `faqs/` folder in Storyblok with one `faq_list` story per FAQ surface,
 * migrating the copy currently hardcoded across the app:
 *   faqs/home            ← homepageFAQs        (src/pages/home/page.tsx)
 *   faqs/homeowners      ← homeownerFAQs       (src/pages/for-homeowners/page.tsx)
 *   faqs/contractors     ← contractorFAQs      (src/pages/for-contractors/page.tsx)
 *   faqs/homeowner-help  ← faqSections         (src/pages/homeowner-account/help/page.tsx)
 *   faqs/contractor-help ← faqs                (src/pages/contractor-account/help/page.tsx)
 *
 * Idempotent — re-running updates existing stories matched by full_slug.
 * Creates the `faqs` folder (default content type `faq_list`) if missing.
 *
 * Usage:
 *   STORYBLOK_OAUTH_TOKEN=<personal-access-token> npm run storyblok:seed-faqs
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
// FAQ copy — one-shot migration from the hardcoded page arrays
// ──────────────────────────────────────────────────────────────

const faqStories = {
  home: {
    name: 'Home FAQ',
    headline: 'Frequently Asked Questions',
    subhead: 'Everything you need to know about how Emporva works.',
    seo_title: 'Emporva FAQ - Frequently Asked Questions',
    seo_description: 'Answers to common questions about Emporva, pricing, verified contractors, and the home services we cover.',
    items: [
      { question: 'What is Emporva and how does it work?', answer: 'Emporva is an AI-powered property services platform that helps homeowners diagnose home issues, get clear project scopes, and connect with verified local contractors. Simply describe your problem or upload photos, and our AI will help clarify what you need before matching you with qualified professionals.' },
      { question: 'How much does Emporva cost?', answer: 'Emporva offers a free Core plan with limited monthly credits for AI diagnostics and utility uploads. Our Premium plan is $12/month (or $120/year) and includes unlimited AI diagnostics, Property Memory, utility insights, and resale packet generation.' },
      { question: 'Are the contractors on Emporva verified?', answer: 'Yes, all contractors on Emporva undergo verification including license checks, insurance verification, and background screening. We maintain high standards to ensure homeowners connect with trustworthy professionals.' },
      { question: 'What types of home services does Emporva cover?', answer: 'Emporva covers a wide range of property services including plumbing, electrical, HVAC, roofing, renovation, painting, landscaping, and general home repairs. Our AI can help diagnose issues across all major home systems.' },
      { question: 'How is Emporva different from other contractor platforms?', answer: 'Unlike traditional lead generation platforms, Emporva focuses on clarity and coordination. Our AI helps scope projects before contractors get involved, reducing miscommunication. We also coordinate multi-trade projects and provide shared workspaces for seamless communication.' },
    ],
  },

  homeowners: {
    name: 'Homeowner FAQ',
    headline: 'Homeowner FAQs',
    subhead: 'Common questions from homeowners using Emporva.',
    seo_title: 'Emporva for Homeowners - FAQ',
    seo_description: 'How Emporva helps homeowners diagnose issues, track their property, and manage costs.',
    items: [
      { question: 'How does Emporva help homeowners diagnose home issues?', answer: 'Emporva uses AI-powered diagnosis to analyze photos and descriptions of your home issues. Simply upload images and describe the problem, and our AI will identify potential causes, suggest solutions, and help you understand the scope of work needed before connecting with contractors.' },
      { question: 'What is Property Memory and how does it work?', answer: "Property Memory is Emporva's system for tracking your home's complete history including repairs, upgrades, system installations, and maintenance records. It creates a comprehensive digital record that's valuable for insurance claims, resale, and ongoing maintenance planning." },
      { question: 'Can Emporva help predict utility costs and detect anomalies?', answer: "Yes, Emporva's Premium plan includes Utility Insights which analyzes your utility bills to predict future costs, detect unusual usage patterns that might indicate problems like leaks or HVAC issues, and help you optimize energy efficiency." },
      { question: 'How much does Emporva cost for homeowners?', answer: 'Emporva offers a free Core plan with 3 AI diagnostic credits, 3 utility upload credits, and 1 export credit every 6 months. The Premium plan at $12/month (or $120/year) includes unlimited diagnostics, Property Memory, utility insights, and resale packet generation.' },
    ],
  },

  contractors: {
    name: 'Contractor FAQ',
    headline: 'Contractor FAQs',
    subhead: 'Common questions from contractors on Emporva.',
    seo_title: 'Emporva for Contractors - FAQ',
    seo_description: 'How Emporva delivers scoped leads, the Core and Premium plans, and how it compares to other platforms.',
    items: [
      { question: 'How does Emporva help contractors get better leads?', answer: 'Unlike traditional lead generation platforms, Emporva provides pre-scoped jobs with clear requirements. Our AI helps homeowners clarify their needs before you get involved, so you receive detailed project scopes, photos, and realistic expectations—reducing wasted site visits and miscommunication.' },
      { question: "What is included in Emporva's Contractor Core plan?", answer: "Contractor Core is a pay-per-lead model at $15 per lead — no monthly fees or commitments. You browse the marketplace for free, then spend one credit to unlock a lead and submit your quote. Every lead comes AI-scoped with photos and clear homeowner expectations. You also get active job management, shared workspaces, and direct homeowner communication. Credits never expire, so you only pay when you're ready to pursue work." },
      { question: 'What additional features does Contractor Premium offer?', answer: "Contractor Premium at $99/month gives you unlimited marketplace access with no per-lead cost, plus a full CRM system, pipeline management, automated follow-ups, multi-job calendar and scheduling, invoicing and payment processing, performance analytics, and growth insights. If you're unlocking 7 or more leads per month on Core, Premium saves you money while giving you powerful business tools." },
      { question: 'How is Emporva different from HomeAdvisor or Thumbtack?', answer: "Emporva focuses on project coordination rather than lead volume. Jobs arrive with AI-generated scopes, clear expectations, and shared workspaces. We don't blast leads to dozens of contractors — we facilitate better communication between homeowners and contractors throughout the entire project lifecycle. On Core, you choose exactly which leads to pursue at $15 each. On Premium, you get unlimited access plus business management tools." },
      { question: 'When should I upgrade from Core to Premium?', answer: "The math is simple: if you're consistently unlocking 7 or more leads per month on Core ($105+), Premium at $99/month saves you money and gives you unlimited access. Plus you get CRM, pipeline management, automated follow-ups, scheduling tools, and analytics — everything you need to run and grow your business from one platform." },
    ],
  },

  'contractor-help': {
    name: 'Contractor Help FAQ',
    headline: 'Frequently Asked Questions',
    subhead: 'Find answers to common questions about your contractor account.',
    seo_title: 'Contractor Help - Emporva',
    seo_description: 'Answers about leads, credits, profile visibility, and reviews for Emporva contractors.',
    items: [
      { question: 'How do I respond to a new lead?', answer: "When you receive a new lead, you'll get a notification via email and in your dashboard. Navigate to your Lead Inbox, click on the lead to view details, and use the \"Send Quote\" button to respond with your pricing and availability. Quick responses typically lead to higher conversion rates." },
      { question: 'How does the credit system work?', answer: 'Credits are used to unlock and respond to leads. Each lead requires a certain number of credits based on the job type and value. Premium plan members receive unlimited lead responses, while Core plan members receive a monthly credit allocation. You can purchase additional credits if needed.' },
      { question: 'How can I improve my profile visibility?', answer: 'To improve your visibility: 1) Complete your profile 100% with photos and detailed service descriptions, 2) Maintain a high response rate to leads, 3) Collect positive reviews from completed jobs, 4) Keep your credentials and insurance up to date, 5) Upgrade to Premium for priority placement in search results.' },
      { question: 'What happens if a homeowner cancels a job?', answer: "If a homeowner cancels a job before work begins, you'll be notified immediately. Any credits used to respond to that lead will be refunded to your account. If work has already started, you should communicate directly with the homeowner to resolve any payment for completed work." },
      { question: 'How do I update my service area?', answer: 'Go to your Profile settings and select "Service Area." You can add or remove cities, ZIP codes, and set your travel radius. You can also specify travel fees for jobs outside your primary service area. Changes take effect immediately.' },
      { question: 'How are reviews verified?', answer: 'Reviews on Emporva are only accepted from homeowners who have completed a job with you through our platform. This ensures all reviews are from genuine customers. We also have systems in place to detect and remove fraudulent reviews.' },
    ],
  },

  'homeowner-help': {
    name: 'Homeowner Help FAQ',
    headline: 'Frequently Asked Questions',
    subhead: 'Find answers to common questions about your Emporva account and dashboard.',
    seo_title: 'Homeowner Help - Emporva',
    seo_description: 'Answers about plans, Property Overview, Property Memory, systems, utilities, and maintenance for Emporva homeowners.',
    categories: [
      { title: 'Account & Plans', items: [
        { question: 'What is the difference between the Core and Premium plans?', answer: 'The Core plan is free and includes basic job posting, messaging with contractors, and access to your Property Overview dashboard with system registry and task tracking. Premium ($12/month) adds AI-powered predictive maintenance, Property Memory with full document vault, DIY project guides, renovation visualization tools, utility insights, and dedicated support with faster response times. You can compare all features side-by-side on the Plans page.' },
        { question: 'How do I upgrade from Core to Premium?', answer: 'Go to Billing & Plans from your account menu (top-right avatar), then click "Upgrade to Premium." You will see the full pricing and a feature comparison. Your upgrade takes effect immediately. All your existing property data, jobs, and documents carry over seamlessly.' },
        { question: 'Can I cancel my Premium subscription at any time?', answer: 'Absolutely. You can cancel anytime from the Billing & Plans page. Your Premium access continues until the end of your current billing period. After cancellation, your account automatically reverts to the free Core plan.' },
        { question: 'How do I update my personal information?', answer: 'Click your profile avatar in the top-right corner and select "Profile." From there you can update your name, email, phone number, and mailing address. You can also upload a profile photo. Changes save immediately — just click "Save Changes" at the bottom of the page.' },
        { question: 'How do I change my password?', answer: 'Go to Settings from your account menu. Under the Security section, click "Change Password." You will need to enter your current password, then create and confirm your new password. For your security, passwords must be at least 8 characters and include a mix of letters, numbers, and symbols.' },
        { question: 'How do notifications work?', answer: 'Your notification bell in the top navigation shows all alerts in real time — new contractor messages, job status updates, upcoming maintenance reminders, and system alerts. Red badge counts show unread items. You can customize which notifications you receive by going to Settings > Notifications and toggling each category on or off.' },
        { question: 'Can I share my dashboard with a spouse or family member?', answer: 'Currently each account is designed for a single user. We are actively building a household sharing feature that will let you invite family members to view and manage your property, each with their own login and permission level. This is planned for a future release. In the meantime, you can export your property information as a PDF from the Property Overview page to share.' },
      ] },
      { title: 'Property Overview', items: [
        { question: 'What information does the Property Overview show me?', answer: 'The Overview tab is your command center. The Summary view shows your property stats (square footage, year built, systems count, upcoming tasks), an AI-powered health diagnosis, and recent activity on your home. The Gallery tab shows all your property photos organized by room.' },
        { question: 'How does the AI property diagnosis work?', answer: "Our AI analyzes your property's age, location, system registry, maintenance history, and utility patterns to generate a real-time health score and diagnosis. It flags systems nearing end-of-life, identifies energy efficiency gaps, and surfaces potential issues before they become emergencies. The more data you add (systems, maintenance records, utility bills), the more accurate and personalized the diagnosis becomes." },
        { question: "How do I edit my property's details?", answer: 'From the Overview tab, click the "Edit Property" button. A modal opens where you can update the property type, year built, square footage, number of bedrooms and bathrooms, lot size, and number of stories. Changes save immediately and are reflected across all dashboard tabs.' },
      ] },
      { title: 'Property Memory', items: [
        { question: 'What is Property Memory and why should I use it?', answer: "Property Memory is a complete digital record of everything that has ever been done to your home — repairs, renovations, installations, inspections, and maintenance. Think of it as your home's permanent medical record. It logs every contractor visit, stores all documents and photos, and creates a searchable timeline. When you eventually sell your home, having a complete Property Memory can significantly increase buyer confidence and your home's value." },
        { question: 'What types of documents should I upload to the Document Vault?', answer: 'We recommend uploading: property deed and title documents, home insurance policies, tax assessments, inspection reports (roof, foundation, pest, HVAC), warranties for all appliances and systems, permits from past renovations, HOA documents and bylaws, purchase and closing documents, appliance manuals, and any insurance claims history. The vault organizes everything by category so you can find what you need instantly.' },
        { question: 'How does Property Memory help when selling my home?', answer: 'A complete Property Memory gives buyers confidence that the home has been well-maintained. You can generate a "Home History Report" that shows every system replaced, every repair documented, and every regular maintenance performed — with dates, receipts, and contractor information. This transparency often translates to higher offers, faster sales, and fewer negotiation issues during inspection.' },
        { question: 'How do I upload documents to the Document Vault?', answer: 'Open the Property Memory tab and switch to "Document Vault." You will see category cards for Warranties, Inspections, Tax & Assessments, Insurance, Permits, Appraisals, HOA, Purchase Docs, Manuals, and Other. Click any card to upload directly to that category. You can also use the "Upload" button at the top to add documents with a name, category, and optional notes.' },
        { question: 'Can I search through my documents?', answer: 'Yes. The Document Vault has a search bar at the top that searches across all document names and notes. You can also filter by category using the filter bar. This makes it easy to find a specific warranty, inspection report, or insurance document without digging through physical files.' },
        { question: 'Is my Property Memory data backed up and secure?', answer: 'Yes. All Property Memory data is stored securely in the cloud with encryption at rest and in transit. Your documents, photos, and records are backed up across multiple data centers.' },
      ] },
      { title: 'Systems & Appliances', items: [
        { question: "How do I add my home's systems and appliances?", answer: "Go to the Systems & Appliances tab in your dashboard and click \"Add System.\" Enter the system name, category (HVAC, plumbing, electrical, roofing, appliances, etc.), brand, model number, installation date, and warranty expiration. You can also add the installing contractor's information and upload the warranty document. Each system is tracked independently for maintenance scheduling and predictive lifespan analysis." },
        { question: 'What is Predictive Maintenance and how accurate is it?', answer: "Predictive Maintenance (Premium feature) uses AI to analyze your home's age, system types, brand reliability data, local climate, usage patterns, maintenance history, and warranty coverage to predict when each major system is likely to need service or replacement. It is typically 85-90% accurate for major systems like HVAC, roofing, and water heaters. This helps you budget for future replacements and schedule proactive maintenance before failures occur." },
        { question: 'How do I track warranties for my appliances and systems?', answer: 'When you add a system to your registry, enter the warranty expiration date and upload the warranty document. The system automatically tracks warranty status — you will see "Active" badges for systems still under warranty and "Expired" warnings for those no longer covered. You will receive a notification 90 days and 30 days before a warranty expires so you can schedule a final covered service if needed.' },
        { question: 'What do the system health statuses mean?', answer: 'Each system is assigned one of three statuses based on age, maintenance history, and condition reports: "Good" (green) means the system is within its expected lifespan and has a clean maintenance record. "Needs Attention" (amber) means the system is approaching end-of-life, has missed recent maintenance, or shows early warning signs. "Critical" (red) means the system is past its expected lifespan, has a history of issues, or has been flagged for immediate attention.' },
        { question: 'Can I add custom systems not in the default categories?', answer: 'Yes. When adding a system, the category dropdown includes the main categories (HVAC, plumbing, electrical, roofing, exterior, appliances, security) but you can also choose "Other" and type in a custom category name. Examples might include: irrigation system, pool equipment, generator, solar panels, or elevator.' },
        { question: 'How does the system timeline help with budgeting?', answer: 'The Systems & Appliances view (Premium) includes a timeline showing when each major system is projected to need replacement, along with estimated costs based on average pricing in your area. This lets you plan capital expenses years in advance — for example, if your HVAC has 3 years of expected life remaining and a replacement costs roughly $8,000 in your area, you can start setting aside about $220 per month now.' },
      ] },
      { title: 'Utilities & Insights', items: [
        { question: 'How do I track my utility usage?', answer: 'The Utilities tab lets you log your monthly electricity, gas, water, and other utility bills. Enter the billing period, usage amount (kWh, therms, gallons), and total cost. Over time, the system builds a usage history that you can view as charts — monthly trends, year-over-year comparisons, and seasonal patterns. This makes it easy to spot unusual spikes that might indicate a problem.' },
        { question: 'What do Utility Insights (Premium) show me?', answer: 'Utility Insights takes your logged utility data and runs an AI analysis to identify patterns, inefficiencies, and savings opportunities. It compares your usage to similar homes in your climate zone, flags months with unusually high consumption, estimates the impact of specific upgrades (e.g., adding insulation, replacing windows), and projects your annual energy costs. You will get actionable recommendations like "Your water usage in July was 40% above your neighborhood average — consider checking for leaks or irrigation inefficiency."' },
        { question: 'Can I track solar panel production?', answer: 'If your home has solar panels, you can log your monthly solar production (kWh generated) in the Utilities tab. The system tracks both production and grid consumption side-by-side, showing your net energy usage and the financial value of your solar generation. This is especially useful for understanding your true energy costs and payback period.' },
        { question: 'How do I manually enter utility bills?', answer: 'In the Utilities tab, click "Add Entry." Select the utility type (electric, gas, water, trash, internet, or custom), enter the billing period dates, usage amount and unit, total cost, and any notes. You can also upload a photo or PDF of the bill for your records. For recurring bills, check the "Recurring" option to set up a monthly reminder.' },
        { question: 'How far back should I log utility data?', answer: 'The more data, the better the insights. We recommend entering at least 12 months of history for meaningful year-over-year comparisons. If you have older bills available, entering 24-36 months of data gives the AI a much richer dataset for pattern detection and seasonal analysis. You can enter past bills manually or upload PDFs for your records.' },
      ] },
      { title: 'Premium Features', items: [
        { question: 'How does Renovation Preview work?', answer: 'Renovation Preview (Premium) lets you visualize potential renovations before committing to them. Upload a photo of the space you want to renovate, select the type of renovation (kitchen, bathroom, exterior, flooring, paint), and describe what you want to change. Our AI generates a realistic preview of the finished result. You can compare multiple design options side-by-side and share them with contractors for more accurate quoting.' },
        { question: 'What kind of DIY project guides are available?', answer: 'The DIY Projects tab (Premium) includes step-by-step guides for common home improvement projects that most homeowners can tackle themselves. Categories include painting, basic plumbing fixes, electrical safety and simple replacements, drywall repair, flooring installation, weatherproofing, landscaping basics, and smart home installations. Each guide includes estimated time, required tools list, material costs, and safety precautions.' },
        { question: 'How does Utility Insights save me money?', answer: 'Utility Insights (Premium) runs an AI analysis on your logged utility bills and compares your consumption to similar homes in your climate zone and to your own historical patterns. It identifies months where usage spiked unusually, estimates the cost impact of specific efficiency upgrades, and projects your future bills. Many homeowners discover issues like HVAC inefficiency, water leaks, or poor insulation through these insights — catching these early can save hundreds or thousands of dollars.' },
        { question: 'Are the DIY guides safe for a complete beginner?', answer: 'Each guide is explicit about when you should hire a professional instead — for example, electrical work beyond replacing a light fixture or outlet is clearly marked as "Hire a Pro." Safety warnings are prominently displayed at the top of every guide. When in doubt, the guide will always recommend consulting a licensed professional.' },
      ] },
      { title: 'Maintenance & Tasks', items: [
        { question: 'How does seasonal maintenance tracking work?', answer: 'The Seasonal Tasks tab shows a month-by-month checklist of recommended maintenance for your home, customized to your climate zone and property type. Tasks are organized by season — spring (AC tune-up, gutter cleaning), summer (deck sealing, pest inspection), fall (furnace check, chimney sweep), winter (pipe insulation, ice dam prevention). Each task has a recommended timeframe, difficulty level, and estimated cost. Check off tasks as you complete them to build your maintenance history.' },
        { question: 'What is the Task Board and how do I use it?', answer: 'The Task Board is a Kanban-style view for managing all your home projects and to-dos. Tasks are organized into columns: To Do, In Progress, and Done. Each task card shows the task name, due date, priority level, and assigned category. Drag cards between columns as work progresses. This works great for managing multiple home projects simultaneously — from a bathroom remodel to simple touch-up painting.' },
        { question: 'Can I export my maintenance checklist?', answer: 'Yes. From the Seasonal Tasks tab, click the "Export" button to download your current checklist as a PDF. This is useful for sharing with a spouse, property manager, or new homeowner if you sell. The PDF includes task names, recommended months, completion status, and any notes you have added.' },
        { question: 'How do I mark a task as complete?', answer: 'Click the checkbox next to any task in the Seasonal Tasks list or on the Task Board. Completed tasks move to the "Done" column on the Task Board and show a strikethrough with a completion date on the Seasonal Tasks view. Completed tasks are automatically recorded in your Property Memory Work History.' },
        { question: 'What if I miss a seasonal task?', answer: 'No problem — overdue tasks remain visible in your list with an "Overdue" label so you do not lose track of them. You can still complete them and check them off. The system will not penalize you, but your maintenance score will reflect overdue items until they are completed. The goal is to keep you informed, not stressed.' },
      ] },
    ],
  },
};

// ──────────────────────────────────────────────────────────────
// Richtext builders (Storyblok ProseMirror format)
// ──────────────────────────────────────────────────────────────

const text = (str) => ({ type: 'text', text: str });
const paragraph = (str) => ({ type: 'paragraph', content: [text(str)] });
const answerDoc = (str) => ({ type: 'doc', content: [paragraph(str)] });

const faqItemBlok = (item) => ({
  _uid: randomUUID(),
  component: 'faq_item',
  question: item.question,
  answer: answerDoc(item.answer),
});

const faqCategoryBlok = (category) => ({
  _uid: randomUUID(),
  component: 'faq_category',
  title: category.title,
  items: category.items.map(faqItemBlok),
});

function buildFaqListContent(def) {
  return {
    component: 'faq_list',
    headline: def.headline || '',
    subhead: def.subhead || '',
    items: (def.items || []).map(faqItemBlok),
    categories: (def.categories || []).map(faqCategoryBlok),
    seo_title: def.seo_title || '',
    seo_description: def.seo_description || '',
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

async function ensureFaqsFolder() {
  const existing = await findStoryByFullSlug('faqs', true);
  if (existing) return existing;
  console.log("Creating 'faqs' folder...");
  const data = await api('/stories', {
    method: 'POST',
    body: JSON.stringify({
      story: { name: 'FAQs', slug: 'faqs', is_folder: true, default_root: 'faq_list' },
    }),
  });
  return data.story;
}

async function upsertStory({ name, slug, parentId, content }) {
  const fullSlug = `faqs/${slug}`;
  const existing = await findStoryByFullSlug(fullSlug);
  const story = { name, slug, parent_id: parentId, content, is_folder: false };
  if (existing) {
    await api(`/stories/${existing.id}`, { method: 'PUT', body: JSON.stringify({ story, publish: 1 }) });
    console.log(`  ↻ updated: ${fullSlug}`);
    return existing;
  }
  const data = await api('/stories', { method: 'POST', body: JSON.stringify({ story, publish: 1 }) });
  console.log(`  + created: ${fullSlug}`);
  return data.story;
}

async function main() {
  console.log(`Seeding FAQ stories in space ${SPACE_ID} (${REGION} region)...\n`);

  const folder = await ensureFaqsFolder();
  console.log(`Using faqs folder (id: ${folder.id}).\n`);

  for (const [slug, def] of Object.entries(faqStories)) {
    await upsertStory({
      name: def.name,
      slug,
      parentId: folder.id,
      content: buildFaqListContent(def),
    });
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('\nSeed failed:', err.message);
  if (err.data) console.error(JSON.stringify(err.data, null, 2));
  process.exit(1);
});
