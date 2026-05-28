import './Loader.css';

const Loader = ({ fullPage = false }) => {
  return (
    <div className={`loader ${fullPage ? 'loader-fullpage' : ''}`}>
      <div className="loader-spinner">
        <div className="loader-leaf">🌿</div>
      </div>
      <p className="loader-text">Loading...</p>
    </div>
  );
};

export default Loader;
