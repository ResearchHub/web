import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const samplePapers = [
  {
    title: "Quantum Computing: A New Era of Computation",
    abstract: "This paper explores the fundamental principles of quantum computing and its potential impact on computational capabilities. We discuss qubits, quantum gates, and potential applications in cryptography and optimization.",
    doi: "10.1234/qc.2024.001",
    publishedAt: new Date('2024-01-15'),
  },
  {
    title: "Machine Learning in Healthcare: Current Applications and Future Prospects",
    abstract: "A comprehensive review of machine learning applications in healthcare, including diagnosis, treatment planning, and drug discovery. We analyze both successes and challenges in implementing AI-driven healthcare solutions.",
    doi: "10.1234/ml.2024.002",
    publishedAt: new Date('2024-01-10'),
  },
  {
    title: "Climate Change Impact on Biodiversity: A Global Analysis",
    abstract: "This study presents a global analysis of how climate change affects biodiversity across different ecosystems. We provide evidence-based predictions for species adaptation and extinction risks.",
    doi: "10.1234/cc.2024.003",
    publishedAt: new Date('2024-01-05'),
  },
  {
    title: "Neural Networks in Natural Language Processing",
    abstract: "An examination of recent advances in applying neural networks to natural language processing tasks. We focus on transformer architectures and their impact on language understanding.",
    doi: "10.1234/nlp.2024.004",
    publishedAt: new Date('2023-12-28'),
  },
  {
    title: "Sustainable Energy Solutions for Urban Development",
    abstract: "Analysis of sustainable energy implementations in urban environments, including solar integration, smart grids, and energy-efficient building designs.",
    doi: "10.1234/se.2024.005",
    publishedAt: new Date('2023-12-20'),
  },
  {
    title: "Blockchain Technology in Supply Chain Management",
    abstract: "Investigation of blockchain applications in improving supply chain transparency, traceability, and efficiency. Case studies from various industries are presented.",
    doi: "10.1234/bc.2024.006",
    publishedAt: new Date('2023-12-15'),
  },
  {
    title: "Advances in CRISPR Gene Editing Technology",
    abstract: "Review of recent developments in CRISPR-Cas9 gene editing, including improved precision, reduced off-target effects, and therapeutic applications.",
    doi: "10.1234/ge.2024.007",
    publishedAt: new Date('2023-12-10'),
  },
  {
    title: "Artificial Intelligence in Autonomous Vehicles",
    abstract: "Comprehensive analysis of AI applications in autonomous vehicle technology, including perception, decision-making, and safety systems.",
    doi: "10.1234/av.2024.008",
    publishedAt: new Date('2023-12-05'),
  },
  {
    title: "Space Exploration: Mars Colonization Challenges",
    abstract: "Technical analysis of challenges in Mars colonization, including life support systems, radiation protection, and psychological factors in long-term space missions.",
    doi: "10.1234/sp.2024.009",
    publishedAt: new Date('2023-11-30'),
  },
  {
    title: "Cybersecurity in IoT Devices",
    abstract: "Examination of security vulnerabilities in IoT devices and proposed solutions for improving device security and data protection.",
    doi: "10.1234/cs.2024.010",
    publishedAt: new Date('2023-11-25'),
  },
];

async function main() {
  console.log('Start seeding...');
  
  // Clear existing data
  await prisma.paper.deleteMany();
  
  // Insert sample papers
  for (const paper of samplePapers) {
    const createdPaper = await prisma.paper.create({
      data: paper,
    });
    console.log(`Created paper with id: ${createdPaper.id}`);
  }
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 