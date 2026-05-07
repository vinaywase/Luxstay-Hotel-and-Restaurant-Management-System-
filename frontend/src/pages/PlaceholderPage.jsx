import React from 'react';

const PlaceholderPage = ({ title }) => {
  return (
    <div className="card w-full h-full flex flex-col items-center justify-center animate-fade-in text-center" style={{ minHeight: '60vh' }}>
      <h2 className="text-primary mb-4">{title}</h2>
      <p>This module is currently under development.</p>
    </div>
  );
};

export default PlaceholderPage;
