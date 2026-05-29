import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';

const ToolbarBtn = ({ active, disabled, onClick, title, children }) => (
  <button
    type="button"
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
    disabled={disabled}
    title={title}
    className={`px-2 py-1 text-sm rounded transition-colors ${
      active
        ? 'bg-[#232F3E] text-white'
        : 'text-[#0F1111] hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed'
    }`}
  >
    {children}
  </button>
);

const Divider = () => <div className="w-px h-5 bg-gray-300 mx-0.5 self-center" />;

export default function RichTextEditor({ value, onChange, placeholder = 'Describe your product…' }) {
  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[140px] px-3 py-2 text-sm text-[#0F1111] focus:outline-none',
      },
    },
  });

  if (!editor) return null;

  const activeHeading = [1, 2, 3].find(l => editor.isActive('heading', { level: l })) ?? 0;

  return (
    <div className="border border-gray-400 rounded focus-within:border-[#e77600] focus-within:ring-1 focus-within:ring-[#e77600] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        {/* Text style */}
        <select
          value={activeHeading}
          onChange={e => {
            const l = parseInt(e.target.value);
            l === 0
              ? editor.chain().focus().setParagraph().run()
              : editor.chain().focus().toggleHeading({ level: l }).run();
          }}
          className="text-xs border border-gray-300 rounded px-1.5 py-0.5 bg-white text-[#0F1111] focus:outline-none cursor-pointer"
        >
          <option value={0}>Paragraph</option>
          <option value={2}>Heading 2</option>
          <option value={3}>Heading 3</option>
        </select>

        <Divider />

        {/* Inline marks */}
        <ToolbarBtn active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} title="Bold (Ctrl+B)">
          <strong>B</strong>
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} title="Italic (Ctrl+I)">
          <em>I</em>
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} title="Underline (Ctrl+U)">
          <span className="underline">U</span>
        </ToolbarBtn>

        <Divider />

        {/* Lists */}
        <ToolbarBtn active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} title="Bullet list">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        </ToolbarBtn>
        <ToolbarBtn active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="Numbered list">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5h11M9 12h11M9 19h11M4 5v.01M4 12v.01M4 19v.01" />
          </svg>
        </ToolbarBtn>

        <Divider />

        {/* Undo / Redo */}
        <ToolbarBtn disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6M3 10l6-6" />
          </svg>
        </ToolbarBtn>
        <ToolbarBtn disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6M21 10l-6-6" />
          </svg>
        </ToolbarBtn>
      </div>

      {/* Editor area */}
      <style>{`
        .tiptap h2 { font-size: 1.125rem; font-weight: 700; margin: 0.5rem 0 0.25rem; }
        .tiptap h3 { font-size: 1rem; font-weight: 600; margin: 0.5rem 0 0.25rem; }
        .tiptap p  { margin: 0.25rem 0; }
        .tiptap ul { list-style: disc; padding-left: 1.5rem; margin: 0.25rem 0; }
        .tiptap ol { list-style: decimal; padding-left: 1.5rem; margin: 0.25rem 0; }
        .tiptap strong { font-weight: 700; }
        .tiptap em { font-style: italic; }
        .tiptap u  { text-decoration: underline; }
        .tiptap.ProseMirror-focused { outline: none; }
      `}</style>
      <EditorContent editor={editor} />
    </div>
  );
}
