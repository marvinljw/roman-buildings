import React, { useState, useEffect, useRef } from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import HistoryEduIcon from '@mui/icons-material/HistoryEdu';
import SendIcon from '@mui/icons-material/Send';
import { chatErrorMessage, getChatResponse } from '../../services/chatService';
import './ChatBot.scss';

interface Message {
  text: string;
  isUser: boolean;
  // Error bubbles are shown to the user but not sent back to the AI as history.
  isError?: boolean;
}

// Renders **bold** from the AI's replies; everything else stays plain text (line breaks are kept by CSS).
const formatReply = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );

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
    const conversation = [...messages, userMessage];
    setMessages(conversation);
    setInput('');
    setIsThinking(true);

    try {
      const reply = await getChatResponse(
        conversation
          .filter(m => !m.isError)
          .map(m => ({ role: m.isUser ? 'user' as const : 'assistant' as const, content: m.text }))
      );
      setMessages(prev => [...prev, { text: reply, isUser: false }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: chatErrorMessage(error), isUser: false, isError: true }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMessage(input);
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
            <div className={`message${message.isError ? ' message--error' : ''}`} role={message.isError ? 'alert' : undefined}>
              {message.isUser || message.isError ? message.text : formatReply(message.text)}
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
