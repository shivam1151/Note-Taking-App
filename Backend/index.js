const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/notesDB')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

const noteSchema = new mongoose.Schema({
  title: String,
  content: String,
  date: { type: Date, default: Date.now },
});

const Note = mongoose.model('Note', noteSchema);

// Get all notes
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new note
app.post('/api/notes', async (req, res) => {
  try {
    const newNote = new Note({
      title: req.body.title,
      content: req.body.content,
    });
    await newNote.save();
    res.json(newNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a note
app.put('/api/notes/:id', async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { title: req.body.title, content: req.body.content },
      { new: true }
    );
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a note
app.delete('/api/notes/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});