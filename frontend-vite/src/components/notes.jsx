import React, { useState } from "react";
import "./Notes.css";

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
  hasNextPage
}) {
  const [showInput, setShowInput] = useState(false);
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const handleSubmit = () => {
    submitNote();
    setShowInput(false);
  };

  const handleSearch = () => {
    fetchNotes(1, searchTerm)
  };
  const clearSearch = () => {
    setSearchTerm("");
    setShowSearch(false);
    fetchNotes(1);
  };

  return (
    <div className="notes-container">
      {/* Search Bar */}
      <div className="notes-search">
        <button onClick={() => setShowSearch(prev => !prev)}>🔍</button>
      </div>

        {showSearch && (
        <div className="notes-search">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch}>Search</button>
          <button onClick={clearSearch}>Clear</button>
        </div>
      )}
      {!selectedNoteId ? (
        <ul className="notes-list">
          {notes.map((note) => (
            <li key={note.id} className="note-card">
              <div className="note-main" onClick={() => setSelectedNoteId(note.id)}>
                <span className="notes-title" title={note.title}>
                  {note.title}
                </span>
              </div>

              <div className="note-actions">
                <button onClick={(e) => { e.stopPropagation(); startEdit(note); }}>
                  Edit
                </button>
                <button onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="notes-content-container">
          <button 
            onClick={() => setSelectedNoteId(null)}
            className="back-button"
          >
            ← Back
          </button>
          <h2>{notes.find(n => n.id === selectedNoteId)?.title}</h2>
          <br/>
          <p>{notes.find(n => n.id === selectedNoteId)?.contents}</p>
        </div>
      )}

      {showInput && (
        <div className="notes-input">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add New note"
          /><br/>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Contents"
            rows={5}
            cols={10}
          /><br/>
          <button onClick={handleSubmit}>
            {editingNoteId ? "Update" : "Add"}
          </button>
        </div>
      )}

      {!showInput && (
        <button className="add-button" onClick={() => setShowInput(true)}>
          +
        </button>
      )}

      {/* Next Page Button */}
      {hasNextPage && !selectedNoteId && (
        <button
          className="next-page-button"
          onClick={() => fetchNotes(currentPage + 1)}
        >
          Next Page →
        </button>
      )}
    </div>
  );
}
