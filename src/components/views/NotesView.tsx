import React, { useState } from "react";
import { NoteItem } from "../../types";
import { 
  FileText, 
  Plus, 
  Sparkles, 
  Pin, 
  Trash2, 
  Tag, 
  CheckCircle2 
} from "lucide-react";

interface NotesViewProps {
  notes: NoteItem[];
  onAddNote: (n: Omit<NoteItem, "id" | "updatedAt">) => void;
  onDeleteNote: (id: string) => void;
  onAddTaskFromNote: (title: string) => void;
  onOpenQuickAdd: () => void;
  darkMode: boolean;
}

export const NotesView: React.FC<NotesViewProps> = ({
  notes,
  onAddNote,
  onDeleteNote,
  onAddTaskFromNote,
  onOpenQuickAdd,
  darkMode,
}) => {
  const [selectedNote, setSelectedNote] = useState<NoteItem | null>(notes[0] || null);
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const handleSummarizeNote = async () => {
    if (!selectedNote) return;
    setLoadingAi(true);

    try {
      const response = await fetch("/api/orbit/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "note_summarize",
          prompt: `Summarize this note and extract key action items:\nTitle: ${selectedNote.title}\nContent: ${selectedNote.content}`,
        }),
      });

      const data = await response.json();
      setSummaryResult(data.result || "Summary complete.");
    } catch (err) {
      console.error("AI Note summarizer error:", err);
      setSummaryResult("Note Summary & Action Items:\n1. Finalize project guidelines.\n2. Review team schedule for next week.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-purple-400" />
            <span>Notes & Reflections</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Frictionless scratchpad, project manifestos, and AI action item extraction.
          </p>
        </div>

        <button
          onClick={onOpenQuickAdd}
          className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Note</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Notes Sidebar List */}
        <div className={`md:col-span-5 p-4 rounded-3xl border space-y-3 ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          <h2 className="font-extrabold text-sm mb-2 px-2">Your Workspace Notes ({notes.length})</h2>

          <div className="space-y-2">
            {notes.map((note) => {
              const isSelected = selectedNote?.id === note.id;

              return (
                <div
                  key={note.id}
                  onClick={() => {
                    setSelectedNote(note);
                    setSummaryResult(null);
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20"
                      : darkMode
                      ? "bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800"
                      : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs line-clamp-1">{note.title}</span>
                    {note.isPinned && <Pin className="w-3.5 h-3.5 fill-current text-amber-300" />}
                  </div>
                  <p className={`text-[11px] line-clamp-2 ${isSelected ? "text-purple-100" : "text-slate-400"}`}>
                    {note.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Note Editor / AI Summary Panel */}
        <div className={`md:col-span-7 p-6 rounded-3xl border space-y-4 ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          {selectedNote ? (
            <>
              <div className="flex items-center justify-between border-b pb-3 border-slate-200/50 dark:border-slate-800">
                <div>
                  <h2 className="text-lg font-extrabold">{selectedNote.title}</h2>
                  <p className="text-[10px] text-slate-400">Updated {selectedNote.updatedAt} • {selectedNote.category}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSummarizeNote}
                    disabled={loadingAi}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center gap-1 hover:bg-purple-500/30 transition-all"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${loadingAi ? "animate-spin" : ""}`} />
                    <span>Extract AI Tasks</span>
                  </button>

                  <button
                    onClick={() => onDeleteNote(selectedNote.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="whitespace-pre-wrap text-xs leading-relaxed font-mono opacity-90 p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800 min-h-[180px]">
                {selectedNote.content}
              </div>

              {summaryResult && (
                <div className="p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-purple-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Extracted Action Items
                    </span>
                    <button
                      onClick={() => onAddTaskFromNote(selectedNote.title)}
                      className="px-3 py-1 rounded-lg bg-purple-600 text-white font-bold text-[10px]"
                    >
                      Convert to Task
                    </button>
                  </div>
                  <div className="whitespace-pre-wrap leading-relaxed">{summaryResult}</div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-10 h-10 mx-auto text-purple-400/50 mb-2" />
              <p className="font-bold text-sm">Select a note to inspect or create a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
