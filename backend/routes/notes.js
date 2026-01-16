import express from "express";
import { auth } from "../middleware/auth.js";
import { db } from "../db.js";
import { validateNoteInput, validatePagination } from "../utils/validation.js";

const router = express.Router();


// Utility: Standard API response
function sendResponse(res, success, data = null, error = null, statusCode = 200) {
  return res.status(statusCode).json({ success, data, error });
}


// GET notes List notes for logged-in user with pagination, filtering, and search
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Validate and sanitize pagination parameters
    const paginationResult = validatePagination(req.query.page, req.query.limit);
    if (!paginationResult.isValid) {
      return sendResponse(res, false, null, paginationResult.errors.join("; "), 400);
    }

    const page = paginationResult.page;
    const limit = paginationResult.limit;
    const offset = (page - 1) * limit;

    // Filtering: ?title=meeting
    const titleFilter = req.query.title ? `%${req.query.title.trim().substring(0, 500)}%` : "%";

    // Search: ?q=keyword (search across title and contents)
    const searchQuery = req.query.q ? `%${req.query.q.trim().substring(0, 500)}%` : "%";

    const result = await db.query(
      `SELECT id, title, contents, created_at, updated_at FROM notes WHERE user_id=$1 
      AND title ILIKE $2 AND (title ILIKE $3 OR contents ILIKE $3)
       ORDER BY created_at DESC LIMIT $4 OFFSET $5`,
       [userId, titleFilter, searchQuery, limit, offset]
    );

    // Get total number of matching notes
    const countResult = await db.query(`SELECT COUNT(*) FROM notes WHERE user_id=$1 
      AND title ILIKE $2 AND (title ILIKE $3 OR contents ILIKE $3)`,
      [userId, titleFilter, searchQuery]
    );

    const totalNotes = parseInt(countResult.rows[0].count);
    const hasNextPage = offset + result.rows.length < totalNotes;
    const nextPage = hasNextPage ? page + 1 : null;

    // Return paginated response with consistent structure
    sendResponse(res, true, {notes: result.rows, page, limit, totalNotes, hasNextPage, nextPage});
  } catch (err) {
    console.error("GET /notes error:", err);
    sendResponse(res, false, null, "Failed to fetch notes", 500);
  }
});


// Create a new note
router.post("/", auth, async (req, res) => {
  const { title, contents } = req.body;

  // Validation: title and contents required and within limits
  const validation = validateNoteInput(title, contents);
  if (!validation.isValid) {
    return sendResponse(res, false, null, validation.errors.join("; "), 400);
  }

  try {
    const result = await db.query(`INSERT INTO notes (title, contents, user_id) 
       VALUES ($1, $2, $3) RETURNING id, title, contents, created_at, updated_at`,
      [title.trim(), (contents || "").trim(), req.user.id]
    );

    // Successful creation returns 201
    sendResponse(res, true, result.rows[0], null, 201);
  } catch (err) {
    console.error("POST /notes error:", err);
    sendResponse(res, false, null, "Failed to create note", 500);
  }
});


// Update an existing note (idempotent)
router.put("/:id", auth, async (req, res) => {
  const noteId = parseInt(req.params.id);
  const { title, contents } = req.body;

  // Validation
  const validation = validateNoteInput(title, contents);
  if (!validation.isValid) {
    return sendResponse(res, false, null, validation.errors.join("; "), 400);
  }

  try {
    const result = await db.query(
      `UPDATE notes 
       SET title=$1, contents=$2, updated_at=NOW() 
       WHERE id=$3 AND user_id=$4 
       RETURNING id, title, contents, created_at, updated_at`,
      [title.trim(), (contents || "").trim(), noteId, req.user.id]
    );

    if (result.rows.length === 0) {
      return sendResponse(res, false, null, "Note not found", 404);
    }

    // Idempotent: repeated PUT with same data produces same result
    sendResponse(res, true, result.rows[0]);
  } catch (err) {
    console.error("PUT /notes/:id error:", err);
    sendResponse(res, false, null, "Failed to update note", 500);
  }
});


// Delete a note
router.delete("/:id", auth, async (req, res) => {
  const noteId = parseInt(req.params.id);

  if (!Number.isInteger(noteId) || noteId < 1) {
    return sendResponse(res, false, null, "Invalid note ID", 400);
  }

  try {
    const result = await db.query(
      `DELETE FROM notes 
       WHERE id=$1 AND user_id=$2 
       RETURNING id`,
      [noteId, req.user.id]
    );

    if (result.rows.length === 0) {
      return sendResponse(res, false, null, "Note not found", 404);
    }

    sendResponse(res, true, { message: "Note deleted successfully" });
  } catch (err) {
    console.error("DELETE /notes/:id error:", err);
    sendResponse(res, false, null, "Failed to delete note", 500);
  }
});

export default router;
