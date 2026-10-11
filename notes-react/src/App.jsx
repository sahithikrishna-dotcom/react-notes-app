import { useState, useRef, useEffect } from "react";
import "./App.css";

const COLORS = [
  "#FFE3EC",
  "#FFF0C9",
  "#DDF5E5",
  "#E5E2FF",
  "#DDF2FF",
  "#FFE8D6",
];

function App() {
  const [notes, setNotes] = useState(() => {
    try {
      const saved = localStorage.getItem("notes");
      const parsed = saved ? JSON.parse(saved) : [];

      if (!Array.isArray(parsed)) return [];

      return parsed.map((note) => ({
        ...note,
        pinned: note.pinned || false,
        color: note.color || COLORS[0],
        createdAt: note.createdAt || new Date().toISOString(),
      }));
    } catch {
      return [];
    }
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("notes-dark-mode") === "true";
  });
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem("notes-dark-mode", String(darkMode));
  }, [darkMode]);

  function saveNote(e) {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("Please enter both title and note content.");
      return;
    }

    if (editId !== null) {
      setNotes((previous) =>
        previous.map((note) =>
          note.id === editId
            ? {
                ...note,
                title: title.trim(),
                content: content.trim(),
                color: selectedColor,
              }
            : note
        )
      );
      setEditId(null);
    } else {
      const newNote = {
        id: Date.now(),
        title: title.trim(),
        content: content.trim(),
        pinned: false,
        color: selectedColor,
        createdAt: new Date().toISOString(),
      };

      setNotes((previous) => [newNote, ...previous]);
    }

    setTitle("");
    setContent("");
    setSelectedColor(COLORS[0]);
    inputRef.current?.focus();
  }

  function startEdit(note) {
    setTitle(note.title);
    setContent(note.content);
    setSelectedColor(note.color || COLORS[0]);
    setEditId(note.id);
    inputRef.current?.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditId(null);
    setTitle("");
    setContent("");
    setSelectedColor(COLORS[0]);
  }

  function deleteNote(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (!confirmed) return;

    setNotes((previous) => previous.filter((note) => note.id !== id));

    if (editId === id) cancelEdit();
  }

  function togglePin(id) {
    setNotes((previous) =>
      previous.map((note) =>
        note.id === id ? { ...note, pinned: !note.pinned } : note
      )
    );
  }

  function exportNotes() {
    if (notes.length === 0) {
      alert("There are no notes to export.");
      return;
    }

    const text = [...notes]
      .sort((a, b) => Number(b.pinned) - Number(a.pinned))
      .map((note) => {
        const date = new Date(note.createdAt).toLocaleString();

        return [
          note.pinned ? "📌 PINNED NOTE" : "NOTE",
          `Title: ${note.title}`,
          `Created: ${date}`,
          "",
          note.content,
          "",
          "----------------------------------------",
          "",
        ].join("\n");
      })
      .join("\n");

    const blob = new Blob([text], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-notes.txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  const filteredNotes = notes
    .filter((note) =>
      `${note.title} ${note.content}`
        .toLowerCase()
        .includes(search.toLowerCase().trim())
    )
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  const pinnedCount = notes.filter((note) => note.pinned).length;

  return (
    <div className={`app ${darkMode ? "dark" : ""}`}>
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-icon">✿</span>
          <span>BlushNotes</span>
        </a>

        <button
          className="theme-button"
          type="button"
          onClick={() => setDarkMode((previous) => !previous)}
        >
          {darkMode ? "☀️ Light mode" : "🌙 Dark mode"}
        </button>
      </header>

      <main className="main-content" id="home">
        <section className="welcome">
          <span className="eyebrow">YOUR LITTLE CORNER OF CALM</span>
          <h1>Your thoughts, <span>beautifully</span> kept.</h1>
          <p>
            A cozy place for your ideas, reminders and little moments.
          </p>
        </section>

        <section className="stats">
          <div className="stat-card">
            <span className="stat-icon">📝</span>
            <div>
              <strong>{notes.length}</strong>
              <span>Total notes</span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">📌</span>
            <div>
              <strong>{pinnedCount}</strong>
              <span>Pinned notes</span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-icon">💗</span>
            <div>
              <strong>{notes.length - pinnedCount}</strong>
              <span>Other notes</span>
            </div>
          </div>
        </section>

        <section className="editor-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                {editId !== null ? "MAKE IT JUST RIGHT" : "A NEW THOUGHT"}
              </span>
              <h2>{editId !== null ? "Edit your note" : "Create a note"}</h2>
            </div>
            <span className="heading-emoji">
              {editId !== null ? "✏️" : "🌷"}
            </span>
          </div>

          <form onSubmit={saveNote}>
            <label htmlFor="note-title">Note title</label>
            <input
              ref={inputRef}
              id="note-title"
              type="text"
              placeholder="Give your note a lovely title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />

            <label htmlFor="note-content">Your thoughts</label>
            <textarea
              id="note-content"
              placeholder="Start writing here..."
              rows="4"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <div className="color-picker">
              <span>Choose a color</span>
              <div className="color-options">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Choose note color ${color}`}
                    title={`Choose color ${color}`}
                    className={`color-dot ${
                      selectedColor === color ? "selected" : ""
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setSelectedColor(color)}
                  />
                ))}
              </div>
            </div>

            <div className="form-actions">
              <button className="primary-button" type="submit">
                {editId !== null ? "✓ Update note" : "＋ Add note"}
              </button>

              {editId !== null && (
                <button
                  className="secondary-button"
                  type="button"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="notes-section">
          <div className="notes-heading">
            <div>
              <span className="eyebrow">YOUR COLLECTION</span>
              <h2>All your notes <span>♡</span></h2>
            </div>

            <button
              className="export-button"
              type="button"
              onClick={exportNotes}
            >
              ⇩ Export TXT
            </button>
          </div>

          <div className="search-box">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search your notes..."
              aria-label="Search notes"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                className="clear-search"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          {filteredNotes.length === 0 ? (
            <div className="empty-state">
              <span>{search ? "🔎" : "🌸"}</span>
              <h3>{search ? "No notes found" : "A fresh little start"}</h3>
              <p>
                {search
                  ? "Try another title or keyword."
                  : "Your notes will bloom here. Create your first one above!"}
              </p>
            </div>
          ) : (
            <div className="notes-grid">
              {filteredNotes.map((note) => (
                <article
                  className="note-card"
                  key={note.id}
                  style={{ "--note-color": note.color || COLORS[0] }}
                >
                  <div className="note-card-top">
                    <span className="note-label">
                      {note.pinned ? "📌 PINNED" : "✿ MY NOTE"}
                    </span>

                    <button
                      className={`pin-button ${note.pinned ? "is-pinned" : ""}`}
                      type="button"
                      title={note.pinned ? "Unpin note" : "Pin note"}
                      aria-label={note.pinned ? "Unpin note" : "Pin note"}
                      onClick={() => togglePin(note.id)}
                    >
                      {note.pinned ? "📌" : "📍"}
                    </button>
                  </div>

                  <h3>{note.title}</h3>
                  <p className="note-content">{note.content}</p>

                  <div className="note-date">
                    <span>🕒</span>
                    {new Date(note.createdAt).toLocaleString()}
                  </div>

                  <div className="note-actions">
                    <button
                      type="button"
                      className="edit-button"
                      onClick={() => startEdit(note)}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      type="button"
                      className="delete-button"
                      onClick={() => deleteNote(note.id)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          <p className="results-count">
            Showing {filteredNotes.length} of {notes.length} notes · Made with ♡
          </p>
        </section>
      </main>

      <footer className="footer">
        <span>BlushNotes ♡</span>
        <p>A little space for everything on your mind.</p>
      </footer>
    </div>
  );
}

export default App;