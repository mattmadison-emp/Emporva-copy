/// <reference lib="dom" />

import { storyblokInit, apiPlugin, getStoryblokApi } from '@storyblok/react';

export interface BulletBlok {
  _uid: string;
  component: 'bullet';
  text: string;
}

export interface ServiceStoryContent {
  component: 'service';
  title: string;
  description: string;
  icon: string;
  hero_image?: { filename: string; alt?: string };
  common_issues: BulletBlok[];
  process_steps: BulletBlok[];
  avg_cost: string;
  urgency: string;
  feature_title?: string;
  feature?: RichTextDocument;
  seo_title?: string;
  seo_description?: string;
  keywords?: string;
  body?: unknown;
}

export interface ServicesIndexContent {
  component: 'services_index';
  headline: string;
  subhead?: string;
  body?: unknown;
  seo_title?: string;
  seo_description?: string;
}

export interface RichTextNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: RichTextNode[];
  text?: string;
  marks?: { type: string; attrs?: Record<string, unknown> }[];
}

export interface RichTextDocument {
  type: 'doc';
  content: RichTextNode[];
}

export interface ArticleContent {
  component: 'article';
  title: string;
  excerpt: string;
  category: string;
  hero_image?: { filename: string; alt?: string };
  author?: string;
  published_date: string;
  read_time: string;
  keywords?: string;
  body: RichTextDocument;
  feature_title?: string;
  feature?: RichTextDocument;
  seo_title?: string;
  seo_description?: string;
}

export interface BlogIndexContent {
  component: 'blog_index';
  headline: string;
  subhead?: string;
  seo_title?: string;
  seo_description?: string;
}

export interface FaqItemBlok {
  _uid: string;
  component: 'faq_item';
  question: string;
  answer: RichTextDocument;
}

export interface FaqCategoryBlok {
  _uid: string;
  component: 'faq_category';
  title: string;
  items: FaqItemBlok[];
}

export interface FaqListContent {
  component: 'faq_list';
  headline?: string;
  subhead?: string;
  items?: FaqItemBlok[];
  categories?: FaqCategoryBlok[];
  seo_title?: string;
  seo_description?: string;
}

export interface StoryblokStory<T> {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  full_slug: string;
  content: T;
  published_at: string | null;
  first_published_at: string | null;
}

const STORYBLOK_TOKEN = import.meta.env.VITE_STORYBLOK_TOKEN || '';
const STORYBLOK_VERSION: 'draft' | 'published' = import.meta.env.DEV ? 'draft' : 'published';

let initialized = false;

export function initStoryblok(): void {
  if (initialized) return;
  if (!STORYBLOK_TOKEN) {
    console.warn('[storyblok] VITE_STORYBLOK_TOKEN is not set — Storyblok content will not load.');
  }
  storyblokInit({
    accessToken: STORYBLOK_TOKEN,
    use: [apiPlugin],
  });
  initialized = true;
}

const storyCache = new Map<string, StoryblokStory<unknown>>();
const listCache = new Map<string, StoryblokStory<unknown>[]>();

function ensureInit() {
  if (!initialized) initStoryblok();
}

export async function fetchStory<T>(slug: string): Promise<StoryblokStory<T>> {
  ensureInit();
  const cacheKey = `${STORYBLOK_VERSION}:${slug}`;
  const cached = storyCache.get(cacheKey);
  if (cached) return cached as StoryblokStory<T>;

  const api = getStoryblokApi();
  const { data } = await api.get(`cdn/stories/${slug}`, {
    version: STORYBLOK_VERSION,
  });
  storyCache.set(cacheKey, data.story);
  return data.story as StoryblokStory<T>;
}

export async function fetchStoriesByFolder<T>(folder: string): Promise<StoryblokStory<T>[]> {
  ensureInit();
  const cacheKey = `${STORYBLOK_VERSION}:folder:${folder}`;
  const cached = listCache.get(cacheKey);
  if (cached) return cached as StoryblokStory<T>[];

  const api = getStoryblokApi();
  const { data } = await api.get('cdn/stories', {
    version: STORYBLOK_VERSION,
    starts_with: folder,
    is_startpage: false,
  } as Parameters<typeof api.get>[1]);
  const stories = (data as { stories: StoryblokStory<T>[] }).stories;
  listCache.set(cacheKey, stories);
  return stories;
}

export function fetchService(slug: string): Promise<StoryblokStory<ServiceStoryContent>> {
  return fetchStory<ServiceStoryContent>(`services/${slug}`);
}

export function fetchServices(): Promise<StoryblokStory<ServiceStoryContent>[]> {
  return fetchStoriesByFolder<ServiceStoryContent>('services/');
}

export function fetchArticle(slug: string): Promise<StoryblokStory<ArticleContent>> {
  return fetchStory<ArticleContent>(`blog/${slug}`);
}

export function fetchArticles(): Promise<StoryblokStory<ArticleContent>[]> {
  return fetchStoriesByFolder<ArticleContent>('blog/');
}

export function fetchFaqList(slug: string): Promise<StoryblokStory<FaqListContent>> {
  return fetchStory<FaqListContent>(`faqs/${slug}`);
}

export function clearStoryblokCache(): void {
  storyCache.clear();
  listCache.clear();
}
