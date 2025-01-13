import { PaperService } from '@/services/paper.service'
import { Work } from '@/types/document'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PageLayout } from '@/app/layouts/PageLayout'
import { WorkDocument } from '@/components/work/WorkDocument'
import { WorkRightSidebar } from '@/components/work/WorkRightSidebar'
import { generateSlug } from '@/utils/url'

interface Props {
  params: {
    id: string
    slug: string
  }
}

// This enables static generation
export const dynamic = 'force-static'
export const revalidate = 3600 // Revalidate every hour

async function getWork(id: string) {
  // Validate that the ID is numeric
  if (!/^\d+$/.test(id)) {
    notFound()
  }

  try {
    const work = await PaperService.get(id)
    return work
  } catch (error) {
    console.error('Error fetching work:', error)
    notFound()
  }
}

export async function generateMetadata(
  { params }: Props
): Promise<Metadata> {
  const work = await getWork(params.id)
  
  return {
    title: work.title,
    description: work.abstract,
  }
}

export default async function WorkPage({ params }: Props) {
  const work = await getWork(params.id)

  // Verify the slug matches
  const expectedSlug = generateSlug(work.title)
  if (params.slug !== expectedSlug) {
    notFound()
  }

  return (
    <PageLayout rightSidebar={<WorkRightSidebar work={work} />}>
      <WorkDocument work={work} />
    </PageLayout>
  )
} 