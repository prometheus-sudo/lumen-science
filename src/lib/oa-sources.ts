export const OA_SOURCES = [
  { id: "arxiv", name: "arXiv", what: "Open preprints in physics, math, CS, astronomy, and quantitative biology. Free PDFs." },
  { id: "pmc", name: "PubMed Central", what: "NIH open-access full-text biomedical and life-science archive via Europe PMC." },
  { id: "doaj", name: "DOAJ", what: "Articles from journals in the Directory of Open Access Journals." },
  { id: "plos", name: "PLOS", what: "Public Library of Science — all articles under Creative Commons." },
  { id: "zenodo", name: "Zenodo", what: "CERN open repository for papers and supporting files." },
  { id: "crossref-cc", name: "Creative Commons (Crossref)", what: "Journal articles with a Creative Commons license registered at Crossref." },
  { id: "preprints", name: "Life-science preprints", what: "bioRxiv, medRxiv, and related servers via Europe PMC." },
] as const;

export const OA_POLICY =
  "Lumen only retrieves works that are open to read: public-domain, Creative Commons, repository copies, and preprint servers. Paywalled publisher PDFs are never fetched.";
