import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I\'m HELIOS AI Assistant. I can help you monitor your solar panels, analyze issues, and provide maintenance recommendations. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

  // Fetch initial summary
  useEffect(() => {
    if (isOpen && !summary) {
      fetchSummary();
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat/summary`);
      const data = await res.json();
      setSummary(data);
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      }));

      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          conversation_history: conversationHistory
        })
      });

      const data = await res.json();
      
      const assistantMessage = {
        role: 'assistant',
        content: data.response || 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        criticalPanels: data.critical_panels
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Refresh summary after critical panel discussions
      if (data.critical_panels?.length > 0) {
        fetchSummary();
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I\'m having trouble connecting to the server. Please check if the backend is running.',
        timestamp: new Date(),
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const quickActions = [
    { label: 'Show Critical Panels', prompt: 'Show me all critical panels that need immediate attention' },
    { label: 'Farm Status', prompt: 'What is the current status of the solar farm?' },
    { label: 'Maintenance Tasks', prompt: 'What maintenance tasks are pending?' },
    { label: 'Performance Report', prompt: 'Give me a performance summary of the farm' }
  ];

  return (
    <>
      {/* Chat Toggle Button */}
      <button 
        className={`chatbot-toggle ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chat"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
        {summary?.critical_count > 0 && !isOpen && (
          <span className="notification-badge">{summary.critical_count}</span>
        )}
      </button>

      {/* Chat Window */}
      <div className={`chatbot-container ${isOpen ? 'open' : ''}`}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="header-info">
            <div className="avatar">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" fill="#10b981" opacity="0.2" />
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
              </svg>
            </div>
            <div>
              <h3>HELIOS AI</h3>
              <span className="status-indicator">
                <span className="pulse"></span>
                Online
              </span>
            </div>
          </div>
          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Status Bar */}
        {summary && (
          <div className="status-bar">
            <div className="status-item">
              <span className="label">Panels</span>
              <span className="value">{summary.total_panels}</span>
            </div>
            <div className="status-item critical">
              <span className="label">Critical</span>
              <span className="value">{summary.critical_count}</span>
            </div>
            <div className="status-item warning">
              <span className="label">Warning</span>
              <span className="value">{summary.warning_count}</span>
            </div>
            <div className="status-item">
              <span className="label">Efficiency</span>
              <span className="value">{summary.avg_efficiency}%</span>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((msg, idx) => (
            <div 
              key={idx} 
              className={`message ${msg.role} ${msg.error ? 'error' : ''}`}
            >
              <div className="message-content">
                {msg.content}
              </div>
              <div className="message-time">{formatTime(msg.timestamp)}</div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message assistant loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          {quickActions.map((action, idx) => (
            <button 
              key={idx}
              className="quick-action-btn"
              onClick={() => {
                setInput(action.prompt);
                inputRef.current?.focus();
              }}
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="chatbot-input">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about panel health, diagnostics, or maintenance..."
            rows="1"
            disabled={isLoading}
          />
          <button 
            className="send-btn" 
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
