import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Header from "./components/header.jsx";
import Login from "./components/login.jsx";
import Register from "./components/Register.jsx";
import Notes from "./components/notes.jsx";
import ProtectedRoutes from "./components/ProtectedRoutes.jsx";

// Allows cookies to be sent with every request automatically
axios.defaults.withCredentials = true;

const API_URL = import.meta.env.VITE_API_URL; // e.g. https://notes-api-tg5u.onrender.com
if (!API_URL) {
  throw new Error("VITE_API_URL is not set. Add it in Vercel Environment Variables and redeploy.");
}
const API_BASE = `${API_URL}/api/v1/notes`;
const USER_BASE = `${API_URL}/api/v1/users`;


export default function App() {
  const navigate = useNavigate();

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Notes state
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Fetch notes function
  const fetchNotes = async (page = 1, q = "") => {
    try {
      const qParam = q ? `&q=${encodeURIComponent(q)}` : "";
      const res = await axios.get(`${API_BASE}?page=${page}&limit=${limit}${qParam}`);
      const { notes: fetchedNotes, hasNextPage: next } = res.data.data;

      if (page === 1) {
        setNotes(fetchedNotes); // first page replaces current notes
      } else {
        setNotes(prev => [...prev, ...fetchedNotes]); // append next page
      }

      setCurrentPage(page);
      setHasNextPage(next);
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Failed to fetch notes:", err.response?.data || err.message);
      setNotes([]);
      setIsLoggedIn(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  // Refresh JWT silently
  const refreshJWT = async () => {
    try {
      await axios.post(`${USER_BASE}/refresh`);
      await fetchNotes();
    } catch (err) {
      console.error("Failed to refresh token:", err.response?.data || err.message);
      logout();
    }
  };

  // On app load
  useEffect(() => {
    fetchNotes();
  },[]);


  // Login
  const login = async () => {
    if (!email.trim() || !password) return;
    try {
      setError("");
      await axios.post(`${USER_BASE}/login`, { email, password });
      await fetchNotes();
      navigate("/");
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
      if (err.response?.status === 401) await refreshJWT();
      else setError(err.response?.data?.error || "Login failed");
    }
  };

  // Register
  const register = async () => {
    if (!email.trim() || !password) return;
    try {
      setError("");
      await axios.post(`${USER_BASE}/register`, { email, password });
      await axios.post(`${USER_BASE}/login`, { email, password });
      await fetchNotes();
      navigate("/");
    } catch (err) {
      console.error("Registration failed:", err.response?.data || err.message);
      if (err.response?.status === 401) await refreshJWT();
      else setError(err.response?.data?.error || "Registration failed");
    }
  };

  // Logout
  const logout = async () => {
    await axios.post(`${USER_BASE}/logout`);
    setIsLoggedIn(false);
    setNotes([]);
    setEmail("");
    setPassword("");
    navigate("/login");
  };

  // Add and Update Note
  const submitNote = async () => {
    if (!title.trim() || !content.trim()) return;
    try {
      setError("");
      if (editingNoteId) {
        // UPDATE EXISTING NOTE
        const res = await axios.put(`${API_BASE}/${editingNoteId}`, {
          title: title.trim(),
          contents: content.trim()
        });
        setNotes(prev =>
          prev.map(note => note.id === editingNoteId ? res.data : note)
        );
        setEditingNoteId(null); // exit edit mode
      } else {
        // ADD NEW NOTE
        const res = await axios.post(API_BASE, {
          title: title.trim(),
          contents: content.trim()
        });
        setNotes(prev => [res.data, ...prev]); // add new note at top
      }
      setTitle("");
      setContent("");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to save note");
    }
  };

  // Start edit
  const startEdit = (note) => {
    setTitle(note.title);
    setContent(note.contents);
    setEditingNoteId(note.id);
  };

  // Delete note
  const deleteNote = async (id) => {
    try {
      await axios.delete(`${API_BASE}/${id}`);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to delete note:", err.response?.data || err.message);
      setError(err.response?.data?.error || "Failed to delete note");
    }
  };

  return (
    <div className="app-layout">
      <Header isLoggedIn={isLoggedIn} logout={logout}/>
      <main className="app-body">
        <Routes>
          <Route
            path="/login"
            element={
              <Login
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                login={login}
                setIsLoggedIn={setIsLoggedIn}
                fetchNotes={fetchNotes}
                error={error}
                setError={setError}
              />
            }
          />
          <Route
            path="/register"
            element={
              <Register
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                register={register}
                setIsLoggedIn={setIsLoggedIn}
                fetchNotes={fetchNotes}
                error={error}
                setError={setError}
              />
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoutes isLoggedIn={isLoggedIn} checkingAuth={checkingAuth}>
                <Notes
                  notes={notes}
                  title={title}
                  setTitle={setTitle}
                  content={content}
                  setContent={setContent}
                  submitNote={submitNote}
                  deleteNote={deleteNote}
                  startEdit={startEdit}
                  editingNoteId={editingNoteId}
                  logout={logout}
                  fetchNotes={fetchNotes}
                  currentPage={currentPage} 
                  hasNextPage={hasNextPage}
                  error={error}
                  setError={setError}  
                />
              </ProtectedRoutes>
            }
          />
          <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} />} />
        </Routes>
      </main>
    </div>
  );
}


