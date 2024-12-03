import { PaperDocument } from "@/app/components/paper/PaperDocument"
import { PaperRightSidebar } from "@/app/components/paper/PaperRightSidebar"
import { PageLayout } from "@/app/layouts/PageLayout"
import { Paper } from "@/types/paper"
import { users } from '@/store/userStore';

export default function PaperPage({ params }: { params: { id: string, slug: string } }) {
  // In a real app, we'd fetch paper data here
  const paperData: Paper = {
    id: params.id,
    title: "Deoxysphingolipids Activate CGAS-STING In Colon Cancer Cells And Enhance Tumor Immunity",
    hub: {
      name: "Cancer Biology",
      slug: "cancer-biology"
    },
    authors: [
      { fullName: "Suchandrima Saha" },
      { fullName: "Fabiola Velázquez" },
      { fullName: "David Montrose" }
    ],
    contributors: [
      { 
        user: users.elenaRodriguez,
        amount: 5000,
        affiliation: "Department of Pathology, Renaissance School of Medicine"
      },
      { 
        user: users.mariaPatel,
        amount: 3500,
        affiliation: "Stony Brook University"
      },
      { 
        user: users.davidKumar,
        amount: 3000,
        affiliation: "Stony Brook Cancer Center"
      }
    ],
    journal: "bioRxiv (Cold Spring Harbor Laboratory)",
    isUnclaimed: true,
    publishDate: "Oct 18, 2024",
    doi: "10.1101/2024.10.16.618749",
    license: "cc-by-nc-nd",
    abstract: "Sample abstract text describing the research...",
    keywords: ["Biology", "Engineering", "Immunology"],
    pdfUrl: "storage.prod.researchhub.com/uploads/papers/2024/11/19/2024.10.16.618749.full.pdf",
    metrics: {
      votes: 8,
      comments: 12,
      citations: 3,
      views: 245,
      reposts: 2,
      saves: 3,
      reviewScore: 4.5,
      totalReviews: 6
    }
  }

  return (
    <PageLayout rightSidebar={<PaperRightSidebar paper={paperData} />}>
      <PaperDocument paper={paperData} />
    </PageLayout>
  )
} 