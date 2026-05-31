import { useRef, useEffect, useState } from 'react';
import { 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, 
  List, ListOrdered, Link2, Palette, Heading1, Heading2, CaseSensitive, Eraser
} from 'lucide-react';
import './RichTextEditor.css';

const RichTextEditor = ({ value, onChange, placeholder, dir }) => {
  const editorRef = useRef(null);
  const dropdownRef = useRef(null);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const colors = [
    { name: 'Dark', value: '#1E293B' },
    { name: 'Primary Green', value: '#7BB445' },
    { name: 'Primary Dark', value: '#4F9200' },
    { name: 'Info Blue', value: '#388BFD' },
    { name: 'Warning Gold', value: '#D4A843' },
    { name: 'Danger Red', value: '#DA3633' },
  ];

  // Close color picker on clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Sync state to editor innerHTML (only if they are different to prevent cursor jump)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const executeCommand = (command, argument = '') => {
    document.execCommand(command, false, argument);
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const addLink = () => {
    const url = prompt(dir === 'rtl' ? 'أدخل الرابط (مثال: https://google.com):' : 'Enter URL (e.g. https://google.com):');
    if (url) {
      executeCommand('createLink', url);
    }
  };

  return (
    <div className="rich-text-editor-container">
      {/* Toolbar */}
      <div className="rich-editor-toolbar">
        <button type="button" title={dir === 'rtl' ? 'عريض' : 'Bold'} onClick={() => executeCommand('bold')} className="toolbar-btn">
          <Bold size={16} />
        </button>
        <button type="button" title={dir === 'rtl' ? 'مائل' : 'Italic'} onClick={() => executeCommand('italic')} className="toolbar-btn">
          <Italic size={16} />
        </button>
        <button type="button" title={dir === 'rtl' ? 'تسطير' : 'Underline'} onClick={() => executeCommand('underline')} className="toolbar-btn">
          <Underline size={16} />
        </button>

        <span className="toolbar-divider" />

        <button type="button" title={dir === 'rtl' ? 'عنوان رئيسي' : 'Heading 1'} onClick={() => executeCommand('formatBlock', '<h1>')} className="toolbar-btn">
          <Heading1 size={16} />
        </button>
        <button type="button" title={dir === 'rtl' ? 'عنوان فرعي' : 'Heading 2'} onClick={() => executeCommand('formatBlock', '<h2>')} className="toolbar-btn">
          <Heading2 size={16} />
        </button>
        <button type="button" title={dir === 'rtl' ? 'نص عادي' : 'Normal Text'} onClick={() => executeCommand('formatBlock', '<p>')} className="toolbar-btn">
          <CaseSensitive size={16} />
        </button>

        <span className="toolbar-divider" />

        <button type="button" title={dir === 'rtl' ? 'محاذاة لليسار' : 'Align Left'} onClick={() => executeCommand('justifyLeft')} className="toolbar-btn">
          <AlignLeft size={16} />
        </button>
        <button type="button" title={dir === 'rtl' ? 'محاذاة للوسط' : 'Align Center'} onClick={() => executeCommand('justifyCenter')} className="toolbar-btn">
          <AlignCenter size={16} />
        </button>
        <button type="button" title={dir === 'rtl' ? 'محاذاة لليمين' : 'Align Right'} onClick={() => executeCommand('justifyRight')} className="toolbar-btn">
          <AlignRight size={16} />
        </button>
        <button type="button" title={dir === 'rtl' ? 'ضبط كامل' : 'Justify'} onClick={() => executeCommand('justifyFull')} className="toolbar-btn">
          <AlignJustify size={16} />
        </button>

        <span className="toolbar-divider" />

        <button type="button" title={dir === 'rtl' ? 'قائمة منقطة' : 'Bullet List'} onClick={() => executeCommand('insertUnorderedList')} className="toolbar-btn">
          <List size={16} />
        </button>
        <button type="button" title={dir === 'rtl' ? 'قائمة رقمية' : 'Numbered List'} onClick={() => executeCommand('insertOrderedList')} className="toolbar-btn">
          <ListOrdered size={16} />
        </button>

        <span className="toolbar-divider" />

        <button type="button" title={dir === 'rtl' ? 'إضافة رابط' : 'Insert Link'} onClick={addLink} className="toolbar-btn">
          <Link2 size={16} />
        </button>

        <div className="color-picker-wrapper" ref={dropdownRef}>
          <button 
            type="button" 
            title={dir === 'rtl' ? 'لون الخط' : 'Text Color'} 
            onClick={() => setShowColorPicker(!showColorPicker)} 
            className={`toolbar-btn ${showColorPicker ? 'active' : ''}`}
          >
            <Palette size={16} />
          </button>
          {showColorPicker && (
            <div className="editor-color-dropdown">
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    executeCommand('foreColor', c.value);
                    setShowColorPicker(false);
                  }}
                  style={{ background: c.value }}
                  title={c.name}
                  className="color-dot"
                />
              ))}
            </div>
          )}
        </div>

        <span className="toolbar-divider" />

        <button type="button" title={dir === 'rtl' ? 'مسح التنسيق' : 'Clear Formatting'} onClick={() => executeCommand('removeFormat')} className="toolbar-btn">
          <Eraser size={16} />
        </button>
      </div>

      {/* Editor Content Area */}
      <div 
        ref={editorRef}
        contentEditable
        className="rich-editor-content"
        onInput={handleInput}
        dir={dir}
        placeholder={placeholder}
      />
    </div>
  );
};

export default RichTextEditor;
