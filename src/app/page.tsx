// app/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Loader, Heart, ArrowRight, Sparkles, Trash2, MessageSquare, RefreshCw } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  suggestions?: string[];
}

// Mapping topik untuk rekomendasi cerdas
const TOPIC_SUGGESTIONS: Record<string, string[]> = {
  pengertian: [
    "Apa hukum wakaf dalam Islam?",
    "Apa saja rukun wakaf?",
    "Berapa minimal untuk wakaf?"
  ],
  hukum: [
    "Apa saja syarat sah wakaf?",
    "Apa dasar hukum wakaf di Al-Quran?",
    "Apakah wakaf wajib atau sunnah?"
  ],
  rukun: [
    "Apa saja jenis-jenis wakaf?",
    "Siapa itu nazhir?",
    "Bagaimana tata cara wakaf?"
  ],
  jenis: [
    "Apa itu wakaf produktif?",
    "Apa itu wakaf uang?",
    "Contoh wakaf di Indonesia?"
  ],
  uang: [
    "Bagaimana cara wakaf uang?",
    "Platform wakaf digital apa saja?",
    "Apakah wakaf uang halal?"
  ],
  produktif: [
    "Bagaimana pengelolaan wakaf produktif?",
    "Contoh wakaf produktif yang sukses?",
    "Apa manfaat wakaf produktif?"
  ],
  digital: [
    "Bagaimana cara wakaf online?",
    "Platform wakaf apa yang terpercaya?",
    "Apakah wakaf digital aman?"
  ],
  tatacara: [
    "Dokumen apa saja yang diperlukan?",
    "Bagaimana mendaftar wakaf?",
    "Siapa yang bisa menerima wakaf?"
  ],
  nazhir: [
    "Apa tugas nazhir?",
    "Bagaimana memilih nazhir yang baik?",
    "Apakah nazhir bisa diganti?"
  ],
  pembatalan: [
    "Apakah wakaf bisa dijual?",
    "Apa yang terjadi jika wakaf rusak?",
    "Bagaimana mengubah tujuan wakaf?"
  ],
  manfaat: [
    "Apa perbedaan wakaf dan sedekah?",
    "Mengapa wakaf penting?",
    "Apa dampak sosial wakaf?"
  ],
  default: [
    "Apa itu wakaf?",
    "Bagaimana cara berwakaf?",
    "Platform wakaf digital apa saja?"
  ]
};

function detectTopic(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('pengertian') || lowerText.includes('definisi') || lowerText.includes('wakaf adalah')) {
    return 'pengertian';
  } else if (lowerText.includes('hukum') || lowerText.includes('syariat') || lowerText.includes('dalil')) {
    return 'hukum';
  } else if (lowerText.includes('rukun') || lowerText.includes('syarat')) {
    return 'rukun';
  } else if (lowerText.includes('jenis') || lowerText.includes('macam') || lowerText.includes('tipe')) {
    return 'jenis';
  } else if (lowerText.includes('wakaf uang') || lowerText.includes('wakaf tunai')) {
    return 'uang';
  } else if (lowerText.includes('produktif') || lowerText.includes('usaha')) {
    return 'produktif';
  } else if (lowerText.includes('digital') || lowerText.includes('online') || lowerText.includes('platform')) {
    return 'digital';
  } else if (lowerText.includes('tata cara') || lowerText.includes('prosedur') || lowerText.includes('langkah')) {
    return 'tatacara';
  } else if (lowerText.includes('nazhir') || lowerText.includes('pengelola')) {
    return 'nazhir';
  } else if (lowerText.includes('batal') || lowerText.includes('hapus') || lowerText.includes('cabut')) {
    return 'pembatalan';
  } else if (lowerText.includes('manfaat') || lowerText.includes('tujuan') || lowerText.includes('dampak')) {
    return 'manfaat';
  }
  
  return 'default';
}

// Deterministic pseudo-random function (returns 0..1) to avoid SSR/CSR mismatch
function pseudoRandom(seed: number) {
  // use a deterministic math function based on input seed
  const x = Math.sin(seed * 12.9898) * 43758.5453123;
  return x - Math.floor(x);
}

