import { useLanguage } from '../hooks/useLanguage';
import './Loader.css';

const Loader = ({ fullPage = false }) => {
  const { t } = useLanguage();

  return (
    <div className={`loader ${fullPage ? 'loader-fullpage' : ''}`}>
      <div className="loader-spinner" aria-hidden="true">
        <div className="loader-leaf">🌿</div>
      </div>
      <p className="loader-text">{t('common.loading')}</p>
    </div>
  );
};

export default Loader;
