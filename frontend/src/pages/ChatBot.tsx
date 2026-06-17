import React from 'react';
import ChatBot from '../components/ChatBot/ChatBot';
import './ChatBotPage.scss';

const ChatBotPage: React.FC = () => {
  return (
    <div className="chat-bot-page">
      <h2>Chat with Roman History AI</h2>
      <ChatBot />
    </div>
  );
};

export default ChatBotPage;