# Search API Requirements Document

## Overview

This document outlines the requirements for implementing a comprehensive search API endpoint to support the ResearchHub search page with advanced filtering, sorting, and faceted search capabilities.

## Current State

The existing `/api/search/suggest/` endpoint provides basic search suggestions but lacks:
- Full search results with pagination
- Advanced filtering capabilities
- Sorting options
- Faceted search with aggregations
- Highlighted search terms
- Combined filter support

## Required API Endpoint

### Endpoint: `/api/search/`

**Purpose**: Full-featured search with filtering, sorting, and pagination

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |
| `page` | number | No | Page number (default: 1) |
| `page_size` | number | No | Results per page (default: 20) |
| `sort` | string | No | Sort method (default: relevance) |
| `year_min` | number | No | Minimum publication year |
| `year_max` | number | No | Maximum publication year |
| `citation_min` | number | No | Minimum citation count |
| `open_access` | boolean | No | Filter for open access only |
| `content_types` | string | No | Comma-separated content types |
| `hubs` | string | No | Comma-separated hub IDs |

### Sort Options

- `relevance` - Most relevant to search query (default)
- `newest` - Most recently published/created
- `hot` - Highest hot score
- `upvoted` - Highest upvote count

### Response Format

```json
{
  "count": 157,
  "documents": [
    {
      "id": 367,
      "type": "paper",
      "title": "Adversarial Machine Learning at Scale",
      "snippet": "Adversarial <mark>Machine Learning at </mark>Scale",
      "matched_field": "title",
      "authors": ["Alexey Kurakin", "Ian Goodfellow", "Samy Bengio"],
      "created_date": null,
      "paper_publish_date": "2016-01-01",
      "hot_score": 0,
      "score": 0,
      "_search_score": 47.945744,
      "hubs": [],
      "doi": "10.48550/arxiv.1611.01236",
      "citations": 1977,
      "is_open_access": null,
      "slug": null,
      "document_type": null
    }
  ],
  "people": [
    {
      "id": 197,
      "full_name": "Jonathan Marchini",
      "profile_image": "",
      "snippet": null,
      "matched_field": null,
      "headline": {"title": null},
      "institutions": [
        {"id": 12, "name": "University of Oxford"}
      ],
      "user_reputation": 0,
      "user_id": null,
      "_search_score": 17.968779
    }
  ],
  "aggregations": {
    "years": [
      {"key": "2025", "doc_count": 1}
    ],
    "hubs": [],
    "content_types": [
      {"key": "paper", "doc_count": 151},
      {"key": "post", "doc_count": 1}
    ]
  }
}
```

## Required Backend Features

### 1. Full-Text Search
- Search across multiple fields (title, abstract, content, author names)
- Support for phrase matching with quotes
- Fuzzy matching for typos
- Multi-field boosting (title matches ranked higher than abstract)

### 2. Faceted Search
- Real-time aggregations for filter counts
- Support for year ranges, content types, hubs, citations
- Dynamic aggregation updates based on active filters

### 3. Filtering
- **Year Range**: Filter by publication year with min/max
- **Citation Count**: Minimum citation threshold
- **Content Type**: Filter by paper, post, grant, etc.
- **Hub/Topic**: Multi-select topic filtering
- **Open Access**: Boolean filter for open access papers
- **Combined Filters**: All filters work together with AND logic

### 4. Sorting
- **Relevance**: Elasticsearch relevance scoring with field boosting
- **Newest**: Sort by publication/creation date (descending)
- **Hot Score**: Sort by ResearchHub hot score algorithm
- **Upvoted**: Sort by upvote count (descending)

### 5. Highlighting
- Highlight matched terms in snippets using `<mark>` tags
- Show which fields matched (title, abstract, etc.)
- Generate contextual snippets around matches

### 6. Pagination
- Efficient cursor-based pagination
- Support for large result sets
- Consistent ordering across pages

### 7. Performance Requirements
- Response time < 200ms for typical queries
- Support for concurrent requests
- Efficient indexing for fast searches

## Data Model Requirements

### Document Indexing
- Papers: title, abstract, authors, DOI, publication date, citations, hubs
- Posts: title, content, authors, creation date, hubs
- Grants: title, description, organization, amount, deadline, status
- Authors: name, institutions, headline, reputation

### Aggregation Fields
- Years: Extract year from publication/creation dates
- Content Types: Map document types to searchable categories
- Hubs: Index hub relationships for filtering
- Citations: Index citation counts for range filtering

## Error Handling

### Validation
- Required query parameter validation
- Sort parameter validation against allowed values
- Numeric parameter validation (years, citations, page)
- Parameter range validation

### Error Responses
```json
{
  "error": "Query parameter 'q' is required"
}
```

```json
{
  "error": "Invalid sort parameter. Must be one of: relevance, newest, hot, upvoted"
}
```

## Implementation Notes

### Elasticsearch Configuration
- Configure appropriate analyzers for different languages
- Set up field mappings with proper data types
- Configure relevance scoring with field boosting
- Set up aggregations for faceted search

### Index Management
- Regular index updates for new content
- Incremental updates for content changes
- Index optimization for performance

### Monitoring
- Track search query performance
- Monitor error rates and response times
- Log popular search terms and filters

## Testing Requirements

### Unit Tests
- Search query parsing and validation
- Filter parameter processing
- Sort parameter handling
- Aggregation calculations

### Integration Tests
- End-to-end search functionality
- Filter combinations
- Pagination behavior
- Error handling

### Performance Tests
- Load testing with concurrent requests
- Large result set handling
- Response time benchmarks

## Migration Strategy

### Phase 1: Basic Search
- Implement basic full-text search
- Add simple filtering (content type, year)
- Basic sorting options

### Phase 2: Advanced Features
- Add faceted search with aggregations
- Implement advanced filters
- Add search highlighting

### Phase 3: Optimization
- Performance optimization
- Advanced relevance scoring
- Caching implementation

## Future Enhancements

### Advanced Search Features
- Boolean search operators (AND, OR, NOT)
- Field-specific search (title:, author:, etc.)
- Saved searches
- Search suggestions/autocomplete

### Analytics
- Search analytics dashboard
- Popular search terms tracking
- Filter usage statistics
- User search behavior analysis

### Personalization
- Personalized search results
- User preference learning
- Recommended content based on search history
