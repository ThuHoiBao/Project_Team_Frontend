import React, { useState, useEffect } from 'react';
import './AddBanner.css'; // Đảm bảo CSS cho banner

const AdBanner = () => {
  const [currentBanner, setCurrentBanner] = useState(0);

  const bannerImages = [
    'https://storage.googleapis.com/bucket_mobileapp/images/banner1.webp', 
    'https://storage.googleapis.com/bucket_mobileapp/images/banner2.webp',
    'https://storage.googleapis.com/bucket_mobileapp/images/banner6.png',
    'https://storage.googleapis.com/bucket_mobileapp/images/banner7.png',
  ];

  // Thay đổi ảnh mỗi 3 giây
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % bannerImages.length);
    }, 3000);

    return () => clearInterval(interval); // Dọn dẹp interval khi component unmount
  }, []);

  // Hàm chuyển ảnh khi bấm vào chấm
  const handleDotClick = (index) => {
    setCurrentBanner(index);
  };

  return (
    <div className="ad-banner">
      <div className="ad-banner-container">
        <img src={bannerImages[currentBanner]} alt={`banner-${currentBanner}`} />
      </div>

      {/* Các dấu chấm chỉ mục */}
      <div className="banner-dots">
        {bannerImages.map((_, index) => (
          <div
            key={index}
            className={`dot ${index === currentBanner ? 'active' : ''}`}
            onClick={() => handleDotClick(index)}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default AdBanner;
