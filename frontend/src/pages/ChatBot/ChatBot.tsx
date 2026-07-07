import React from 'react';
import ChatBot from '../../components/ChatBot/ChatBot';
import './ChatBotPage.scss';

const ChatBotPage: React.FC = () => {
  return (
    <div className="chat-bot-page">
      <ChatBot />
    </div>
  );
};

export default ChatBotPage;
