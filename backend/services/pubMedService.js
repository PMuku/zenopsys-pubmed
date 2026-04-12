import { XMLParser } from 'fast-xml-parser';
import dotenv from 'dotenv';

dotenv.config();

const parser = new XMLParser({
    ignoreAttributes: false,
    textNodeName: 'text',
});

const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/';
const retmax = 3;

const pubMedSearch = async (query, baseParams) => {
    const url = `${baseUrl}esearch.fcgi?db=pubmed&retmax=${retmax}&term=${encodeURIComponent(query)}&sort=relevance&${baseParams}&retmode=json`;
    
    const res = await fetch(url, {
        signal: AbortSignal.timeout(30000)
    });
    if (!res.ok) throw new Error(`esearch failed with status: ${res.status}`);

    const data = await res.json();

    return data?.esearchresult?.idlist || [];
};

const summaryFetch = async (pmids, baseParams) => {
    const url = `${baseUrl}efetch.fcgi?db=pubmed&id=${pmids.join(',')}&retmode=xml&${baseParams}`;

    const res = await fetch(url, {
        signal: AbortSignal.timeout(30000)
    });
    if (!res.ok) throw new Error(`efetch failed with status: ${res.status}`);

    const xmlData = await res.text();
    const data = parser.parse(xmlData);

    return data;
};

export const fetchPubMedData = async (query) => {
    try {
        const tool = "chatapp";
        const email = process.env.PUBMED_EMAIL;
        const apiKey = process.env.PUBMED_API_KEY ? `&api_key=${process.env.PUBMED_API_KEY}` : '';
        const baseParams = `tool=${tool}&email=${email}${apiKey}`;

        const pmids = await pubMedSearch(query, baseParams);
        if (pmids.length === 0) return { citations: [], abstracts: {} };

        const parsedXml = await summaryFetch(pmids, baseParams);
        let articles = parsedXml?.PubmedArticleSet?.PubmedArticle || [];
        if (!Array.isArray(articles)) articles = [articles];

        const citations = [];
        const abstracts = {};

        articles.forEach(x => {
            const article = x.MedlineCitation?.Article;
            const pmid = x.MedlineCitation?.PMID?.text || '';

            let authors = 'Unknown Authors';
            if (article.AuthorList && article.AuthorList.Author) {
                const authorArray = Array.isArray(article.AuthorList.Author) ? article.AuthorList.Author : [article.AuthorList.Author];
                authors = authorArray.map(a => `${a.LastName} ${a.Initials}`.trim()).join(', ');
            }

            const year = article?.Journal?.JournalIssue?.PubDate?.Year || 'Unknown Year';
            const title = article?.ArticleTitle || 'No Title';

            let abstract = 'No abstract available';
            const abstractData = article?.Abstract?.AbstractText;

            if (abstractData) {
                if (Array.isArray(abstractData)) {
                    abstract = abstractData.map(a => (typeof a === 'string') ? a : (a.text || '')).join('\n');
                } else if (typeof abstractData === 'object') {
                    abstract = abstractData.text || '';
                } else {
                    abstract = abstractData;
                }
            }

            citations.push({
                title: title,
                authors: authors,
                year: year,
                pmid: pmid,
                url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
            });

            abstracts[pmid] = abstract;
        });
        
        return { citations, abstracts };

    } catch (error) {
        console.error('Error fetching PubMed data:', error.message);
        console.error('Cause: ', error.cause);
        return { citations: [], abstracts: {} };
    }
};