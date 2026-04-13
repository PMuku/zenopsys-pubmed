import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({ apiKey: apiKey });

const model = 'gemini-2.5-flash';

export const generateAiResponse = async (userMessage, abstracts, history = []) => {
    try {
        const hasData = Object.keys(abstracts).length > 0;

        let contextString = "No research articles found.";
        if (hasData) {
            contextString = Object.entries(abstracts).map(([pmid, text]) => {
                return `--- Abstract (PMID: ${pmid}) ---\n${text}\n`;
            }).join('\n');
        }
        
        const historyContext = history.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n');
        const sysPrompt = `You are an expert Medical Literature Synthesizer. Your audience consists of biomedical professionals, clinicians, and researchers. Your job is to answer their natural language medical questions using ONLY the provided PubMed abstracts.
CONVERSATION HISTORY (FOR CONTEXT):
${historyContext}
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

// Function to optimise user's natural language query into Pubmed-safe boolean query using LLM
export const optimizeMedicalQuery = async (userMessage, history = []) => {
    try {

        const historyContext = history.map(msg => `${msg.role.toUpperCase()}: ${msg.content}`).join('\n');
        const sysPrompt = `You are a biomedical query optimization agent. Your primary task is to resolve any pronouns or context (e.g., "that", "those", "previous results") based on the conversation history before building the PubMed Boolean query.
CONVERSATION HISTORY:
${historyContext}
## Step 0: Context Resolution
If the user's message is a follow-up, combine it with the previous topic to form a complete query intent and re-query with a narrower scope.
## Step 1: Extract PICO Elements
Identify: Population (P), Intervention (I), Comparator (C), Outcomes (O), Study type.
## Step 2: Build a HIGH-RECALL Base Query
Use MeSH terms ONLY for the main disease if confident. Use free text for drugs and outcomes initially. Include synonyms using OR.
Example structure: (Population) AND (Intervention) [AND Comparator]
## Step 3: Expand with Synonyms
Add synonyms using OR for diseases and drugs.
## Step 4: Iterative Constraint Addition
Add filters ONE at a time: 1. Comparator 2. Outcomes 3. Study type.
## Step 5: Avoid Over-Constraint
DO NOT require multiple MeSH terms simultaneously or combine too many AND conditions.
## Step 6: Zero-Result Recovery Strategy
Remove outcome constraints or replace MeSH terms with free text if it risks zero results. Prefer relevant results over empty results.
## Key Principle
PubMed is NOT a semantic search engine. Queries must be flexible, redundancy-tolerant, and biased toward recall.
## Step 7: Final Output
You MUST return your response as a valid JSON object so the backend API can parse it.
Format:
{
  "query": "YOUR_OPTIMIZED_PUBMED_BOOLEAN_STRING",
  "explanation": "Explanation of tradeoffs",
  "relaxedConstraints": ["list", "of", "relaxed"]
}`;

        const res = await ai.models.generateContent({
            model: model,
            contents: userMessage,
            config: {
                systemInstruction: sysPrompt,
                temperature: 0.1
            }
        });

        let responseText = res.text?.trim() || "";
        responseText = responseText.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();

        try {
            const parsedData = JSON.parse(responseText);
            if (parsedData && parsedData.query) {
                console.log("LLM Optimization Tradeoffs:", parsedData.explanation);
                return parsedData.query;
            }
        } catch (e) {
            console.error('Failed to parse AI query JSON:', e);
            // Fallback: if it just returned the raw string somehow
            return responseText.replace(/^["']|["']$/g, '');
        }

        return userMessage;
    } catch (error) {
        console.error('Error optimizing medical query:', error.message);
        return userMessage; // Fallback gracefully
    }
};