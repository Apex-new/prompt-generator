const express = require('express');
     const dotenv = require('dotenv');
     const cors = require('cors'); // Add CORS middleware

     // Load environment variables from .env
     dotenv.config();

     const app = express();
     const port = process.env.PORT || 3000;

     // Enable CORS for all routes
     app.use(cors());

     // Serve static files (index.html, style.css, client.js, assets/)
     app.use(express.static("./"));

     // Middleware to parse JSON bodies
     app.use(express.json());

     // API endpoint to generate a prompt
     app.post('/generate-prompt', async (req, res) => {
       const { genre } = req.body;

       if (!genre) {
         return res.status(400).json({ error: 'Genre is required' });
       }

       try {
         // Call Hugging Face API to generate a prompt
         const prompt = await generatePromptWithHuggingFace(genre);
         res.json({ prompt });
       } catch (error) {
         console.error('Error generating prompt:', error.message);
         res.status(500).json({ error: error.message });
       }
     });

     // Function to call Hugging Face Inference API
     async function generatePromptWithHuggingFace(genre) {
       const apiKey = process.env.HF_API_KEY;
       if (!apiKey) {
         throw new Error('HF_API_KEY is not set in environment variables');
       }

       const model = 'gpt2';
       const promptInput = `In a ${genre} world, write the beginning of a story:`;

       const response = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
         method: 'POST',
         headers: {
           'Authorization': `Bearer ${apiKey}`,
           'Content-Type': 'application/json',
         },
         body: JSON.stringify({
           inputs: promptInput,
           parameters: { max_length: 100, num_return_sequences: 1 },
         }),
       });

       const data = await response.json();
       if (!response.ok || data.error) {
         throw new Error(data.error || 'Failed to generate prompt');
       }

       const generatedText = data[0]?.generated_text || 'No prompt generated.';
       return generatedText;
     }

     app.listen(port, () => {
       console.log(`Server running on port ${port}`);
     });