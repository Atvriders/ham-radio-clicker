// ============================================================
// Ham Radio Clicker — Chat Box
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ChatMessage {
  id: number;
  callsign: string;
  message: string;
  created_at: string;
}

interface ChatProps {
  callsign: string;
  isMobile?: boolean;
}

function formatTime(isoStr: string): string {
  try {
    // Server returns UTC datetime without Z — append Z for correct parsing
    const d = new Date(isoStr.endsWith('Z') ? isoStr : isoStr + 'Z');
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return '??:??';
  }
}

const Chat: React.FC<ChatProps> = ({ callsign, isMobile = false }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(0);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastSeenIdRef = useRef<number>(0);
  const wasOpenRef = useRef(false);
  const sessionStartRef = useRef<string>(new Date().toISOString());

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      // Only fetch messages since this window opened
      const res = await fetch(`/api/chat?since=${encodeURIComponent(sessionStartRef.current)}`);
      if (res.ok) {
        const data: ChatMessage[] = await res.json();
        setMessages(data);

        if (data.length > 0) {
          const latestId = data[data.length - 1].id;
          if (!wasOpenRef.current && latestId > lastSeenIdRef.current) {
            const newCount = data.filter((m) => m.id > lastSeenIdRef.current).length;
            setUnread(newCount);
          }
          if (wasOpenRef.current) {
            lastSeenIdRef.current = latestId;
            setUnread(0);
          }
        }
      }
    } catch {
      // Network error — keep existing
    }
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Track open state
  useEffect(() => {
    wasOpenRef.current = open;
    if (open && messages.length > 0) {
      lastSeenIdRef.current = messages[messages.length - 1].id;
      setUnread(0);
    }
  }, [open, messages]);

  // Auto-scroll when new messages arrive while open
  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open, scrollToBottom]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callsign, message: trimmed }),
      });
      if (res.ok) {
        setInput('');
        await fetchMessages();
      }
    } catch {
      // Network error
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Collapsed button
  if (!open) {
    return (
      <button
        style={{
          ...styles.chatButton,
          bottom: isMobile ? '64px' : '16px',
        }}
        onClick={() => setOpen(true)}
      >
        CHAT
        {unread > 0 && (
          <span style={styles.badge}>{unread > 99 ? '99+' : unread}</span>
        )}
      </button>
    );
  }

  // Expanded chat window
  return (
    <div
      style={{
        ...styles.chatWindow,
        bottom: isMobile ? '64px' : '16px',
      }}
    >
      {/* Header */}
      <div style={styles.chatHeader}>
        <span style={styles.chatTitle}>RADIO CHAT</span>
        <button style={styles.chatCloseBtn} onClick={() => setOpen(false)}>X</button>
      </div>

      {/* Messages */}
      <div style={styles.messageList}>
        {messages.length === 0 ? (
          <div style={styles.emptyChat}>No messages yet</div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.callsign === callsign;
            return (
              <div key={msg.id} style={styles.messageRow}>
                <span style={styles.timestamp}>[{formatTime(msg.created_at)}]</span>{' '}
                <span style={isOwn ? styles.ownCallsign : styles.otherCallsign}>
                  {msg.callsign}:
                </span>{' '}
                <span style={isOwn ? styles.ownMessage : styles.otherMessage}>
                  {msg.message}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={styles.inputRow}>
        <input
          style={styles.chatInput}
          type="text"
          maxLength={200}
          placeholder="Type message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          style={{
            ...styles.sendBtn,
            opacity: sending || !input.trim() ? 0.4 : 1,
          }}
          onClick={sendMessage}
          disabled={sending || !input.trim()}
        >
          TX
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  // Collapsed chat button
  chatButton: {
    position: 'fixed',
    right: '16px',
    zIndex: 4000,
    background: 'rgba(10, 14, 26, 0.95)',
    border: '1px solid rgba(51, 255, 51, 0.3)',
    color: '#33ff33',
    fontFamily: 'inherit',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '2px',
    padding: '6px 16px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 0 10px rgba(51,255,51,0.1)',
  },
  badge: {
    background: '#ff3333',
    color: '#fff',
    fontSize: '9px',
    fontWeight: 700,
    padding: '1px 5px',
    borderRadius: '8px',
    minWidth: '16px',
    textAlign: 'center',
    letterSpacing: '0',
  },

  // Expanded chat window
  chatWindow: {
    position: 'fixed',
    right: '16px',
    width: '300px',
    height: '400px',
    zIndex: 4000,
    background: 'rgba(10, 14, 26, 0.95)',
    border: '1px solid rgba(51, 255, 51, 0.3)',
    borderRadius: '4px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 0 20px rgba(51,255,51,0.1)',
    fontFamily: "'Courier New', 'Lucida Console', monospace",
  },
  chatHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 10px',
    borderBottom: '1px solid rgba(51, 255, 51, 0.2)',
    flexShrink: 0,
  },
  chatTitle: {
    color: '#33ff33',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '2px',
    textShadow: '0 0 6px rgba(51,255,51,0.4)',
  },
  chatCloseBtn: {
    background: 'none',
    border: '1px solid rgba(51, 255, 51, 0.3)',
    color: '#33ff33',
    fontSize: '10px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    padding: '2px 6px',
    letterSpacing: '1px',
  },

  // Messages area
  messageList: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  emptyChat: {
    color: '#556655',
    fontSize: '11px',
    textAlign: 'center',
    marginTop: '40px',
    letterSpacing: '1px',
  },
  messageRow: {
    fontSize: '11px',
    lineHeight: '1.4',
    wordBreak: 'break-word',
  },
  timestamp: {
    color: '#556655',
    fontSize: '10px',
  },
  ownCallsign: {
    color: '#ffaa00',
    fontWeight: 700,
  },
  otherCallsign: {
    color: '#33ff33',
    fontWeight: 700,
  },
  ownMessage: {
    color: '#ffaa00',
  },
  otherMessage: {
    color: '#33ff33',
  },

  // Input area
  inputRow: {
    display: 'flex',
    gap: '4px',
    padding: '8px 10px',
    borderTop: '1px solid rgba(51, 255, 51, 0.2)',
    flexShrink: 0,
  },
  chatInput: {
    flex: 1,
    background: 'rgba(10, 20, 10, 0.8)',
    border: '1px solid rgba(51, 255, 51, 0.3)',
    color: '#33ff33',
    fontFamily: "'Courier New', 'Lucida Console', monospace",
    fontSize: '11px',
    padding: '6px 8px',
    outline: 'none',
    borderRadius: '2px',
  },
  sendBtn: {
    background: 'none',
    border: '1px solid rgba(51, 255, 51, 0.3)',
    color: '#33ff33',
    fontFamily: 'inherit',
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '1px',
    padding: '4px 10px',
    cursor: 'pointer',
    borderRadius: '2px',
  },
};

export default Chat;
