import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../styles/AddRecipient.css';

const AddRecipient = () => {
  const [name, setName] = useState('');
  const [occasion, setOccasion] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Name is required.');
      return;
    }

    const { error: insertError } = await supabase
      .from('recipients')
      .insert([{ name: name.trim(), occasion: occasion.trim() || null }]);

    if (insertError) {
      console.error(insertError.message);
      setError('Something went wrong. Please try again.');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="add-page">
      <Link to="/" className="back-btn">
        ← Back to Dashboard
      </Link>

      <h1>Add New Recipient</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Name<span>*</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Mom"
          />
        </label>

        <label>
          Occasion
          <input
            type="text"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            placeholder="e.g., Birthday"
          />
        </label>

        {error && <p className="error">{error}</p>}

        <button type="submit">Save Recipient</button>
      </form>
    </div>
  );
};

export default AddRecipient;
