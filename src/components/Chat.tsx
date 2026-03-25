// ============================================================
// Ham Radio Clicker — Chat Box (WebSocket ephemeral chat)
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface ChatMessage {
  id: number;
  callsign: string;
  message: string;
  timestamp: string;
}

interface ChatProps {
  callsign: string;
  isMobile?: boolean;
  externalOpen?: boolean;
  onExternalToggle?: (open: boolean) => void;
}

let msgIdCounter = 0;

function formatTime(isoStr: string): string {
  try {
    const d = new Date(isoStr);
    const hh = d.getHours().toString().padStart(2, '0');
    const mm = d.getMinutes().toString().padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return '??:??';
  }
}

const Chat: React.FC<ChatProps> = ({ callsign, isMobile = false, externalOpen, onExternalToggle }) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = (val: boolean) => {
    if (onExternalToggle) onExternalToggle(val);
    else setInternalOpen(val);
  };
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [unread, setUnread] = useState(0);
  const [connected, setConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const openRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Track open state in ref for WS callback access
  useEffect(() => {
    openRef.current = open;
    if (open) {
      setUnread(0);
    }
  }, [open]);

  // Auto-scroll when new messages arrive while open
  useEffect(() => {
    if (open) {
      scrollToBottom();
    }
  }, [messages, open, scrollToBottom]);

  // WebSocket connection
  const connectWs = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.CONNECTING || wsRef.current.readyState === WebSocket.OPEN)) {
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      // Register callsign
      ws.send(JSON.stringify({ type: 'join', callsign }));
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'chat') {
          const msg: ChatMessage = {
            id: ++msgIdCounter,
            callsign: data.callsign,
            message: data.message,
            timestamp: data.timestamp,
          };
          setMessages((prev) => [...prev.slice(-199), msg]);
          // Increment unread if chat is closed
          if (!openRef.current) {
            setUnread((prev) => prev + 1);
          }
        } else if (data.type === 'online') {
          setOnlineUsers(data.users || []);
        }
      } catch {
        // Ignore malformed messages
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
      // Auto-reconnect after 3 seconds
      reconnectTimerRef.current = setTimeout(() => {
        connectWs();
      }, 3000);
    };

    ws.onerror = () => {
      // onclose will fire after onerror, triggering reconnect
    };
  }, [callsign]);

  // Connect on mount, cleanup on unmount
  useEffect(() => {
    connectWs();

    // Ping every 5 seconds for online user list
    pingTimerRef.current = setInterval(() => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping' }));
      }
    }, 5000);

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (pingTimerRef.current) clearInterval(pingTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on intentional close
        wsRef.current.close();
      }
    };
  }, [connectWs]);

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    wsRef.current.send(JSON.stringify({
      type: 'chat',
      callsign,
      message: trimmed,
    }));
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Collapsed — if externally controlled, render nothing (header button handles toggle)
  if (!open) {
    if (externalOpen !== undefined) return null;
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
        <span style={{ fontSize: 8, color: '#665533', letterSpacing: 1 }}>TEMP — LOST ON RELOAD</span>
        <button style={styles.chatCloseBtn} onClick={() => setOpen(false)}>X</button>
      </div>

      {/* Online users */}
      <div style={styles.onlineBar}>
        <span style={styles.onlineIndicator}>{connected ? '\u25CF' : '\u25CB'}</span>
        {' '}
        ONLINE: {onlineUsers.length > 0 ? onlineUsers.join(', ') : 'none'}
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
                <span style={styles.timestamp}>[{formatTime(msg.timestamp)}]</span>{' '}
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
            opacity: !input.trim() || !connected ? 0.4 : 1,
          }}
          onClick={sendMessage}
          disabled={!input.trim() || !connected}
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

  // Online users bar
  onlineBar: {
    padding: '4px 10px',
    fontSize: '9px',
    color: '#33ff33',
    letterSpacing: '1px',
    borderBottom: '1px solid rgba(51, 255, 51, 0.1)',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textShadow: '0 0 4px rgba(51,255,51,0.3)',
  },
  onlineIndicator: {
    fontSize: '8px',
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
