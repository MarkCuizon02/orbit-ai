import React, { useEffect, useRef, useState } from "react";
import { NoteItem } from "../../types";
import { 
  FileText, 
  Plus, 
  Sparkles, 
  Pin, 
  Trash2, 
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
  onDeleteNote,
  onAddTaskFromNote,
  onOpenQuickAdd,
  darkMode,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(notes[0]?.id ?? null);
  const selectedNote = notes.find((note) => note.id === selectedNoteId) ?? notes[0] ?? null;

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
            {notes.length === 0 && (
              <p className="px-2 py-4 text-xs text-slate-400">No notes yet.</p>
            )}
            {notes.map((note) => {
              const isSelected = selectedNote?.id === note.id;

              return (
                <button
                  type="button"
                  key={note.id}
                  aria-pressed={isSelected}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/20"
                      : darkMode
                      ? "bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800"
                      : "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100"
                  }`}
                >
                  <span className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs line-clamp-1">{note.title.trim() || "Untitled note"}</span>
                    {note.isPinned && <Pin className="w-3.5 h-3.5 fill-current text-amber-300" />}
                  </span>
                  <span className={`text-[11px] line-clamp-2 ${isSelected ? "text-purple-100" : "text-slate-400"}`}>
                    {note.content.trim() || "Empty note"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note Editor / AI Summary Panel */}
        <div className={`md:col-span-7 p-6 rounded-3xl border space-y-4 ${
          darkMode ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        }`}>
          {selectedNote ? (
            <NoteDetails
              key={JSON.stringify([selectedNote.id, selectedNote.title, selectedNote.content, selectedNote.updatedAt])}
              note={selectedNote}
              onDeleteNote={onDeleteNote}
              onAddTaskFromNote={onAddTaskFromNote}
            />
          ) : (
            <div className="text-center py-12 text-slate-500">
              <FileText className="w-10 h-10 mx-auto text-purple-400/50 mb-2" />
              <p className="font-bold text-sm">No notes yet</p>
              <button onClick={onOpenQuickAdd} className="mt-3 inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-purple-600 text-white text-xs font-bold">
                <Plus className="w-4 h-4" /> New Note
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const NoteDetails: React.FC<{
  note: NoteItem;
  onDeleteNote: (id: string) => void;
  onAddTaskFromNote: (title: string) => void;
}> = ({ note, onDeleteNote, onAddTaskFromNote }) => {
  const [summaryResult, setSummaryResult] = useState<string | null>(null);
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [addedItems, setAddedItems] = useState<Set<string>>(new Set());
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const requestRef = useRef<AbortController | null>(null);
  const convertedItemsRef = useRef(new Set<string>());
  const hasContent = Boolean(note.content.trim());

  useEffect(() => () => requestRef.current?.abort(), []);

  const handleSummarizeNote = async () => {
    if (!hasContent || requestRef.current) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setLoadingAi(true);
    setAiError(null);
    setSummaryResult(null);
    setActionItems([]);

    try {
      const response = await fetch("/api/orbit/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          action: "note_summarize",
          prompt: `Summarize this note and extract only actions supported by its content. Return a plain paragraph under Summary: and a numbered list under Action Items:. If there are no actions, leave that list empty.\nTitle: ${note.title}\nContent: ${note.content}`,
        }),
      });
      if (!response.ok) throw new Error("Note extraction failed");
      const data = await response.json();
      if (data.success === false || typeof data.result !== "string" || !data.result.trim()) {
        throw new Error("Empty note extraction");
      }
      if (controller.signal.aborted) return;
      const result: string = data.result;
      const lines = result.trim().split("\n");
      const actionHeader = lines.findIndex((line) => /^(?:key\s+)?action items\s*:?\s*$/i.test(
        line.trim().replace(/^#{1,6}\s*/, "").replace(/\*\*/g, "")
      ));
      const candidates = actionHeader === -1 ? [] : lines.slice(actionHeader + 1);
      const extracted = candidates.flatMap((line) => {
        const match = line.trim().match(/^(?:\d+[.)]|[-*•])\s+(.+)$/);
        const title = match?.[1].replace(/\*\*/g, "").trim();
        return title ? [title] : [];
      });
      const uniqueItems = extracted.filter((title, index) =>
        extracted.findIndex((item) => item.toLowerCase() === title.toLowerCase()) === index
      );
      const summary = (actionHeader === -1 ? lines : lines.slice(0, actionHeader)).join("\n").trim();
      setSummaryResult(summary);
      setActionItems(uniqueItems);
    } catch {
      if (!controller.signal.aborted) setAiError("Could not extract actions. Try again.");
    } finally {
      if (!controller.signal.aborted) {
        requestRef.current = null;
        setLoadingAi(false);
      }
    }
  };

  const handleConvertAction = (title: string) => {
    const normalized = title.trim().toLowerCase();
    if (!normalized || convertedItemsRef.current.has(normalized)) return;
    onAddTaskFromNote(title.trim());
    convertedItemsRef.current.add(normalized);
    setAddedItems(new Set(convertedItemsRef.current));
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3 border-slate-200/50 dark:border-slate-800">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold break-words">{note.title.trim() || "Untitled note"}</h2>
          <p className="text-[10px] text-slate-400">Updated {note.updatedAt} • {note.category}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSummarizeNote}
            disabled={loadingAi || !hasContent}
            className="px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 font-bold text-xs flex items-center gap-1 hover:bg-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Sparkles className={`w-3.5 h-3.5 text-amber-300 ${loadingAi ? "animate-spin" : ""}`} />
            <span>{loadingAi ? "Extracting..." : "Extract AI Tasks"}</span>
          </button>
          <button aria-label="Delete note" onClick={() => onDeleteNote(note.id)} className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="whitespace-pre-wrap break-words text-xs leading-relaxed font-mono opacity-90 p-4 rounded-2xl bg-slate-100/50 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-800 min-h-[180px]">
        {hasContent ? note.content : "This note is empty."}
      </div>
      {aiError && <p role="alert" className="text-xs text-rose-400">{aiError}</p>}
      {summaryResult !== null && (
        <section aria-label="AI note extraction" aria-live="polite" className="pt-4 border-t border-purple-500/30 text-xs space-y-3">
          <h3 className="font-extrabold text-purple-300 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" /> Summary & Action Items
          </h3>
          {summaryResult && <div className="whitespace-pre-wrap break-words leading-relaxed">{summaryResult}</div>}
          {actionItems.length === 0 && <p className="text-slate-400">No action items found.</p>}
          <ul className="space-y-3">
            {actionItems.map((title) => {
              const added = addedItems.has(title.toLowerCase());
              return (
                <li key={title} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="min-w-0 break-words">{title}</span>
                  <button
                    onClick={() => handleConvertAction(title)}
                    disabled={added}
                    aria-label={`${added ? "Added task" : "Add task"}: ${title}`}
                    className="self-start shrink-0 px-3 py-1.5 rounded-lg bg-purple-600 text-white font-bold text-[10px] flex items-center gap-1 disabled:opacity-60"
                  >
                    {added ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                    {added ? "Added" : "Add Task"}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </>
  );
};
