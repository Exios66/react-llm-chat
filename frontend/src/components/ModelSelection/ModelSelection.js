import React, { useState, useEffect } from 'react';
import '../../App.css';

const ModelSelection = () => {
  const [models, setModels] = useState({
    llama: [],
    openai: [],
    openrouter: []
  });
  const [selectedModel, setSelectedModel] = useState(null);

  useEffect(() => {
    // Simulated API call to fetch models
    const fetchModels = async () => {
      // In a real application, this would be an API call
      const mockModels = {
        llama: ['Llama 7B', 'Llama 13B', 'Llama 30B'],
        openai: ['GPT-3.5 Turbo', 'GPT-4', 'Davinci'],
        openrouter: ['Openrouter Model A', 'Openrouter Model B', 'Openrouter Model C']
      };
      setModels(mockModels);
    };

    fetchModels();
  }, []);

  const handleModelSelect = (api, model) => {
    setSelectedModel({ api, model });
    // In a real application, you would typically dispatch an action here to update the global state
  };

  return (
    <div className="joinContainer">
      <h1>Select Model</h1>
      {Object.entries(models).map(([api, modelList]) => (
        <div key={api}>
          <h2>{api.charAt(0).toUpperCase() + api.slice(1)} Models</h2>
          <form>
            {modelList.map(model => (
              <button
                key={model}
                type="button"
                onClick={() => handleModelSelect(api, model)}
                className={selectedModel && selectedModel.model === model ? 'selected' : ''}
              >
                {model}
              </button>
            ))}
          </form>
        </div>
      ))}
      {selectedModel && (
        <div className="selectedModel">
          <h2>Selected Model:</h2>
          <p>{selectedModel.api}: {selectedModel.model}</p>
        </div>
      )}
    </div>
  );
};

export default ModelSelection;
