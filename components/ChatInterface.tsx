import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Shield, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { Message } from '../types';
import MarkdownMessage from './MarkdownMessage';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (content: string, image?: string) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage }) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Adjust textarea height dynamically up to max-height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (input.trim() || selectedImage) {
      onSendMessage(input.trim() || 'Analyze this image.', selectedImage || undefined);
      setInput('');
      setSelectedImage(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsProcessingImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setIsProcessingImage(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full w-full min-h-0 overflow-hidden bg-gray-950/20 backdrop-blur-sm">
      {/* 1. Primary Content Area: Message Viewport with all remaining vertical space */}
      <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 md:p-6 space-y-5">
        {messages.length === 0 && (
          <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-center space-y-5 max-w-lg mx-auto py-6">
            <div className="relative">
              <Shield className="h-14 w-14 sm:h-16 sm:w-16 text-cyan-500/20" />
              <Bot className="h-7 w-7 sm:h-8 sm:w-8 text-cyan-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="space-y-1.5 px-2">
              <h3 className="text-lg sm:text-xl font-bold text-white uppercase tracking-tight font-mono">
                System Initialization Complete
              </h3>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Codex Prime Panzershell is active. Enter queries or upload images for deep multimodal analysis.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full px-2">
              {[
                'Explain secure JWT auth',
                'Audit my react hook',
                'Analyze system architecture',
                'Python crypto logic',
              ].map((text) => (
                <button
                  key={text}
                  onClick={() => onSendMessage(text)}
                  className="px-3.5 py-2.5 bg-gray-900/90 border border-gray-800 rounded-xl text-xs font-mono text-gray-300 hover:text-cyan-300 hover:border-cyan-500/50 hover:bg-gray-850 transition-all text-left flex items-center space-x-2 shadow-sm"
                >
                  <span className="text-cyan-500 font-bold">{'>'}</span>
                  <span className="truncate">{text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`flex items-start w-full max-w-[96%] sm:max-w-[90%] md:max-w-[85%] space-x-3 ${
                msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              {/* Avatar Icon */}
              <div
                className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border shadow-md mt-1 ${
                  msg.role === 'user'
                    ? 'bg-blue-600/20 border-blue-500/40'
                    : msg.role === 'assistant'
                    ? 'bg-cyan-600/20 border-cyan-500/40'
                    : 'bg-gray-800 border-gray-700'
                }`}
              >
                {msg.role === 'user' ? (
                  <User className="h-4 w-4 text-blue-400" />
                ) : (
                  <Bot className="h-4 w-4 text-cyan-400" />
                )}
              </div>

              {/* Message Content Container */}
              <div
                className={`flex-1 min-w-0 p-4 sm:p-5 rounded-2xl shadow-xl transition-all ${
                  msg.role === 'user'
                    ? 'bg-blue-600/15 border border-blue-500/30 text-blue-50 ml-6 sm:ml-12'
                    : msg.securityEvent
                    ? 'bg-red-950/20 border border-red-500/50 text-red-100 mr-4 sm:mr-8'
                    : 'bg-gray-900/90 border border-gray-800/80 text-gray-100 mr-4 sm:mr-8'
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between mb-2.5 pb-1.5 border-b border-gray-800/60">
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider font-mono text-gray-400">
                      {msg.role === 'user' ? 'Operator' : 'Codex Prime'}
                    </span>
                    {msg.securityEvent && (
                      <span className="text-[9px] px-2 py-0.5 bg-red-500/20 border border-red-500/40 text-red-400 rounded uppercase font-bold tracking-wider animate-pulse">
                        Boundary Violated
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-gray-500">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {/* Uploaded Image Thumbnail */}
                {msg.image && (
                  <div className="mb-3.5 rounded-xl overflow-hidden border border-gray-700 max-w-md bg-black/40">
                    <img
                      src={msg.image}
                      alt="User payload"
                      className="max-w-full max-h-[320px] object-contain"
                    />
                  </div>
                )}

                {/* Rendered Body Text: Approximately 16px, high-contrast, markdown-aware */}
                {msg.role === 'assistant' ? (
                  <MarkdownMessage content={msg.content} />
                ) : (
                  <div className="text-[15px] sm:text-[16px] leading-[1.65] whitespace-pre-wrap font-sans text-blue-50 break-words">
                    {msg.content}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={scrollRef} className="h-1" />
      </div>

      {/* 2. Non-shrinking Input Composer positioned below the message viewport */}
      <div className="shrink-0 p-3 sm:p-4 bg-gray-900/85 border-t border-gray-800 backdrop-blur-md">
        {selectedImage && (
          <div className="max-w-4xl mx-auto mb-2.5 relative inline-block">
            <img
              src={selectedImage}
              alt="Preview attachment"
              className="h-16 w-16 sm:h-20 sm:w-20 object-cover rounded-xl border-2 border-cyan-500/60 shadow-cyan-500/20 shadow-lg"
            />
            <button
              onClick={clearImage}
              className="absolute -top-1.5 -right-1.5 p-1 bg-red-500 text-white rounded-full hover:bg-red-400 transition-colors shadow-md"
              title="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="relative max-w-4xl mx-auto flex items-end space-x-2"
        >
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingImage}
            className="p-3 bg-gray-950 border border-gray-800 text-gray-400 hover:text-cyan-400 hover:border-cyan-500/50 rounded-xl transition-all disabled:opacity-50 shrink-0 h-[46px] w-[46px] flex items-center justify-center shadow-sm"
            title="Upload Image for Multimodal Analysis"
          >
            {isProcessingImage ? (
              <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
            ) : (
              <ImageIcon className="h-5 w-5" />
            )}
          </button>

          <div className="relative flex-1">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                selectedImage
                  ? 'Describe analysis instructions for image payload...'
                  : 'Message Codex Prime (Press Enter to send, Shift+Enter for newline)...'
              }
              className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 pr-12 text-sm sm:text-[15px] text-gray-100 font-sans placeholder-gray-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/50 transition-all shadow-inner resize-none min-h-[46px] max-h-36 overflow-y-auto leading-normal"
            />
            <button
              type="submit"
              disabled={(!input.trim() && !selectedImage) || isProcessingImage}
              className="absolute right-2.5 bottom-2.5 p-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-all shadow-md"
              title="Transmit query"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>

        <div className="mt-1.5 text-center">
          <span className="text-[9px] text-gray-500 uppercase font-mono tracking-widest">
            CODEX PRIME PANZERSHELL · SECURE GATEWAY ACTIVE
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
