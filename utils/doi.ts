/**
 * DOI regex pattern based on CrossRef guidelines
 * https://www.crossref.org/blog/dois-and-matching-regular-expressions/
 */
export const isDOI = (text: string): boolean => {
  if (!text || typeof text !== 'string') {
    return false
  }

  // Remove common DOI URL prefixes
  const cleanedText = text.replace(/^https?:\/\/(dx\.)?doi\.org\//, '')

  // Simpler DOI pattern that matches 10.XXXX/any.characters
  const DOI_REGEX = /10\.\d{4,}\/[-._;()\/:a-zA-Z0-9]+/
  const match = cleanedText.match(DOI_REGEX)

  return Boolean(match)
} 