import React, { useState } from 'react';
import ChatInterface from './components/ChatInterface';
import AuthScreen from './components/AuthScreen';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="app-layout">
      <main className="main-content">
        {!user ? (
          <AuthScreen onLogin={setUser} />
        ) : (
          <ChatInterface user={user} />
        )}
      </main>
    </div>
  );
}

export default App;