import { NextRequest, NextResponse } from 'next/server'
import { PaperService } from '@/services/paper.service'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const encodedDoi = searchParams.get('doi')

  if (!encodedDoi) {
    return new Response('Missing DOI parameter', { status: 400 })
  }

  const doi = decodeURIComponent(encodedDoi)

  try {
    const work = await PaperService.get(doi)
    return NextResponse.redirect(new URL(`/work/${work.id}`, request.url))
  } catch (error) {
    console.error('Error fetching work by DOI:', error)
    return new Response('Work not found', { status: 404 })
  }
} 