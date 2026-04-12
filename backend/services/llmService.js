import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GOOGLE_GENAI_API_KEY;

const ai = new GoogleGenAI({ apiKey: apiKey });

const model = 'gemini-3-flash-preview';

export const generateAiResponse = async (userMessage, abstracts) => {
    try {
        const hasData = Object.keys(abstracts).length > 0;

        let contextString = "No research articles found.";
        if (hasData) {
            contextString = Object.entries(abstracts).map(([pmid, text]) => {
                return `--- Abstract (PMID: ${pmid}) ---\n${text}\n`;
            }).join('\n');
        }

        const sysPrompt = `You are an expert Medical Literature Synthesizer. Your audience consists of biomedical professionals, clinicians, and researchers. Your job is to answer their natural language medical questions using ONLY the provided PubMed abstracts.
CRITICAL RULES:
- Do not use outside knowledge. If the answer is not in the abstracts, explicitly state: "The provided research does not contain enough information to answer this."
- Assume a high level of medical literacy. Do not explain basic anatomical terms or standard procedures unless specifically asked.
- Synthesize the findings into clear clinical categories (e.g., Diagnostic Criteria, Biomarkers, Clinical Outcomes, Pathophysiology) where appropriate.
- Maintain strict scientific accuracy. Do not overstate conclusions. 
- You MUST cite every claim using the specific PMID inline (e.g., "The aVR sign is associated with high mortality [PMID: 31401390].").`;

        const userPrompt = `
            MEDICAL ABSTRACTS:
            ${contextString}

            USER QUESTION:
            "${userMessage}"
        `;

        const res = await ai.models.generateContent({
            model: model,
            contents: userPrompt,
            config: {
                systemInstruction: sysPrompt,
                temperature: 0.2
            }
        });

        const aiResponseText = res.text?.trim() || "I'm sorry, I can't answer that at the moment.";
        return aiResponseText;

    } catch (error) {
        console.error('Error generating AI response:', error.message);
        return "I'm sorry, I encountered an error while analyzing the research data.";
    }
};