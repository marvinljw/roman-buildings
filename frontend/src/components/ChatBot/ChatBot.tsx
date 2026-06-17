import React, { useState, useEffect, useRef } from 'react';
import './ChatBot.scss';

interface Message {
  text: string;
  isUser: boolean;
}

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { text: input, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const botResponse = await mockAIResponse(input);
    const botMessage: Message = { text: botResponse, isUser: false };
    setMessages(prev => [...prev, botMessage]);
  };

  const mockAIResponse = async (query: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('roman empire')) {
      return "The Roman Empire was one of the largest and most influential empires in world history. It lasted from 27 BC to 476 AD, spanning across Europe, North Africa, and the Middle East.";
    } else if (lowerQuery.includes('architecture')) {
      return "Roman architecture was renowned for its durability, functionality, and beauty. Key elements include the arch, the dome, and the use of concrete. Famous examples include the Colosseum, Pantheon, and numerous aqueducts.";
    } else if (lowerQuery.includes('colosseum')) {
      return "The Colosseum, also known as the Flavian Amphitheatre, is an iconic symbol of Imperial Rome. Built around 70-80 AD, it could hold up to 80,000 spectators for gladiatorial contests and public spectacles.";
    } else if (lowerQuery.includes('pantheon')) {
      return "The Pantheon in Rome is a former Roman temple, now a church, commissioned by Marcus Agrippa during the reign of Augustus. The current building was completed by emperor Hadrian and probably dedicated around 126 AD. Its dome remains the world's largest unreinforced concrete dome.";
    } else {
      return "I'm an AI assistant specializing in Roman history and architecture. Feel free to ask about specific Roman sites, architectural techniques, or historical events!";
    }
  };

  return (
    <div className="chat-bot">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.isUser ? 'user' : 'bot'}`}>
            {message.text}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Roman history..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default ChatBot;