import React, { useState, useEffect } from 'react';
import './TrafficWarningBanner.css';

const LOCAL_STORAGE_KEY = 'trafficWarningBannerDismissed';

const TrafficWarningBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!dismissed) {
      setVisible(true);
    }
  }, []);

  const handleClose = () => {
    setVisible(false);
    localStorage.setItem(LOCAL_STORAGE_KEY, 'true');
  };

  if (!visible) return null;

  return (
    <div className="traffic-warning-banner">
      <span className="traffic-warning-text">
        ⚠️ The website may be slow or behave unexpectedly due to high traffic and limited cloud server resources. Thank you for your patience!
      </span>
      <button className="close-btn" onClick={handleClose} aria-label="Dismiss warning">&times;</button>
    </div>
  );
};

export default TrafficWarningBanner;
