import React, { useEffect, useState } from "react";
import axios from "axios";

const NotesSection = ({ userId, plantName }) => {
  const [notesByCategory, setNotesByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = "http://localhost:5000/api/notes"; // change to your actual backend URL

  // Fetch categorized notes
  const fetchNotesByCategory = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE}/category/${userId}`);

      // Extract response data safely
      const data = response.data;
      const categorized = {};

      if (Array.isArray(data)) {
        // ✅ If backend returns an array (e.g. [{ _id, notes: [...] }])
        data.forEach((item) => {
          categorized[item._id] = item.notes.filter(
            (note) => !plantName || note.plantName === plantName
          );
        });
      } else if (data && typeof data === "object") {
        // ✅ If backend returns an object (e.g. { categoryName: [notes...] })
        Object.keys(data).forEach((key) => {
          const categoryNotes = Array.isArray(data[key]) ? data[key] : [];
          categorized[key] = categoryNotes.filter(
            (note) => !plantName || note.plantName === plantName
          );
        });
      } else {
        console.error("❌ Unexpected API response format:", data);
        setError("Unexpected response format from server.");
        return;
      }

      setNotesByCategory(categorized);
      setError(null);
    } catch (err) {
      console.error("Error fetching categorized notes:", err);
      setError("Failed to load notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchNotesByCategory();
    }
  }, [userId, plantName]);

  if (loading) {
    return <p className="text-gray-400">Loading notes...</p>;
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-3 text-purple-600">Your Notes</h2>
      {Object.keys(notesByCategory).length === 0 ? (
        <p className="text-gray-500">No notes found.</p>
      ) : (
        Object.keys(notesByCategory).map((category) => (
          <div
            key={category}
            className="bg-white shadow-md rounded-2xl p-4 mb-4 border border-purple-200"
          >
            <h3 className="text-lg font-semibold text-purple-700 mb-2">
              {category.toUpperCase()}
            </h3>

            {notesByCategory[category].length > 0 ? (
              <ul className="space-y-2">
                {notesByCategory[category].map((note) => (
                  <li
                    key={note._id}
                    className="p-3 bg-purple-50 rounded-lg text-gray-700 shadow-sm"
                  >
                    <strong>{note.title}</strong>
                    <p className="text-sm">{note.content}</p>
                    {note.plantName && (
                      <p className="text-xs text-gray-500">
                        🌿 Plant: {note.plantName}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No notes in this category.</p>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default NotesSection;
