import { generateGeminiContent } from '@/lib/gemini';
import { generateOpenRouterContent } from '@/lib/openrouter';
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
        const systemInstruction = `You are an expert executive consultant. Your task is to generate a professional project summary for a startup idea.\n${modeInstructions}\n\nGENERAL RULES:\n- Professional, formal tone.\n- NO emojis.\n- NO chat-like conversational filler.\n- Use clear headings and bullet points.\n- Focus on clarity and strategic insight.\n- Format the response in Markdown.\n\nSECTIONS TO INCLUDE:\n1. Project Overview\n2. Problem Being Solved\n3. Target Users\n4. Chosen Approach\n5. MVP Scope\n6. Roadmap Overview\n7. Key Risks & Assumptions\n8. Next Action Steps`;

        const userContext = `
        Idea: ${idea}
        
        Project Memory (Decisions/Assumptions):
        Decisions: ${memory?.decisions?.join(', ') || 'None tracked'}
        Assumptions: ${memory?.assumptions?.join(', ') || 'None tracked'}
        Scope: ${memory?.scope?.join(', ') || 'None tracked'}

        Roadmap:
        ${roadmap ? JSON.stringify(roadmap) : 'No roadmap generated yet.'}
        `;

        let summaryContent;

        // 1. PRIMARY: OpenRouter
        try {
            console.log("Attempting Primary OpenRouter generation for Summary...");
            const openRouterResponse = await generateOpenRouterContent(
                systemInstruction,
                `Please generate the final project summary based on this data: ${userContext}`
            );
            if (openRouterResponse) {
                summaryContent = openRouterResponse;
            } else {
                throw new Error("OpenRouter returned null");
            }
        } catch (orError) {
            console.error("OpenRouter Summary Failed:", orError.message);

            // 2. SECONDARY: Gemini
            try {
                console.log("Attempting Secondary Gemini generation for Summary...");
                const geminiResponse = await generateGeminiContent(
                    systemInstruction,
                    `Please generate the final project summary based on this data: ${userContext}`
                );
                if (geminiResponse) {
                    summaryContent = geminiResponse;
                } else {
                    throw new Error("Gemini returned null");
                }
            } catch (geminiError) {
                console.error("Gemini Summary Failed:", geminiError.message);

                // 3. TERTIARY: Hugging Face
                try {
                    console.log("Attempting Tertiary HF generation for Summary...");
                    const systemPrompt = { role: 'system', content: systemInstruction };

                    const models = [
                        "meta-llama/Llama-3.2-3B-Instruct",
                        "mistralai/Mistral-7B-Instruct-v0.3",
                        "microsoft/Phi-3-mini-4k-instruct"
                    ];

                    let hfResponse;
                    for (const model of models) {
                        try {
                            hfResponse = await client.chatCompletion({
                                model: model,
                                messages: [
                                    systemPrompt,
                                    { role: 'user', content: `Please generate the final project summary based on this data: ${userContext}` }
                                ],
                                max_tokens: 2000,
                                temperature: 0.5,
                            });
                            if (hfResponse?.choices?.length > 0) break;
                        } catch (e) { continue; }
                    }

                    if (hfResponse?.choices?.length > 0) {
                        summaryContent = hfResponse.choices[0].message.content;
                    } else {
                        throw new Error("All HF models failed");
                    }
                } catch (hfError) {
                    console.error("HF Summary Failed:", hfError.message);
                    summaryContent = "## Execution Summary\n\n*System Note: Automated summary generation failed due to API limits. Please review your project details manually.*";
                }
            }
        }

        return new Response(JSON.stringify({ summary: summaryContent }), {
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
