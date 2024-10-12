import React, { useState } from 'react';
import '../../App.css';

const SentenceCompletion = () => {
  const [sentence, setSentence] = useState('');
  const [completion, setCompletion] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically make an API call to get the sentence completion
    // For now, we'll just simulate it
    setCompletion(`${sentence} ... This is a simulated completion.`);
  };

  return (
    <div className="joinContainer">
      <h1>Sentence Completion</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={sentence}
          onChange={(e) => setSentence(e.target.value)}
          placeholder="Enter a sentence to complete..."
        />
        <button type="submit">Complete</button>
      </form>
      {completion && (
        <div className="completion">
          <h2>Completed Sentence:</h2>
          <p>{completion}</p>
        </div>
      )}
    </div>
  );
};

export default SentenceCompletion;
