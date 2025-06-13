// MainApp.js
import React from 'react';

function MainApp({ onLogout }) {
  return (
    <>
      <button onClick={onLogout} style={{ position: 'absolute', top: 10, right: 10 }}>
        Logout
      </button>
      {/* Paste your entire previous App.js return JSX here */}
    </>
  );
}

export default MainApp;
