"use client"

/*
  Requires a Supabase table. Run this SQL in your Supabase SQL editor:

  create table demos_chat (
    id          uuid         default gen_random_uuid() primary key,
    content     text         not null,
    user_color  text         not null,
    created_at  timestamptz  default now() not null
  );
  alter table demos_chat enable row level security;
  create policy "public_read"   on demos_chat for select using (true);
  create policy "public_insert" on demos_chat for insert with check (content <> '');
*/

import { useEffect, useMemo, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { MessageCircle, Send, X } from "lucide-react"

const CHAT_COLORS = [
  "#e63946", "#2a9d8f", "#457b9d", "#e9c46a", "#f4a261",
  "#6a4c93", "#1982c4", "#8ac926", "#ff595e", "#fb8500",
]

type ChatMsg = {
  id: string
  content: string
  user_color: string
  created_at: string
}

function formatTime(ts: string) {
  const d = new Date(ts)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  if (isToday) return time
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + time
}

export function DemosChatButton({ accent }: { accent: string }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const userColor = useRef("")
  const supabase = useMemo(() => createClient(), [])

  // Assign a persistent random colour per browser
  useEffect(() => {
    let c = localStorage.getItem("ranga-chat-color")
    if (!c) {
      c = CHAT_COLORS[Math.floor(Math.random() * CHAT_COLORS.length)]
      localStorage.setItem("ranga-chat-color", c)
    }
    userColor.current = c
  }, [])

  // Timestamp of the newest message we've seen — used to fetch only new rows on each poll
  const lastSeenRef = useRef(new Date(0).toISOString())

  // Initial load
  useEffect(() => {
    supabase
      .from("demos_chat")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(200)
      .then(({ data, error }) => {
        if (error) { setFailed(true); return }
        if (data && data.length > 0) {
          setMessages(data as ChatMsg[])
          lastSeenRef.current = (data as ChatMsg[])[data.length - 1].created_at
        }
      })
  }, [supabase])

  // Poll for new messages every 3 s (only while chat is open)
  useEffect(() => {
    if (!open) return
    const poll = () => {
      supabase
        .from("demos_chat")
        .select("*")
        .gt("created_at", lastSeenRef.current)
        .order("created_at", { ascending: true })
        .limit(50)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setMessages((prev) => [...prev, ...(data as ChatMsg[])])
            lastSeenRef.current = (data as ChatMsg[])[data.length - 1].created_at
          }
        })
    }
    const id = setInterval(poll, 3000)
    return () => clearInterval(id)
  }, [open, supabase])

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when panel opens
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80)
  }, [open])

  const send = async () => {
    const content = input.trim()
    if (!content || sending) return
    setSending(true)
    setInput("")
    const { error } = await supabase.from("demos_chat").insert({
      content,
      user_color: userColor.current || CHAT_COLORS[0],
    })
    if (error) setFailed(true)
    setSending(false)
  }

  return (
    <>
      {open && (
        <div
          className="fixed right-3 z-40 flex w-72 flex-col overflow-hidden rounded-2xl sm:w-80"
          style={{
            bottom: "72px",
            background: "rgba(255,255,255,0.96)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${accent}33`,
            boxShadow: "0 -4px 32px rgba(0,0,0,0.12)",
            maxHeight: "58vh",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-black/8 px-4 py-2.5">
            <span className="text-sm font-medium" style={{ color: "rgba(0,0,0,0.6)" }}>
              chat
            </span>
            <button
              onClick={() => setOpen(false)}
              className="text-black/30 hover:text-black/60"
              aria-label="Close chat"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto px-4 py-3"
            style={{ minHeight: 0 }}
          >
            {failed && (
              <p className="py-4 text-center text-xs text-black/30">
                chat unavailable — table not set up yet
              </p>
            )}
            {!failed && messages.length === 0 && (
              <p className="py-4 text-center text-xs text-black/30">
                no messages yet — say hi!
              </p>
            )}
            <div className="space-y-2">
              {messages.map((msg) => (
                <div key={msg.id}>
                  <p className="break-words text-sm" style={{ color: msg.user_color }}>
                    {msg.content}
                  </p>
                  <p className="mt-0.5 text-[10px]" style={{ color: "rgba(0,0,0,0.25)" }}>
                    {formatTime(msg.created_at)}
                  </p>
                </div>
              ))}
            </div>
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 border-t border-black/8 px-3 py-2">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() } }}
              placeholder="say something..."
              disabled={failed}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-black/25 disabled:opacity-40"
              style={{ color: "#0a0a0e" }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || sending || failed}
              className="shrink-0 transition-opacity disabled:opacity-30"
              style={{ color: accent }}
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle chat"
        className="fixed right-3 z-40 flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{
          bottom: "22px",
          background: open ? accent : "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          border: `1px solid ${open ? "transparent" : "rgba(0,0,0,0.08)"}`,
          color: open ? "#fff" : "rgba(0,0,0,0.5)",
        }}
      >
        <MessageCircle className="h-5 w-5" />
      </button>
    </>
  )
}
