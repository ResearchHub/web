# ResearchHub auth.md

How AI agents authenticate with ResearchHub.

## Audience

AI agents and MCP clients using ResearchHub's public tools, such as searching open research funding opportunities.

## Registration

None. ResearchHub does not register agents or issue agent credentials yet.

## Supported methods

- **Anonymous**: the ResearchHub MCP server accepts requests without credentials. Its endpoint is listed in the server card at https://researchhub.com/.well-known/mcp/server-card.json.

## Using credentials

Send requests without an `Authorization` header. Anonymous requests see only public content and are rate limited.
