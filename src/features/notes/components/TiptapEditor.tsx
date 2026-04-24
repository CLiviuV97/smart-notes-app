'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useRef } from 'react';

/** Convert simple markdown (headings + paragraphs) to HTML for Tiptap */
function markdownToHtml(md: string): string {
  if (!md) return '<p></p>';
  return md
    .split('\n')
    .map((line) => {
      const h = line.match(/^(#{1,3})\s+(.+)/);
      if (h && h[1] && h[2]) {
        return `<h${h[1].length}>${h[2]}</h${h[1].length}>`;
      }
      return `<p>${line}</p>`;
    })
    .join('');
}

/** Convert Tiptap HTML back to markdown-ish plain text */
function htmlToMarkdown(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  const lines: string[] = [];
  div.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      lines.push(node.textContent ?? '');
      return;
    }
    const el = node as HTMLElement;
    const tag = el.tagName;
    const text = el.textContent ?? '';
    if (tag === 'H1') lines.push(`# ${text}`);
    else if (tag === 'H2') lines.push(`## ${text}`);
    else if (tag === 'H3') lines.push(`### ${text}`);
    else lines.push(text);
  });
  return lines.join('\n');
}

interface TiptapEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  className?: string;
}

export function TiptapEditor({ content, onChange, className }: TiptapEditorProps) {
  const lastNoteContent = useRef(content);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        blockquote: false,
        bulletList: false,
        codeBlock: false,
        horizontalRule: false,
        listItem: false,
        orderedList: false,
        code: false,
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder: 'Start writing...' }),
    ],
    content: markdownToHtml(content),
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[300px]',
      },
    },
    onUpdate: ({ editor: ed }) => {
      const md = htmlToMarkdown(ed.getHTML());
      lastNoteContent.current = md;
      onChange(md);
    },
  });

  // Reset editor content when note switches (content prop changes externally)
  useEffect(() => {
    if (editor && content !== lastNoteContent.current) {
      lastNoteContent.current = content;
      editor.commands.setContent(markdownToHtml(content));
    }
  }, [content, editor]);

  return <EditorContent editor={editor} className={className} />;
}
