import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  Bot,
  LifeBuoy,
  LogOut,
  MessageSquareHeart,
  Send,
  ShieldAlert,
  Sparkles,
  X,
} from 'lucide-react';
import { useRouter } from '../context/RouterContext';
import type { AssistantSuggestedLink } from '../utils/careTools';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  suggestedLinks?: AssistantSuggestedLink[];
  urgentSafetyNote?: string;
}

type ChatMode = 'guide' | 'crisis';

const STARTER_PROMPTS = [
  'Our company wants to visit a children’s home in Nairobi',
  'Help me find a rehabilitation centre near Kiambu',
  'Tips to help my autistic 6-year-old calm down',
  'I feel overwhelmed and want to talk to a counsellor',
  'Someone needs urgent shelter away from abuse',
];

const CRISIS_STARTER_PROMPTS = [
  'I feel completely overwhelmed and need to talk safely right now',
  'Someone at home is hurting me or a child and we need refuge',
  'I need discreet support without a phone call right now',
];

export function openCareGuideChatbot(prompt?: string) {
  window.dispatchEvent(new CustomEvent('open-care-guide', { detail: { prompt, mode: 'guide' } }));
}

export function openCrisisTextChat(prompt?: string) {
  window.dispatchEvent(new CustomEvent('open-care-guide', { detail: { prompt, mode: 'crisis' } }));
}

