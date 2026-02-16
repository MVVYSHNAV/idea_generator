import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN || process.env.HUGGING_FACE_API_KEY);

const SUMMARY_MODE_PROMPTS = {
    'non-tech': `The audience is NON-TECHNICAL founders and business users.
Rules:
- Focus on business value, market impact, and user outcomes.
- Use analogies for technical parts.
- Avoid implementation details.
- Professional, clear, and executive-level language.`,

    'tech': `The audience is TECHNICAL developers and architects.
Rules:
- Focus on technical architecture, system trade-offs, and data models.
- Use precise terminology (APIs, state management, database schemas).
- Include high-level implementation details and engineering priorities.
- Analytical, direct, and architecture-first language.`
};

export async function POST(req) {
    try {
        const { idea, memory, roadmap, replyMode = 'non-tech' } = await req.json();

        const modeInstructions = SUMMARY_MODE_PROMPTS[replyMode] || SUMMARY_MODE_PROMPTS['non-tech'];

        const systemPrompt = {
            role: 'system',
            content: `You are an expert executive consultant. Your task is to generate a professional project summary for a startup idea.
            
            ${modeInstructions}

            GENERAL RULES:
            - Professional, formal tone.
            - NO emojis.
            - NO chat-like conversational filler.
            - Use clear headings and bullet points.
            - Focus on clarity and strategic insight.
            - Format the response in Markdown.

            SECTIONS TO INCLUDE:
            1. Project Overview
            2. Problem Being Solved
            3. Target Users
            4. Chosen Approach
            5. MVP Scope
            6. Roadmap Overview
            7. Key Risks & Assumptions
            8. Next Action Steps`
        };

        const userContext = `
        Idea: ${idea}
        
        Project Memory (Decisions/Assumptions):
        Decisions: ${memory?.decisions?.join(', ') || 'None tracked'}
        Assumptions: ${memory?.assumptions?.join(', ') || 'None tracked'}
        Scope: ${memory?.scope?.join(', ') || 'None tracked'}

        Roadmap:
        ${roadmap ? JSON.stringify(roadmap) : 'No roadmap generated yet.'}
        `;

        const models = [
            "Qwen/Qwen2.5-72B-Instruct",
            "meta-llama/Llama-3.3-70B-Instruct",
            "mistralai/Mistral-7B-Instruct-v0.3"
        ];

        let response;
        let lastError;

        for (const model of models) {
            try {
                console.log(`Attempting summary generation with model: ${model}`);
                response = await client.chatCompletion({
                    model: model,
                    messages: [
                        systemPrompt,
                        { role: 'user', content: `Please generate the final project summary based on this data: ${userContext}` }
                    ],
                    max_tokens: 2000,
                    temperature: 0.5,
                });

                if (response && response.choices && response.choices.length > 0) {
                    break; // Success!
                }
            } catch (error) {
                console.error(`Error with model ${model}:`, error.message);
                lastError = error;
                // Continue to next model
            }
        }

        if (!response || !response.choices || response.choices.length === 0) {
            throw lastError || new Error('Invalid response format from all providers');
        }

        return new Response(JSON.stringify({ summary: response.choices[0].message.content }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Summary API Error:', error);
        return new Response(JSON.stringify({ error: 'Failed to generate summary', details: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
