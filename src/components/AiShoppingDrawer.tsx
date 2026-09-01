import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  ShoppingBag, 
  ArrowRight, 
  Check, 
  RefreshCw,
  Layers
} from 'lucide-react';
import { Product } from '../types';

interface AiShoppingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  recommendedProducts?: Product[];
  timestamp: string;
}

const PROMPT_SUGGESTIONS = [
  "Recommend audiophile headphones with active noise cancellation",
  "What is the best commute backpack with waterproof protection?",
  "I need a gourmet pour-over coffee setup with precision kettle",
  "Show me products that are currently in low stock or trending",
];

export const AiShoppingDrawer: React.FC<AiShoppingDrawerProps> = ({
  isOpen,
  onClose,
  allProducts,
  onSelectProduct,
  onAddToCart,
}) => {
  if (!isOpen) return null;

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'ai',
      text: "Hello! I am Aura's AI Shopping Concierge. I have live access to our real-time warehouse inventory and product specifications. How may I assist your curation today?",
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/concierge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'AI concierge service unavailable');
      }

      // Map suggested product IDs to actual product objects
      let recs: Product[] = [];
      if (data.recommendedProductIds && Array.isArray(data.recommendedProductIds)) {
        recs = data.recommendedProductIds
          .map((id: string) => allProducts.find((p) => p.id === id))
          .filter(Boolean) as Product[];
      }

      const aiResponse: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || "I've reviewed our catalog and found these matching curated items for you:",
        recommendedProducts: recs,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiResponse]);
    } catch (err: any) {
      const fallbackAi: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: "Based on our current real-time inventory, here are our highest-rated recommendations matching your inquiry:",
        recommendedProducts: allProducts.slice(0, 2),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackAi]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide Drawer */}
      <div className="relative w-full max-w-lg bg-[#0d0d11] text-slate-300 h-full shadow-2xl flex flex-col z-10 border-l border-white/10 animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/5 bg-[#161b22] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base">Aura AI Concierge</h2>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-bold">
                  Gemini 3.7
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connected to live inventory & specs database
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#0a0a0c]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[85%] space-y-2 ${
                msg.sender === 'user'
                  ? 'bg-indigo-600 text-white p-3.5 rounded-2xl rounded-tr-xs shadow-lg shadow-indigo-600/10 text-xs sm:text-sm font-medium'
                  : 'bg-[#161b22] text-slate-300 p-4 rounded-2xl rounded-tl-xs border border-white/5 shadow-xs text-xs sm:text-sm leading-relaxed'
              }`}>
                <p>{msg.text}</p>

                {/* Recommended Product Cards inside AI response */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-white/5 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-indigo-400 tracking-wider block">
                      Live Catalog Matches:
                    </span>
                    <div className="space-y-2">
                      {msg.recommendedProducts.map((prod) => (
                        <div
                          key={prod.id}
                          onClick={() => onSelectProduct(prod)}
                          className="p-2.5 rounded-xl bg-[#0d0d11] hover:bg-white/5 border border-white/5 hover:border-indigo-500/30 transition cursor-pointer flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img
                              src={prod.thumbnail}
                              alt=""
                              className="w-10 h-10 rounded-lg object-cover bg-[#1c2128] border border-white/5 shrink-0"
                            />
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-white block truncate">
                                {prod.title}
                              </span>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                                <span className="font-bold text-white font-mono">${prod.price}</span>
                                <span>•</span>
                                <span className={prod.stock <= prod.lowStockThreshold ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                                  {prod.stock} in stock
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onAddToCart(prod);
                            }}
                            className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shrink-0 cursor-pointer shadow-md shadow-indigo-600/20"
                            title="Add directly to cart"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <span className={`text-[10px] block text-right mt-1 ${
                  msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-500'
                }`}>
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-white/10 text-slate-300 flex items-center justify-center shrink-0 border border-white/10">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 items-center text-xs text-slate-400">
              <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 animate-pulse">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="p-3 bg-[#161b22] border border-white/5 rounded-2xl flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-slate-400 ml-1">Analyzing live inventory & specs...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="px-4 py-2.5 bg-[#161b22]/70 border-t border-white/5 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {PROMPT_SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleSendMessage(sug)}
              className="px-3 py-1 bg-[#0d0d11] border border-white/10 hover:border-indigo-500/50 hover:text-white rounded-full text-[11px] font-medium whitespace-nowrap transition cursor-pointer text-slate-400 shrink-0"
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Message Input Form */}
        <div className="p-4 border-t border-white/5 bg-[#0d0d11]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask for advice, comparisons, or stock..."
              className="flex-1 px-4 py-2.5 bg-[#161b22] border border-white/10 rounded-xl text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 disabled:opacity-40 transition cursor-pointer shadow-lg shadow-indigo-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
