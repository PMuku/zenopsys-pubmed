import React, { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';

const ChatInput = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="chat-input-wrapper">
      <form onSubmit={handleSubmit} className="chat-input-form">
        <textarea
          className="chat-textarea"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a medical question..."
          disabled={isLoading}
          rows={1}
        />
        <button
          type="submit"
          className={`chat-submit-btn ${isLoading || !inputValue.trim() ? 'disabled' : ''}`}
          disabled={isLoading || !inputValue.trim()}
        >
          {isLoading ? <Loader2 size={20} className="spinner" /> : <Send size={20} />}
        </button>
      </form>
      <div className="chat-input-footer">
        PubMed AI can make mistakes. Consider verifying important information.
      </div>
    </div>
  );
};

export default ChatInput;
