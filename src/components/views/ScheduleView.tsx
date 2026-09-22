import React, { useState } from "react";
import { ScheduleEvent, Category } from "../../types";
import { 
  CalendarDays, 
  Sparkles, 
  Plus, 
  Clock, 
  Zap, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Check,
  Archive,
  RotateCcw,
  RefreshCw,
  Video,
  MapPin,
  Users,
  ExternalLink,
  Globe,
  CheckCheck,
  Calendar,
  X,
  Sliders,
  AlertCircle,
  ShieldCheck,
  Link2
} from "lucide-react";

interface ScheduleViewProps {
  schedule: ScheduleEvent[];
  onAddScheduleEvent: (evt: Omit<ScheduleEvent, "id">) => void;
  onDeleteScheduleEvent: (id: string) => void;
  onUnarchiveScheduleEvent?: (id: string) => void;
  onAutoFillGaps: () => void;
  onTriggerToast?: (title: string, desc?: string, type?: "success" | "ai" | "streak" | "warning") => void;
  darkMode: boolean;
}

const MOCK_GCAL_EVENTS: Omit<ScheduleEvent, "id">[] = [
  {
    title: "Google Meet: Product Strategy & Q3 Roadmap",
    startTime: "09:00",
    endTime: "10:00",
    category: "Work",
    isFocusBlock: false,
    completed: false,
    date: new Date().toISOString().split("T")[0],
    isExternalCalendar: true,
    externalSource: "Google Calendar",
    meetUrl: "https://meet.google.com/orbit-roadmap-sync",
    location: "Google Meet Virtual Room",
    attendees: ["sarah.chen@google.com", "alex.v@company.org", "mark@hurdman.net"],
  },
  {
    title: "All-Hands Quarterly Executive Briefing",
    startTime: "11:00",
    endTime: "12:00",
    category: "Work",
    isFocusBlock: false,
    completed: false,
    date: new Date().toISOString().split("T")[0],
    isExternalCalendar: true,
    externalSource: "Google Calendar",
    meetUrl: "https://meet.google.com/all-hands-q3",
    location: "Main Auditorium & Google Meet",
    attendees: ["leadership@company.org", "all-staff@company.org"],
  },
  {
    title: "Cross-Team Engineering Architecture Sync",
    startTime: "14:30",
    endTime: "15:15",
    category: "Work",
    isFocusBlock: false,
    completed: false,
    date: new Date().toISOString().split("T")[0],
    isExternalCalendar: true,
    externalSource: "Google Calendar",
    meetUrl: "https://meet.google.com/eng-arch-sync",
    location: "Conference Room 4B",
    attendees: ["dev-lead@company.org", "infra-team@company.org"],
  },
  {
    title: "Dental Checkup & Teeth Cleaning",
    startTime: "16:30",
    endTime: "17:30",
    category: "Personal",
    isFocusBlock: false,
    completed: false,
    date: new Date().toISOString().split("T")[0],
    isExternalCalendar: true,
    externalSource: "Google Calendar",
    location: "Metro Dental Health Clinic, Suite 302",
    attendees: ["dr.smith@metrodental.com"],
  },
];

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedule,
  onAddScheduleEvent,
  onDeleteScheduleEvent,
  onUnarchiveScheduleEvent,
  onAutoFillGaps,
  onTriggerToast,
  darkMode,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [filterSource, setFilterSource] = useState<"all" | "orbit" | "gcal">("all");
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(() => {
    return localStorage.getItem("orbit_gcal_last_synced") || "Today at 08:30 AM";
  });
  const [connectedAccount, setConnectedAccount] = useState("mark@hurdman.net");

  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("14:00");
  const [endTime, setEndTime] = useState("15:00");
  const [category, setCategory] = useState<Category>("Work");
  const [isFocusBlock, setIsFocusBlock] = useState(true);

  // Filter schedule based on archived status and source filter
  const baseActiveSchedule = schedule.filter((evt) => (showArchived ? Boolean(evt.archived) : !evt.archived));
  
  const activeSchedule = baseActiveSchedule.filter((evt) => {
    if (filterSource === "gcal") return Boolean(evt.isExternalCalendar);
    if (filterSource === "orbit") return !evt.isExternalCalendar;
    return true;
  });

  const archivedCount = schedule.filter((evt) => evt.archived).length;
  const gcalCount = baseActiveSchedule.filter((evt) => evt.isExternalCalendar).length;
  const orbitCount = baseActiveSchedule.filter((evt) => !evt.isExternalCalendar).length;

  const hours = Array.from({ length: 15 }, (_, i) => {
    const h = i + 7;
    return `${h < 10 ? "0" + h : h}:00`;
  });

  const handleSyncGoogleCalendar = () => {
    setIsSyncing(true);
    setTimeout(() => {
      let importedCount = 0;
      
      // Import mock events if they don't already exist in schedule by title
      MOCK_GCAL_EVENTS.forEach((mockEvt) => {
        const exists = schedule.some(
          (existing) => existing.title === mockEvt.title && existing.startTime === mockEvt.startTime
        );
        if (!exists) {
          onAddScheduleEvent(mockEvt);
          importedCount++;
        }
      });

      const now = new Date();
      const timeStr = `Today at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      setLastSyncedTime(timeStr);
      localStorage.setItem("orbit_gcal_last_synced", timeStr);
      setIsSyncing(false);
      setShowSyncModal(false);

      if (importedCount > 0) {
        onTriggerToast?.(
          "Google Calendar Synced",
          `Successfully imported ${importedCount} external commitments from ${connectedAccount}.`,
          "success"
        );
      } else {
        onTriggerToast?.(
          "Calendar Already Up To Date",
          `All 4 Google Calendar commitments from ${connectedAccount} are synchronized.`,
          "ai"
        );
      }
    }, 1100);
  };

  const handleClearGCalEvents = () => {
    const gcalEvents = schedule.filter((evt) => evt.isExternalCalendar);
    gcalEvents.forEach((evt) => onDeleteScheduleEvent(evt.id));
    setShowSyncModal(false);
    onTriggerToast?.(
      "Google Calendar Commitments Cleared",
      "Removed imported external events from your local timeline schedule.",
      "warning"
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAddScheduleEvent({
      title: title.trim(),
      startTime,
      endTime,
      category,
      isFocusBlock,
      completed: false,
      date: new Date().toISOString().split("T")[0],
    });

    setTitle("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-500" />
            <span>Schedule & Time-Blocking</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic hour-by-hour calendar timeline with Google Calendar sync & AI gap filling.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sync Google Calendar Button */}
          <button
            onClick={handleSyncGoogleCalendar}
            disabled={isSyncing}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
            title="Import commitments from Google Calendar"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-200 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Sync Google Calendar"}</span>
            {gcalCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-md bg-white/20 text-[10px] font-mono">
                {gcalCount}
              </span>
            )}
          </button>

          {archivedCount > 0 && (
            <button
              onClick={() => setShowArchived((prev) => !prev)}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                showArchived
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                  : "bg-slate-200/60 dark:bg-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Archive className="w-4 h-4 text-amber-400" />
              <span>{showArchived ? "Active View" : `Archive (${archivedCount})`}</span>
            </button>
          )}

          <button
            onClick={onAutoFillGaps}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>AI Auto-Fill Gaps</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Google Calendar Sync Status Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all ${
        darkMode ? "bg-slate-900/80 border-slate-800" : "bg-blue-50/50 border-blue-200"
      }`}>
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 shrink-0">
            <Calendar className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-100 dark:text-zinc-100 flex items-center gap-1.5">
                Google Calendar Integration
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Account: <span className="font-mono text-blue-400">{connectedAccount}</span> • Last synced: {lastSyncedTime} ({gcalCount} events imported)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSyncModal(true)}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300 hover:text-white flex items-center gap-1.5 transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span>Sync Settings</span>
          </button>
          
          <button
            onClick={handleSyncGoogleCalendar}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
            <span>{isSyncing ? "Syncing..." : "Re-Sync Now"}</span>
          </button>
        </div>
      </div>

      {showArchived && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-amber-400" />
            <span>Showing auto-archived schedule events older than 30 days.</span>
          </div>
          <button
            onClick={() => setShowArchived(false)}
            className="text-[11px] font-bold underline hover:text-white"
          >
            Back to Active
          </button>
        </div>
      )}

      {/* Filter Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setFilterSource("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
            filterSource === "all"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white/5 hover:bg-white/10 text-slate-400"
          }`}
        >
          All Commitments ({baseActiveSchedule.length})
        </button>
        <button
          onClick={() => setFilterSource("orbit")}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
            filterSource === "orbit"
              ? "bg-indigo-600 text-white shadow-sm"
              : "bg-white/5 hover:bg-white/10 text-slate-400"
          }`}
        >
          Orbit Focus Blocks ({orbitCount})
        </button>
        <button
          onClick={() => setFilterSource("gcal")}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
            filterSource === "gcal"
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-white/5 hover:bg-white/10 text-slate-400"
          }`}
        >
          <Calendar className="w-3.5 h-3.5 text-blue-300" />
          <span>Google Calendar ({gcalCount})</span>
        </button>
      </div>

      {/* Timeline View Container */}
      <div className={`p-6 rounded-3xl border shadow-sm ${
        darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
      }`}>
        <div className="space-y-4">
          {hours.map((hour) => {
            const matchingEvents = activeSchedule.filter((evt) => evt.startTime.startsWith(hour.substring(0, 2)));

            return (
              <div key={hour} className="grid grid-cols-12 gap-4 items-center border-b border-slate-200/40 dark:border-slate-800/60 pb-3">
                {/* Time Label */}
                <div className="col-span-2 sm:col-span-1 text-xs font-mono font-bold text-slate-400">
                  {hour}
                </div>

                {/* Event Area */}
                <div className="col-span-10 sm:col-span-11 min-h-[44px] flex flex-col justify-center">
                  {matchingEvents.length > 0 ? (
                    <div className="space-y-2">
                      {matchingEvents.map((evt) => (
                        <div
                          key={evt.id}
                          className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                            evt.isExternalCalendar
                              ? "bg-blue-950/20 border-blue-500/40 shadow-sm"
                              : evt.isFocusBlock
                              ? "bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border-indigo-500/40"
                              : darkMode
                              ? "bg-slate-800/40 border-slate-800"
                              : "bg-slate-50 border-slate-200"
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            {evt.isExternalCalendar ? (
                              <div className="p-1.5 rounded-xl bg-blue-500/20 border border-blue-500/30 text-blue-400 shrink-0 mt-0.5">
                                <Calendar className="w-4 h-4 text-blue-400" />
                              </div>
                            ) : (
                              <Clock className="w-4 h-4 text-indigo-400 shrink-0 mt-1" />
                            )}
                            <div className="space-y-1">
                              <p className="text-xs font-bold flex flex-wrap items-center gap-2">
                                <span>{evt.title}</span>
                                {evt.isExternalCalendar && (
                                  <span className="text-[9px] font-bold font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Globe className="w-2.5 h-2.5 text-blue-400" /> Google Calendar
                                  </span>
                                )}
                                {evt.isFocusBlock && (
                                  <span className="text-[9px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.2 rounded">
                                    Focus Block
                                  </span>
                                )}
                              </p>

                              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 font-mono">
                                <span className="text-slate-300 font-semibold">{evt.startTime} - {evt.endTime}</span>
                                <span>• {evt.category}</span>
                                {evt.location && (
                                  <span className="flex items-center gap-1 text-slate-300">
                                    <MapPin className="w-3 h-3 text-indigo-400" />
                                    {evt.location}
                                  </span>
                                )}
                              </div>

                              {/* Attendees / Meet metadata */}
                              {evt.attendees && evt.attendees.length > 0 && (
                                <div className="flex items-center gap-1.5 pt-0.5 text-[10px] text-slate-400">
                                  <Users className="w-3 h-3 text-indigo-400 shrink-0" />
                                  <span className="truncate max-w-xs">{evt.attendees.join(", ")}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 self-end sm:self-auto">
                            {evt.meetUrl && (
                              <a
                                href={evt.meetUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all"
                              >
                                <Video className="w-3 h-3 text-white" />
                                <span>Join Meet</span>
                                <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                              </a>
                            )}

                            {evt.archived && onUnarchiveScheduleEvent && (
                              <button
                                onClick={() => onUnarchiveScheduleEvent(evt.id)}
                                className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1 transition-all"
                                title="Restore event to active schedule"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Restore</span>
                              </button>
                            )}
                            <button
                              onClick={() => onDeleteScheduleEvent(evt.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                              title="Delete event"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div 
                      onClick={() => {
                        setStartTime(hour);
                        setShowAddModal(true);
                      }}
                      className="w-full h-8 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-between px-3 text-[11px] text-slate-400 opacity-40 hover:opacity-100 hover:border-indigo-500/50 cursor-pointer transition-all"
                    >
                      <span>Available Focus Slot</span>
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Google Calendar Settings Modal */}
      {showSyncModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm">
          <div className={`w-full max-w-lg p-6 rounded-3xl border shadow-2xl space-y-5 ${
            darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-extrabold text-lg">Google Calendar Sync</h2>
                  <p className="text-xs text-slate-400">Configure external account integration & schedule sync parameters.</p>
                </div>
              </div>
              <button
                onClick={() => setShowSyncModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Connected Workspace Account:</span>
                <span className="font-mono text-blue-400 font-bold">{connectedAccount}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Sync Mode:</span>
                <span className="font-mono text-emerald-400 font-bold">Two-Way Live Simulation</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-semibold">Imported Commitments:</span>
                <span className="font-mono text-white font-bold">{gcalCount} events loaded</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300">Selected Calendars to Sync</span>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-semibold cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Work Calendar (Google Workspace)
                  </span>
                  <input type="checkbox" defaultChecked className="accent-blue-600 w-4 h-4" />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 text-xs font-semibold cursor-pointer">
                  <span className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Personal Commitments & Health
                  </span>
                  <input type="checkbox" defaultChecked className="accent-blue-600 w-4 h-4" />
                </label>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handleClearGCalEvents}
                disabled={gcalCount === 0}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all disabled:opacity-40"
              >
                Clear Imported Events
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setShowSyncModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Close
                </button>
                <button
                  onClick={handleSyncGoogleCalendar}
                  disabled={isSyncing}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md"
                >
                  {isSyncing ? "Syncing..." : "Sync Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className={`w-full max-w-md p-6 rounded-3xl border shadow-2xl ${
            darkMode ? "bg-slate-900 border-slate-800 text-slate-100" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <h2 className="font-extrabold text-lg mb-4">Schedule Time Block</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Block Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Work on Architecture..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="focusBlockToggle"
                  checked={isFocusBlock}
                  onChange={(e) => setIsFocusBlock(e.target.checked)}
                  className="w-4 h-4 rounded accent-indigo-600"
                />
                <label htmlFor="focusBlockToggle" className="text-xs font-semibold">
                  Designate as Deep Focus Block
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs"
                >
                  Save Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
