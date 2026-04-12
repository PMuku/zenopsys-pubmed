import dotenv from 'dotenv';

dotenv.config();

const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
const retmax = 3;

const pubMedSearch = async (query, baseParams) => {
    const url = `${baseUrl}esearch.fcgi?db=pubmed&retmax=${retmax}&term=${encodeURIComponent(query)}&${baseParams}`;
    
    const res = await fetch(url, {
        signal: AbortSignal.timeout(30000)
    });
    if (!res.ok) throw new Error(`esearch failed with status: ${res.status}`);

    const data = await res.json();

    return data?.esearchresult?.idlist || [];
};

const summaryFetch = async (pmids, baseParams) => {
    const url = `${baseUrl}esummary.fcgi?db=pubmed&id=${pmids.join(',')}&version=2.0&${baseParams}`;

    const res = await fetch(url, {
        signal: AbortSignal.timeout(30000)
    });
    if (!res.ok) throw new Error(`esummary failed with status: ${res.status}`);

    return await res.json();
};

export const fetchPubMedData = async (query) => {
    try {
        const tool = "chatapp";
        const email = process.env.PUBMED_EMAIL;
        const apiKey = process.env.PUBMED_API_KEY ? `&api_key=${process.env.PUBMED_API_KEY}` : '';
        const baseParams = `tool=${tool}&email=${email}${apiKey}&retmode=json`;

        const pmids = await pubMedSearch(query, baseParams);
        if (pmids.length === 0) return [];

        const summaries = await summaryFetch(pmids, baseParams);

        const citations = pmids.map(id => {
            const article = summaries.result[id];
            const authors = article.authors && article.authors.length > 0
                ? article.authors.map(a => a.name).join(', ') 
                : 'Unknown Authors';
            const year = article.pubdate ? article.pubdate.split(' ')[0] : 'Unknown';
            return {
                title: article.title || 'Untitled',
                authors: authors,
                year: year,
                pmid: id,
                url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`
            };
        });
        return citations;
    } catch (error) {
        console.error('Error fetching PubMed data:', error.message);
        console.error('Cause: ', error.cause);
        return [];
    }
};