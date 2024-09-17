import React from 'react';
import './SideNav.module.css';

export const SideNav: React.FC = () => {
  return (
    <div>
      <input type="checkbox" id="nav-toggle" className="nav-toggle"/>
      <label htmlFor="nav-toggle" className="nav-toggle-label">&#9776; Menu</label>

      <div className="side-nav">
        <a href="#">Home</a>
        <a href="#">About</a>
        <a href="#">Services</a>
        <a href="#">Contact</a>
      </div>
    </div>
  );
};

