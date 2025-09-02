import React, { useState, useEffect, useRef } from 'react';
import { Send, MoreVertical, Phone, Video, Search, User } from 'lucide-react';
import { format } from 'date-fns';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey! How are you doing?",
      sender: "John Doe",
      timestamp: new Date(Date.now() - 300000),
      isOwn: false
    },
    {
      id: 2,
      text: "I'm doing great! Thanks for asking 😊",
      sender: "You",
      timestamp: new Date(Date.now() - 240000),
      isOwn: true
    },
    {
      id: 3,
      text: "Want to grab coffee later?",
      sender: "John Doe",
      timestamp: new Date(Date.now() - 180000),
      isOwn: false
    },
    {
      id: 4,
      text: "Sure! That sounds great. What time works for you?",
      sender: "You",
      timestamp: new Date(Date.now() - 120000),
      isOwn: true
    }
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [contacts] = useState([
    { id: 1, name: "John Doe", avatar: "JD", status: "online", lastMessage: "Want to grab coffee later?", time: "2:33 PM" },
    { id: 2, name: "Jane Smith", avatar: "JS", status: "offline", lastMessage: "Thanks for the help!", time: "1:45 PM" },
    { id: 3, name: "Mike Johnson", avatar: "MJ", status: "online", lastMessage: "See you tomorrow!", time: "12:20 PM" },
    { id: 4, name: "Sarah Wilson", avatar: "SW", status: "away", lastMessage: "The project looks great!", time: "11:30 AM" }
  ]);

  const [selectedContact, setSelectedContact] = useState(contacts[0]);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        text: newMessage,
        sender: "You",
        timestamp: new Date(),
        isOwn: true
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Messages</h2>
          <button className="icon-btn">
            <MoreVertical size={20} />
          </button>
        </div>
        
        <div className="search-container">
          <div className="search-input">
            <Search size={18} />
            <input type="text" placeholder="Search messages..." />
          </div>
        </div>

        <div className="contacts-list">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`contact-item ${selectedContact.id === contact.id ? 'active' : ''}`}
              onClick={() => setSelectedContact(contact)}
            >
              <div className="contact-avatar">
                <span>{contact.avatar}</span>
                <div className={`status-indicator ${contact.status}`}></div>
              </div>
              <div className="contact-info">
                <div className="contact-name">{contact.name}</div>
                <div className="contact-last-message">{contact.lastMessage}</div>
              </div>
              <div className="contact-time">{contact.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-contact-info">
            <div className="contact-avatar">
              <span>{selectedContact.avatar}</span>
              <div className={`status-indicator ${selectedContact.status}`}></div>
            </div>
            <div>
              <h3>{selectedContact.name}</h3>
              <span className="status-text">{selectedContact.status}</span>
            </div>
          </div>
          <div className="chat-actions">
            <button className="icon-btn">
              <Phone size={20} />
            </button>
            <button className="icon-btn">
              <Video size={20} />
            </button>
            <button className="icon-btn">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="messages-container">
          <div className="messages-list">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.isOwn ? 'own' : 'other'}`}
              >
                <div className="message-content">
                  <div className="message-text">{message.text}</div>
                  <div className="message-time">
                    {format(message.timestamp, 'HH:mm')}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="message-input-container">
          <form onSubmit={handleSendMessage} className="message-form">
            <div className="input-wrapper">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                rows="1"
                className="message-input"
              />
              <button type="submit" className="send-btn" disabled={!newMessage.trim()}>
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat; 