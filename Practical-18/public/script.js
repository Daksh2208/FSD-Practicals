const API_BASE = '/api/notes';
let editingId = null;

const noteForm = document.getElementById('noteForm');
const titleInput = document.getElementById('title');
const contentInput = document.getElementById('content');
const submitBtn = document.getElementById('submitBtn');
const notesList = document.getElementById('notesList');

// Load notes on page load
document.addEventListener('DOMContentLoaded', loadNotes);

// Form submit handler
noteForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) return;

  if (editingId) {
    await updateNote(editingId, { title, content });
  } else {
    await createNote({ title, content });
  }

  resetForm();
  loadNotes();
});

// Load all notes
async function loadNotes() {
  try {
    const response = await fetch(API_BASE);
    const notes = await response.json();
    displayNotes(notes);
  } catch (error) {
    console.error('Error loading notes:', error);
  }
}

// Display notes in the UI
function displayNotes(notes) {
  notesList.innerHTML = '';

  notes.forEach(note => {
    const noteDiv = document.createElement('div');
    noteDiv.className = 'note';
    noteDiv.innerHTML = `
      <h3>${note.title}</h3>
      <p>${note.content}</p>
      <div class="timestamp">Created: ${new Date(note.timestamp).toLocaleString()}</div>
      <div class="actions">
        <button class="edit-btn" onclick="startEdit('${note._id}', '${note.title.replace(/'/g, "\\'")}', '${note.content.replace(/'/g, "\\'").replace(/\n/g, '\\n')}')">Edit</button>
        <button class="delete-btn" onclick="deleteNote('${note._id}')">Delete</button>
      </div>
    `;
    notesList.appendChild(noteDiv);
  });
}

// Create a new note
async function createNote(noteData) {
  try {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      throw new Error('Failed to create note');
    }
  } catch (error) {
    console.error('Error creating note:', error);
    alert('Failed to create note');
  }
}

// Update a note
async function updateNote(id, noteData) {
  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      throw new Error('Failed to update note');
    }
  } catch (error) {
    console.error('Error updating note:', error);
    alert('Failed to update note');
  }
}

// Delete a note
async function deleteNote(id) {
  if (!confirm('Are you sure you want to delete this note?')) return;

  try {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete note');
    }

    loadNotes();
  } catch (error) {
    console.error('Error deleting note:', error);
    alert('Failed to delete note');
  }
}

// Start editing a note
function startEdit(id, title, content) {
  editingId = id;
  titleInput.value = title;
  contentInput.value = content.replace(/\\n/g, '\n').replace(/\\'/g, "'");
  submitBtn.textContent = 'Update Note';
  titleInput.focus();
}

// Reset form
function resetForm() {
  editingId = null;
  titleInput.value = '';
  contentInput.value = '';
  submitBtn.textContent = 'Add Note';
}
