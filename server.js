require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch");
const app = express();

console.log("HF_API_KEY:", process.env.HF_API_KEY ? "Loaded" : "Not loaded");

let usage = {};

app.use(express.static("./"));

app.get("/generate", async (req, res) => {
    const genre = req.query.genre || "general";
    const userId = req.query.userId || "free_user";
    const prompt = `Write a short writing prompt (1–2 sentences) for a ${genre} story, centered on a specific character, setting, or conflict typical of the genre, in the format: "Write a [genre] story about [specific scenario]." Avoid unrelated themes like products, games, or non-fiction.`;
    const apiKey = process.env.HF_API_KEY;

    if (!apiKey) {
        return res.json({ error: "API key not configured" });
    }

    // Rate limiting (temporary: 20 prompts/day for testing)
    usage[userId] = usage[userId] || { count: 0, reset: Date.now() + 24 * 60 * 60 * 1000 };
    if (Date.now() > usage[userId].reset) {
        usage[userId] = { count: 0, reset: Date.now() + 24 * 60 * 60 * 1000 };
    }
    if (usage[userId].count >= 20 && userId === "free_user") {
        return res.json({ error: "Free limit reached. <a href='/premium'>Upgrade to premium!</a>" });
    }

    try {
        const response = await fetch("https://api-inference.huggingface.co/models/EleutherAI/gpt-neo-125M", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: prompt,
                max_length: 50,
                temperature: 0.6,
                top_p: 0.9,
                top_k: 40,
                num_return_sequences: 1
            })
        });

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Received non-JSON response from API");
        }

        const data = await response.json();
        if (data.error) {
            res.json({ error: data.error });
        } else {
            usage[userId].count++;
            // Clean and format output
            let generated = data[0].generated_text.replace(prompt, "").trim();
            // Ensure proper format
            if (!generated.startsWith("Write a")) {
                generated = `Write a ${genre} story about ${generated.toLowerCase()}.`;
            }
            // Truncate to 1–2 sentences
            generated = generated.split(/[.!?]/).slice(0, 2).join(". ").trim();
            if (!generated || generated.length < 20) {
                generated = `Write a ${genre} story about a mysterious figure in a forgotten realm.`;
            }
            res.json({ prompt: generated });
        }
    } catch (error) {
        console.error("API Error:", error.message);
        res.json({ error: "Failed to generate prompt due to API issue. Please try again later." });
    }
});

app.get("/premium", (req, res) => {
    res.send(`
        <h1>Upgrade to Premium</h1>
        <p>Unlimited prompts for $5/month!</p>
        <a href="https://buy.stripe.com/your-checkout-link">Subscribe Now</a>
    `);
});

app.listen(process.env.PORT || 3000, () => console.log("Server running"));