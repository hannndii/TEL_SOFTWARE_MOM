import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function testModels() {
  const models = [
    'gemini-2.0-flash',
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-pro-latest',
    'gemma-4-31b-it',
    'gemini-2.0-flash-lite-001'
  ];

  for (const modelName of models) {
    try {
      console.log(`Testing model: ${modelName}...`);
      const response = await ai.models.generateContent({
        model: modelName,
        contents: 'Say "OK"',
      });
      console.log(`SUCCESS with ${modelName}:`, response.text);
      // If we find one that works, we can stop or just log it
      return modelName;
    } catch (error) {
      console.log(`FAILED ${modelName}:`, error.message.substring(0, 100));
    }
  }
}

testModels().then(workingModel => {
    if (workingModel) {
        console.log(`\nFound working model: ${workingModel}`);
    } else {
        console.log(`\nALL MODELS FAILED QUOTA/NOT_FOUND CHECKS.`);
    }
});
