"use client";
import "@livekit/components-styles";
import Link from "next/link";
import { useState } from "react";
import { LiveKitRoom, PreJoin, VideoConference, useParticipants, type LocalUserChoices } from "@livekit/components-react";
import { VideoPresets, type RoomOptions } from "livekit-client";
import { ArrowLeft, Users, Radio } from "lucide-react";

const MAX = 100;

// Tuned for large classes (40–100): simulcast + adaptive stream + dynacast mean each
// viewer only downloads the resolution of the tiles actually on screen.
const roomOptions = (c: LocalUserChoices): RoomOptions => ({
  adaptiveStream: true,
  dynacast: true,
  videoCaptureDefaults: { deviceId: c.videoDeviceId || undefined, resolution: VideoPresets.h540.resolution },
  audioCaptureDefaults: { deviceId: c.audioDeviceId || undefined },
  publishDefaults: { simulcast: true, videoSimulcastLayers: [VideoPresets.h180, VideoPresets.h360], screenShareEncoding: { maxBitrate: 2_500_000, maxFramerate: 15 } },
});

function HeadCount() {
  const n = useParticipants().length;
  return <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs"><Users className="h-3.5 w-3.5" />{n} / {MAX}</span>;
}

export function Classroom({ room, title, bootcamp, userName, isHost }: { room: string; title: string; bootcamp: string; userName: string; isHost: boolean }) {
  const [choices, setChoices] = useState<LocalUserChoices | null>(null);
  const [conn, setConn] = useState<{ token: string; url: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function join(values: LocalUserChoices) {
    setLoading(true); setError(null);
    const res = await fetch("/api/livekit-token", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ room }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error ?? "Could not join the class.");
    setChoices(values); setConn(data);
  }

  const header = (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-slate-950 px-4 text-white">
      <Link href={isHost ? "/admin/classes" : "/dashboard"} className="grid h-8 w-8 place-items-center rounded-lg hover:bg-white/10" aria-label="Back"><ArrowLeft className="h-4 w-4" /></Link>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold">{title}</div>
        <div className="truncate text-xs text-slate-400">{bootcamp}</div>
      </div>
      {conn && <span className="ml-2 flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400"><Radio className="h-3 w-3" />LIVE</span>}
      {isHost && <span className="rounded-full bg-brand-600/20 px-2 py-0.5 text-xs font-semibold text-brand-500">Host</span>}
    </header>
  );

  if (!conn || !choices)
    return (
      <div data-lk-theme="default" className="flex min-h-screen flex-col bg-slate-950">
        {header}
        <div className="grid flex-1 place-items-center p-4">
          <div className="w-full max-w-xl">
            <h1 className="mb-1 text-center text-2xl font-bold text-white">Ready to join?</h1>
            <p className="mb-6 text-center text-sm text-slate-400">Check your camera and microphone before entering the classroom.</p>
            <PreJoin defaults={{ username: userName, videoEnabled: true, audioEnabled: isHost }} onSubmit={join} onError={(e) => setError(/permission|NotAllowed/i.test(e.message) ? "Camera/microphone access was blocked. Allow it in your browser, or join with them turned off." : e.message)} joinLabel={loading ? "Joining…" : "Join class"} />
            {error && <p className="mt-4 rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-300">{error}</p>}
          </div>
        </div>
      </div>
    );

  return (
    <LiveKitRoom
      data-lk-theme="default"
      // inline styles: LiveKit's unlayered CSS outranks Tailwind v4's layered utilities
      style={{ height: "100dvh", display: "flex", flexDirection: "column", background: "#020617" }}
      serverUrl={conn.url}
      token={conn.token}
      connect
      video={choices.videoEnabled}
      audio={choices.audioEnabled}
      options={roomOptions(choices)}
      onDisconnected={() => { setConn(null); setChoices(null); }}
      onError={(e) => setError(e.message)}
    >
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 bg-slate-950 px-4 text-white">
        <div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold">{title}</div><div className="truncate text-xs text-slate-400">{bootcamp}</div></div>
        <span className="flex items-center gap-1 rounded-full bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400"><Radio className="h-3 w-3" />LIVE</span>
        <HeadCount />
      </header>
      {/* Prefab: paginated grid, focus layout for screen share, chat, and control bar (mic / camera / share screen / chat / leave) */}
      <div style={{ flex: 1, minHeight: 0 }}><VideoConference /></div>
    </LiveKitRoom>
  );
}
