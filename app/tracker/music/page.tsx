"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { 
  Music, Play, Pause, Search, Sparkles, Volume2, 
  VolumeX, Clock, SkipForward, SkipBack, Heart, Headphones 
} from "lucide-react";
import { loadTodayLog, type DailyLog } from "@/lib/health-tracker";

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  category: "nature" | "lofi" | "classical" | "bowls";
  description: string;
}

const SOUNDSCAPES_DB: Track[] = [
  { id: "s-1", title: "Morning Dew Serenade", artist: "Nature Ambient", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3", category: "nature", description: "Soft piano notes with gentle forest ambiance and birds." },
  { id: "s-2", title: "Mountain Stream Rain", artist: "Rainmaker", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", category: "nature", description: "Traditional bamboo flute overlayed with stream sounds." },
  { id: "s-3", title: "Uplifting Lo-Fi Cafe Beats", artist: "Lofi Cafe Beats", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3", category: "lofi", description: "Bright, cheerful lofi beats to keep you relaxed and smiling." },
  { id: "s-4", title: "Focus Deep Ambient Wave", artist: "Synth Dreamer", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", category: "lofi", description: "Perfect background synthesizer hum for focused tasks." },
  { id: "s-5", title: "Serene Indian Sitar Flow", artist: "Classical Fusion", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3", category: "classical", description: "Mellow sitar strings blended with ambient synth pads." },
  { id: "s-6", title: "Surbahar Evening Raga", artist: "Zen Strings", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", category: "classical", description: "Deep, slow surbahar plucks to ease clinical stress." },
  { id: "s-7", title: "Tibetan Bowl Resonance", artist: "Spiritual Chimes", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", category: "bowls", description: "Resonant bell and chime vibrations to target anxiety." },
  { id: "s-8", title: "Reiki Solar Plexus Bowls", artist: "Chakra Healing", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", category: "bowls", description: "Healing frequency bowl tones to clear mental clutter." },
];

export default function MusicPlayerPage() {
  const [log, setLog] = useState<DailyLog | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "nature" | "lofi" | "classical" | "bowls">("all");

  // Audio Playback states
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);

  // Sleep Timer states
  const [sleepTimerMinutes, setSleepTimerMinutes] = useState<number>(0);
  const [sleepTimeoutId, setSleepTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);

  useEffect(() => {
    setLog(loadTodayLog());
  }, []);

  // Sync actual HTML5 audio volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Audio End handlers
  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    // Auto-advance to next track in queue
    playNextTrack();
  };

  // Countdown timer countdown interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (secondsRemaining !== null && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
      }, 1000);
    } else if (secondsRemaining === 0) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
      setSecondsRemaining(null);
      setSleepTimerMinutes(0);
      alert("Sleep timer ended. Soundscape playback has been auto-paused.");
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [secondsRemaining]);

  // Set Sleep Timer
  const handleSetSleepTimer = (minutes: number) => {
    if (sleepTimeoutId) {
      clearTimeout(sleepTimeoutId);
      setSleepTimeoutId(null);
    }

    setSleepTimerMinutes(minutes);

    if (minutes === 0) {
      setSecondsRemaining(null);
      return;
    }

    setSecondsRemaining(minutes * 60);

    const timeout = setTimeout(() => {
      // Trigger handled by secondsRemaining === 0 interval
    }, minutes * 60 * 1000);

    setSleepTimeoutId(timeout);
  };

  // Filtered tracks list
  const filteredTracks = useMemo(() => {
    return SOUNDSCAPES_DB.filter((track) => {
      const matchCat = selectedCategory === "all" || track.category === selectedCategory;
      const matchSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          track.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          track.artist.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Recommends tracks based on today's logged mood
  const moodRecommendation = useMemo(() => {
    if (!log) return null;
    // Suggest categories based on mood
    if (log.mood === "stressed" || log.mood === "anxious") {
      return {
        label: `Anxiety Relievers (${log.mood.toUpperCase()})`,
        category: "bowls" as const,
        note: "Sound bowls and chimes can help soothe stress and lower heart rate."
      };
    }
    if (log.mood === "happy") {
      return {
        label: `Active Beats (${log.mood.toUpperCase()})`,
        category: "lofi" as const,
        note: "Uplifting lofi vibes to boost your mood and focus."
      };
    }
    return {
      label: `Calm Flows (${log.mood.toUpperCase()})`,
      category: "nature" as const,
      note: "Gentle nature ambient piano to support a peaceful state."
    };
  }, [log]);

  const recommendedTracks = useMemo(() => {
    if (!moodRecommendation) return [];
    return SOUNDSCAPES_DB.filter(t => t.category === moodRecommendation.category);
  }, [moodRecommendation]);

  const handlePlayTrack = (track: Track) => {
    if (!audioRef.current) return;

    if (currentTrack?.id === track.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(e => console.log("Audio play failed:", e));
        setIsPlaying(true);
      }
    } else {
      setCurrentTrack(track);
      setIsPlaying(false);
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.load();
          audioRef.current.play()
            .then(() => setIsPlaying(true))
            .catch(e => console.log("Audio play failed:", e));
        }
      }, 50);
    }
  };

  const playNextTrack = () => {
    const list = filteredTracks.length > 0 ? filteredTracks : SOUNDSCAPES_DB;
    const currentIndex = currentTrack ? list.findIndex(t => t.id === currentTrack.id) : -1;
    if (currentIndex !== -1 && currentIndex < list.length - 1) {
      handlePlayTrack(list[currentIndex + 1]);
    } else if (list.length > 0) {
      handlePlayTrack(list[0]);
    }
  };

  const playPrevTrack = () => {
    const list = filteredTracks.length > 0 ? filteredTracks : SOUNDSCAPES_DB;
    const currentIndex = currentTrack ? list.findIndex(t => t.id === currentTrack.id) : -1;
    if (currentIndex > 0) {
      handlePlayTrack(list[currentIndex - 1]);
    } else if (list.length > 0) {
      handlePlayTrack(list[list.length - 1]);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const minutes = Math.floor(secs / 60);
    const seconds = Math.floor(secs % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatCountdown = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      
      {/* Hidden HTML5 Audio Component */}
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={handleAudioEnded}
      />

      {/* Header */}
      <div>
        <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--purple-primary)" }}>
          <Headphones size={12} style={{ display: "inline", verticalAlign: "middle", marginRight: "4px" }} />
          Mind Relaxer Soundscapes
        </span>
        <h1 style={{ fontFamily: "var(--font-heading)", fontSize: "clamp(1.5rem, 3vw, 2rem)", fontWeight: 800, color: "var(--text-primary)", margin: "8px 0 4px", letterSpacing: "-0.02em" }}>
          Peaceful Audios & Chill Beats
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
          Reduce clinical anxiety, calm breathing intervals, and boost focus.
        </p>
      </div>

      {/* Mood Recommendations Alert banner */}
      {moodRecommendation && (
        <div style={{ background: "rgba(0,113,227,0.03)", border: "1px dashed rgba(0,113,227,0.2)", borderRadius: "16px", padding: "18px 20px" }} className="animate-fade-in">
          <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--purple-primary)", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={16} /> Recommended Soundscapes for Mood: {log?.mood.toUpperCase()}
          </h4>
          <p style={{ margin: "4px 0 10px 0", fontSize: "12px", color: "var(--text-secondary)" }}>
            {moodRecommendation.note}
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            {recommendedTracks.map(track => (
              <button
                key={track.id}
                onClick={() => handlePlayTrack(track)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "100px",
                  background: currentTrack?.id === track.id ? "var(--purple-primary)" : "var(--bg-card)",
                  color: currentTrack?.id === track.id ? "white" : "var(--text-secondary)",
                  border: "1px solid var(--border)",
                  fontSize: "11px",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                {currentTrack?.id === track.id && isPlaying ? <Pause size={10} /> : <Play size={10} />}
                {track.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Playlist Grid Column */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "28px" }} className="dashboard-bottom-grid">
        
        {/* Left Column: Database of tracks */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          
          {/* Controls Search & Filter Row */}
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
            {/* Search */}
            <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
              <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search ambient soundscapes..."
                style={{
                  width: "100%", padding: "8px 12px 8px 36px", borderRadius: "100px", border: "1px solid var(--border)",
                  background: "var(--bg-card)", fontSize: "13px", outline: "none", color: "var(--text-primary)"
                }}
              />
            </div>

            {/* Categories filters */}
            <div style={{ display: "flex", gap: "4px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: "100px", padding: "3px" }}>
              {(["all", "nature", "lofi", "classical", "bowls"] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: "6px 12px", borderRadius: "100px", border: "none", cursor: "pointer",
                    fontSize: "11px", fontWeight: 600, textTransform: "capitalize",
                    background: selectedCategory === cat ? "var(--purple-primary)" : "transparent",
                    color: selectedCategory === cat ? "white" : "var(--text-secondary)",
                    transition: "all 0.2s"
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tracks list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {filteredTracks.map(track => {
              const isCurrent = currentTrack?.id === track.id;
              return (
                <div
                  key={track.id}
                  onClick={() => handlePlayTrack(track)}
                  style={{
                    padding: "16px",
                    background: isCurrent ? "rgba(0,113,227,0.02)" : "var(--bg-card)",
                    border: `1.5px solid ${isCurrent ? "var(--purple-primary)" : "var(--border)"}`,
                    borderRadius: "16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                    boxShadow: isCurrent ? "var(--shadow-purple)" : "var(--shadow-card)"
                  }}
                  className="hover:scale-101"
                >
                  <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                    <div style={{
                      width: "36px", height: "36px", borderRadius: "10px",
                      background: "rgba(0,113,227,0.05)", display: "flex", alignItems: "center", justifyContent: "center",
                      color: "var(--purple-primary)"
                    }}>
                      <Music size={16} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{track.title}</h4>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>{track.artist} • {track.description}</p>
                    </div>
                  </div>
                  <div style={{
                    width: "32px", height: "32px", borderRadius: "50%",
                    background: isCurrent && isPlaying ? "var(--purple-primary)" : "rgba(0,113,227,0.06)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: isCurrent && isPlaying ? "white" : "var(--purple-primary)",
                    flexShrink: 0
                  }}>
                    {isCurrent && isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: "1px" }} />}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Premium Player Widget */}
        <div>
          <div
            className="apple-card"
            style={{
              padding: "28px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              position: "sticky",
              top: "84px",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>🎧 Now Relaxing</h3>
              <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>
                Adjust volume levels and set sleep timer to auto-pause.
              </p>
            </div>

            {currentTrack ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                
                {/* Visual waves and Title */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ minWidth: 0, flex: 1, paddingRight: "10px" }}>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--purple-primary)", textTransform: "uppercase" }}>{currentTrack.category} category</span>
                      <h4 style={{ margin: "2px 0 0", fontSize: "15px", fontWeight: 800, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{currentTrack.title}</h4>
                      <p style={{ margin: "2px 0 0", fontSize: "11px", color: "var(--text-secondary)" }}>{currentTrack.artist}</p>
                    </div>

                    {/* Wave visualizer */}
                    <div style={{ display: "flex", alignItems: "flex-end", gap: "2.5px", height: "20px", flexShrink: 0 }}>
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          style={{
                            width: "2.5px",
                            borderRadius: "1px",
                            background: "var(--purple-primary)",
                            animation: isPlaying ? `audio-wave 1.${i}s infinite ease-in-out` : "none",
                            height: isPlaying ? "100%" : "3px",
                            transformOrigin: "bottom",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-secondary)", minWidth: "24px" }}>{formatTime(currentTime)}</span>
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={(e) => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = Number(e.target.value);
                          setCurrentTime(Number(e.target.value));
                        }
                      }}
                      style={{ flex: 1, accentColor: "var(--purple-primary)", height: "4px", cursor: "pointer" }}
                    />
                    <span style={{ fontSize: "10px", color: "var(--text-secondary)", minWidth: "24px" }}>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Controls (Next, Prev, Play/Pause) */}
                <div style={{ display: "flex", justifySelf: "center", justifyContent: "center", gap: "20px", alignItems: "center" }}>
                  <button onClick={playPrevTrack} style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer" }}>
                    <SkipBack size={18} />
                  </button>
                  <button
                    onClick={() => handlePlayTrack(currentTrack)}
                    style={{
                      width: "44px", height: "44px", borderRadius: "50%", background: "var(--purple-primary)",
                      border: "none", color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                      cursor: "pointer", boxShadow: "0 4px 12px rgba(0,113,227,0.2)"
                    }}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: "2px" }} />}
                  </button>
                  <button onClick={playNextTrack} style={{ background: "none", border: "none", color: "var(--text-primary)", cursor: "pointer" }}>
                    <SkipForward size={18} />
                  </button>
                </div>

                {/* Volume bar */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                  <button onClick={() => setIsMuted(!isMuted)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                    {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={(e) => {
                      setVolume(Number(e.target.value));
                      setIsMuted(false);
                    }}
                    style={{ flex: 1, accentColor: "var(--purple-primary)", height: "4px", cursor: "pointer" }}
                  />
                  <span style={{ fontSize: "11px", fontWeight: 700, minWidth: "28px", color: "var(--text-secondary)" }}>
                    {Math.round(volume * 100)}%
                  </span>
                </div>

                {/* Sleep Timer dropdown controls */}
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Clock size={13} /> Sleep Timer
                    </span>
                    {secondsRemaining !== null && (
                      <span style={{ fontSize: "11px", color: "var(--severity-high)", fontWeight: 700 }}>
                        Auto-off in: {formatCountdown(secondsRemaining)}
                      </span>
                    )}
                  </div>
                  <select
                    value={sleepTimerMinutes}
                    onChange={(e) => handleSetSleepTimer(Number(e.target.value))}
                    style={{
                      width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--border)",
                      background: "var(--bg-surface)", fontSize: "12px", color: "var(--text-primary)", cursor: "pointer", outline: "none"
                    }}
                  >
                    <option value={0}>Disabled</option>
                    <option value={1}>1 Minute (Testing)</option>
                    <option value={5}>5 Minutes</option>
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>

              </div>
            ) : (
              <div style={{ padding: "40px 10px", textAlign: "center", color: "var(--text-secondary)" }}>
                <Music size={32} style={{ color: "var(--text-muted)", margin: "0 auto 12px" }} />
                <p style={{ margin: 0, fontSize: "13px" }}>No soundscape selected.</p>
                <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--text-muted)" }}>Select a relaxing track from the playlist to begin.</p>
              </div>
            )}

          </div>
        </div>

      </div>

      <style jsx global>{`
        @keyframes audio-wave {
          0%, 100% { transform: scaleY(0.2); }
          50% { transform: scaleY(1); }
        }
      `}</style>
    </div>
  );
}
