# Chat with PubMed

## Overview

This project implements an end-to-end medical literature research assistant. It integrates a React-based frontend with a Node.js/Express backend, bridging natural language queries to the PubMed (NCBI) database. The system utilizes Large Language Models (LLMs) to first translate clinical questions into optimized Boolean/MeSH search strings, retrieves the relevant abstracts, and finally synthesizes an evidence-based response grounded strictly in the retrieved literature.

## Tech Stack

* Frontend: React
* Backend: Node.js, Express
* Database: MongoDB
* Artificial Intelligence: Google Generative AI

## Installation and Setup

### Prerequisites

* Node.js (v18 or higher)
* MongoDB instance
* Google Generative AI API Key
* NCBI API Key (optional, but recommended for higher rate limits)

### Backend Configuration

1. Create and navigate to the backend directory:
   `mkdir backend && cd backend`
2. Install dependencies:
   `npm install`
3. Create a `.env` file in the `backend` directory with the following variables:
   ```text
   PORT=8000
   MONGO_URI=your_mongodb_connection_string
   GOOGLE_GENAI_API_KEY=your_gemini_api_key
   NCBI_API_KEY=your_ncbi_api_key
   ```
4. Start the backend server using nodemon for development:
   `npm run dev`

### Frontend Configuration

1. Create and navigate to the frontend directory:
   `mkdir frontend && cd frontend`
2. Install dependencies:
   `npm install`
3. Start the development server:
   `npm run dev`

## Engineering Justifications

### Hybrid Query Optimization

PubMed is keyword-based and struggles with natural language. I implemented an LLM-driven "translation" layer to map user questions into structured Boolean strings and MeSH(**Me**dical **S**ubject **H**eadings) terms. This ensures high recall and prevents the "zero results" issue common with raw natural language searches.

### Network Resilience

The NCBI API is prone to `ECONNRESET` and handshake timeouts, especially under high load. I stabilized the backend by implementing a dispatcher to override Node's default connection timeouts and a recursive retry mechanism with exponential backoff. Still the error occasionally returns, resulting in no abstracts or citations being fetched due to which the LLM is forced to reply that it doesn't have enough research to answer the question.

### Model-Agnostic LLM Service

To prevent downtime from API quotas, I built a flexible service layer that supports both Gemini (via system instructions) and Gemma (via prompt concatenation). This modularity allows the system to swap models without breaking the core logic.

### Evidence-Based Ground Truth

To eliminate medical hallucinations, the generation logic is strictly grounded in the retrieved PubMed abstracts. The system is explicitly instructed to cite specific PMIDs or refuse the answer if the provided literature is insufficient.

### Minimalist Custom UI

Pure CSS was used instead of heavier frameworks like Tailwind CSS to keep the frontend lightweight but still providing complete functionality.

## Scope for Improvement

* Integrate different LLMs (not just Gemini) and provide manual model selection in the UI, to further handle rate limiting.
* Provide functionality to delete or rename conversations in the sidebar.
* Cache boolean queries to reduce redundant LLM API calls for repeated queries.
