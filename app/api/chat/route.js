import { Utils } from 'lucide-react';
import { generateGeminiContent } from '@/lib/gemini';
import { generateOpenRouterContent } from '@/lib/openrouter';
import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN || process.env.HUGGING_FACE_API_KEY);

const MODE_PROMPTS = {
    brainstorm: `You are an expert creative strategist. Your goal is to expand the user's vision.
    
    INSTRUCTIONS:
    1. Acknowledge the idea briefly.
    2. Suggest 5 numbered directions/variations for the project (e.g., "1. [Name]: [Description]").
    3. Keep them brief but inspiring.
    4. End by asking the user to "reply with the number" of the option they want to pursue to move to MVP planning.`,

    mvp: `You are a lean startup expert focused on execution. Your goal is to strip the user's idea down to its most core, essential value proposition.
    Focus on the "Smallest Testable Product". Prioritize speed to market and identifying the single most important problem being solved.`,

    risk: `You are a critical thinker and risk analyst. Your goal is to kill the user's idea before the market does.
    Identify hidden assumptions, technical hurdles, market saturation, and potential failure points. Be brutally honest but constructive.`,

    roadmap: `You are an operations and project management lead. Your goal is to turn dreams into a phased plan.
    Structure output into clear, chronological phases: Research, Build, Launch, Scale. Focus on technical dependencies and clear milestones.
    CRITICAL: If the user asks to "generate roadmap" or "create plan", you MUST respond with a valid JSON object in this format:
    {
      "problem_statement": "string",
      "target_users": "string",
      "key_assumptions": ["string"],
      "mvp_features": ["string"],
      "roadmap_phases": [{"phase": "string", "tasks": ["string"]}],
      "risks": ["string"],
      "open_questions": ["string"]
    }
    Include NO other text before or after the JSON in this case.`,

    investor: `You are a venture capitalist and growth expert. Your goal is to find the "Big Business" in the idea.
    Focus on unit economics, defensibility (moats), scalability, and long-term exit potential. Address the "Why now?" and "How big?".`,

    legal: `You are a senior legal counsel and regulatory compliance expert. Your goal is to identify necessary legal structures, documents, and compliance frameworks.
    
    INSTRUCTIONS:
    1. Identify key regulatory frameworks (e.g., GDPR, HIPAA, CCPA, PCI-DSS) relevant to the project.
    2. List necessary legal documents (e.g., Privacy Policy, Terms of Service, DPAs, NDAs).
    3. Highlight potential liability risks (IP infringement, data breaches, user generated content).
    4. Suggest specific licenses if open source components are involved.
    
    DISCLAIMER: Always preface advice by stating you are an AI assistant and this is not professional legal advice.`
};

const REPLY_MODE_PROMPTS = {
    'non-tech': `You are explaining concepts to a non-technical user.
Rules:
- Use simple words
- Avoid technical jargon
- Focus on ideas, outcomes, and clarity
- Explain as if to a smart beginner
- Never assume technical knowledge
- NO CODE, no architecture diagrams, no implementation details.`,

    'tech': `You are explaining concepts to a technical user.
Rules:
- Be precise and structured
- Use correct technical terminology
- Explain trade-offs and constraints
- Assume engineering literacy
- Avoid over-simplification
- FEEL FREE to mention APIs, data models, or system flows.`
};

