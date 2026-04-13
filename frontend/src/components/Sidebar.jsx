import React, { useEffect, useState } from 'react';
import { MessageSquare, Plus, Loader2 } from 'lucide-react';

const Sidebar = ({ user, activeConversationId, onSelectConversation, onNewChat }) => {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/users/conversations', {
          headers: { 'x-user-id': user._id },
        });
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
        }
      } catch (error) {
        console.error('Failed to load history', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConversations();
  }, [user._id, activeConversationId]);

  return (
    <aside className="sidebar">
      <button onClick={onNewChat} className="new-chat-btn">
        <Plus size={18} /> New Chat
      </button>
      <div className="history-list">
        <h3 className="history-title">Recent History</h3>
        {isLoading ? (
          <div className="sidebar-loading">
            <Loader2 size={24} className="spinner" />
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv._id}
              onClick={() => onSelectConversation(conv._id)}
              className={`history-item ${activeConversationId === conv._id ? 'active' : ''}`}
            >
              <MessageSquare size={16} className="history-icon" />
              <span className="history-text">{conv.title || 'Conversation'}</span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
