import { PaperService } from '@/services/paper.service'
import { notFound, redirect } from 'next/navigation'
import { buildWorkUrl } from '@/utils/url'

interface Props {
  params: {
    id: string
  }
}

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

export default async function WorkPage({ params }: Props) {
  const work = await getWork(params.id)
  redirect(buildWorkUrl(work.id, work.title))
} 