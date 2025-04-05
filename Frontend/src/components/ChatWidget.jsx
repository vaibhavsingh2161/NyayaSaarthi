// Frontend/src/components/ChatWidget.jsx
import React, { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import '../styles/ChatWidget.css';
import chatService from '../services/ChatService';

function ChatWidget({ onClose }) {
  const [query, setQuery] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const chatEndRef = useRef(null);

  // Scroll to bottom when new messages appear
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Initial welcome message
  useEffect(() => {
    setChatHistory([{
      role: 'assistant',
      content: 'Hello! I can help answer your legal questions. What would you like to know about Indian law?'
    }]);

    // Check if the service is available
    checkServiceAvailability();
  }, []);

  // Check service availability
  const checkServiceAvailability = async () => {
    try {
      const isAvailable = await chatService.checkServiceStatus();
      setConnectionError(!isAvailable);
    } catch (error) {
      console.error('Error checking service:', error);
      setConnectionError(true);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: query };
    setChatHistory(prev => [...prev, userMessage]);
    
    setIsLoading(true);
    const userQuery = query;
    setQuery(''); // Clear input immediately after submission

    try {
      // Get previous messages for context
      const allMessages = [...chatHistory, userMessage];
      
      // Send messages to API
      const response = await chatService.sendMessage(allMessages);
      
      if (response.success && response.response) {
        // Add AI response to chat
        setChatHistory(prev => [...prev, { 
          role: 'assistant', 
          content: response.response 
        }]);
        
        // Reset connection error if it was previously set
        if (connectionError) {
          setConnectionError(false);
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Error processing question:', err);
      
      setConnectionError(true);
      
      // Add error message to chat
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I had trouble processing your question. I\'ll use my backup knowledge instead.' 
      }]);
      
      // Use fallback responses
      provideFallbackResponse(userQuery);
    } finally {
      setIsLoading(false);
    }
  };

  // Provide fallback responses when API fails
  const provideFallbackResponse = (question) => {
    // Simple keyword-based responses as fallback
    let response;
    
    const lowerQuestion = question.toLowerCase();
    if (lowerQuestion.includes('murder') || lowerQuestion.includes('kill')) {
      response = 'Under the Bharatiya Nyaya Sanhita, murder is covered under Section 103 with punishment that may include imprisonment for life or death penalty.';
    } else if (lowerQuestion.includes('theft') || lowerQuestion.includes('steal')) {
      response = 'Theft is defined in Section 303 of the Bharatiya Nyaya Sanhita with punishment of imprisonment up to 3 years, or fine, or both.';
    } else if (lowerQuestion.includes('bail')) {
      response = 'Bail provisions are covered under the Bharatiya Nagarik Suraksha Sanhita (BNSS). Generally, bail is a right in bailable offenses and discretionary in non-bailable offenses.';
    } else if (lowerQuestion.includes('divorce')) {
      response = 'Divorce in India is governed by personal laws based on religion and the Special Marriage Act. Grounds may include cruelty, desertion, conversion, mental illness, among others.';
    } else if (lowerQuestion.includes('property') || lowerQuestion.includes('inheritance')) {
      response = 'Property rights in India are governed by personal laws and the Indian Succession Act. Laws vary based on religion and whether the property is ancestral or self-acquired.';
    } else {
      response = 'This is a complex legal matter. The Bharatiya Nyaya Sanhita covers various aspects of criminal law. I would recommend consulting specific sections or speaking with a legal professional.';
    }

    // Add fallback response to chat
    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    }, 500);
  };

  return (
    <div className="chat-widget-container">
      <div className="chat-widget-header">
        <h3>Legal Assistant</h3>
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>
      </div>
      
      <div className="chat-widget-messages">
        {connectionError && (
          <div className="connection-error-banner">
            <p>Running in offline mode with limited responses.</p>
          </div>
        )}
        
        {chatHistory.map((message, index) => (
          <div 
            key={index}
            className={`widget-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
          >
            <div className="widget-message-content">
              <p>{message.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="widget-message assistant-message">
            <div className="widget-message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>
      
      <form className="chat-widget-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a legal question..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading || !query.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default ChatWidget;