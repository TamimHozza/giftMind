import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import '../styles/Dashboard.css';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [recipients, setRecipients] = useState([]);

  useEffect(() => {
    const fetchRecipientsWithCounts = async () => {
      const { data: recipients, error } = await supabase
        .from('recipients')
        .select('*');
      if (error) {
        console.error(error);
        return;
      }

      // Fetch all gift ideas and count them by recipient_id
      const { data: ideas, error: ideasError } = await supabase
        .from('gift_ideas')
        .select('recipient_id');

      if (ideasError) {
        console.error(ideasError);
        return;
      }

      // Count ideas per recipient
      const ideaCounts = ideas.reduce((acc, idea) => {
        acc[idea.recipient_id] = (acc[idea.recipient_id] || 0) + 1;
        return acc;
      }, {});

      // Merge counts into recipients
      const recipientsWithCounts = recipients.map((r) => ({
        ...r,
        idea_count: ideaCounts[r.id] || 0,
      }));

      setRecipients(recipientsWithCounts);
    };

    fetchRecipientsWithCounts();
  }, []);

  const startRecipientEdit = (id) => {
    setRecipients((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              editing: true,
              editName: r.name,
              editOccasion: r.occasion || '',
            }
          : r
      )
    );
  };

  const cancelRecipientEdit = (id) => {
    setRecipients((prev) =>
      prev.map((r) => (r.id === id ? { ...r, editing: false } : r))
    );
  };

  const handleSaveRecipient = async (id) => {
    const r = recipients.find((r) => r.id === id);
    if (!r.editName.trim()) return;

    const { error } = await supabase
      .from('recipients')
      .update({
        name: r.editName.trim(),
        occasion: r.editOccasion.trim() || null,
      })
      .eq('id', id);

    if (!error) {
      setRecipients((prev) =>
        prev.map((r2) =>
          r2.id === id
            ? {
                ...r2,
                name: r.editName.trim(),
                occasion: r.editOccasion.trim(),
                editing: false,
              }
            : r2
        )
      );
    }
  };

  const handleDeleteRecipient = async (id) => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this recipient?'
    );
    if (!confirmDelete) return;

    await supabase.from('recipients').delete().eq('id', id);
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="dashboard">
      <header>
        <h1>GiftMind 🎁</h1>
        <Link to="/add-recipient" className="add-btn">
          + Add New Recipient
        </Link>
      </header>

      <div className="recipient-list">
        {recipients.length === 0 ? (
          <p>No recipients yet. Click "Add New Recipient" to get started.</p>
        ) : (
          recipients.map((recipient) =>
            recipient.editing ? (
              <div key={recipient.id} className="recipient-card">
                <input
                  type="text"
                  value={recipient.editName}
                  onChange={(e) =>
                    setRecipients((prev) =>
                      prev.map((r) =>
                        r.id === recipient.id
                          ? { ...r, editName: e.target.value }
                          : r
                      )
                    )
                  }
                />
                <input
                  type="text"
                  value={recipient.editOccasion}
                  onChange={(e) =>
                    setRecipients((prev) =>
                      prev.map((r) =>
                        r.id === recipient.id
                          ? { ...r, editOccasion: e.target.value }
                          : r
                      )
                    )
                  }
                />
                <div className="edit-buttons">
                  <button onClick={() => handleSaveRecipient(recipient.id)}>
                    Save
                  </button>
                  <button onClick={() => cancelRecipientEdit(recipient.id)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div key={recipient.id} className="recipient-card">
                <h2>{recipient.name}</h2>
                <p>
                  <strong>Occasion:</strong> {recipient.occasion || 'N/A'}
                </p>
                <p>
                  <strong>Ideas:</strong> {recipient.idea_count || 0}
                </p>
                <div className="recipient-actions">
                  <button onClick={() => startRecipientEdit(recipient.id)}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteRecipient(recipient.id)}>
                    Delete
                  </button>
                  <Link to={`/recipient/${recipient.id}`}>View Ideas</Link>
                </div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
};

export default Dashboard;
