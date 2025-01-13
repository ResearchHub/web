import { Work, DocumentVersion, WorkType, Authorship, AuthorPosition } from '@/types/document'
import { transformAuthorProfile } from './user.dto'

export function transformAuthorship(raw: any): Authorship {
  return {
    authorProfile: transformAuthorProfile(raw),
    isCorresponding: raw.authorship?.is_corresponding || false,
    position: raw.authorship?.position as AuthorPosition || 'middle',
  }
}

export function transformDocumentVersion(raw: any): DocumentVersion {
  return {
    workId: raw.paper_id,
    version: raw.version,
    isLatest: raw.is_latest,
    publishedDate: raw.published_date,
    description: '',
  }
}

export function transformWork(raw: any): Work {
  return {
    id: raw.id,
    type: raw.work_type as WorkType,
    title: raw.title || raw.paper_title,
    slug: raw.slug,
    createdDate: raw.created_date,
    publishedDate: raw.paper_publish_date,
    authors: Array.isArray(raw.authors) ? raw.authors.map(transformAuthorship) : [],
    abstract: raw.abstract,
    doi: raw.doi,
    journal: raw.external_source ? {
      id: 0, // Not provided in current response
      name: raw.external_source,
      slug: '', // Not provided in current response
      image: '', // Not provided in current response
    } : undefined,
    topics: [], // Not provided in current response
    formats: [], // Not provided in current response
    license: raw.pdf_license,
    pdfCopyrightAllowsDisplay: raw.pdf_copyright_allows_display,
    figures: raw.first_preview ? [{
      url: raw.first_preview.file,
    }] : [],
    versions: Array.isArray(raw.version_list) ? raw.version_list.map(transformDocumentVersion) : [],
    metrics: {
      votes: raw.score || 0,
      comments: raw.discussion_count || 0,
      saves: 0, // Not provided in current response
      reviewScore: raw.unified_document?.reviews?.avg || 0,
      reviews: raw.unified_document?.reviews?.count || 0,
      earned: 0, // Not provided in current response
    }
  }
} 