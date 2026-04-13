import React from 'react';
import { User, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const MessageBubble = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`message-wrapper ${isUser ? 'message-user' : 'message-assistant'}`}>
      <div className="message-icon-container">
        {isUser ? <User size={20} className="message-icon" /> : <Bot size={20} className="message-icon" />}
      </div>
      <div className="message-content-container">
        <div className="message-bubble">
          <div className="markdown-body">
            <ReactMarkdown>{message.content || ''}</ReactMarkdown>
          </div>
        </div>
        {Array.isArray(message.citations) && message.citations.length > 0 && (
          <div className="citations-container">
            <h4 className="citations-title">References</h4>
            <ul className="citations-list">
              {message.citations.map((citation, index) => (
                <li key={citation.pmid || index} className="citation-item">
                  <a href={citation.url} target="_blank" rel="noopener noreferrer" className="citation-link">
                    [{index + 1}] {citation.title}
                  </a>
                  {citation.authors && <span className="citation-authors"> - {citation.authors}</span>}
                  {citation.source && <span className="citation-source"> ({citation.source})</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
