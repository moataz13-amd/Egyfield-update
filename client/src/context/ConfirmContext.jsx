import { createContext, useState, useContext } from 'react';
import { useLanguage } from '../hooks/useLanguage';
import { AlertTriangle, Trash2 } from 'lucide-react';
import './ConfirmContext.css';

const ConfirmContext = createContext();

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
};

export const ConfirmProvider = ({ children }) => {
  const { language } = useLanguage();
  const isAr = language === 'ar';
  const [config, setConfig] = useState(null);

  const confirm = (options = {}) => {
    return new Promise((resolve) => {
      setConfig({
        type: 'danger', // default to danger
        ...options,
        resolve,
      });
    });
  };

  const handleClose = (value) => {
    if (config?.resolve) {
      config.resolve(value);
    }
    setConfig(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {config && (
        <div className="confirm-modal-overlay" onClick={() => handleClose(false)}>
          <div className="confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className={`confirm-modal-icon ${config.type}`}>
              {config.type === 'danger' ? <Trash2 size={28} /> : <AlertTriangle size={28} />}
            </div>
            
            <div className="confirm-modal-content">
              <h3>
                {config.title || (config.type === 'danger' 
                  ? (isAr ? 'حذف العنصر' : 'Delete Item') 
                  : (isAr ? 'تأكيد الإجراء' : 'Confirm Action'))}
              </h3>
              <p>{config.message}</p>
            </div>
            
            <div className="confirm-modal-actions">
              <button 
                type="button" 
                className="confirm-btn-cancel" 
                onClick={() => handleClose(false)}
              >
                {config.cancelText || (isAr ? 'إلغاء' : 'Cancel')}
              </button>
              <button 
                type="button" 
                className={`confirm-btn-submit ${config.type === 'danger' ? 'danger' : 'primary'}`} 
                onClick={() => handleClose(true)}
              >
                {config.confirmText || (config.type === 'danger' 
                  ? (isAr ? 'حذف' : 'Delete') 
                  : (isAr ? 'تأكيد' : 'Confirm'))}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};
