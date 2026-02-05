import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { MessageSquare, Send, X, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! I am your AI Finance Assistant. Ask me about your spending patterns or budget!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setInput('');
    setIsTyping(true);

    try {
      // Send to Python Backend
      const res = await axios.post('http://127.0.0.1:5000/chat', { message: userMsg });
      setMessages(prev => [...prev, { sender: 'ai', text: res.data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'ai', text: "I'm having trouble connecting to the brain (Server). Is Python running?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000, fontFamily: 'Inter, sans-serif' }}>
      
      {/* 1. The Floating Button (When chat is closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button 
            initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            style={{ 
              width: '60px', height: '60px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', 
              border: 'none', color: 'white', cursor: 'pointer', 
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            <MessageSquare size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* 2. The Chat Window (When chat is open) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{ 
              width: '350px', height: '500px', background: '#1e293b', 
              borderRadius: '16px', display: 'flex', flexDirection: 'column', 
              overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255,255,255,0.1)'
            }}
          >
            {/* Header */}
            <div style={{ padding: '15px', background: 'linear-gradient(to right, #3b82f6, #8b5cf6)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                <Bot size={20} /> Finance AI
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                <X size={20}/>
              </button>
            </div>
            
            {/* Messages Area */}
            <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#0f172a' }}>
              {messages.map((m, i) => (
                <div key={i} style={{ 
                  alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', 
                  background: m.sender === 'user' ? '#3b82f6' : '#334155', 
                  padding: '10px 14px', borderRadius: '12px', 
                  maxWidth: '85%', color: 'white', fontSize: '0.9rem', lineHeight: '1.4',
                  borderBottomRightRadius: m.sender === 'user' ? '2px' : '12px',
                  borderTopLeftRadius: m.sender === 'ai' ? '2px' : '12px'
                }}>
                  {m.text}
                </div>
              ))}
              {isTyping && (
                <div style={{ alignSelf: 'flex-start', background: '#334155', padding: '10px', borderRadius: '12px', color: '#94a3b8', fontSize: '0.8rem' }}>
                  AI is typing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{ padding: '15px', background: '#1e293b', borderTop: '1px solid #334155', display: 'flex', gap: '10px' }}>
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Ask about your expenses..."
                style={{ 
                  flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #334155', 
                  background: '#0f172a', color: 'white', outline: 'none' 
                }}
              />
              <button 
                onClick={sendMessage} 
                style={{ 
                  background: '#3b82f6', border: 'none', borderRadius: '8px', 
                  width: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', cursor: 'pointer', transition: 'background 0.2s'
                }}
              >
                <Send size={20}/>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIChatbot;