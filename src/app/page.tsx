// app/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader, Sparkles, MessageSquare, Zap, Shield } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function Home() {
  const [isOnChat, setIsOnChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Halo! 👋 Saya adalah ChatBot dengan teknologi NLP. Ada yang bisa saya bantu?',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend }),
      });

      if (!response.ok) throw new Error('HTTP error');

      const data = await response.json();
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Maaf, ada kesalahan. Pastikan backend sedang berjalan.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // LANDING PAGE
  if (!isOnChat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -top-20 -left-20 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -bottom-20 -right-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <header className="border-b border-slate-700/50 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Sparkles className="w-6 h-6" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  NLP ChatBot
                </span>
              </div>
              <div className="text-sm text-slate-400">Powered by M. Nabil dawami</div>
            </div>
          </header>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 py-20">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="inline-block mb-6 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-full">
                <span className="text-sm font-semibold text-blue-300">✨ AI-Powered Assistant NLP</span>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                Tanya Apa Saja
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Dapatkan Jawaban Instan
                </span>
              </h1>

              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                ChatBot dengan teknologi Natural Language Processing (NLP) siap membantu Anda menjawab pertanyaan apa pun secara real-time.
              </p>

              <button
                onClick={() => setIsOnChat(true)}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all hover:shadow-lg hover:shadow-purple-500/50 text-lg"
              >
                Mulai Chat Sekarang →
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mt-20">
              <div className="p-6 border border-slate-700/50 rounded-xl bg-slate-800/50 backdrop-blur hover:border-blue-500/50 transition">
                <div className="p-3 w-12 h-12 bg-blue-500/20 rounded-lg mb-4 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Percakapan Natural</h3>
                <p className="text-slate-400">Chatbot memahami bahasa manusia dengan teknologi NLP terdepan</p>
              </div>

              <div className="p-6 border border-slate-700/50 rounded-xl bg-slate-800/50 backdrop-blur hover:border-purple-500/50 transition">
                <div className="p-3 w-12 h-12 bg-purple-500/20 rounded-lg mb-4 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Respons Cepat</h3>
                <p className="text-slate-400">Dapatkan jawaban dalam hitungan detik, 24/7 tanpa henti</p>
              </div>

              <div className="p-6 border border-slate-700/50 rounded-xl bg-slate-800/50 backdrop-blur hover:border-pink-500/50 transition">
                <div className="p-3 w-12 h-12 bg-pink-500/20 rounded-lg mb-4 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Aman & Terpercaya</h3>
                <p className="text-slate-400">Data Anda aman dengan enkripsi end-to-end</p>
              </div>
            </div>

            {/* Demo Preview */}
            <div className="mt-20 p-8 border border-slate-700/50 rounded-2xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur">
              <h2 className="text-2xl font-bold mb-6">Contoh Percakapan</h2>
              <div className="space-y-4 max-w-2xl">
                <div className="flex justify-end">
                  <div className="bg-blue-600 rounded-2xl rounded-tr-none px-4 py-3 max-w-xs">
                    <p className="text-sm">Halo, siapa nama mu?</p>
                  </div>
                </div>
                <div className="flex justify-start">
                  <div className="bg-slate-700 rounded-2xl rounded-tl-none px-4 py-3 max-w-xs">
                    <p className="text-sm">Saya adalah ChatBot AI dengan teknologi NLP! 😊</p>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-700/50 backdrop-blur-md mt-20">
            <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-400">
              <p>© 2025 NLP ChatBot. Dibuat dengan ❤️ menggunakan Next.js & Flask persembahan Tugas NLP</p>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  // CHAT PAGE (ChatGPT Style)
  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-semibold">NLP ChatBot</h1>
              <p className="text-xs text-slate-400">Natural Language Processing</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsOnChat(false);
              setMessages([{
                id: '1',
                text: 'Halo! 👋 Saya adalah ChatBot dengan teknologi NLP. Ada yang bisa saya bantu?',
                sender: 'bot',
                timestamp: new Date(),
              }]);
            }}
            className="px-4 py-2 text-sm bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-slate-700"
          >
            ← Kembali
          </button>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {messages.length === 1 && (
            <div className="h-full flex flex-col items-center justify-center px-4 text-center">
              <div className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full mb-6">
                <Sparkles className="w-12 h-12 text-purple-400" />
              </div>
              <h2 className="text-3xl font-bold mb-3">Mulai percakapan</h2>
              <p className="text-slate-400 mb-8">Tanya apa saja kepada ChatBot AI kami</p>
              
              {/* Quick suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-md">
                {[
                  { text: 'Halo, siapa nama mu?', icon: '👋' },
                  { text: 'Apa yang bisa kamu lakukan?', icon: '🤖' },
                  { text: 'Terima kasih', icon: '😊' },
                  { text: 'Jam berapa sekarang?', icon: '⏰' }
                ].map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInputValue(suggestion.text);
                      // Auto submit
                      const form = document.querySelector('form');
                      form?.dispatchEvent(new Event('submit', { bubbles: true }));
                    }}
                    className="p-3 text-left rounded-lg border border-slate-700 hover:border-blue-500/50 bg-slate-800/50 hover:bg-slate-700/50 transition text-sm"
                  >
                    <span className="text-lg mr-2">{suggestion.icon}</span>
                    {suggestion.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.length > 1 && (
            <div className="py-8 px-4 space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xl lg:max-w-2xl ${
                    message.sender === 'user'
                      ? 'bg-blue-600 rounded-2xl rounded-tr-none'
                      : 'bg-slate-800 rounded-2xl rounded-tl-none'
                  } px-4 py-3`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                    <span className="text-xs opacity-60 mt-2 block">
                      {message.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-blue-400" />
                    <span className="text-sm">Mengetik...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-md">
        <div className="max-w-4xl mx-auto p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ketik pertanyaan Anda..."
              className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-full focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-white placeholder-slate-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="p-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full transition flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <p className="text-xs text-slate-500 text-center mt-3">
            ChatBot dapat membuat kesalahan. Pertimbangkan untuk memverifikasi informasi penting.
          </p>
        </div>
      </div>
    </div>
  );
}