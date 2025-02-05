import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [notes, setNotes] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/notes');
      setNotes(response.data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleAddNote = async () => {
    if (newTitle.trim() && newContent.trim()) {
      try {
        const response = await axios.post('http://localhost:5000/api/notes', { title: newTitle, content: newContent });
        setNotes([...notes, response.data]);
        setNewTitle('');
        setNewContent('');
      } catch (error) {
        console.error('Error adding note:', error);
      }
    }
  };

  const handleDeleteNote = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notes/${id}`);
      setNotes(notes.filter(note => note._id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleEditNote = async (id, newTitle, newContent) => {
    try {
      const response = await axios.put(`http://localhost:5000/api/notes/${id}`, { title: newTitle, content: newContent });
      setNotes(notes.map(note => (note._id === id ? response.data : note)));
      setShowModal(false);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const searchNotes = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredNotes = notes.filter(note =>
    (note.title && note.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSort = () => {
    const sortedNotes = [...filteredNotes].sort((a, b) => {
      if (sortOrder === 'asc') {
        return a.title.localeCompare(b.title);
      } else {
        return b.title.localeCompare(a.title);
      }
    });
    setNotes(sortedNotes);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <h1>Note Taking App</h1>
      </header>
      <div style={styles.container}>
        <div style={styles.controls}>
          <input
            type="text"
            style={styles.searchBar}
            placeholder="Search notes..."
            value={searchTerm}
            onChange={searchNotes}
          />
          <button onClick={handleSort} style={styles.sortBtn}>
            Sort ({sortOrder === 'asc' ? 'Ascending' : 'Descending'})
          </button>
        </div>
        <div style={styles.notesList}>
          {filteredNotes.map(note => (
            <div key={note._id} style={styles.noteCard}>
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <div style={styles.noteActions}>
                <button
                  style={styles.deleteBtn}
                  onClick={(e) => { e.stopPropagation(); handleDeleteNote(note._id); }}
                >
                  Delete
                </button>
                <button
                  style={styles.renameBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditNote(note._id, prompt("Enter new title", note.title), prompt("Enter new content", note.content));
                  }}
                >
                  Rename
                </button>
              </div>
            </div>
          ))}
        </div>
        <div style={styles.createNoteSection}>
          <input 
            type="text"
            placeholder="Enter note title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            style={styles.createNoteInput}
          />
          <textarea 
            placeholder="Enter note content"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            style={styles.createNoteTextarea}
          />
          <button onClick={handleAddNote} style={styles.addNoteBtn}>Add Note</button>
        </div>

        {showModal && selectedNote && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <h2>Edit Note</h2>
              <input
                type="text"
                value={selectedNote.title}
                onChange={(e) => setSelectedNote({ ...selectedNote, title: e.target.value })}
                style={styles.editTitleInput}
              />
              <textarea
                value={selectedNote.content}
                onChange={(e) => setSelectedNote({ ...selectedNote, content: e.target.value })}
                style={styles.textarea}
              />
              <button onClick={() => handleEditNote(selectedNote._id, selectedNote.title, selectedNote.content)} style={styles.saveBtn}>Save</button>
              <button onClick={() => setShowModal(false)} style={styles.closeBtn}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

// Inline CSS styles
const styles = {
  app: {
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f4f9',
    margin: 0,
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#282c34',
    color: 'white',
    padding: '10px',
    width: '100%',
    textAlign: 'center',
  },
  container: {
    width: '100%',
    maxWidth: '800px',
    padding: '20px',
  },
  controls: {
    marginBottom: '20px',
  },
  searchBar: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    marginBottom: '10px',
    border: '1px solid #ccc',
  },
  sortBtn: {
    padding: '10px',
    backgroundColor: '#f39c12',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
  notesList: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '20px',
    marginBottom: '20px',
  },
  noteCard: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
  },
  noteActions: {
    marginTop: '10px',
  },
  deleteBtn: {
    padding: '5px 10px',
    border: 'none',
    backgroundColor: '#e74c3c',
    color: 'white',
    cursor: 'pointer',
  },
  renameBtn: {
    padding: '5px 10px',
    border: 'none',
    backgroundColor: '#3498db',
    color: 'white',
    cursor: 'pointer',
    marginLeft: '10px',
  },
  createNoteSection: {
    marginTop: '20px',
  },
  createNoteInput: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    marginBottom: '10px',
  },
  createNoteTextarea: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    height: '100px',
    marginBottom: '20px',
  },
  addNoteBtn: {
    padding: '10px 20px',
    backgroundColor: '#2ecc71',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    width: '400px',
  },
  textarea: {
    width: '100%',
    height: '100px',
    padding: '10px',
    fontSize: '16px',
    border: '1px solid #ccc',
  },
  saveBtn: {
    padding: '5px 10px',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px',
  },
  closeBtn: {
    padding: '5px 10px',
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    marginTop: '10px',
  },
  editTitleInput: {
    width: '100%',
    padding: '10px',
    fontSize: '16px',
    marginBottom: '10px',
  },
};