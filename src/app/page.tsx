"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Send, 
  Plus, 
  LogOut, 
  User, 
  Paperclip, 
  Trash2, 
  Loader2, 
  Menu, 
  X,
  FileText,
  Image as ImageIcon
} from "lucide-react";

interface ChatSession {
  id: string;
  title: string;
}

interface Message {
  role: "user" | "ai";
  content: string;
  image?: string | null;
}

export default function ChatPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("new");
  const [history, setHistory] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Authenticate user on load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        setUser(data.user);
        
        // Fetch sessions
        const sessionsRes = await fetch("/api/sessions");
        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json();
          setSessions(sessionsData);
        }
      } catch (err) {
        router.push("/login");
      } finally {
        setPageLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  // Load chat history when activeSessionId changes
  useEffect(() => {
    if (activeSessionId === "new") {
      setHistory([]);
      return;
    }
    
    const loadHistory = async () => {
      try {
        const res = await fetch(`/api/history/${activeSessionId}`);
        if (res.ok) {
          const data = await res.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      }
    };
    loadHistory();
  }, [activeSessionId]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        router.push("/login");
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleSelectSession = (id: string) => {
    setActiveSessionId(id);
    // On mobile, close sidebar on selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/chat/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSessions(prev => prev.filter(s => s.id !== id));
        if (activeSessionId === id) {
          setActiveSessionId("new");
        }
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && !selectedFile) return;

    const currentMsg = inputMessage;
    const currentFile = selectedFile;
    
    // Optimistically add user message to list
    const tempUserMsg: Message = {
      role: "user",
      content: currentMsg,
      image: currentFile && currentFile.type.startsWith("image/") ? URL.createObjectURL(currentFile) : null
    };
    setHistory(prev => [...prev, tempUserMsg]);
    setInputMessage("");
    setSelectedFile(null);
    setLoading(true);

    const formData = new FormData();
    formData.append("session_id", activeSessionId);
    formData.append("message", currentMsg);
    if (currentFile) {
      formData.append("file", currentFile);
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to get AI response");
      }

      // Update active session ID if this was a new conversation
      if (activeSessionId === "new") {
        setActiveSessionId(data.session_id);
        // Add new session to sidebar list
        setSessions(prev => [{ id: data.session_id, title: data.title }, ...prev]);
      }

      // Add AI response
      setHistory(prev => [...prev, { role: "ai", content: data.response }]);
    } catch (err: any) {
      setHistory(prev => [...prev, { role: "ai", content: `Error: ${err.message || "Something went wrong"}` }]);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#0f0f13]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0f0f13] text-[#eef2f6]">
      {/* Sidebar backdrop for mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Component */}
      <motion.aside
        initial={{ x: -260 }}
        animate={{ x: sidebarOpen ? 0 : -260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={`fixed inset-y-0 left-0 z-30 flex w-[260px] flex-col border-r border-white/5 bg-[#181824] md:static md:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white">
              Z
            </div>
            <span className="font-semibold text-lg tracking-wide text-white">Zish AI</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1 text-gray-400 hover:bg-white/5 hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => handleSelectSession("new")}
            className={`flex w-full items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-medium transition-all hover:bg-white/5 ${activeSessionId === "new" ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300" : "text-gray-300"}`}
          >
            <Plus className="h-4 w-4" />
            New Chat
          </button>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <AnimatePresence>
            {sessions.map((session) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className={`group flex items-center justify-between rounded-xl px-3 py-3 text-sm cursor-pointer transition-all hover:bg-white/5 ${activeSessionId === session.id ? "bg-white/10 text-white font-medium" : "text-gray-400 hover:text-gray-200"}`}
              >
                <div className="flex items-center gap-3 truncate">
                  <MessageSquare className="h-4 w-4 flex-shrink-0 text-indigo-400" />
                  <span className="truncate">{session.title}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 rounded transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* User Profile Footer */}
        <div className="mt-auto border-t border-white/5 bg-[#14141e] p-3">
          {user && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20">
                  <User className="h-4 w-4" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-semibold text-white leading-tight truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="text-gray-400 hover:text-red-400 p-2 rounded-xl hover:bg-white/5 transition-all"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Header */}
        <header className="flex h-16 items-center border-b border-white/5 bg-[#181824]/60 backdrop-blur-md px-4 relative z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className={`mr-3 rounded-xl border border-white/5 p-2 text-gray-400 hover:bg-white/5 hover:text-white md:hidden ${sidebarOpen ? "hidden" : "block"}`}
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-md font-semibold text-white">
              {activeSessionId === "new" ? "New Chat" : (sessions.find(s => s.id === activeSessionId)?.title || "Chat")}
            </h1>
          </div>
        </header>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 space-y-6">
          {history.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-white">How can I help you today?</h2>
                <p className="max-w-md text-sm text-gray-400 leading-relaxed">
                  Start a conversation by typing a question or uploading a PDF, document, or image.
                </p>
              </motion.div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {history.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  key={idx}
                  className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role !== "user" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 flex-shrink-0">
                      Z
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[80%] gap-2`}>
                    <div 
                      className={`rounded-2xl px-4 py-3 text-sm shadow-md leading-relaxed whitespace-pre-wrap ${msg.role === "user" ? "bg-indigo-600 text-white rounded-br-none" : "bg-[#181824] border border-white/5 text-gray-200 rounded-bl-none"}`}
                    >
                      {msg.content}
                    </div>

                    {msg.image && (
                      <div className="overflow-hidden rounded-xl border border-white/5 max-w-sm mt-1">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={msg.image} alt="Uploaded attachment" className="object-cover max-h-48 w-full" />
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white flex-shrink-0">
                      U
                    </div>
                  )}
                </motion.div>
              ))}

              {loading && (
                <div className="flex gap-4 justify-start">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 flex-shrink-0">
                    Z
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-[#181824] border border-white/5 px-4 py-3 text-sm text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar Footer */}
        <footer className="p-4 border-t border-white/5 bg-[#0f0f13]">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSendMessage} className="space-y-3">
              {selectedFile && (
                <div className="flex items-center justify-between rounded-xl bg-[#181824] border border-white/5 px-3 py-2 text-xs">
                  <div className="flex items-center gap-2 text-gray-300">
                    {selectedFile.type.startsWith("image/") ? (
                      <ImageIcon className="h-4 w-4 text-indigo-400" />
                    ) : (
                      <FileText className="h-4 w-4 text-indigo-400" />
                    )}
                    <span className="truncate max-w-xs">{selectedFile.name}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-500 hover:text-red-400"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              <div className="relative flex items-center">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleFileChange}
                  accept=".pdf,image/*,text/*"
                />
                
                <button
                  type="button"
                  onClick={triggerFileSelect}
                  className="absolute left-3 p-2 text-gray-400 hover:text-indigo-400 rounded-lg hover:bg-white/5 transition-all"
                  title="Attach PDF, document or image"
                >
                  <Paperclip className="h-5 w-5" />
                </button>

                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Message Zish AI..."
                  className="w-full bg-[#181824] border border-white/5 rounded-2xl py-4 pl-12 pr-14 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-inner"
                />

                <button
                  type="submit"
                  disabled={(!inputMessage.trim() && !selectedFile) || loading}
                  className="absolute right-3 p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:bg-white/5 disabled:text-gray-600 transition-all shadow-md shadow-indigo-600/10"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
            <p className="text-center text-[10px] text-gray-600 mt-2">
              Zish AI can make mistakes. Verify important info.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
