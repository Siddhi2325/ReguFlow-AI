import { useRef, useState, useEffect, useMemo, useCallback } from "react";
import { BeginnerHint } from "@/components/shared/States";
import { useIsBeginner } from "@/state/CopilotContext";
import type { ChatMessage } from "@/lib/types";
import {
  Send, Sparkles, BookOpenCheck, Loader2, X, Plus, Trash2,
  ChevronLeft, MessageSquare, Clock, Copy, Check, RotateCcw
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const QUICK = [
  { label: "Summarize the latest circular", icon: "📋" },
  { label: "What changed between my latest documents?", icon: "🔄" },
  { label: "Which departments are most impacted?", icon: "🏢" },
  { label: "List open MAPs by severity", icon: "⚠️" },
  { label: "Draft an executive briefing", icon: "📝" },
];

const STORAGE_KEY = "reguflow.copilot.sessions";
const ACTIVE_KEY = "reguflow.copilot.active_session";

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  sessionId?: string;
  createdAt: string;
  updatedAt: string;
}

function loadSessions(): ChatSession[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveSessions(sessions: ChatSession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
}

function generateTitle(firstMessage: string): string {
  return firstMessage.length > 50 ? firstMessage.slice(0, 47) + "..." : firstMessage;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

const INITIAL_MESSAGE: ChatMessage = {
  role: "assistant",
  content: "Hi! I'm **ReguFlow AI Copilot** 🎯\n\nI can help you with:\n- Summarizing regulatory circulars\n- Analyzing document changes\n- Impact assessment across departments\n- Drafting compliance documents\n\nWhat would you like to explore today?",
};

export default function AIExplanation() {
  const isBeginner = useIsBeginner();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sessions state
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(() =>
    localStorage.getItem(ACTIVE_KEY)
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Current chat state
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [copiedMsgIdx, setCopiedMsgIdx] = useState<number | null>(null);

  // Document Drafting State
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [selectedComp, setSelectedComp] = useState("");
  const [docType, setDocType] = useState("sop");
  const [drafting, setDrafting] = useState(false);
  const [draftResult, setDraftResult] = useState<string | null>(null);

  // Active session messages
  const activeSession = useMemo(
    () => sessions.find((s) => s.id === activeSessionId) || null,
    [sessions, activeSessionId]
  );
  const messages = activeSession?.messages ?? [INITIAL_MESSAGE];
  const sessionId = activeSession?.sessionId;

  // Persist sessions to localStorage whenever they change
  useEffect(() => {
    saveSessions(sessions);
  }, [sessions]);

  // Persist active session id
  useEffect(() => {
    if (activeSessionId) {
      localStorage.setItem(ACTIVE_KEY, activeSessionId);
    } else {
      localStorage.removeItem(ACTIVE_KEY);
    }
  }, [activeSessionId]);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  // Load comparisons
  useEffect(() => {
    api.listComparisons()
      .then((res) => {
        setComparisons(res || []);
        if (res?.length > 0) setSelectedComp(res[0].comparisonId);
      })
      .catch(() => {});
  }, []);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const createNewSession = useCallback((): ChatSession => {
    const id = `session_${Date.now()}`;
    const session: ChatSession = {
      id,
      title: "New Conversation",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return session;
  }, []);

  const handleNewChat = () => {
    const session = createNewSession();
    setSessions((prev) => [session, ...prev]);
    setActiveSessionId(session.id);
    setInput("");
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.focus();
    }
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    setInput("");
  };

  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      const remaining = sessions.filter((s) => s.id !== id);
      setActiveSessionId(remaining[0]?.id || null);
    }
  };

  const send = async (content: string) => {
    if (!content.trim() || thinking) return;
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";

    // Create a session if none active
    let currentSessionId = activeSessionId;
    let currentSession = activeSession;

    if (!currentSession) {
      const newSession = createNewSession();
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      currentSessionId = newSession.id;
      currentSession = newSession;
    }

    const userMsg: ChatMessage = { role: "user", content };
    const isFirst = currentSession.messages.length === 0;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === currentSessionId
          ? {
              ...s,
              messages: [...s.messages, userMsg],
              title: isFirst ? generateTitle(content) : s.title,
              updatedAt: new Date().toISOString(),
            }
          : s
      )
    );

    setThinking(true);
    try {
      const res = await api.copilot(content, currentSession.sessionId);
      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: res.answer,
        citations: (res.citations ?? []).map((c: any) => ({
          regulation: c.document,
          clause: c.clauseId,
          text: c.text,
          confidence: Math.round((c.similarity ?? 0) * 100),
        })),
      };
      setSessions((prev) =>
        prev.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                messages: [...s.messages, assistantMsg],
                sessionId: res.sessionId || s.sessionId,
                updatedAt: new Date().toISOString(),
              }
            : s
        )
      );
    } catch (e: any) {
      toast({ title: "Copilot error", description: e.message, variant: "destructive" });
    } finally {
      setThinking(false);
    }
  };

  const handleCopy = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedMsgIdx(idx);
    setTimeout(() => setCopiedMsgIdx(null), 2000);
  };

  const handleGenerateDraft = async () => {
    if (!selectedComp) {
      toast({ title: "Drafting Error", description: "Select a circular comparison.", variant: "destructive" });
      return;
    }
    setDrafting(true);
    try {
      const res = await api.generateComplianceDocument(docType, selectedComp);
      setDraftResult(res.draft);
      toast({ title: "Document Draft Generated", description: `Compiled AI draft for compliance ${docType.toUpperCase()}.` });
    } catch (err: any) {
      toast({ title: "Drafting Failed", description: err.message, variant: "destructive" });
    } finally {
      setDrafting(false);
    }
  };

  // Format message content (bold, code, newlines)
  const formatContent = (content: string) => {
    return content
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/`(.*?)`/g, "<code class=\"bg-muted px-1 rounded text-primary font-mono text-[10px]\">$1</code>")
      .replace(/\n/g, "<br/>");
  };

  const groupedSessions = useMemo(() => {
    const today: ChatSession[] = [];
    const yesterday: ChatSession[] = [];
    const older: ChatSession[] = [];
    const now = new Date();
    sessions.forEach((s) => {
      const d = new Date(s.updatedAt);
      const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
      if (diff === 0) today.push(s);
      else if (diff === 1) yesterday.push(s);
      else older.push(s);
    });
    return { today, yesterday, older };
  }, [sessions]);

  return (
    <div className="h-[calc(100vh-7.5rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-muted transition-colors"
          >
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </button>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">AI Compliance Copilot</h1>
            <p className="text-xs text-muted-foreground">Chat-driven regulatory guidance with citation references</p>
          </div>
        </div>
        <button
          onClick={handleNewChat}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-colors uppercase tracking-wider"
        >
          <Plus className="h-3.5 w-3.5" /> New Chat
        </button>
      </div>

      {isBeginner && (
        <BeginnerHint>
          Ask questions about your compliance posture, SOP obligations, or circulars. ACRIS Copilot references specific document nodes.
        </BeginnerHint>
      )}

      {/* Main layout */}
      <div className="flex flex-1 gap-3 min-h-0 mt-3">

        {/* Session History Sidebar */}
        {sidebarOpen && (
          <div className="w-60 flex-shrink-0 glass-card bg-card flex flex-col overflow-hidden">
            <div className="p-3 border-b border-border flex-shrink-0">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-2">
                <Clock className="h-3 w-3" /> Chat History
              </div>
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-opacity uppercase tracking-wider shadow-sm h-8"
              >
                <Plus className="h-3.5 w-3.5" /> New Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {sessions.length === 0 ? (
                <div className="p-4 text-xs text-muted-foreground text-center italic">
                  No conversations yet. Start chatting!
                </div>
              ) : (
                <div className="p-2 space-y-3">
                  {groupedSessions.today.length > 0 && (
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">Today</div>
                      {groupedSessions.today.map((s) => (
                        <SessionItem
                          key={s.id}
                          session={s}
                          active={s.id === activeSessionId}
                          onSelect={handleSelectSession}
                          onDelete={handleDeleteSession}
                        />
                      ))}
                    </div>
                  )}
                  {groupedSessions.yesterday.length > 0 && (
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">Yesterday</div>
                      {groupedSessions.yesterday.map((s) => (
                        <SessionItem
                          key={s.id}
                          session={s}
                          active={s.id === activeSessionId}
                          onSelect={handleSelectSession}
                          onDelete={handleDeleteSession}
                        />
                      ))}
                    </div>
                  )}
                  {groupedSessions.older.length > 0 && (
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground px-2 mb-1">Older</div>
                      {groupedSessions.older.map((s) => (
                        <SessionItem
                          key={s.id}
                          session={s}
                          active={s.id === activeSessionId}
                          onSelect={handleSelectSession}
                          onDelete={handleDeleteSession}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 glass-card bg-card flex flex-col min-h-0 overflow-hidden">
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Empty state for new chat */}
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-1">How can I help you?</h2>
                  <p className="text-xs text-muted-foreground max-w-xs">Ask about regulations, compliance posture, or let me draft documents for you.</p>
                </div>
                <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
                  {QUICK.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => send(q.label)}
                      className="flex items-center gap-2 text-left px-4 py-3 rounded-xl border border-border bg-muted/30 hover:bg-muted hover:border-primary/30 transition-all text-xs font-semibold text-foreground"
                    >
                      <span className="text-base">{q.icon}</span>
                      <span>{q.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Initial greeting for sessions with no messages */}
            {messages.length > 0 && messages[0].role === "assistant" && !activeSession && (
              <MessageBubble
                msg={messages[0]}
                idx={0}
                copiedMsgIdx={copiedMsgIdx}
                onCopy={handleCopy}
                formatContent={formatContent}
              />
            )}

            {/* Actual session messages */}
            {activeSession && messages.map((m, i) => (
              <MessageBubble
                key={i}
                msg={m}
                idx={i}
                copiedMsgIdx={copiedMsgIdx}
                onCopy={handleCopy}
                formatContent={formatContent}
              />
            ))}

            {/* Thinking indicator */}
            {thinking && (
              <div className="flex gap-3 items-start">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 border border-border px-4 py-3 rounded-2xl rounded-tl-sm">
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </span>
                  <span className="font-semibold italic">Analyzing...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick suggestions when session has messages */}
          {messages.length > 0 && activeSession && (
            <div className="px-5 pb-2 flex flex-wrap gap-1.5">
              {QUICK.slice(0, 3).map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q.label)}
                  className="text-[11px] font-semibold border border-border rounded-full px-3 py-1 hover:bg-muted bg-card transition-colors text-muted-foreground hover:text-foreground"
                >
                  {q.label}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-border p-4 bg-card flex-shrink-0">
            <div className="flex items-end gap-2 bg-muted/40 border border-border rounded-2xl px-4 py-3 focus-within:border-primary/50 focus-within:bg-muted/60 transition-all">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={handleInputChange}
                placeholder="Ask ReguFlow AI anything about your compliance..."
                className="flex-1 bg-transparent text-xs text-foreground resize-none focus:outline-none font-medium placeholder:text-muted-foreground leading-relaxed"
                style={{ maxHeight: 120 }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
              />
              <button
                onClick={() => send(input)}
                disabled={!input.trim() || thinking}
                className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-xl bg-primary text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                {thinking ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1.5 text-center font-medium">
              Press <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[9px]">Enter</kbd> to send · <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[9px]">Shift+Enter</kbd> for new line
            </p>
          </div>
        </div>

        {/* Right sidebar: Document Drafting */}
        <div className="w-64 flex-shrink-0 glass-card bg-card p-4 flex flex-col gap-4 overflow-auto">
          <div>
            <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-foreground mb-3 pb-2 border-b border-border">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>AI Document Drafting</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
              Generate policy or SOP drafts from comparison outputs.
            </p>
            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground block mb-1">Target Comparison</label>
                <select
                  value={selectedComp}
                  onChange={(e) => setSelectedComp(e.target.value)}
                  className="premium-select text-xs h-8 py-1 focus:outline-none w-full"
                >
                  <option value="">Select comparison…</option>
                  {comparisons.map((c) => (
                    <option key={c.comparisonId} value={c.comparisonId}>
                      {c.newDocumentTitle?.substring(0, 14)}... vs {c.oldDocumentTitle?.substring(0, 14)}...
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[9px] font-mono font-bold uppercase tracking-wider text-muted-foreground block mb-1">Document Format</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="premium-select text-xs h-8 py-1 focus:outline-none w-full"
                >
                  <option value="sop">SOP Amendment</option>
                  <option value="policy">Board Policy Draft</option>
                  <option value="circular">Internal Circular</option>
                  <option value="checklist">Audit Checklist</option>
                </select>
              </div>
              <button
                onClick={handleGenerateDraft}
                disabled={drafting || !selectedComp}
                className="w-full bg-primary text-primary-foreground h-9 font-bold rounded-lg text-xs hover:opacity-90 disabled:opacity-60 transition-opacity flex items-center justify-center gap-1.5 uppercase tracking-wider"
              >
                {drafting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                <span>Generate Draft</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Draft Output Modal */}
      {draftResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card border border-border text-foreground rounded-xl shadow-xl w-full max-w-2xl p-5 flex flex-col h-[75vh]">
            <div className="flex items-center justify-between mb-3 border-b border-border pb-3">
              <div className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-primary animate-pulse" />
                <span>Compiled Compliance Draft ({docType.toUpperCase()})</span>
              </div>
              <button onClick={() => setDraftResult(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-muted/20 p-4 rounded-lg border border-border font-mono text-xs whitespace-pre-wrap leading-relaxed select-all">
              {draftResult}
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-border">
              <button onClick={() => setDraftResult(null)} className="px-4 h-9 text-xs border border-border bg-card rounded-lg hover:bg-muted font-bold text-foreground uppercase tracking-wider">Close</button>
              <button
                onClick={() => {
                  const blob = new Blob([draftResult], { type: "text/plain;charset=utf-8" });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement("a");
                  link.href = url; link.download = `${docType.toUpperCase()}-Draft.txt`;
                  document.body.appendChild(link); link.click();
                  document.body.removeChild(link); URL.revokeObjectURL(url);
                }}
                className="px-4 h-9 text-xs border border-border bg-card rounded-lg hover:bg-muted font-bold text-foreground uppercase tracking-wider"
              >Download</button>
              <button
                onClick={() => { navigator.clipboard.writeText(draftResult); toast({ title: "Copied!" }); }}
                className="px-4 h-9 text-xs bg-primary text-primary-foreground font-extrabold rounded-lg hover:opacity-90 uppercase tracking-wider"
              >Copy Draft</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Session item in sidebar ──────────────────────────────
function SessionItem({
  session, active, onSelect, onDelete
}: {
  session: ChatSession;
  active: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={() => onSelect(session.id)}
      className={`group w-full text-left px-2 py-2 rounded-lg text-xs transition-all flex items-start gap-2 ${
        active
          ? "bg-primary/10 text-primary font-bold border border-primary/20"
          : "hover:bg-muted text-foreground font-medium"
      }`}
    >
      <MessageSquare className={`h-3 w-3 mt-0.5 flex-shrink-0 ${active ? "text-primary" : "text-muted-foreground"}`} />
      <div className="flex-1 min-w-0">
        <div className="truncate font-semibold">{session.title}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          {formatTime(session.updatedAt)} · {session.messages.length} msgs
        </div>
      </div>
      <button
        onClick={(e) => onDelete(session.id, e)}
        className="opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center rounded hover:bg-destructive/10 hover:text-destructive transition-all flex-shrink-0"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </button>
  );
}

// ── Message bubble ───────────────────────────────────────
function MessageBubble({
  msg, idx, copiedMsgIdx, onCopy, formatContent
}: {
  msg: ChatMessage;
  idx: number;
  copiedMsgIdx: number | null;
  onCopy: (text: string, idx: number) => void;
  formatContent: (s: string) => string;
}) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 items-start group ${isUser ? "justify-end" : ""}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-sm">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
      )}
      <div className={`max-w-[80%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
        <div
          className={`text-xs leading-relaxed relative ${
            isUser
              ? "bg-primary text-primary-foreground font-semibold rounded-2xl rounded-tr-sm px-4 py-3 shadow-sm shadow-primary/20"
              : "text-foreground bg-muted/30 border border-border px-4 py-3 rounded-2xl rounded-tl-sm"
          }`}
          dangerouslySetInnerHTML={{ __html: formatContent(msg.content) }}
        />

        {!isUser && (
          <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onCopy(msg.content, idx)}
              className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground px-2 py-0.5 rounded hover:bg-muted transition-colors"
            >
              {copiedMsgIdx === idx ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              {copiedMsgIdx === idx ? "Copied!" : "Copy"}
            </button>
          </div>
        )}

        {msg.citations && msg.citations.length > 0 && (
          <div className="mt-2 w-full">
            <details className="text-[11px] border border-border rounded-xl bg-card overflow-hidden">
              <summary className="cursor-pointer font-bold px-3 py-2 select-none hover:bg-muted text-muted-foreground flex items-center gap-1.5">
                <BookOpenCheck className="h-3.5 w-3.5 text-primary" />
                <span>{msg.citations.length} source citation{msg.citations.length > 1 ? "s" : ""}</span>
              </summary>
              <div className="p-3 border-t border-border space-y-2.5 bg-muted/10">
                {msg.citations.map((c, j) => (
                  <div key={j} className="space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="font-mono text-primary text-[10px]">{c.regulation} · {c.clause}</span>
                      <span className="text-[9px] text-muted-foreground">{c.confidence}% match</span>
                    </div>
                    {c.text && (
                      <p className="text-[11px] text-muted-foreground italic pl-2 border-l-2 border-primary/30 py-0.5">
                        "{c.text}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </details>
          </div>
        )}
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-muted border border-border flex items-center justify-center flex-shrink-0 text-xs font-bold text-foreground">
          You
        </div>
      )}
    </div>
  );
}