export async function POST(req) {
    try {
        const { messages, selectedMode = 'brainstorm', replyMode = 'non-tech' } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: 'Messages are required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const personaContent = MODE_PROMPTS[selectedMode] || MODE_PROMPTS.brainstorm;
        const replyLevelContent = REPLY_MODE_PROMPTS[replyMode] || REPLY_MODE_PROMPTS['non-tech'];

        let responseContent;

        // 1. PRIMARY: Try OpenRouter
        try {
            console.log("Attempting Primary OpenRouter generation...");
            const lastUserMessage = messages[messages.length - 1].content;
            const systemInstruction = `You are an expert co-founder operating in ${selectedMode} mode.\n${personaContent}\n${replyLevelContent}`;

            const openRouterResponse = await generateOpenRouterContent(systemInstruction, lastUserMessage);
            if (openRouterResponse) {
                responseContent = openRouterResponse;
            } else {
                throw new Error("OpenRouter returned null/empty response");
            }
        } catch (orError) {
            console.error("OpenRouter Primary Failed:", orError.message);

            // 2. SECONDARY: Try Gemini
            try {
                console.log("Attempting Secondary Gemini generation...");
                const lastUserMessage = messages[messages.length - 1].content;
                const systemInstruction = `You are an expert co-founder operating in ${selectedMode} mode.\n${personaContent}\n${replyLevelContent}`;

                const geminiResponse = await generateGeminiContent(systemInstruction, lastUserMessage);
                if (geminiResponse) {
                    responseContent = geminiResponse;
                } else {
                    throw new Error("Gemini returned null/empty response");
                }
            } catch (geminiError) {
                console.error("Gemini Secondary Failed:", geminiError.message);

                // 3. TERTIARY: Try Hugging Face
                try {
                    console.log("Attempting Tertiary HF generation...");
                    const systemPrompt = {
                        role: 'system',
                        content: `You are an expert co-founder and startup advisor strictly operating in ${selectedMode.toUpperCase()} mode. 
                        
                        PERSONA INSTRUCTIONS:
                        ${personaContent} 
                        
                        REPLY STYLE INSTRUCTIONS:
                        ${replyLevelContent}

                        Keep responses concise, professional, and actionable.`
                    };

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
                                messages: [systemPrompt, ...messages],
                                max_tokens: 1000,
                                temperature: 0.7,
                            });
                            if (hfResponse?.choices?.length > 0) break;
                        } catch (e) { continue; }
                    }

                    if (hfResponse?.choices?.length > 0) {
                        responseContent = hfResponse.choices[0].message.content;
                    } else {
                        throw new Error("All HF models failed");
                    }

                } catch (hfError) {
                    console.error("HF Tertiary Failed:", hfError.message);

                    // 4. FINAL FALLBACK: Mock Response
                    const fallbackResponses = {
                        brainstorm: "I'm having trouble connecting to my creative brain right now (API Limit), but here are a few ideas to get you started:\n\n1. **Gamified Education Platform**: Turn learning into a quest-based adventure.\n2. **AI-Powered Personal Stylist**: Use computer vision to recommend outfits.\n3. **Hyper-local Community Hub**: Connect neighbors for tool sharing and events.\n4. **Sustainable Supply Chain Tracker**: Blockchain for transparent sourcing.\n5. **Virtual Interior Designer**: AR visualization for home decor.\n\nReply with the number you like!",
                        mvp: "Since I can't reach my analysis tools, here's a general MVP approach:\n\n**Core Value:** Solve one specific problem for one specific user.\n**Key Feature:** A simple, manual process that delivers the result (Concierge MVP).\n**Success Metric:** 10 paying customers.",
                        risk: "I can't run a full risk assessment right now, but consider these common pitfalls:\n\n1. **Market Saturation:** Are there too many competitors?\n2. **User Adoption:** Will people actually change their behavior?\n3. **Technical Complexity:** Is the solution too hard to build?",
                        roadmap: JSON.stringify({
                            problem_statement: "User needs X but has Y problem.",
                            target_users: "Early adopters",
                            key_assumptions: ["Users want this", "Tech is feasible"],
                            mvp_features: ["Login", "Core Feature", "Payment"],
                            roadmap_phases: [
                                { phase: "Phase 1: Research", tasks: ["Competitor Analysis", "User Interviews"] },
                                { phase: "Phase 2: MVP Build", tasks: ["Core Logic", "UI Design"] },
                                { phase: "Phase 3: Launch", tasks: ["Beta Testing", "Marketing"] }
                            ],
                            risks: ["Low adoption", "Technical debt"],
                            open_questions: ["How to monetize?", "Who is the ideal customer?"]
                        }),
                        investor: "I can't analyze the market data right now, but focus on your **CAC (Customer Acquisition Cost)** vs **LTV (Lifetime Value)**. Investors want to see a clear path to profitability and a large addressable market.",
                        legal: "I cannot provide specific legal definitions at the moment. Generally, ensure you update your **Privacy Policy** and **Terms of Service**, and comply with local data protection laws (GDPR/CCPA)."
                    };

                    responseContent = fallbackResponses[selectedMode] || "I'm currently offline (API Quota Exceeded), but I'm here to help! Please try again later or check your API credits.";
                }
            }
        }

        return new Response(JSON.stringify({ role: "assistant", content: responseContent }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Chat API Fatal Error:', error);
        return new Response(JSON.stringify({
            role: "assistant",
            content: "System Critical Error: Unable to process request."
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
