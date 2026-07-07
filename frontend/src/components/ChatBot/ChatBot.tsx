import React, { useState, useEffect, useRef } from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import SendIcon from '@mui/icons-material/Send';
import './ChatBot.scss';

interface Message {
  text: string;
  isUser: boolean;
}

const suggestions = [
  'Tell me about the Colosseum',
  'How did Roman arches work?',
  'What made the Pantheon special?'
];

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || isThinking) return;

    const userMessage: Message = { text: trimmedMessage, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsThinking(true);

    const botResponse = await mockAIResponse(trimmedMessage);
    const botMessage: Message = { text: botResponse, isUser: false };
    setMessages(prev => [...prev, botMessage]);
    setIsThinking(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
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
      <header className="chat-hero">
        <div className="chat-hero__icon">
          <HistoryEduIcon />
        </div>
        <div>
          <p>Roman History AI</p>
          <h2>Ask about ancient sites, engineering, and empire life.</h2>
        </div>
      </header>

      <div className="chat-messages" aria-live="polite">
        {messages.length === 0 && (
          <section className="empty-state">
            <AutoAwesomeIcon />
            <h3>Start exploring the ancient world</h3>
            <p>Try a question about monuments, emperors, architecture, or daily life in Rome.</p>
            <div className="suggestion-list" aria-label="Suggested questions">
              {suggestions.map(suggestion => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => sendMessage(suggestion)}
                  disabled={isThinking}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </section>
        )}

        {messages.map((message, index) => (
          <div key={index} className={`message-row ${message.isUser ? 'user' : 'bot'}`}>
            <div className="message-avatar" aria-hidden="true">
              {message.isUser ? 'You' : 'AI'}
            </div>
            <div className="message">
              {message.text}
            </div>
          </div>
        ))}

        {isThinking && (
          <div className="message-row bot">
            <div className="message-avatar" aria-hidden="true">AI</div>
            <div className="message thinking" aria-label="Roman History AI is thinking">
              <span />
              <span />
              <span />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-composer">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about Roman history, sites, or architecture..."
          disabled={isThinking}
          aria-label="Chat message"
        />
        <button type="submit" disabled={!input.trim() || isThinking} aria-label="Send message">
          <SendIcon fontSize="small" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};

export default ChatBot;