export function CareGuideChatbot() {
  const { path, navigate } = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ChatMode>('guide');
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Welcome to the HIS AND HERS Care Family Guide. Tell me briefly what you or your loved one need today—whether booking a children’s home CSR visit, finding nearby rehabilitation, ASD family support, counselling, or urgent safe refuge.',
      suggestedLinks: [
        {
          label: 'Visit Children’s Homes',
          href: '/home-visits',
          reason: 'Browse partner homes & onboard CSR teams',
        },
        {
          label: 'Crisis Text & Counselling',
          href: '/counselling',
          reason: 'Speak privately or lighten your burden',
        },
      ],
    },
  ]);

  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      const custom = event as CustomEvent<{ prompt?: string; mode?: ChatMode }>;
      setIsOpen(true);
      if (custom.detail?.mode === 'crisis') {
        setMode('crisis');
        setMessages((prev) => {
          if (prev.some((m) => m.id === 'crisis-welcome')) return prev;
          return [
            ...prev,
            {
              id: 'crisis-welcome',
              role: 'assistant',
              text: 'You are in Confidential Crisis & Care Text Support. Take one slow breath. Type whatever feels safe right now—I can guide you immediately to Safe Refuge Protection (/find-my-home), confidential counselling, or immediate emergency steps. Use Quick Exit above at any second if someone checks your screen.',
              urgentSafetyNote:
                'If you or a child is in immediate physical danger, please call local emergency police right away.',
              suggestedLinks: [
                {
                  label: 'Open Find My Home Refuge Intake',
                  href: '/find-my-home',
                  reason: 'Text-only confidential shelter alert',
                },
                {
                  label: 'Anonymous Burden Release',
                  href: '/counselling',
                  reason: 'Speak with a counsellor confidentially',
                },
              ],
            },
          ];
        });
      } else {
        setMode('guide');
      }
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

  if (path.startsWith('/admin')) return null;

  const handleQuickExit = () => {
    window.location.replace('https://www.google.com');
  };

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
      const contextualMessage =
        mode === 'crisis' ? `[URGENT CRISIS SUPPORT CHAT]: ${clean}` : clean;
      const res = await fetch('/api/care-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: contextualMessage,
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
      setErrorMsg('Network error reaching Care Guide. Please select a direct pathway card below.');
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void sendMessage(input);
  };

  const activeStarters = mode === 'crisis' ? CRISIS_STARTER_PROMPTS : STARTER_PROMPTS;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 print:hidden">
      {!isOpen ? (
        <button
          type="button"
          onClick={() => {
            setMode('guide');
            setIsOpen(true);
          }}
          aria-label="Open Care Guide AI & Crisis Text Chat"
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#3B155F] via-[#59217C] to-[#C2593F] text-[#FAF7F2] shadow-lg hover:brightness-110 transition-all text-xs sm:text-sm font-semibold border border-[#E5CA7B]/45"
        >
          <MessageSquareHeart className="w-4 h-4 text-[#E5CA7B]" aria-hidden="true" />
          <span>Care Guide &amp; Crisis Chat</span>
        </button>
      ) : (
        <section
          aria-label="HIS AND HERS Care Guide & Crisis Text Chat"
          className="w-[calc(100vw-2rem)] sm:w-[410px] max-h-[84vh] bg-white border border-[#3B155F]/20 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Chat Header */}
          <div
            className={`px-4 py-3.5 text-[#FAF7F2] space-y-2.5 ${
              mode === 'crisis'
                ? 'bg-gradient-to-r from-[#1D4E46] via-[#256358] to-[#3B155F]'
                : 'bg-gradient-to-r from-[#1E0B2B] via-[#3B155F] to-[#C2593F]'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#D4AF37] text-[#160822] flex items-center justify-center shrink-0">
                  {mode === 'crisis' ? (
                    <LifeBuoy className="w-4 h-4" aria-hidden="true" />
                  ) : (
                    <Bot className="w-4 h-4" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="font-serif text-lg font-semibold leading-tight truncate">
                    {mode === 'crisis' ? 'Crisis & Burden Text Support' : 'Care Family Guide AI'}
                  </h2>
                  <p className="text-[11px] text-[#FAF7F2]/85 truncate">
                    {mode === 'crisis'
                      ? 'Private text guidance · No phone call needed'
                      : 'Private navigation & support finder'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {mode === 'crisis' && (
                  <button
                    type="button"
                    onClick={handleQuickExit}
                    title="Quick Exit to Google"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#D4AF37] text-[#160822] text-[11px] font-semibold hover:bg-[#E5CA7B]"
                  >
                    <LogOut className="w-3 h-3" aria-hidden="true" />
                    Exit
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close Care Guide AI Chatbot"
                  className="w-8 h-8 rounded-md flex items-center justify-center text-[#FAF7F2]/85 hover:bg-white/15 transition-colors"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1.5 bg-black/20 p-1 rounded-lg text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setMode('guide')}
                className={`py-1.5 rounded-md transition-colors ${
                  mode === 'guide' ? 'bg-white text-[#1E0B2B]' : 'text-[#FAF7F2]/80 hover:text-white'
                }`}
              >
                Care Navigation AI
              </button>
              <button
                type="button"
                onClick={() => setMode('crisis')}
                className={`py-1.5 rounded-md transition-colors ${
                  mode === 'crisis' ? 'bg-[#D4AF37] text-[#160822]' : 'text-[#FAF7F2]/80 hover:text-white'
                }`}
              >
                Crisis Text Chat
              </button>
            </div>
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
                  Responding thoughtfully...
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
          <div className="px-4 py-2.5 bg-white border-t border-[#3B155F]/10 flex gap-1.5 overflow-x-auto">
            {activeStarters.map((promptText) => (
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

          {/* Input Bar */}
          <form
            onSubmit={handleSubmit}
            className="p-3 bg-white border-t border-[#3B155F]/12 flex items-center gap-2"
          >
            <label htmlFor="care-guide-chat-input" className="sr-only">
              Type privately to HIS AND HERS Care Guide or Crisis Text Chat
            </label>
            <input
              id="care-guide-chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                mode === 'crisis'
                  ? 'Type discreetly what help you need right now...'
                  : 'Ask about homes, rehab, ASD tips, counselling...'
              }
              maxLength={600}
              className="flex-1 px-3.5 py-2 text-sm bg-[#FAF7F2] border border-[#3B155F]/20 rounded-lg"
            />
            <button
              type="submit"
              disabled={sending || input.trim().length < 2}
              aria-label="Send message"
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
