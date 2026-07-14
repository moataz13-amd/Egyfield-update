import { useState } from 'react';
import { Languages, Loader } from 'lucide-react';
import { translateText } from '../utils/translate';

export default function TranslateButton({ sourceText, targetLang, onTranslated, style }) {
  const [translating, setTranslating] = useState(false);

  const handleTranslate = async () => {
    if (!sourceText || translating) return;
    setTranslating(true);
    try {
      const result = await translateText(sourceText, targetLang);
      onTranslated(result);
    } catch {
      // Silently fail
    }
    setTranslating(false);
  };

  return (
    <button
      type="button"
      onClick={handleTranslate}
      disabled={!sourceText || translating}
      title={`Translate to ${targetLang === 'ar' ? 'Arabic' : 'English'}`}
      style={{
        border: '1px solid var(--admin-border)',
        background: 'var(--admin-bg)',
        borderRadius: 6,
        cursor: sourceText && !translating ? 'pointer' : 'not-allowed',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 6,
        color: sourceText ? 'var(--admin-primary)' : 'var(--admin-text-muted)',
        opacity: sourceText ? 1 : 0.4,
        transition: 'all 0.2s',
        flexShrink: 0,
        ...style,
      }}
    >
      {translating ? <Loader size={14} className="spin" /> : <Languages size={14} />}
    </button>
  );
}
