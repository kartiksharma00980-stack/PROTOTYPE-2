import React, { useState, useEffect, useRef } from 'react';
import {
  DocumentSource,
  KnowledgeChunk,
  ChatMessage,
  Language,
} from './types';
import { getDeveloperKnowledgeBase } from '../knowledge_base';
import { searchKnowledgeBaseBM25 } from './utils/search';
import { Header } from './components/Header';
import { KnowledgeBaseSidebar } from './components/KnowledgeBaseSidebar';
import { ChatMessageView } from './components/ChatMessageView';
import { ChunksModal } from './components/ChunksModal';
import { VoiceConversationModal } from './components/VoiceConversationModal';
import { TRANSLATIONS, EXAMPLE_QUESTIONS } from './data/translations';
import {
  Send,
  Loader2,
  Trash2,
  Menu,
  Sparkles,
  Scale,
  ShieldAlert,
  ArrowUpRight,
  ShieldCheck,
  Mic,
  BookOpen,
} from 'lucide-react';

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [documents, setDocuments] = useState<DocumentSource[]>([]);
  const [chunks, setChunks] = useState<KnowledgeChunk[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string | null>(null);

  // Read-only inspection & Voice modals for normal users
  const [inspectingDoc, setInspectingDoc] = useState<DocumentSource | null>(null);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const t = TRANSLATIONS[language];

  // Initialize Knowledge Base from Developer-Controlled Files
  useEffect(() => {
    const { documents: devDocs, chunks: devChunks } = getDeveloperKnowledgeBase();
    setDocuments(devDocs);
    setChunks(devChunks);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSearching]);

  // Send a query through BM25/Vector retrieval -> Gemini Grounded Answer
  const handleSendMessage = async (queryText?: string) => {
    const question = (queryText || inputValue).trim();
    if (!question || isSearching) return;

    setInputValue('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    // Determine query language
    const isHindiQuestion = /[\u0900-\u097F]/.test(question) || language === 'hi';
    const queryLang: Language = isHindiQuestion ? 'hi' : 'en';

    // Add user message
    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: question,
      timestamp: Date.now(),
      language: queryLang,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsSearching(true);
    setSearchStatus('Searching official Knowledge Base statutes & guidelines...');

    try {
      // STRICT SOURCE CONTROL: Search ONLY the developer-curated Knowledge Base chunks
      const top5Chunks = searchKnowledgeBaseBM25(question, chunks, 5);

      // Call server-side Gemini API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          chunks: top5Chunks,
          language: queryLang,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.answer,
        timestamp: Date.now(),
        language: queryLang,
        retrievedChunks: top5Chunks,
        usedCitations: data.usedCitations || [],
        foundInSources: data.foundInSources !== false,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = {
        id: `assistant-error-${Date.now()}`,
        sender: 'assistant',
        text:
          queryLang === 'hi'
            ? `त्रुटि: अनुरोध संसाधित करने में समस्या आई। (${error?.message || 'सर्वर अनुपलब्ध है'})`
            : `Error: Could not complete grounded query. (${error?.message || 'Server unavailable'})`,
        timestamp: Date.now(),
        language: queryLang,
        error: error?.message,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSearching(false);
      setSearchStatus(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
  };

  const handleClearChat = () => {
    if (messages.length === 0) return;
    if (window.confirm(t.clearChatConfirm)) {
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#FBF9F4] text-[#1C2920] overflow-hidden">
      {/* Top Header */}
      <Header
        language={language}
        onToggleLanguage={setLanguage}
        totalDocs={documents.length}
        totalChunks={chunks.length}
        onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
      />

      {/* Main App Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Official Reference Explorer & Example Questions */}
        <KnowledgeBaseSidebar
          documents={documents}
          totalChunks={chunks.length}
          language={language}
          onSelectExampleQuestion={(q) => handleSendMessage(q)}
          onInspectDocument={setInspectingDoc}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Right Main Chat Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-[#FAF8F2]">
          {/* Sub-header on mobile */}
          <div className="lg:hidden px-3 py-2 bg-[#EDE8DC] border-b border-[#E0D8C8] flex items-center justify-between gap-2">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#1A3B2B] bg-[#FAF8F2] px-2.5 py-1.5 rounded-lg border border-[#DDD3BF]"
            >
              <Menu className="w-3.5 h-3.5 text-[#2E5A44]" />
              <span>Official Statutes ({documents.length})</span>
            </button>

            <button
              onClick={() => setIsVoiceModalOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voice</span>
            </button>
          </div>

          {/* Active Knowledge Base Info Bar */}
          <div className="bg-[#FAF7EE] border-b border-[#E8E2D5] px-4 py-2 text-xs text-[#526559] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-semibold text-[#1A3B2B]">
                Official Regulatory Grounding:
              </span>
              <span>
                {documents.length} authoritative statutes and guidelines in active force.
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-[#2E5A44] font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Strictly Grounded • 0 External Web Scraping</span>
            </div>
          </div>

          {/* Messages Stream Container */}
          <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Empty / Welcome State */}
              {messages.length === 0 && (
                <div className="my-4 sm:my-8 space-y-6">
                  {/* Hero Card */}
                  <div className="bg-gradient-to-br from-[#1A3B2B] to-[#254A37] text-[#FAF7EE] rounded-3xl p-6 sm:p-8 shadow-md border border-[#3A634E] relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
                    <div className="max-w-2xl relative z-10">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF7EE]/10 border border-[#FAF7EE]/20 text-xs text-[#D8EADB] mb-4">
                        <Scale className="w-3.5 h-3.5 text-[#E6C364]" />
                        <span>Traditional Knowledge & Ayush IP Intelligence</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3 font-serif">
                        {t.chatWelcomeTitle}
                      </h2>
                      <p className="text-sm sm:text-[15px] text-[#C2D8CB] leading-relaxed mb-4">
                        {t.chatWelcomeDesc}
                      </p>

                      <div className="flex flex-wrap items-center gap-2.5 pt-1">
                        <button
                          onClick={() => setIsVoiceModalOpen(true)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold shadow-md inline-flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <Mic className="w-4 h-4" />
                          <span>Start Voice Conversation (Live API)</span>
                        </button>

                        <button
                          onClick={() => setIsMobileSidebarOpen(true)}
                          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-[#FAF7EE] text-xs font-semibold border border-white/20 inline-flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <BookOpen className="w-4 h-4 text-[#80D2A4]" />
                          <span>Explore Official Acts</span>
                        </button>
                      </div>

                      <div className="mt-4 p-3 rounded-xl bg-[#132B20]/70 border border-[#2D5541] flex items-center gap-2 text-xs text-[#E6C364]">
                        <ShieldAlert className="w-4 h-4 shrink-0" />
                        <span>{t.disclaimerLong}</span>
                      </div>
                    </div>
                  </div>

                  {/* 3-Step Grounding Architecture Guide */}
                  <div className="bg-white border border-[#E3DCCE] rounded-2xl p-5 shadow-2xs">
                    <h3 className="text-xs font-bold text-[#1A3B2B] uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#C29B38]" />
                      <span>Strict Grounding & Verification Architecture</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-xl bg-[#FAF8F2] border border-[#E8E2D4]">
                        <span className="text-xs font-bold text-[#2E5A44] block mb-1">
                          1. Official Ingested Guidelines
                        </span>
                        <p className="text-xs text-[#526559] leading-relaxed">
                          Authoritative guidelines from CGPDTM, CSIR-TKDL, National Biodiversity Authority, and WIPO.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#FAF8F2] border border-[#E8E2D4]">
                        <span className="text-xs font-bold text-[#2E5A44] block mb-1">
                          2. Hybrid Semantic Retrieval
                        </span>
                        <p className="text-xs text-[#526559] leading-relaxed">
                          Retrieves the top 5 most relevant passages across Indian patent sections and traditional remedies.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-[#FAF8F2] border border-[#E8E2D4]">
                        <span className="text-xs font-bold text-[#2E5A44] block mb-1">
                          3. Source-Cited Synthesis
                        </span>
                        <p className="text-xs text-[#526559] leading-relaxed">
                          Gemini cites exact page numbers [1], [2]. If not found in the statutes, it strictly says "No evidence found".
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Starter Prompts */}
                  <div>
                    <p className="text-xs font-bold text-[#62776A] uppercase tracking-wider mb-2.5">
                      Suggested Questions to Ask:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {EXAMPLE_QUESTIONS.map((item, idx) => {
                        const q = language === 'hi' ? item.textHi : item.textEn;
                        return (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(q)}
                            className="p-3.5 text-left rounded-xl bg-white border border-[#E3DCCE] hover:border-[#2E5A44] hover:bg-[#F8FAF8] text-xs sm:text-sm text-[#1C2E22] transition-all flex items-center justify-between gap-3 group shadow-2xs cursor-pointer"
                          >
                            <span className="font-medium">{q}</span>
                            <ArrowUpRight className="w-4 h-4 text-[#8AA093] group-hover:text-[#2E5A44] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Message List */}
              {messages.map((message) => (
                <ChatMessageView
                  key={message.id}
                  message={message}
                  language={language}
                />
              ))}

              {/* Searching Indicator */}
              {isSearching && (
                <div className="flex justify-start my-4 px-2 sm:px-0 animate-in fade-in">
                  <div className="bg-white border border-[#DDD3BF] rounded-2xl rounded-bl-xs p-4 shadow-2xs flex items-center gap-3 text-xs sm:text-sm text-[#2E5A44]">
                    <Loader2 className="w-4 h-4 animate-spin text-[#2E5A44]" />
                    <span className="font-medium">
                      {searchStatus || 'Searching official Knowledge Base statutes & guidelines...'}
                    </span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Bottom Query Input Bar */}
          <div className="p-3 sm:p-4 bg-[#EDE8DC] border-t border-[#E0D8C8]">
            <div className="max-w-4xl mx-auto space-y-2">
              <div className="relative flex items-end gap-2 bg-white border border-[#D5CCBA] rounded-2xl p-2 shadow-xs focus-within:border-[#2E5A44] focus-within:ring-2 focus-within:ring-[#2E5A44]/20 transition-all">
                <textarea
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  placeholder={t.inputPlaceholder}
                  rows={1}
                  disabled={isSearching}
                  className="w-full bg-transparent px-2.5 py-1.5 text-xs sm:text-sm text-[#1A3B2B] placeholder-[#7F9387] resize-none focus:outline-hidden max-h-36 leading-relaxed disabled:opacity-50"
                />

                <div className="flex items-center gap-1 shrink-0 pb-0.5">
                  {/* Voice Button inside input */}
                  <button
                    onClick={() => setIsVoiceModalOpen(true)}
                    type="button"
                    title="Speak with Gemini 3.8 Live"
                    className="p-2 rounded-xl text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {messages.length > 0 && (
                    <button
                      onClick={handleClearChat}
                      disabled={isSearching}
                      title={t.clearChat}
                      className="p-2 rounded-xl text-[#7F9387] hover:text-[#996256] hover:bg-[#F5EBE9] transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputValue.trim() || isSearching}
                    className="p-2.5 rounded-xl bg-[#1A3B2B] text-[#FAF7EE] hover:bg-[#2E5A44] disabled:opacity-30 disabled:hover:bg-[#1A3B2B] transition-all shadow-xs cursor-pointer"
                    title={t.sendButton}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Input Footer Disclaimer Notice */}
              <div className="flex items-center justify-between text-[11px] text-[#697E72] px-2 flex-wrap gap-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <strong className="text-[#3A5344]">Strict Grounding:</strong> Searching ONLY developer-verified statutory knowledge base.
                </span>
                <span className="italic text-[#8A795E]">
                  {t.disclaimerShort}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Document Chunks Inspector Modal (Read-Only Reference for Users) */}
      {inspectingDoc && (
        <ChunksModal
          document={inspectingDoc}
          chunks={chunks}
          language={language}
          onClose={() => setInspectingDoc(null)}
        />
      )}

      {/* Gemini 3.8 Live Voice Conversation Modal */}
      <VoiceConversationModal
        isOpen={isVoiceModalOpen}
        language={language}
        onClose={() => setIsVoiceModalOpen(false)}
      />
    </div>
  );
}
