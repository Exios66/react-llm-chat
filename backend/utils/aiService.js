// backend/services/aiService.js

const axios = require('axios');
const OpenAI = require('openai');
require('dotenv').config();

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(prompt, context = '') {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant in a chat room." },
          { role: "user", content: context },
          { role: "user", content: prompt }
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating AI response:', error);
      return "I'm sorry, I couldn't generate a response at this time.";
    }
  }

  async moderateContent(content) {
    try {
      const response = await this.openai.moderations.create({
        input: content,
      });

      return {
        flagged: response.results[0].flagged,
        categories: response.results[0].categories,
      };
    } catch (error) {
      console.error('Error moderating content:', error);
      return { flagged: false, categories: {} };
    }
  }

  async translateMessage(message, targetLanguage) {
    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
        {
          q: message,
          target: targetLanguage,
        }
      );

      return response.data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Error translating message:', error);
      return message; // Return original message if translation fails
    }
  }

  async detectLanguage(text) {
    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2/detect?key=${process.env.GOOGLE_TRANSLATE_API_KEY}`,
        {
          q: text,
        }
      );

      return response.data.data.detections[0][0].language;
    } catch (error) {
      console.error('Error detecting language:', error);
      return 'en'; // Default to English if detection fails
    }
  }

  async summarizeConversation(messages) {
    const conversationText = messages.map(m => `${m.user}: ${m.text}`).join('\n');
    const prompt = `Please summarize the following conversation:\n\n${conversationText}\n\nSummary:`;

    return this.generateResponse(prompt);
  }
}

module.exports = new AIService();