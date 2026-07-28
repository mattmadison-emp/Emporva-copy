#!/usr/bin/env node
/**
 * Push components.json to a Storyblok space via the Management API.
 *
 * Bypasses the storyblok CLI (which has issues with empty spaces / region detection).
 * Reads the components from ./storyblok/components.json and upserts each one in the space.
 *
 * Usage:
 *   STORYBLOK_OAUTH_TOKEN=<personal-access-token> node ./storyblok/push-components.mjs
 *
 * Environment:
 *   STORYBLOK_OAUTH_TOKEN  Required. Personal Access Token from
 *                          Storyblok → Account Settings → Personal Access Tokens.
 *   STORYBLOK_SPACE_ID     Optional. Defaults to 290960764133094.
 *   STORYBLOK_REGION       Optional. eu | us | ap | ca | cn. Defaults to eu.
 */

import { readFile } from 'node:fs/promises';
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
    if (!(key in process.env)) {
      process.env[key] = value;
    }
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
  console.error('Missing STORYBLOK_OAUTH_TOKEN environment variable.');
  console.error('Generate one at: https://app.storyblok.com/#/me/account?tab=token');
  process.exit(1);
}

const host = REGION_HOSTS[REGION];
if (!host) {
  console.error(`Unknown region: ${REGION}. Valid: ${Object.keys(REGION_HOSTS).join(', ')}`);
  process.exit(1);
}

const baseUrl = `https://${host}/v1/spaces/${SPACE_ID}`;
const headers = {
  Authorization: TOKEN,
  'Content-Type': 'application/json',
};

const componentsPath = resolve(__dirname, 'components.json');

async function loadComponents() {
  const raw = await readFile(componentsPath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed.components)) {
    throw new Error(`components.json must have a "components" array.`);
  }
  return parsed.components;
}

async function fetchExistingComponents() {
  const res = await fetch(`${baseUrl}/components`, { headers });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GET /components failed (${res.status}): ${body}`);
  }
  const data = await res.json();
  return data.components || [];
}

async function createComponent(component) {
  const res = await fetch(`${baseUrl}/components`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ component }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`POST /components (${component.name}) failed (${res.status}): ${body}`);
  }
  return res.json();
}

async function updateComponent(id, component) {
  const res = await fetch(`${baseUrl}/components/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ component }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`PUT /components/${id} (${component.name}) failed (${res.status}): ${body}`);
  }
  return res.json();
}

async function main() {
  console.log(`Pushing components to space ${SPACE_ID} (${REGION} region)...`);

  const local = await loadComponents();
  console.log(`Loaded ${local.length} component(s) from components.json.`);

  const existing = await fetchExistingComponents();
  console.log(`Space currently has ${existing.length} component(s).`);

  const existingByName = new Map(existing.map((c) => [c.name, c]));

  let created = 0;
  let updated = 0;

  for (const component of local) {
    const match = existingByName.get(component.name);
    if (match) {
      await updateComponent(match.id, component);
      console.log(`  ↻ updated: ${component.name}`);
      updated++;
    } else {
      await createComponent(component);
      console.log(`  + created: ${component.name}`);
      created++;
    }
  }

  console.log(`\nDone. ${created} created, ${updated} updated.`);
}

main().catch((err) => {
  console.error('\nPush failed:', err.message);
  process.exit(1);
});
