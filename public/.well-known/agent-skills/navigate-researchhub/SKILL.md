---
name: navigate-researchhub
description: Find research funding opportunities, proposals, peer review bounties, and researcher profiles on ResearchHub. Use when a task involves funding open science, reviewing preprints or proposals, or looking up ResearchHub content by URL.
---

# Navigate ResearchHub

ResearchHub is an open science platform where researchers publish, peer review, fund, and discuss scientific research. Contributors earn ResearchCoin (RSC).

## Pages

- `https://researchhub.com/fund`: open Requests for Proposals (RFPs) and grants
- `https://researchhub.com/fund/proposals`: community research proposals seeking funding
- `https://researchhub.com/peer-review`: preprints and proposals open for paid peer review
- `https://researchhub.com/journal`: the ResearchHub Journal
- `https://researchhub.com/researchcoin`: ResearchCoin (RSC)
- `https://researchhub.com/endowment`: the ResearchHub Endowment and Funding Credits

## URL patterns

- Proposals: `/proposal/{id}/{slug}`
- RFPs (grants): `/rfp/{id}/{slug}`
- Posts: `/post/{id}/{slug}`
- Authors: `/author/{id}`

## Machine-readable resources

- `https://researchhub.com/llms.txt`: site overview, also served for `Accept: text/markdown` requests to `/`
- `https://researchhub.com/llms-full.txt`: extended site overview
- `https://researchhub.com/sitemap.xml`: static pages, public proposals (`/proposal/`), and RFPs (`/rfp/`). Papers and authors are not listed.
- RFP and proposal URLs return markdown when the request sends `Accept: text/markdown`
- `https://researchhub.com/.well-known/api-catalog`: API catalog (RFC 9727)
- `https://docs.researchhub.com/`: documentation

## Licensing

User-contributed content, excluding peer reviews, is licensed under CC BY 4.0.
