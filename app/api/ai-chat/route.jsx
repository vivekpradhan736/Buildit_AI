import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Access your API key
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

// Main function to process the image and prompt input
export async function POST(req) {
  try {
    // Parse the form data (multipart/form-data)
    const formData = await req.formData();
    console.log('Received form data VIVEK :', formData);
    const prompt = formData.get('prompt');
    const imageFile = formData.get('imageFile'); // Optional image file

    let imageText = '';

    if (imageFile) {
      // Save the uploaded image to a temporary file
      const tempFilePath = path.join('/tmp', imageFile.name);
      await fs.writeFile(tempFilePath, Buffer.from(await imageFile.arrayBuffer()));

      // Read the image file and encode it in Base64
      const imageBuffer = await fs.readFile(tempFilePath);
      const base64Image = imageBuffer.toString('base64');

      // Use the Gemini Vision Model to generate text from the image
      const model = genAI.getGenerativeModel({ model: 'models/gemini-1.5-pro' });
      const result = await model.generateContent([
        {
          inlineData: {
            data: base64Image,
            mimeType: imageFile.type || 'image/jpeg', // Default to JPEG if type is unavailable
          },
        },
        'Caption this image.',
      ]);

      imageText = result.response.text();

      // Remove the temporary file after processing
      await fs.unlink(tempFilePath);
    }

    // Construct the full prompt for Gemini AI
    const fullPrompt = imageText ? `The image contains: ${imageText}. ${prompt}` : prompt;

    console.log('Full Prompt:', fullPrompt);

    // Initialize the Gemini AI chat session for additional response generation
    const chatSession = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
    }).startChat({
      generationConfig: {
        temperature: 1,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 8192,
        responseMimeType: 'text/plain',
      },
      history: [
        {
          role: 'user',
          parts: [{ text: fullPrompt }],
        },
      ],
    });

    // Generate a response based on the full prompt
    const result = await chatSession.sendMessage(fullPrompt);
    const AIResponse = result.response.text();
    console.log('AI Response:', AIResponse);

    // Return the response to the frontend
    return NextResponse.json({ result: AIResponse });
  } catch (error) {
    console.error('Error in AI processing:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}