import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN || process.env.HUGGING_FACE_API_KEY);

const DEV_GUIDE_PROMPTS = {
    'non-tech': `The audience is NON-TECHNICAL founders.
    Rules:
    - Explain the "What" and "Why", simplify the "How".
    - Use analogies for technical concepts.
    - Focus on the sequence of events and business value.
    - Setup steps should be high-level (e.g., "Install the coding tools").`,

    'tech': `The audience is TECHNICAL developers.
    Rules:
    - Go deep into file structure, libraries, and strict patterns.
    - Specify folder structures, key libraries, and data models.
    - Provide CLI commands and configuration details.
    - Focus on modularity, scalability, and best practices.`
};

export async function POST(req) {
    try {
        const {
            idea,
            memory,
            roadmap,
            summary,
            language = 'JavaScript',
            framework = 'Next.js',
            backend_tech = 'Node.js',
            replyLevel = 'tech'
        } = await req.json();

        const levelInstructions = DEV_GUIDE_PROMPTS[replyLevel] || DEV_GUIDE_PROMPTS['tech'];

        const systemPrompt = {
            role: 'system',
            content: `You are a Senior Software Architect and Technical Mentor.
            Your goal is to convert a business idea into a concrete, step-by-step development guide.

            CONTEXT:
            Frontend Framework: ${framework} (Language: ${language})
            Backend Stack: ${backend_tech}
            Tone: ${replyLevel === 'tech' ? 'Technical & Precise' : 'Educational & Concept-focused'}

            ${levelInstructions}

            IMPORTANT:
            If the user selected a specific framework (e.g., Frappe, Django, Laravel), your guide MUST follow that framework's best practices, folder structure, and CLI commands.
            Do not give generic advice if a framework is specified.

            CRITICAL OUTPUT FORMAT:
            You must respond with a valid JSON object strictly matching this schema. 
            ENSURE all markdown strings are properly escaped (e.g., escape double quotes with \").
            
            {
                "overview": "Markdown string...",
                "architecture": "Markdown string...",
                "steps": [
                    {
                        "title": "Step title",
                        "description": "Markdown string..."
                    }
                ],
                "deployment": "Markdown string...",
                "estimated_timeline": "String",
                "risk_analysis": "Markdown string...",
                "git_strategy": "String"
            }

            Do NOT include any text, notes, or markdown formatting (like code blocks) outside the JSON object.
            Just the raw JSON string.
            `
        };

        const userContext = `
        Project Idea: ${idea}
        Executive Summary: ${summary}
        
        Roadmap Context:
        ${roadmap ? JSON.stringify(roadmap) : 'No roadmap data.'}

        Key Decisions: ${memory?.decisions?.join(', ') || 'None'}
        Scopes: ${memory?.scope?.join(', ') || 'None'}
        `;

        const models = [
            "THUDM/glm-4-9b-chat",
            "Qwen/Qwen2.5-72B-Instruct",
            "meta-llama/Llama-3.3-70B-Instruct"
        ];

        let response;
        let lastError;

        for (const model of models) {
            try {
                console.log(`Generating Dev Guide with model: ${model}`);
                response = await client.chatCompletion({
                    model: model,
                    messages: [
                        systemPrompt,
                        { role: 'user', content: `Generate the development guide for this project:\n${userContext}` }
                    ],
                    max_tokens: 3500, // Increased for GLM-4
                    temperature: 0.4,
                });

                if (response && response.choices && response.choices.length > 0) {
                    const content = response.choices[0].message.content.trim();
                    if (content.startsWith('{') || content.startsWith('```json') || content.startsWith('```')) {
                        break;
                    }
                }
            } catch (error) {
                console.error(`Error with model ${model}:`, error.message);
                lastError = error;
            }
        }

        if (!response || !response.choices || response.choices.length === 0) {
            throw lastError || new Error('Failed to generate development guide');
        }

        let content = response.choices[0].message.content.trim();

        // Aggressive cleanup
        content = content.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '');

        // Find the first { and last }
        const firstOpen = content.indexOf('{');
        const lastClose = content.lastIndexOf('}');

        if (firstOpen !== -1 && lastClose !== -1) {
            content = content.substring(firstOpen, lastClose + 1);
        }

        let guideData;
        try {
            guideData = JSON.parse(content);
        } catch (parseError) {
            console.error("JSON Parse Failed. Raw content:", content);
            throw new Error(`Invalid JSON format from AI: ${parseError.message}`);
        }

        return new Response(JSON.stringify({ guide: guideData }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Dev Guide API Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate guide', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
