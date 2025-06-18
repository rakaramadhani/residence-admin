import { Editor } from "@tiptap/react";
import {
  AlignCenterIcon,
  AlignJustifyIcon,
  AlignLeftIcon,
  AlignRightIcon,
  BoldIcon,
  EraserIcon,
  Heading1,
  Heading2,
  ItalicIcon,
  List,
  ListIcon,
  StrikethroughIcon,
  UnderlineIcon
} from "lucide-react";

interface MenuBarProps {
  editor: Editor | null;
}

const MenuBar = ({ editor }: MenuBarProps) => {
  if (!editor) return null;

  return (
    <div className="flex flex-wrap gap-1 p-2 border rounded-lg mb-2 bg-white">
      <div className="flex items-center gap-1 border-r pr-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-md text-sm transition ${
            editor.isActive("bold")
              ? "bg-blue-100 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Bold"
        >
          <BoldIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-md text-sm transition ${
            editor.isActive("italic")
              ? "bg-blue-100 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Italic"
        >
          <ItalicIcon size={16}/>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-md text-sm transition ${
            editor.isActive("underline")
              ? "bg-blue-100 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Underline"
        >
          <UnderlineIcon size={16}/>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`p-1.5 rounded-md text-sm transition ${
            editor.isActive("strike")
              ? "bg-blue-100 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Strikethrough"
        >
          <StrikethroughIcon size={16}/>
        </button>
      </div>

      <div className="flex items-center gap-1 border-r pr-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded-md text-sm transition ${
            editor.isActive({ textAlign: 'left' })
              ? "bg-blue-100 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Align Left"
        >
          <AlignLeftIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded-md text-sm transition ${
            editor.isActive({ textAlign: 'center' })
              ? "bg-blue-100 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Align Center"
        >
          <AlignCenterIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded-md text-sm transition ${
            editor.isActive({ textAlign: 'right' })
              ? "bg-blue-100 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Align Right"
        >
          <AlignRightIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-1.5 rounded-md text-sm transition ${
            editor.isActive({ textAlign: 'justify' })
              ? "bg-blue-100 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Justify"
        >
          <AlignJustifyIcon size={16} />
        </button>
      </div>

      <div className="flex items-center gap-1 border-r pr-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-1.5 rounded-md text-sm transition ${
            editor.isActive('heading', { level: 1 })
              ? "bg-blue-100 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Heading 1"
        >
          <Heading1 size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-1.5 rounded-md text-sm transition ${
            editor.isActive('heading', { level: 2 })
              ? "bg-blue-100 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Heading 2"
        >
          <Heading2 size={16} />
        </button>
      </div>

      <div className="flex items-center gap-1 border-r pr-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-md text-sm transition ${
            editor.isActive('bulletList')
              ? "bg-blue-100 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Bullet List"
        >
          <ListIcon size={16} />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-md text-sm transition ${
            editor.isActive('orderedList')
              ? "bg-blue-100 text-blue-600"
              : "text-gray-600 hover:bg-gray-100"
          }`}
          title="Ordered List"
        >
          <List size={16} />
        </button>
      </div>
      
      <button
        type="button"
        onClick={() => editor.chain().focus().unsetAllMarks().run()}
        className="p-1.5 rounded-md text-sm text-red-500 hover:bg-red-50 transition"
        title="Clear Formatting"
      >
        <EraserIcon size={16}/>
      </button>
    </div>
  );
};

export default MenuBar;
