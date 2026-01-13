'use client';

/**
 * Portable Text Renderer for Sanity CMS content
 * Renders Sanity's Portable Text format to React components
 */

import { PortableText, type PortableTextComponents } from '@portabletext/react';
import Image from 'next/image';

// Sanity Portable Text block types
interface PortableTextBlock {
  _key: string;
  _type: string;
  children?: Array<{
    _key: string;
    _type: string;
    text?: string;
    marks?: string[];
  }>;
  markDefs?: Array<{
    _key: string;
    _type: string;
    href?: string;
  }>;
  style?: string;
  level?: number;
  listItem?: 'bullet' | 'number';
}

interface SanityImageBlock {
  _type: 'image';
  _key: string;
  asset: {
    _ref: string;
    url?: string;
  };
  alt?: string;
}

type PortableTextValue = PortableTextBlock | SanityImageBlock;

/**
 * Custom components for Portable Text rendering
 */
const components: PortableTextComponents = {
  block: {
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold mt-8 mb-3 text-foreground">{children}</h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-lg font-semibold mt-6 mb-2 text-foreground">{children}</h4>
    ),
    normal: ({ children }) => (
      <p className="text-foreground-muted leading-relaxed mb-4">{children}</p>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-primary pl-4 my-6 italic text-foreground-muted">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-6 text-foreground-muted ml-4">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-6 text-foreground-muted ml-4">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="leading-relaxed">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="bg-background-secondary px-1.5 py-0.5 rounded text-sm font-mono text-primary">
        {children}
      </code>
    ),
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }: { value: SanityImageBlock }) => {
      if (!value?.asset) return null;
      return (
        <figure className="my-8">
          <div className="relative aspect-video overflow-hidden rounded-lg">
            <Image
              src={value.asset.url || `/api/sanity-image?ref=${value.asset._ref}`}
              alt={value.alt || 'Article image'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
          {value.alt && (
            <figcaption className="text-center text-sm text-foreground-muted mt-2">
              {value.alt}
            </figcaption>
          )}
        </figure>
      );
    },
  },
};

interface PortableTextRendererProps {
  content: string | PortableTextValue[];
}

/**
 * Renders Sanity Portable Text content
 * Accepts either a JSON string or parsed array
 */
export function PortableTextRenderer({ content }: PortableTextRendererProps) {
  // Parse content if it's a string
  let parsedContent: PortableTextValue[];

  if (typeof content === 'string') {
    try {
      parsedContent = JSON.parse(content);
    } catch {
      // If parsing fails, show as plain text
      return <p className="text-foreground-muted">{content}</p>;
    }
  } else {
    parsedContent = content;
  }

  // If content is empty or not an array
  if (!Array.isArray(parsedContent) || parsedContent.length === 0) {
    return null;
  }

  return (
    <div className="portable-text">
      <PortableText value={parsedContent} components={components} />
    </div>
  );
}

export default PortableTextRenderer;
