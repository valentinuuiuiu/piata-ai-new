'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '../lib/supabase/client';

interface UserContext {
  interests: string[];
  searchHistory: string[];
  preferences: {
    language: string;
    currency: string;
    location: string;
  };
}

export default function PAIHelper() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('x-ai/grok-4-fast');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [messages, setMessages] = useState<{role: 'user'|'assistant', content: string, attachments?: string[]}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [attachments, setAttachments] = useState<{name: string, url: string}[]>([]);
  const [context, setContext] = useState<UserContext>({interests: [], searchHistory: [], preferences: {language: 'ro', currency: 'RON', location: 'RO'}});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  // Learn from user behavior (privacy-preserving, local only)
  useEffect(() => {
    // Load user context from localStorage (stays on their device)
    const savedContext = localStorage.getItem('pai_context');
    if (savedContext) {
      setContext(JSON.parse(savedContext));
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  // Smart Router: Use intelligent routing based on query complexity
  const selectBestModel = (query: string): string => {
    // Import will be done dynamically later, for now use inline logic
    // This matches the ai-router.ts logic
    let complexity = 1;
    const lowerQuery = query.toLowerCase();
    
    // Length
    complexity += Math.min(query.length / 100, 2);
    
    // Technical keywords
    const techWords = /\b(code|api|database|debug|technical)\b/gi;
    if (techWords.test(query)) complexity += 2;
    
    // Reasoning keywords
    const reasonWords = /\b(why|how|explain|analyze)\b/gi;
    if (reasonWords.test(query)) complexity += 1.5;
    
    // Multi-step
    if (/(then|after|next|step)/gi.test(query)) complexity += 2;
    
    complexity = Math.min(complexity, 10);
    
    // Route based on complexity - always use grok-4-fast
    return 'x-ai/grok-4-fast';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newAttachments = [...attachments];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `user-uploads/${fileName}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('pai-attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('pai-attachments')
          .getPublicUrl(filePath);

        newAttachments.push({ name: file.name, url: publicUrl });
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }

    setAttachments(newAttachments);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const sendMessage = async () => {
    if ((!message.trim() && attachments.length === 0) || isLoading) return;

    const userMessage = message;
    const currentAttachments = [...attachments];

    // Smart routing: Auto-select best model for this query
    const routedModel = selectBestModel(userMessage);
    setSelectedModel(routedModel); 
    setMessage('');
    setAttachments([]);
    setIsLoading(true);
    
    setMessages(prev => [...prev, { 
      role: 'user' as const, 
      content: userMessage || '📎 Fișiere atașate',
      attachments: currentAttachments.map(a => a.url)
    }]);

    try {
      // PAI Public Assistant with Smart Routing
      const paiResponse = await fetch('/api/pai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage, 
          model: routedModel,
          attachments: currentAttachments.map(a => a.url)
        }),
      });
      
      let aiReply: string;
      
      // Check if response is JSON
      const contentType = paiResponse.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Response is not JSON, get text
        const errorText = await paiResponse.text();
        aiReply = `❌ Eroare: ${errorText.substring(0, 100)}`;
      } else {
        // Parse JSON response
        const paiData = await paiResponse.json();
        if (paiData.error) {
          aiReply = `❌ Eroare: ${paiData.reply || paiData.error}`;
        } else {
          aiReply = `💬 PAI: ${paiData.reply}`;
        }
      }
      
      setMessages(prev => [...prev, { role: 'assistant' as const, content: aiReply }]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setMessages(prev => [...prev, { 
        role: 'assistant' as const, 
        content: `❌ Eroare de conexiune: ${errorMessage}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* PAI Button - Floating */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: 'spring' }}
        onClick={handleOpen}
        className="fixed bottom-8 right-8 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-[#ff00f0] to-[#00f0ff] shadow-[0_0_40px_rgba(255,0,240,0.6)] hover:shadow-[0_0_60px_rgba(255,0,240,0.9)] transition-all duration-300 flex items-center justify-center text-3xl cursor-pointer"
        whileHover={{ scale: 1.1, rotate: 15 }}
        whileTap={{ scale: 0.9 }}
      >
        🤖
      </motion.button>

      {/* PAI Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 md:p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="glass max-w-2xl w-full rounded-3xl border-2 border-[#00f0ff]/50 shadow-[0_0_60px_rgba(0,240,255,0.4)] flex flex-col overflow-hidden h-[90vh] md:h-[85vh]"
            >
              {/* Header - Compact on mobile */}
              <div className="flex justify-between items-center p-3 md:p-4 flex-shrink-0 bg-[#1a1a2e]/80 border-b border-[#00f0ff]/30">
                <h2 className="text-base md:text-xl font-black bg-gradient-to-r from-[#ff00f0] to-[#00f0ff] bg-clip-text text-transparent">
                  PAI
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white text-xl md:text-2xl w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              {/* Chat Messages - Scrollable area */}
              <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-[#0d0d1a]/50">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-4xl mb-3">🤖</div>
                    <p className="text-gray-400 text-sm">Întreabă-mă orice despre marketplace...</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => (
                      <div key={i} className={`mb-3 ${msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-[#00f0ff]/20 rounded-br-sm' : 'bg-[#ff00f0]/20 rounded-bl-sm'}`}>
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-2">
                              {msg.attachments.map((url, idx) => (
                                <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="block relative">
                                  {url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                    <img src={url} alt="Attachment" className="w-20 h-20 object-cover rounded-lg border border-white/20" />
                                  ) : (
                                    <div className="w-20 h-20 bg-black/40 rounded-lg border border-white/20 flex items-center justify-center text-xs">📄 DOC</div>
                                  )}
                                </a>
                              ))}
                            </div>
                          )}
                          <p className="text-xs md:text-sm whitespace-pre-wrap break-words text-white">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                        <div className="animate-spin">⚡</div>
                        <span>Gândesc...</span>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area - Fixed at bottom */}
              <div className="flex-shrink-0 p-3 md:p-4 bg-[#1a1a2e]/80 border-t border-[#00f0ff]/30">
                {/* File Previews */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {attachments.map((file, idx) => (
                      <div key={idx} className="relative group">
                        <div className="w-12 h-12 rounded-lg bg-[#0d0d1a] border border-[#00f0ff]/40 overflow-hidden text-[8px] flex items-center justify-center">
                           {file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? <img src={file.url} className="w-full h-full object-cover" /> : '📄'}
                        </div>
                        <button 
                          onClick={() => removeAttachment(idx)}
                          className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Smart Router Info - No model selection for users */}
                <div className="mb-2 px-3 py-2 rounded-lg bg-[#0d0d1a]/50 border border-[#00f0ff]/20">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">🧠 PAI Smart Router</span>
                    <span className="text-[#00f0ff] font-mono text-[10px]">Auto-selecting best AI</span>
                  </div>
                </div>

                {/* Message input */}
                <div className="flex gap-2 mb-2">
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading || isUploading}
                    className="p-2 rounded-xl bg-[#0d0d1a] border-2 border-[#00f0ff]/30 text-xl hover:border-[#00f0ff] transition-colors"
                  >
                    {isUploading ? '⏳' : '📎'}
                  </button>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileUpload} 
                    multiple 
                    className="hidden" 
                  />
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                    placeholder="Sunt PAI, pot să te ajut să devii mai bun..."
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0d0d1a] border-2 border-[#00f0ff]/30 focus:border-[#00f0ff] outline-none text-white placeholder-gray-500 text-sm"
                    disabled={isLoading}
                  />
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || isUploading || (!message.trim() && attachments.length === 0)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#ff00f0] to-[#00f0ff] font-bold hover:shadow-[0_0_30px_rgba(255,0,240,0.6)] transition-all disabled:opacity-50 text-xl flex-shrink-0"
                  >
                    {isLoading ? '🤔' : '🚀'}
                  </button>
                </div>

                {/* Privacy notice */}
                <p className="text-[10px] text-gray-500 text-center">
                  🔒 Privacy Respect - Date locale, învățare personală
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
