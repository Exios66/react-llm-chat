const { v4: uuidv4 } = require('uuid');
const sanitizeHtml = require('sanitize-html');
const moment = require('moment');
const { OpenAI } = require('openai');
const { Anthropic } = require('anthropic');
const { LlamaAPI } = require('llama-api');

// Initialize AI clients
const openai = new OpenAI(process.env.OPENAI_API_KEY);
const anthropic = new Anthropic(process.env.ANTHROPIC_API_KEY);
const llama = new LlamaAPI(process.env.LLAMA_API_KEY);

// In-memory storage for messages (replace with database in production)
let messages = [];

exports.sendMessage = async (req, res) => {
  try {
    const { userId, roomId, content } = req.body;
    
    // Sanitize user input
    const sanitizedContent = sanitizeHtml(content);
    
    const message = {
      id: uuidv4(),
      userId,
      roomId,
      content: sanitizedContent,
      timestamp: moment().format(),
    };
    
    messages.push(message);
    
    // Emit the message to all users in the room
    req.app.get('io').to(roomId).emit('newMessage', message);
    
    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getMessages = (req, res) => {
  const { roomId } = req.params;
  const roomMessages = messages.filter(message => message.roomId === roomId);
  res.json(roomMessages);
};

exports.deleteMessage = (req, res) => {
  const { messageId } = req.params;
  const index = messages.findIndex(message => message.id === messageId);
  
  if (index !== -1) {
    messages.splice(index, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Message not found' });
  }
};

exports.getAIResponse = async (req, res) => {
  try {
    const { content, aiModel } = req.body;
    let response;

    switch (aiModel) {
      case 'gpt3':
        response = await openai.createCompletion({
          model: "text-davinci-002",
          prompt: content,
          max_tokens: 150
        });
        break;
      case 'claude':
        response = await anthropic.completions.create({
          model: "claude-v1",
          prompt: content,
          max_tokens_to_sample: 150
        });
        break;
      case 'llama':
        response = await llama.generate({
          prompt: content,
          maxLength: 150
        });
        break;
      default:
        throw new Error('Invalid AI model specified');
    }

    res.json({ aiResponse: response.choices[0].text.trim() });
  } catch (error) {
    console.error('Error getting AI response:', error);
    res.status(500).json({ error: 'Error processing AI request' });
  }
};

// Add more controller functions as needed