export default function Home() {
  const [isOnChat, setIsOnChat] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Assalamualaikum wa rahmatullahi wa barakatuh! 👋\n\nSaya adalah ChatBot khusus Wakaf. Siap membantu Anda memahami dan merencanakan wakaf Anda. Ada yang ingin diketahui tentang wakaf?',
      sender: 'bot',
      // fixed timestamp to avoid SSR/client mismatch during initial render
      timestamp: new Date(0),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const STORAGE_KEY = 'wakaf_ai_chat_messages';

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Array<any>;
        const restored = parsed.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp),
        })) as Message[];
        setMessages(restored);
      }
    } catch (e) {
      console.warn('Failed to load messages from storage', e);
    }
    // adjust textarea after loading
    setTimeout(() => adjustTextareaHeight(), 0);
  }, []);

  // Persist messages to localStorage (serialize timestamp to ISO)
  useEffect(() => {
    try {
      const toStore = messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    } catch (e) {
      console.warn('Failed to save messages to storage', e);
    }
  }, [messages]);

  // Auto-resize helper
  const adjustTextareaHeight = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 300) + 'px';
  };

  const handleClearChat = () => {
    if (window.confirm('Yakin ingin menghapus semua riwayat chat?')) {
      setMessages([{
        id: '1',
        text: 'Assalamualaikum wa rahmatullahi wa barakatuh! 👋\n\nSaya adalah ChatBot khusus Wakaf. Siap membantu Anda memahami dan merencanakan wakaf Anda. Ada yang ingin diketahui tentang wakaf?',
        sender: 'bot',
        timestamp: new Date(),
      }]);
      try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }
  };

  const handleSendMessage = async (messageText?: string) => {
    if (isLoading) return; // prevent duplicate sends
    const textToSend = messageText || inputValue;
    if (!textToSend.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    adjustTextareaHeight();
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) throw new Error('HTTP error');

      const data = await response.json();
      
      const topic = detectTopic(data.message);
      const suggestions = TOPIC_SUGGESTIONS[topic] || TOPIC_SUGGESTIONS.default;
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        sender: 'bot',
        timestamp: new Date(),
        suggestions: suggestions,
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Maaf, ada kesalahan koneksi. Pastikan backend sedang berjalan.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSendMessage(question);
  };

  // ============= LANDING PAGE =============
  if (!isOnChat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950 text-white overflow-hidden relative">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl -top-20 -left-20 animate-blob"></div>
          <div className="absolute w-96 h-96 bg-teal-500/20 rounded-full blur-3xl -bottom-20 -right-20 animate-blob animation-delay-2000"></div>
          <div className="absolute w-96 h-96 bg-green-500/20 rounded-full blur-3xl top-1/2 left-1/2 animate-blob animation-delay-4000"></div>
          
          {/* Floating particles */}
          {[...Array(15)].map((_, i) => {
            // derive deterministic values from index so server and client match
            const r1 = pseudoRandom(i + 1);
            const r2 = pseudoRandom(i + 101);
            const r3 = pseudoRandom(i + 201);
            const left = `${(r1 * 100).toFixed(6)}%`;
            const top = `${(r2 * 100).toFixed(6)}%`;
            const animationDelay = `${(r3 * 5).toFixed(6)}s`;
            const animationDuration = `${(5 + r1 * 10).toFixed(6)}s`;

            return (
              <div
                key={i}
                className="absolute w-2 h-2 bg-emerald-400/30 rounded-full animate-float"
                style={{
                  left,
                  top,
                  animationDelay,
                  animationDuration,
                }}
              />
            );
          })}
        </div>

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <header className="border-b border-emerald-700/30 backdrop-blur-xl bg-slate-900/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="relative p-3 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl shadow-lg group-hover:shadow-emerald-500/50 transition-all duration-300 group-hover:scale-110">
                  <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white animate-pulse-slow" />
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl blur opacity-50 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-300 via-teal-400 to-green-400 bg-clip-text text-transparent">
                    Wakaf Chatbot
                  </span>
                  <p className="text-xs text-emerald-300/80">Informasi wakaf Digital</p>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 flex items-center justify-center px-4 sm:px-6 py-10 sm:py-20">
            <div className="max-w-5xl w-full">
              {/* Hero Section */}
              <div className="text-center mb-12 sm:mb-16">
                <div className="inline-flex items-center gap-2 mb-6 px-4 sm:px-5 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full hover:border-emerald-500/70 transition-all duration-300 backdrop-blur-sm animate-fadeIn">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                  <span className="text-xs sm:text-sm font-semibold text-emerald-300">Platform Chat Wakaf</span>
                </div>
                
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 leading-tight">
                  <span className="animate-slideDown inline-block">Wujudkan</span>
                  <br />
                  <span className="bg-gradient-to-r from-emerald-300 via-teal-400 to-green-400 bg-clip-text text-transparent animate-slideUp inline-block">
                    Sedekah Jariyah
                  </span>
                </h1>

                <p className="text-base sm:text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed animate-fadeIn animation-delay-200">
                  Pahami wakaf secara mendalam dengan AI yang memahami hukum Islam dan regulasi Indonesia. Konsultasikan rencana wakaf Anda sekarang.
                </p>
              </div>

              {/* CTA Section */}
              <div className="flex flex-col items-center gap-6 animate-fadeIn animation-delay-400 px-4">
                <button
                  onClick={() => setIsOnChat(true)}
                  className="group relative px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl transition-all text-base sm:text-lg flex items-center gap-3 transform hover:scale-105 duration-300 shadow-lg hover:shadow-2xl hover:shadow-emerald-500/50 mb-6 sm:mb-12"
                >
                  <span>Mulai Chatbot Wakaf </span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-2 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl blur opacity-50 group-hover:opacity-100 transition-opacity -z-10"></div>
                </button>

              {/* Features Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12 sm:mb-16 px-4">
                {[
                  {
                    number: '01',
                    title: 'Pahami Wakaf',
                    desc: 'Pelajari pengertian, hukum, rukun, dan syarat wakaf menurut syariat Islam',
                    icon: '📖',
                    gradient: 'from-emerald-500/20 to-teal-500/20'
                  },
                  {
                    number: '02',
                    title: 'Panduan Lengkap',
                    desc: 'Dapatkan panduan step-by-step cara berwakaf dan mendaftarkan wakaf Anda',
                    icon: '📋',
                    gradient: 'from-teal-500/20 to-green-500/20'
                  },
                  {
                    number: '03',
                    title: 'Platform Terpercaya',
                    desc: 'Akses informasi platform wakaf digital sudah resmi',
                    icon: '🔒',
                    gradient: 'from-green-500/20 to-emerald-500/20'
                  },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className={`relative p-5 sm:p-6 bg-gradient-to-br ${feature.gradient} border border-emerald-500/30 rounded-2xl hover:border-emerald-500/70 transition-all duration-500 group cursor-pointer animate-slideUp backdrop-blur-sm overflow-hidden`}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/0 to-teal-600/0 group-hover:from-emerald-400/10 group-hover:to-teal-600/10 transition-all duration-500"></div>
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-2xl sm:text-3xl font-bold text-emerald-400 group-hover:scale-110 transition-transform duration-300">
                          {feature.number}
                        </div>
                        <div className="text-3xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-300">
                          {feature.icon}
                        </div>
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold mb-2 group-hover:text-emerald-300 transition-colors">{feature.title}</h3>
                      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

                {/* Quote */}
                <div className="relative p-5 sm:p-6 max-w-2xl bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/30 rounded-2xl backdrop-blur-xl hover:border-emerald-500/70 transition-all duration-300 hover:scale-105">
                  <div className="absolute top-3 left-3 text-emerald-400/20 text-4xl">"</div>
                  <p className="text-emerald-200 italic text-sm sm:text-base relative z-10 px-4">
                    Sedekah jariyah (wakaf), ilmu yang bermanfaat, atau anak saleh yang mendoakannya.
                  </p>
                  <p className="text-emerald-400 text-xs sm:text-sm mt-3 font-semibold text-right">— Hadits Riwayat Muslim</p>
                  <div className="absolute bottom-3 right-3 text-emerald-400/20 text-4xl">"</div>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-emerald-700/30 backdrop-blur-xl bg-slate-900/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 text-center">
              <p className="text-slate-400 text-xs sm:text-sm">© 2025 Wakaf Chatbot M.Nabil dawami | Semoga amal Anda diterima Allah SWT 💚</p>
            </div>
          </footer>
        </div>

        <style jsx>{`
          @keyframes blob {
            0%, 100% { transform: translate(0, 0) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); opacity: 0.3; }
            50% { transform: translateY(-20px); opacity: 0.6; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-blob { animation: blob 7s infinite; }
          .animate-float { animation: float linear infinite; }
          .animate-fadeIn { animation: fadeIn 0.8s ease-out; }
          .animate-slideUp { animation: slideUp 0.8s ease-out forwards; opacity: 0; }
          .animate-slideDown { animation: slideDown 0.8s ease-out; }
          .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
          .animate-spin-slow { animation: spin 3s linear infinite; }
          .animation-delay-200 { animation-delay: 200ms; }
          .animation-delay-400 { animation-delay: 400ms; }
          .animation-delay-2000 { animation-delay: 2s; }
          .animation-delay-4000 { animation-delay: 4s; }
        `}</style>
      </div>
    );
  }

  // ============= CHAT PAGE =============
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-950 via-emerald-950/50 to-slate-950 text-white relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl top-0 right-0 animate-pulse-slow"></div>
        <div className="absolute w-96 h-96 bg-teal-500/10 rounded-full blur-3xl bottom-0 left-0 animate-pulse-slow animation-delay-2000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-emerald-700/30 bg-slate-900/50 backdrop-blur-xl sticky top-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="relative p-2 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-lg hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white animate-pulse-slow" />
            </div>
            <div className="min-w-0">
              <h1 className="font-semibold text-sm sm:text-lg truncate">Konsultan Wakaf AI</h1>
              <p className="text-xs text-emerald-300 truncate">Memahami Sedekah Jariyah</p>
            </div>
          </div>
          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
            {messages.length > 1 && (
              <button
                onClick={handleClearChat}
                className="px-2 sm:px-4 py-2 text-xs sm:text-sm bg-red-900/30 hover:bg-red-900/50 rounded-lg transition border border-red-700/50 hover:border-red-500/70 duration-300 flex items-center gap-1 sm:gap-2 hover:scale-105"
                title="Hapus semua riwayat chat"
              >
                <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Hapus</span>
              </button>
            )}
            <button
              onClick={() => {
                setIsOnChat(false);
                setMessages([{
                  id: '1',
                  text: 'Assalamualaikum wa rahmatullahi wa barakatuh! 👋\n\nSaya adalah ChatBot khusus Wakaf. Siap membantu Anda memahami dan merencanakan wakaf Anda. Ada yang ingin diketahui tentang wakaf?',
                  sender: 'bot',
                  timestamp: new Date(),
                }]);
              }}
              className="px-2 sm:px-4 py-2 text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 rounded-lg transition border border-slate-700 hover:border-emerald-500/50 duration-300 hover:scale-105"
            >
              ← <span className="hidden sm:inline">Kembali</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="relative flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-4xl mx-auto py-4 sm:py-8">
          {messages.length === 1 && (
            <div className="h-full flex flex-col items-center justify-center px-4 text-center mb-8">
              <div className="relative p-6 sm:p-8 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-full mb-6 border border-emerald-500/30 hover:border-emerald-500/70 transition-all duration-300">
                <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-300 animate-pulse-slow" />
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-600/20 rounded-full blur-xl animate-pulse"></div>
              </div>
              <h2 className="text-2xl sm:text-4xl font-bold mb-3 bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
                Selamat Datang di Wakaf AI
              </h2>
              <p className="text-slate-300 text-sm sm:text-base mb-8 sm:mb-12 max-w-xl">
                Tanyakan apa saja tentang wakaf. Dari pengertian, hukum, tata cara, hingga panduan berwakaf. Saya siap membantu Anda.
              </p>
              
              <div className="w-full mb-12">
                <h3 className="text-xs sm:text-sm font-semibold text-emerald-300 mb-4 sm:mb-6 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin-slow" />
                  Pertanyaan Populer
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto">
                  {[
                    { text: 'Apa itu Wakaf?', icon: '❓', desc: 'Pahami pengertian & dasar wakaf' },
                    { text: 'Apa status wakaf?', icon: '✅', desc: 'Status hukum wakaf dalam Islam' },
                    { text: 'Minimal Berapa untuk Wakaf?', icon: '💰', desc: 'Tidak ada minimal, mulai dari Rp 1 juta' },
                    { text: 'Bagaimana Tata Cara Wakaf?', icon: '📋', desc: 'Panduan lengkap step-by-step' },
                    { text: 'Bisa Dibatalkan?', icon: '🔒', desc: 'Wakaf tidak bisa dibatalkan' },
                    { text: 'Platform Wakaf Digital', icon: '📱', desc: 'Akses platform wakaf online' },
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickQuestion(suggestion.text)}
                      className="p-3 sm:p-4 text-left rounded-xl border border-emerald-500/30 hover:border-emerald-500/70 bg-emerald-900/20 hover:bg-emerald-900/40 transition-all duration-300 group cursor-pointer hover:shadow-lg hover:shadow-emerald-500/10 hover:scale-105 transform animate-slideUp backdrop-blur-sm"
                      style={{ animationDelay: `${idx * 100}ms` }}
                    >
                      <div className="flex items-start gap-2 sm:gap-3">
                        <span className="text-xl sm:text-2xl group-hover:scale-125 transition-transform duration-300">{suggestion.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-semibold group-hover:text-emerald-300 transition-colors truncate">{suggestion.text}</p>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{suggestion.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {messages.length > 1 && (
            <div className="py-4 sm:py-8 px-3 sm:px-4 space-y-4 sm:space-y-6">
              {messages.map((message, idx) => (
                <div key={message.id} className="space-y-3 sm:space-y-4">
                  <div 
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}
                    style={{ animationDelay: `${idx * 50}ms` }}
                  >
                    <div className={`max-w-[85%] sm:max-w-xl lg:max-w-2xl ${
                      message.sender === 'user'
                        ?
                                                'bg-gradient-to-r from-emerald-500 to-teal-600 text-white'
                        : 'bg-slate-800/50 text-slate-200 border border-slate-700/50'
                      } rounded-2xl p-3 sm:p-4 shadow-lg hover:shadow-xl transition-all duration-300`}
                    >
                      <p className="text-sm sm:text-base whitespace-pre-wrap leading-relaxed">{message.text}</p>
                      <p className="text-xs text-slate-400 mt-2">{message.timestamp.toLocaleTimeString()}</p>
                    </div>
                  </div>
                  
                  {/* Suggestions for bot messages */}
                  {message.sender === 'bot' && message.suggestions && (
                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-start animate-fadeIn animation-delay-200">
                      {message.suggestions.map((suggestion, sidx) => (
                        <button
                          key={sidx}
                          onClick={() => handleQuickQuestion(suggestion)}
                          className="px-3 sm:px-4 py-2 text-xs sm:text-sm bg-emerald-900/30 hover:bg-emerald-900/50 border border-emerald-500/30 hover:border-emerald-500/70 rounded-lg transition-all duration-300 hover:scale-105 text-emerald-300 hover:text-emerald-200"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start px-3 sm:px-4 animate-fadeIn">
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-3 sm:p-4 shadow-lg max-w-[85%] sm:max-w-xl lg:max-w-2xl">
                <div className="flex items-center gap-3">
                  <Loader className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 animate-spin" />
                  <span className="text-sm sm:text-base text-slate-300">Sedang mengetik...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Section */}
      <div className="relative z-10 border-t border-emerald-700/30 bg-slate-900/50 backdrop-blur-xl sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex gap-2 sm:gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={(el) => { textareaRef.current = el; }}
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); adjustTextareaHeight(); }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Tanyakan tentang wakaf..."
                className="w-full min-h-[44px] max-h-32 resize-none rounded-xl border border-emerald-500/30 bg-slate-800/50 px-3 sm:px-4 py-3 text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/70 transition-all duration-300 backdrop-blur-sm"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputValue.trim()}
              className="p-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-slate-600 disabled:to-slate-700 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl hover:shadow-emerald-500/50 flex-shrink-0"
            >
              <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
