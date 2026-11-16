import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Bot, MessageSquareHeart, Send, ShieldAlert, Sparkles, X } from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import type { AssistantSuggestedLink } from '../utils/careTools';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  suggestedLinks?: AssistantSuggestedLink[];
  urgentSafetyNote?: string;
}

const STARTER_PROMPTS = [
  'Our company wants to visit a children’s home in Nairobi',
  'Help me find a rehabilitation centre near Kiambu',
  'Tips to help my autistic 6-year-old calm down',
  'I feel overwhelmed and want to talk to a counsellor',
  'Someone needs urgent shelter away from abuse',
];

export function openCareGuideChatbot(prompt?: string) {
  window.dispatchEvent(new CustomEvent('open-care-guide', { detail: { prompt } }));
}

export function CareGuideChatbot() {
  const { path, navigate } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Welcome to the HIS AND HERS Care Family Guide. Tell me briefly what you or your loved one need today—whether booking a children’s home CSR visit, finding nearby rehabilitation, ASD family support, counselling, or safe refuge.',
      suggestedLinks: [
        {
          label: 'Visit Children’s Homes',
          href: '/home-visits',
          reason: 'Browse partner homes & onboard CSR teams',
        },
        {
          label: 'ASD Family Support',
          href: '/asd-support',
          reason: 'Build a daily visual routine or ask mentors',
        },
      ],
    },
  ]);

  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ prompt?: string }>;
      setIsOpen(true);
      if (custom.detail?.prompt) {
        setInput(custom.detail.prompt);
      }
    };
    window.addEventListener('open-care-guide', handler);
    return () => window.removeEventListener('open-care-guide', handler);
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  // Keep admin workspace uncluttered
  if (path.startsWith('/admin')) return null;

  const sendMessage = async (textToSend: string) => {
    const clean = textToSend.trim();
    if (!clean || sending) return;

    setErrorMsg(null);
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: clean,
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setInput('');
    setSending(true);

    try {
      const res = await fetch('/api/care-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: clean,
          history: nextHistory.slice(-6).map((m) => ({ role: m.role, text: m.text })),
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        setErrorMsg(payload.error || 'Could not reach Care Guide AI right now.');
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: payload.reply,
          suggestedLinks: payload.suggestedLinks || [],
          urgentSafetyNote: payload.urgentSafetyNote,
        },
      ]);
    } catch {
      setErrorMsg('Network error reaching Care Guide AI. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 print:hidden">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Care Guide AI Chatbot"
          className="inline-flex items-center gap-2 px-3.5 sm:px-5 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#3B155F] via-[#59217C] to-[#C2593F] text-[#FAF7F2] shadow-lg hover:brightness-110 transition-all text-xs sm:text-sm font-semibold border border-[#E5CA7B]/40"
        >
          <MessageSquareHeart className="w-4 h-4 text-[#E5CA7B]" aria-hidden="true" />
          <span>Ask Care Guide AI</span>
        </button>
      ) : (
        <section
          aria-label="HIS AND HERS Care Guide AI Assistant"
          className="w-[calc(100vw-2rem)] sm:w-[400px] max-h-[82vh] bg-white border border-[#3B155F]/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-[#1E0B2B] via-[#3B155F] to-[#C2593F] text-[#FAF7F2] px-5 py-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-[#160822] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="font-serif text-lg font-semibold leading-tight truncate">
                  Care Family Guide AI
                </h2>
                <p className="text-[11px] text-[#FAF7F2]/80 truncate">
                  Private navigation &amp; support finder
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close Care Guide AI Chatbot"
              className="w-8 h-8 rounded-md flex items-center justify-center text-[#FAF7F2]/85 hover:bg-white/15 transition-colors shrink-0"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF7F2]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[90%] rounded-xl px-4 py-3 text-sm leading-relaxed space-y-2.5 ${
                    msg.role === 'user'
                      ? 'bg-[#3B155F] text-[#FAF7F2]'
                      : 'bg-white border border-[#3B155F]/14 text-[#1E0B2B]'
                  }`}
                >
                  <p>{msg.text}</p>

                  {msg.urgentSafetyNote && (
                    <div className="bg-[#FDF2EC] border border-[#C2593F]/30 rounded-lg p-2.5 text-xs text-[#92321D] flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
                      <span>{msg.urgentSafetyNote}</span>
                    </div>
                  )}

                  {msg.suggestedLinks && msg.suggestedLinks.length > 0 && (
                    <div className="pt-1 space-y-1.5">
                      {msg.suggestedLinks.map((link) => (
                        <button
                          key={`${msg.id}-${link.href}`}
                          type="button"
                          onClick={() => {
                            navigate(link.href);
                            setIsOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg bg-[#FDF6EE] hover:bg-[#F5E6D6] border border-[#C2593F]/25 transition-colors flex items-center justify-between gap-2"
                        >
                          <span className="min-w-0">
                            <span className="block text-xs font-semibold text-[#3B155F]">
                              {link.label}
                            </span>
                            {link.reason && (
                              <span className="block text-[11px] text-[#665B73] truncate">
                                {link.reason}
                              </span>
                            )}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#C2593F] shrink-0" aria-hidden="true" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex items-start">
                <div className="bg-white border border-[#3B155F]/12 rounded-xl px-4 py-3 text-xs text-[#665B73] inline-flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#C2593F]" aria-hidden="true" />
                  Finding the best Care Family pathway for you...
                </div>
              </div>
            )}

            {errorMsg && (
              <div role="alert" className="text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg p-3 space-y-2">
                <p>{errorMsg}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[
                    { label: 'Children’s Homes', href: '/home-visits' },
                    { label: 'Rehab Near Me', href: '/rehabilitation' },
                    { label: 'ASD Support', href: '/asd-support' },
                    { label: 'Counselling', href: '/counselling' },
                    { label: 'Find My Home', href: '/find-my-home' },
                  ].map((item) => (
                    <button
                      key={item.href}
                      type="button"
                      onClick={() => {
                        navigate(item.href);
                        setIsOpen(false);
                      }}
                      className="px-2 py-1 rounded bg-white border border-red-200 text-[#3B155F] font-semibold hover:bg-[#FAF7F2]"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={scrollEndRef} />
          </div>

          {/* Starter Prompts Strip */}
          {messages.length <= 2 && (
            <div className="px-4 py-2.5 bg-white border-t border-[#3B155F]/10 flex gap-1.5 overflow-x-auto">
              {STARTER_PROMPTS.map((promptText) => (
                <button
                  key={promptText}
                  type="button"
                  onClick={() => void sendMessage(promptText)}
                  className="px-2.5 py-1.5 text-[11px] font-medium bg-[#EDF6F3] hover:bg-[#DCEEE8] text-[#256358] rounded-md whitespace-nowrap shrink-0 transition-colors"
                >
                  {promptText}
                </button>
              ))}
            </div>
          )}

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-[#3B155F]/12 flex items-center gap-2"
          >
            <label htmlFor="care-guide-chat-input" className="sr-only">
              Ask Care Guide AI what support you need
            </label>
            <input
              id="care-guide-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about homes, rehab, ASD tips, counselling..."
              maxLength={600}
              className="flex-1 px-3.5 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-lg"
            />
            <button
              type="submit"
              disabled={sending || input.trim().length < 2}
              aria-label="Send message to Care Guide AI"
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[#C2593F] hover:bg-[#A64831] disabled:opacity-50 text-white transition-colors shrink-0"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
