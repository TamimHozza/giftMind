import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../styles/GiftIdeas.css';

const GiftIdeas = () => {
  const { id } = useParams();
  const [recipient, setRecipient] = useState(null);
  const [ideas, setIdeas] = useState([]);
  const [text, setText] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecipient = async () => {
      const { data, error } = await supabase
        .from('recipients')
        .select('*')
        .eq('id', id)
        .single();

      if (!error) setRecipient(data);
    };

    const fetchIdeas = async () => {
      const { data, error } = await supabase
        .from('gift_ideas')
        .select('*')
        .eq('recipient_id', id)
        .order('created_at', { ascending: false });

      if (!error) setIdeas(data);
    };

    fetchRecipient();
    fetchIdeas();
  }, [id]);

  const handleAddIdea = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Idea text is required.');
      return;
    }

    const { data, error: insertError } = await supabase
      .from('gift_ideas')
      .insert([
        { recipient_id: id, text: text.trim(), note: note.trim() || null },
      ])
      .select();

    if (!insertError && data) {
      setIdeas((prev) => [data[0], ...prev]);
      setText('');
      setNote('');
      setError('');
    } else {
      console.error(insertError);
      setError('Failed to add idea.');
    }
  };

  const handleDelete = async (ideaId) => {
    await supabase.from('gift_ideas').delete().eq('id', ideaId);
    setIdeas((prev) => prev.filter((idea) => idea.id !== ideaId));
  };

  const startEdit = (id) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === id
          ? {
              ...idea,
              editing: true,
              editText: idea.text,
              editNote: idea.note || '',
            }
          : idea
      )
    );
  };

  const cancelEdit = (id) => {
    setIdeas((prev) =>
      prev.map((idea) => (idea.id === id ? { ...idea, editing: false } : idea))
    );
  };

  const handleSaveEdit = async (id) => {
    const idea = ideas.find((i) => i.id === id);
    if (!idea.editText.trim()) return;

    const { error } = await supabase
      .from('gift_ideas')
      .update({
        text: idea.editText.trim(),
        note: idea.editNote.trim() || null,
      })
      .eq('id', id);

    if (!error) {
      setIdeas((prev) =>
        prev.map((i) =>
          i.id === id
            ? {
                ...i,
                text: idea.editText.trim(),
                note: idea.editNote.trim(),
                editing: false,
              }
            : i
        )
      );
    }
  };

  if (!recipient) return <p>Loading recipient...</p>;

  return (
    <div className="ideas-page">
      <Link to="/" className="back-btn">
        ← Back to Dashboard
      </Link>
      <h1>Gift Ideas for {recipient.name}</h1>
      <p className="occasion">
        {recipient.occasion && `Occasion: ${recipient.occasion}`}
      </p>

      <form onSubmit={handleAddIdea} className="idea-form">
        <input
          type="text"
          placeholder="Gift idea..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <textarea
          placeholder="Optional note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Add Idea</button>
      </form>

      <div className="idea-list">
        {ideas.length === 0 ? (
          <p>No gift ideas yet.</p>
        ) : (
          ideas.map((idea) => (
            <div key={idea.id} className="idea-card">
              {idea.editing ? (
                <>
                  <input
                    type="text"
                    value={idea.editText}
                    onChange={(e) =>
                      setIdeas((prev) =>
                        prev.map((i) =>
                          i.id === idea.id
                            ? { ...i, editText: e.target.value }
                            : i
                        )
                      )
                    }
                  />
                  <textarea
                    value={idea.editNote}
                    onChange={(e) =>
                      setIdeas((prev) =>
                        prev.map((i) =>
                          i.id === idea.id
                            ? { ...i, editNote: e.target.value }
                            : i
                        )
                      )
                    }
                  />
                  <div className="edit-buttons">
                    <button onClick={() => handleSaveEdit(idea.id)}>
                      Save
                    </button>
                    <button onClick={() => cancelEdit(idea.id)}>Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <p className="idea-text">{idea.text}</p>
                  {idea.note && <p className="idea-note">{idea.note}</p>}
                  <p className="idea-date">
                    Added on {new Date(idea.created_at).toLocaleDateString()}
                  </p>
                  <div className="idea-actions">
                    <button onClick={() => startEdit(idea.id)}>Edit</button>
                    <button onClick={() => handleDelete(idea.id)}>
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default GiftIdeas;
