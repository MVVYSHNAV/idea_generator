import { generateGeminiContent } from '@/lib/gemini';
import { generateOpenRouterContent } from '@/lib/openrouter';
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
        const systemInstruction = `You are a Senior Software Architect and Technical Mentor.
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
            Just the raw JSON string.`;

        const userContext = `
        Project Idea: ${idea}
        Executive Summary: ${summary}
        
        Roadmap Context:
        ${roadmap ? JSON.stringify(roadmap) : 'No roadmap data.'}

        Key Decisions: ${memory?.decisions?.join(', ') || 'None'}
        Scopes: ${memory?.scope?.join(', ') || 'None'}
        `;

        let content;

        // 1. PRIMARY: OpenRouter
        try {
            console.log("Attempting Primary OpenRouter generation for Dev Guide...");
            const openRouterResponse = await generateOpenRouterContent(
                systemInstruction,
                `Generate the development guide for this project:\n${userContext}`
            );
            if (openRouterResponse) {
                content = openRouterResponse;
            } else {
                throw new Error("OpenRouter returned null");
            }
        } catch (orError) {
            console.error("OpenRouter Dev Guide Failed:", orError.message);

            // 2. SECONDARY: Gemini
            try {
                console.log("Attempting Secondary Gemini generation for Dev Guide...");
                const geminiResponse = await generateGeminiContent(
                    systemInstruction,
                    `Generate the development guide for this project:\n${userContext}`
                );
                if (geminiResponse) {
                    content = geminiResponse;
                } else {
                    throw new Error("Gemini returned null");
                }
            } catch (geminiError) {
                console.error("Gemini Dev Guide Failed:", geminiError.message);

                // 3. TERTIARY: Hugging Face
                try {
                    console.log("Attempting Tertiary HF generation for Dev Guide...");
                    const systemPrompt = { role: 'system', content: systemInstruction };
                    const models = [
                        "mistralai/Mistral-7B-Instruct-v0.3",
                        "meta-llama/Llama-3.2-3B-Instruct",
                        "microsoft/Phi-3-mini-4k-instruct"
                    ];

                    let hfResponse;
                    for (const model of models) {
                        try {
                            hfResponse = await client.chatCompletion({
                                model: model,
                                messages: [
                                    systemPrompt,
                                    { role: 'user', content: `Generate the development guide for this project:\n${userContext}` }
                                ],
                                max_tokens: 3500,
                                temperature: 0.4,
                            });
                            if (hfResponse?.choices?.length > 0) break;
                        } catch (e) { continue; }
                    }

                    if (hfResponse?.choices?.length > 0) {
                        content = hfResponse.choices[0].message.content;
                    } else {
                        throw new Error("All HF models failed");
                    }
                } catch (hfError) {
                    console.error("HF Dev Guide Failed:", hfError.message);
                    throw new Error("All providers failed to generate dev guide");
                }
            }
        }

        // Processing & Cleaning JSON
        content = content.trim();
        content = content.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '');

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
