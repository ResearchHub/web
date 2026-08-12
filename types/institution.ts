export interface Institution {
  id: string | number;
  name: string;
  location?: string;
  hIndex?: number;
  worksCount?: number;
  imageUrl?: string;
  imageThumbnailUrl?: string;
}

export interface InstitutionResponse {
  id: number;
  display_name: string;
  city?: string;
  region?: string;
  country_code?: string;
  h_index?: number;
  works_count?: number;
  image_url?: string;
  image_thumbnail_url?: string;
}

export interface InstitutionSuggestionsResponse {
  suggestion_phrases__completion?: Array<{
    options?: Array<{ _source?: InstitutionResponse }>;
  }>;
}

export function transformInstitution(response: InstitutionResponse): Institution {
  return {
    id: response.id,
    name: response.display_name,
    location: [response.city, response.region, response.country_code].filter(Boolean).join(', '),
    hIndex: response.h_index,
    worksCount: response.works_count,
    imageUrl: response.image_url,
    imageThumbnailUrl: response.image_thumbnail_url,
  };
}

export function transformInstitutions(response: InstitutionSuggestionsResponse): Institution[] {
  const suggestions = response.suggestion_phrases__completion?.[0]?.options ?? [];
  return suggestions.flatMap((suggestion) =>
    suggestion._source ? [transformInstitution(suggestion._source)] : []
  );
}
