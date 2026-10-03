import React from 'react';

const CheckoutDebug = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Checkout Debug Page</h1>
      <p>This is a test to see if the page renders at all.</p>
      <p>If you can see this, the routing works but there's an issue with the Checkout component.</p>
      <p>Current URL: {window.location.href}</p>
      <p>Timestamp: {new Date().toLocaleString()}</p>
    </div>
  );
};

export default CheckoutDebug;
