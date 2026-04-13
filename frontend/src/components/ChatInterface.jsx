import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import Sidebar from './Sidebar';

const ChatInterface = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async (conversationId) => {
    setActiveConversationId(conversationId);
    setIsLoading(true);
    setMessages([]);
    try {
      const res = await fetch(`/api/users/conversations/${conversationId}`, {
        headers: { 'x-user-id': user._id },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.messages) setMessages(data.messages);
      }
    } catch (err) {
      console.error('Failed to load conversation', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveConversationId(null);
    setMessages([]);
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const optimisticMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, optimisticMessage]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/users/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user._id,
        },
        body: JSON.stringify({ message: text, conversationId: activeConversationId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data._id && !activeConversationId) {
        setActiveConversationId(data._id);
      }
      
      // Update with the full conversation history from the server
      if (data.messages && Array.isArray(data.messages)) {
        setMessages(data.messages);
      } else if (data.role && data.content) {
        // Fallback if the backend returns a single message
        setMessages((prev) => [...prev, data]);
      } else {
        console.error('Unexpected response format. No messages array found:', data);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request.',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="layout-with-sidebar">
      <Sidebar 
        user={user} 
        activeConversationId={activeConversationId} 
        onSelectConversation={loadConversation} 
        onNewChat={handleNewChat} 
      />
      <div className="chat-container">
        <div className="chat-header">
        <span className="logged-in-text">Logged in as: <strong>{user?.email}</strong></span>
      </div>
      <div className="chat-content">
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <h1 className="chat-hero-title">PubMed AI</h1>
            <p className="chat-hero-subtitle">Ask anything about medical research and literature.</p>
          </div>
        ) : (
          <div className="message-list">
            {messages.map((msg, index) => (
              <MessageBubble key={index} message={msg} />
            ))}
            {isLoading && (
              <div className="message-wrapper message-assistant loading-state">
                <div className="message-icon-container">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="input-container">
        <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
    </div>
  );
};

export default ChatInterface;
