import type { FC } from "react";

type Props = {
  description?: string | null;
  previewLink?: string | null;
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function sanitizeAllowedHtml(html: string) {
  const allowed = new Set(['P', 'B', 'I', 'EM', 'STRONG', 'BR']);
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  function serialize(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
      return escapeHtml(node.textContent || '');
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tag = el.tagName.toUpperCase();
      if (!allowed.has(tag)) {
        let out = '';
        el.childNodes.forEach(child => out += serialize(child));
        return out;
      }
      if (tag === 'BR') return '<br/>';
      let out = `<${tag.toLowerCase()}>`;
      el.childNodes.forEach(child => out += serialize(child));
      out += `</${tag.toLowerCase()}>`;
      return out;
    }
    return '';
  }

  let out = '';
  doc.body.childNodes.forEach(n => out += serialize(n));
  return out;
}

export const BookDescription: FC<Props> = ({ description, previewLink }) => {
  return (
    <div className="book-description">
      {description ? (
        <div
          className="book-page-description"
          dangerouslySetInnerHTML={{ __html: sanitizeAllowedHtml(description) }}
        />
      ) : (
        <p className="book-page-description">Sem descrição disponível.</p>
      )}

      {previewLink && (
        <a href={previewLink} target="_blank" rel="noreferrer" className="book-page-preview-link">
          Ver no Google Books
        </a>
      )}
    </div>
  );
};
