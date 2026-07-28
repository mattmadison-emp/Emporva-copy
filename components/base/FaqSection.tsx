import { useMemo, useState } from 'react';
import RichText from './RichText';
import type {
  FaqListContent,
  FaqItemBlok,
  RichTextDocument,
  RichTextNode,
} from '../../services/storyblokService';

// ── Rich text → plain text (for search + SEO FAQ schema) ──
function nodeToPlain(node: RichTextNode | RichTextDocument | undefined): string {
  if (!node) return '';
  if ('text' in node && node.text) return node.text;
  const children = (node as RichTextNode).content || (node as RichTextDocument).content;
  if (!children) return '';
  return children.map(nodeToPlain).join(' ');
}

function richTextToPlain(doc?: RichTextDocument): string {
  return nodeToPlain(doc).replace(/\s+/g, ' ').trim();
}

/** Flatten a FAQ story (flat items + all category items) into {question, answer} pairs for generateFAQSchema. */
export function flattenFaqs(
  content?: FaqListContent | null,
): Array<{ question: string; answer: string }> {
  if (!content) return [];
  const items: FaqItemBlok[] = [
    ...(content.items || []),
    ...(content.categories || []).flatMap((c) => c.items || []),
  ];
  return items
    .filter((i) => i?.question)
    .map((i) => ({ question: i.question, answer: richTextToPlain(i.answer) }));
}

/**
 * Convert a FAQ story into `[{ section, items:[{question, answer}] }]` with plain-text
 * answers. Lets pages with their own accordion/search UI (e.g. the account help pages)
 * source their data from Storyblok without changing their layout.
 */
export function faqContentToSections(
  content?: FaqListContent | null,
): Array<{ section: string; items: Array<{ question: string; answer: string }> }> {
  if (!content) return [];
  const toItems = (items?: FaqItemBlok[]) =>
    (items || []).filter((i) => i?.question).map((i) => ({ question: i.question, answer: richTextToPlain(i.answer) }));

  const sections: Array<{ section: string; items: Array<{ question: string; answer: string }> }> = [];
  if (content.items?.length) sections.push({ section: '', items: toItems(content.items) });
  for (const cat of content.categories || []) {
    sections.push({ section: cat.title, items: toItems(cat.items) });
  }
  return sections.filter((s) => s.items.length > 0);
}

interface FaqAccordionProps {
  items: FaqItemBlok[];
  openSet: Set<string>;
  toggle: (uid: string) => void;
}

function FaqAccordion({ items, openSet, toggle }: FaqAccordionProps) {
  return (
    <div className="space-y-4">
      {items.map((item) => {
        const isOpen = openSet.has(item._uid);
        return (
          <div
            key={item._uid}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggle(item._uid)}
              className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left cursor-pointer hover:bg-gray-50/50 transition-colors"
              aria-expanded={isOpen}
            >
              <span
                className="text-base sm:text-lg font-semibold text-[#0B1F33]"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {item.question}
              </span>
              <i
                className={`ri-arrow-down-s-line text-2xl text-[#D4B483] flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                aria-hidden="true"
              ></i>
            </button>
            {isOpen && (
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 border-t border-gray-100 pt-4">
                <RichText doc={item.answer} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface FaqSectionProps {
  content?: FaqListContent | null;
  /** Render a search box that filters questions/answers (used on help pages). */
  searchable?: boolean;
  /** Render the headline/subhead from the story. Default true. */
  showHeadline?: boolean;
  className?: string;
}

/**
 * Storyblok-driven FAQ section. Renders a flat accordion (from `items`) and/or
 * grouped accordions (from `categories`). Returns null when there's no content,
 * so it's safe to drop onto any page whose FAQ story may be empty/unpublished.
 */
export default function FaqSection({
  content,
  searchable = false,
  showHeadline = true,
  className = '',
}: FaqSectionProps) {
  const [openSet, setOpenSet] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');

  const toggle = (uid: string) =>
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });

  const q = query.trim().toLowerCase();
  const matches = useMemo(() => {
    return (item: FaqItemBlok) =>
      !q ||
      item.question.toLowerCase().includes(q) ||
      richTextToPlain(item.answer).toLowerCase().includes(q);
  }, [q]);

  if (!content) return null;

  const flatItems = (content.items || []).filter(matches);
  const categories = (content.categories || [])
    .map((c) => ({ ...c, items: (c.items || []).filter(matches) }))
    .filter((c) => c.items.length > 0);

  const totalRaw = (content.items?.length || 0) + (content.categories || []).reduce((n, c) => n + (c.items?.length || 0), 0);
  if (totalRaw === 0) return null;

  const nothingMatches = flatItems.length === 0 && categories.length === 0;

  return (
    <div className={className}>
      {showHeadline && (content.headline || content.subhead) && (
        <div className="text-center mb-10">
          {content.headline && (
            <h2
              className="text-3xl md:text-4xl font-bold text-[#0B1F33] mb-4"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {content.headline}
            </h2>
          )}
          {content.subhead && (
            <p
              className="text-lg text-[#6B7C8F] max-w-2xl mx-auto"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {content.subhead}
            </p>
          )}
        </div>
      )}

      {searchable && (
        <div className="max-w-xl mx-auto mb-8 relative">
          <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-[#333645]/50 text-xl" aria-hidden="true"></i>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search questions..."
            aria-label="Search FAQs"
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm bg-white"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
        </div>
      )}

      {nothingMatches ? (
        <div className="text-center py-12 text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
          No questions found matching “{query}”.
        </div>
      ) : (
        <div className="space-y-10">
          {flatItems.length > 0 && (
            <FaqAccordion items={flatItems} openSet={openSet} toggle={toggle} />
          )}
          {categories.map((category) => (
            <div key={category._uid}>
              <h3
                className="text-xl font-bold text-[#0B1F33] mb-4"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                {category.title}
              </h3>
              <FaqAccordion items={category.items} openSet={openSet} toggle={toggle} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
