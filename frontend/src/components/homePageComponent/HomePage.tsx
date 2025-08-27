// src/components/homePageComponent/HomePage.tsx
import React from 'react';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-container">
      <div className="home-card shadow-lg p-4 rounded">
        <h2>Welcome to Your Dashboard</h2>
        <p>Congratulations! You have successfully logged in.</p>
        <button className="btn btn-primary">Explore Dashboard</button>
      </div>

      <div className="footer">
        <p>&copy; 2025 YourApp. All Rights Reserved.</p>
      </div>
    </div>
  );
};

export default HomePage;
