import RichText from './RichText';
import type { RichTextDocument } from '../../services/storyblokService';

interface FeatureCalloutProps {
  title?: string;
  doc?: RichTextDocument;
  className?: string;
}

/**
 * Highlighted "feature / information" callout, styled like the "Why Emporva?"
 * card on the About page: a white card with a gold (sand) left border.
 * Renders nothing when both the title and body are empty, so it's safe to
 * drop into any page whose Storyblok story may or may not populate the field.
 */
function docHasContent(doc?: RichTextDocument): boolean {
  if (!doc?.content?.length) return false;
  return doc.content.some((node) =>
    node.type === 'paragraph' ? !!node.content?.length : true,
  );
}

/** True when the callout would render something (used to gate section wrappers). */
export function hasFeatureContent(title?: string, doc?: RichTextDocument): boolean {
  return !!title?.trim() || docHasContent(doc);
}

export default function FeatureCallout({ title, doc, className = '' }: FeatureCalloutProps) {
  const hasTitle = !!title?.trim();
  const hasBody = docHasContent(doc);
  if (!hasTitle && !hasBody) return null;

  return (
    <article className={`bg-white rounded-xl shadow-sm p-8 sm:p-12 border-l-4 border-[#D4B483] ${className}`}>
      {hasTitle && (
        <h2 className="text-lg text-[#333645] leading-relaxed font-semibold mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
          {title}
        </h2>
      )}
      {hasBody && <RichText doc={doc} />}
    </article>
  );
}
