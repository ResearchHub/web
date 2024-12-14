import { PaperDocument } from "@/components/paper/PaperDocument"
import { PaperRightSidebar } from "@/components/paper/PaperRightSidebar"
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
    abstract: "Bioactive sphingolipids (SLs) play critical roles in cellular function, including modifying the oncogenic potential of cancer cells. Depletion of the non-essential amino acid serine induces an intracellular shift from the generation of canonical SLs to non-canonical SLs known as deoxySLs, which can exert antitumor effects. Recent evidence has shown that restricting endogenous and exogenous sources of serine from cancer cells promotes antitumor immunity by activating the cyclic GMP-AMP Synthase-Stimulator of Interferon Genes (cGAS-STING) pathway. However, it is not known whether deoxySLs play a role in mediating this antitumor immune response. In this study, we demonstrated that depleting both externally supplied and internally synthesized serine from CT26 colon cancer cells maximally increased the levels of deoxySLs compared to removing either source alone. The ability of serine restriction to induce cytosolic accumulation of mitochondrial DNA (mtDNA) and subsequent activation of cGAS-STING components, including downstream Type I interferons (IFNs) was prevented by blocking deoxySL generation with the serine-palmitoyl transferase (SPT) inhibitor, myriocin. Direct administration of deoxysphinganine to cells induced mitochondrial dysfunction, in association with accumulation of cytosolic mtDNA, and increased expression of cGAS-STING components and Type I IFNs. A similar increase in IFNs was observed following mutation of SPT or supplementation of WT cells with alanine. Increasing deoxySLs in tumors through SPT mutation or feeding an alanine-enriched diet suppressed tumor growth in mice, while combining SPT mutation with a high alanine diet accentuated the antitumor effects. The observed tumor growth suppression was associated with increased infiltration of activated dendritic and cytotoxic T cells. Collectively, these findings reveal a novel role for deoxySLs in mediating antitumor immunity and provide support for the potential of using diet modification as an anticancer approach.",
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