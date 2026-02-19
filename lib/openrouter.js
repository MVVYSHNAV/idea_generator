export async function generateOpenRouterContent(systemPrompt, userPrompt, modelName = "google/gemini-2.0-flash-lite-preview-02-05:free") {
    const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_PAI_KEY; // Support both standard and user's specific typo

    if (!apiKey) {
        console.warn("OpenRouter API Key not found. Skipping OpenRouter.");
        return null;
    }

    try {
        console.log(`Attempting OpenRouter generation with model: ${modelName}`);

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://idea-navigator.com", // Required by OpenRouter, using placeholder
                "X-Title": "Idea Navigator" // Required by OpenRouter
            },
            body: JSON.stringify({
                "model": modelName,
                "messages": [
                    { "role": "system", "content": systemPrompt },
                    { "role": "user", "content": userPrompt }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API failed with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            return data.choices[0].message.content;
        } else {
            throw new Error("OpenRouter returned empty choices");
        }

    } catch (error) {
        console.error(`OpenRouter Generation Error (${modelName}):`, error.message);
        return null;
    }
}
