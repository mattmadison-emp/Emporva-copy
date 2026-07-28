import { Fragment, type CSSProperties } from 'react';
import type { RichTextDocument, RichTextNode } from '../../services/storyblokService';

interface RichTextProps {
  doc: RichTextDocument | null | undefined;
  className?: string;
}

const headingClassByLevel: Record<number, string> = {
  1: 'text-4xl md:text-5xl font-bold text-[#0B1F33] mt-12 mb-6',
  2: 'text-2xl md:text-3xl font-bold text-[#0B1F33] mt-10 mb-4',
  3: 'text-xl md:text-2xl font-semibold text-[#0B1F33] mt-8 mb-3',
  4: 'text-lg md:text-xl font-semibold text-[#0B1F33] mt-6 mb-3',
  5: 'text-base md:text-lg font-semibold text-[#0B1F33] mt-5 mb-2',
  6: 'text-base font-semibold text-[#0B1F33] mt-4 mb-2',
};

const paragraphFont: CSSProperties = { fontFamily: 'Inter, sans-serif' };

function renderText(node: RichTextNode, key: number) {
  let element: React.ReactNode = node.text ?? '';
  for (const mark of node.marks ?? []) {
    if (mark.type === 'bold') element = <strong>{element}</strong>;
    else if (mark.type === 'italic') element = <em>{element}</em>;
    else if (mark.type === 'underline') element = <u>{element}</u>;
    else if (mark.type === 'code') element = <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">{element}</code>;
    else if (mark.type === 'link') {
      const href = (mark.attrs?.href as string) || '#';
      const target = mark.attrs?.target as string | undefined;
      element = (
        <a
          href={href}
          target={target}
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
          className="text-[#D4B483] underline hover:text-[#c4a473]"
        >
          {element}
        </a>
      );
    }
  }
  return <Fragment key={key}>{element}</Fragment>;
}

function renderNode(node: RichTextNode, key: number): React.ReactNode {
  const children = node.content?.map((child, i) => renderNode(child, i));

  switch (node.type) {
    case 'text':
      return renderText(node, key);
    case 'paragraph':
      return (
        <p key={key} className="text-[#333645] leading-relaxed mb-4" style={paragraphFont}>
          {children}
        </p>
      );
    case 'heading': {
      const level = Math.min(Math.max(Number(node.attrs?.level) || 2, 1), 6);
      const className = headingClassByLevel[level];
      const headingStyle = { fontFamily: 'Poppins, sans-serif' };
      if (level === 1) return <h1 key={key} className={className} style={headingStyle}>{children}</h1>;
      if (level === 2) return <h2 key={key} className={className} style={headingStyle}>{children}</h2>;
      if (level === 3) return <h3 key={key} className={className} style={headingStyle}>{children}</h3>;
      if (level === 4) return <h4 key={key} className={className} style={headingStyle}>{children}</h4>;
      if (level === 5) return <h5 key={key} className={className} style={headingStyle}>{children}</h5>;
      return <h6 key={key} className={className} style={headingStyle}>{children}</h6>;
    }
    case 'bullet_list':
      return (
        <ul key={key} className="list-disc pl-6 mb-6 space-y-2 text-[#333645]" style={paragraphFont}>
          {children}
        </ul>
      );
    case 'ordered_list':
      return (
        <ol key={key} className="list-decimal pl-6 mb-6 space-y-2 text-[#333645]" style={paragraphFont}>
          {children}
        </ol>
      );
    case 'list_item':
      return (
        <li key={key} className="leading-relaxed">
          {children}
        </li>
      );
    case 'blockquote':
      return (
        <blockquote
          key={key}
          className="border-l-4 border-[#D4B483] pl-4 italic text-[#6B7C8F] my-6"
          style={paragraphFont}
        >
          {children}
        </blockquote>
      );
    case 'hard_break':
      return <br key={key} />;
    case 'horizontal_rule':
      return <hr key={key} className="my-8 border-gray-200" />;
    case 'image': {
      const src = node.attrs?.src as string | undefined;
      const alt = (node.attrs?.alt as string) || '';
      if (!src) return null;
      return <img key={key} src={src} alt={alt} className="rounded-lg my-6 w-full" loading="lazy" />;
    }
    default:
      return children ? <Fragment key={key}>{children}</Fragment> : null;
  }
}

export default function RichText({ doc, className }: RichTextProps) {
  if (!doc || !doc.content) return null;
  return (
    <div className={className}>
      {doc.content.map((node, i) => renderNode(node, i))}
    </div>
  );
}
