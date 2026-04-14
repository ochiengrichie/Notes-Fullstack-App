import React, { useMemo, useState } from "react";
import "./Notes.css";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M20 20L16.65 16.65" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5V19M5 12H19" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 20L8.5 19L18.5 9L15 5.5L5 15.5L4 20Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M13.8 6.6L17.3 10.1" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function StackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3L4 8L12 13L20 8L12 3Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6.5 11.2L12 15L17.5 11.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.5 15.2L12 19L17.5 15.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="4" width="14" height="16" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 9H16M8 13H16M8 17H13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ArchiveIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7.5H20V10.5H4V7.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M6.5 10.5V18.5H17.5V10.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 13H14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 7H18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M9 7V5.5H15V7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 7L8.7 18.5H15.3L16 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function formatNoteDate(note) {
  const value = note.updated_at || note.created_at;
  if (!value) return "Recently updated";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently updated";

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function getInitials(email) {
  if (!email) return "U";
  return email.trim().charAt(0).toUpperCase();
}

export default function Notes({
  notes,
  title,
  setTitle,
  content,
  setContent,
  submitNote,
  deleteNote,
  startEdit,
  editingNoteId,
  fetchNotes,
  currentPage,
  hasNextPage,
  error,
  setError,
  logout,
  userEmail
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [activeSection, setActiveSection] = useState("all");

  const visibleNotes = useMemo(() => notes, [notes]);

  const openComposer = () => setShowComposer(true);

  const closeComposer = () => {
    setShowComposer(false);
    setTitle("");
    setContent("");
  };

  const handleSubmit = async () => {
    await submitNote();
    setShowComposer(false);
  };

  const handleSearch = () => {
    fetchNotes(1, searchTerm.trim());
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchNotes(1);
  };

  const handleEdit = (note) => {
    startEdit(note);
    setShowComposer(true);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
  };

  const titleText = activeSection === "all" ? "All Notes" : activeSection === "archive" ? "Archive" : "Trash";
  const sectionMessage =
    activeSection === "all"
      ? null
      : `${titleText} is not wired to backend data yet. The current API only returns active notes.`;

  return (
    <div className="dashboard-shell">
      <aside className="dashboard-rail">
        <div className="rail-brand">
          <StackIcon />
        </div>
        <div className="rail-actions">
          <button
            type="button"
            className={`rail-icon-button ${activeSection === "all" ? "active" : ""}`}
            onClick={() => handleSectionChange("all")}
            aria-label="All notes"
          >
            <NoteIcon />
          </button>
          <button
            type="button"
            className={`rail-icon-button ${activeSection === "archive" ? "active" : ""}`}
            onClick={() => handleSectionChange("archive")}
            aria-label="Archive"
          >
            <ArchiveIcon />
          </button>
          <button
            type="button"
            className={`rail-icon-button ${activeSection === "trash" ? "active" : ""}`}
            onClick={() => handleSectionChange("trash")}
            aria-label="Trash"
          >
            <TrashIcon />
          </button>
        </div>
      </aside>

      <div className="dashboard-frame">
        <header className="dashboard-topbar">
          <div className="dashboard-title-wrap">
            <h1>Notes App</h1>
          </div>

          <div className="dashboard-toolbar">
            <label className="dashboard-search" htmlFor="note-search">
              <SearchIcon />
              <input
                id="note-search"
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") handleSearch();
                  if (event.key === "Escape") handleClearSearch();
                }}
              />
            </label>
            <button type="button" className="primary-cta" onClick={openComposer}>
              <PlusIcon />
              <span>New Note</span>
            </button>
          </div>
        </header>

        <div className="dashboard-main">
          <nav className="dashboard-sidebar">
            <div className="sidebar-menu">
              <button
                type="button"
                className={`sidebar-item ${activeSection === "all" ? "active" : ""}`}
                onClick={() => handleSectionChange("all")}
              >
                <span className="sidebar-dot" />
                <span>All Notes</span>
              </button>
              <button
                type="button"
                className={`sidebar-item ${activeSection === "archive" ? "active" : ""}`}
                onClick={() => handleSectionChange("archive")}
              >
                <span className="sidebar-dot" />
                <span>Archive</span>
              </button>
              <button
                type="button"
                className={`sidebar-item ${activeSection === "trash" ? "active" : ""}`}
                onClick={() => handleSectionChange("trash")}
              >
                <span className="sidebar-dot" />
                <span>Trash</span>
              </button>
            </div>

            <div className="sidebar-profile">
              <div className="profile-avatar">{getInitials(userEmail)}</div>
              <div className="profile-copy">
                <p>{userEmail || "Signed in user"}</p>
                <button type="button" onClick={logout}>
                  Logout
                </button>
              </div>
            </div>
          </nav>

          <section className="dashboard-content">
            <div className="content-header">
              <div>
                <h2>{titleText}</h2>
                {sectionMessage && <p className="content-subtle">{sectionMessage}</p>}
              </div>
              {searchTerm && activeSection === "all" ? (
                <button type="button" className="ghost-button" onClick={handleClearSearch}>
                  Clear Search
                </button>
              ) : null}
            </div>

            {error ? (
              <div className="dashboard-error">
                <p>{error}</p>
                <button type="button" onClick={() => setError("")}>
                  Dismiss
                </button>
              </div>
            ) : null}

            {activeSection !== "all" ? (
              <div className="empty-state">
                <h3>{titleText} is not available yet</h3>
                <p>The current backend supports active notes only. This view is ready for future archive or trash APIs.</p>
              </div>
            ) : visibleNotes.length > 0 ? (
              <>
                <div className="notes-grid">
                  {visibleNotes.map((note) => (
                    <article key={note.id} className="dashboard-note-card">
                      <div className="note-card-copy">
                        <h3>{note.title}</h3>
                        <p className="note-date">{formatNoteDate(note)}</p>
                        <p className="note-preview">{note.contents}</p>
                      </div>

                      <div className="note-card-actions">
                        <button type="button" className="ghost-button" onClick={() => handleEdit(note)}>
                          <EditIcon />
                          <span>Edit</span>
                        </button>
                        <button type="button" className="ghost-button" onClick={() => deleteNote(note.id)}>
                          <span>Delete</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>

                {hasNextPage ? (
                  <div className="content-footer">
                    <button type="button" className="load-more-button" onClick={() => fetchNotes(currentPage + 1, searchTerm.trim())}>
                      Load More
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <div className="empty-state">
                <h3>No notes found</h3>
                <p>Create a note to populate this dashboard, or refine your search.</p>
                <button type="button" className="primary-cta" onClick={openComposer}>
                  <PlusIcon />
                  <span>New Note</span>
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      {showComposer ? (
        <div className="composer-overlay" role="presentation" onClick={closeComposer}>
          <div className="composer-card" role="dialog" aria-modal="true" aria-labelledby="composer-title" onClick={(event) => event.stopPropagation()}>
            <div className="composer-header">
              <h3 id="composer-title">{editingNoteId ? "Edit Note" : "Create Note"}</h3>
              <button type="button" className="composer-close" onClick={closeComposer} aria-label="Close composer">
                X
              </button>
            </div>

            <div className="composer-body">
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Note title"
              />
              <textarea
                value={content}
                onChange={(event) => setContent(event.target.value)}
                placeholder="Write your note here..."
                rows={10}
              />
            </div>

            <div className="composer-actions">
              <button type="button" className="ghost-button" onClick={closeComposer}>
                Cancel
              </button>
              <button type="button" className="primary-cta" onClick={handleSubmit}>
                <span>{editingNoteId ? "Update Note" : "Save Note"}</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
