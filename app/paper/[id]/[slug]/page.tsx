import { PaperDocument } from "@/app/components/paper/PaperDocument"

export default function PaperPage({ params }: { params: { id: string, slug: string } }) {
  // In a real app, we'd fetch paper data here
  const paperData = {
    id: params.id,
    title: "Deoxysphingolipids Activate CGAS-STING In Colon Cancer Cells And Enhance Tumor Immunity",
    authors: [
      { name: "Suchandrima Saha", verified: true },
      { name: "Fabiola Velázquez", verified: false },
      { name: "David Montrose", verified: true }
    ],
    journal: "bioRxiv (Cold Spring Harbor Laboratory)",
    publishDate: "Oct 18, 2024",
    doi: "10.1101/2024.10.16.618749",
    license: "cc-by-nc-nd",
    abstract: "Sample abstract text describing the research...",
    keywords: ["Biology", "Engineering", "Immunology"],
    pdfUrl: "https://storage.prod.researchhub.com/uploads/papers/2024/11/19/2024.10.16.618749.full.pdf",
    metrics: {
      votes: 8,
      comments: 12,
      citations: 3,
      views: 245
    }
  }

  return <PaperDocument paper={paperData} />
} 