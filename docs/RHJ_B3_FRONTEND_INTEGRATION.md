# RHJ Journal Journey: Frontend Integration Through B3

This guide covers only the frontend integration needed through **B3: accepting a
funded proposal into a Registered Report draft, then publishing that draft**.

It intentionally stops here. Do not use this document for later work such as
results updates, the new journal feed, tracker UI, stage badges, notifications,
or search/indexing.

## Current Product Shape

The backend flow is now:

1. A proposal is approved and gets a `ResearchJourney`.
2. A fundraise for that proposal is completed and funded.
3. The user follows an "accept journal entry" link.
4. The frontend calls the accept endpoint.
5. The backend creates an unpublished notebook `Note` draft for a Registered
   Report.
6. The user edits the note in the notebook.
7. The user publishes that note.
8. Publishing creates the actual `ResearchhubPost(REGISTERED_REPORT)`.

The accept endpoint **does not publish** and **does not create a
`ResearchhubPost`**. It only creates a draft `Note`.

## Key Concepts

### Proposal

The proposal is the funded preregistration post:

```text
ResearchhubPost(document_type="PREREGISTRATION")
```

The proposal is connected to a `Fundraise` through its
`ResearchhubUnifiedDocument`.

### Registered Report Draft

The draft created by the accept endpoint is a notebook note:

```text
Note(document_type="REGISTERED_REPORT")
Note.unified_document.document_type == "NOTE"
```

It appears in the user's notebook and is editable before publication.

### Registered Report Post

The actual Registered Report is created later, when the note is published:

```text
ResearchhubPost(document_type="REGISTERED_REPORT")
```

That post is attached to the proposal's journey.

## Frontend Flow

### 1. User Lands On Accept Page

The notification branch should send the user to a frontend route containing:

```text
user_id
fundraise_id
```

Example frontend URL:

```text
/accept_journal_entry?user_id=55&fundraise_id=23
```

The frontend should require an authenticated user before calling the API.

### 2. Accept The Journal Entry

Call:

```http
POST /api/researchhubpost/accept_journal_entry/?user_id=55&fundraise_id=23
```

Request body can be empty. The backend currently accepts the values from query
params or request body.

Equivalent JSON body shape:

```json
{
  "user_id": 55,
  "fundraise_id": 23
}
```

Required authentication:

```text
Authenticated user must be user_id.
```

### 3. Backend Validation

The backend accepts the journal entry only when all checks pass:

- `user_id` exists and matches the authenticated user.
- `fundraise_id` exists.
- the fundraise belongs to that user.
- the fundraise status is `COMPLETED`.
- the fundraise has received funding.
- the fundraise belongs to a valid proposal.
- the proposal journey does not already have a Registered Report.

Moderators/admins cannot accept another user's entry.

### 4. Accept Response

Success status:

```text
200
```

Response body is the normal `NoteSerializer` response, plus `fundraise_id`.

Important fields for the frontend:

```json
{
  "id": 123,
  "title": "Registered Report: Example proposal title",
  "document_type": "REGISTERED_REPORT",
  "access": "PRIVATE",
  "post": null,
  "fundraise_id": 23,
  "journey_id": 42,
  "proposal_id": 456
}
```

Important meaning:

- `id` is the `note_id` to open in the notebook.
- `proposal_id` is required later when publishing the Registered Report.
- `journey_id` is available for local state/debugging, but is not needed in the
  publish payload.
- `document_type` should be `REGISTERED_REPORT`.
- `post` should be `null`, because the note is still unpublished.
- `access` should be `PRIVATE`.

After this succeeds, route the user into the notebook/editor for that note.

### 5. Draft Content

The backend seeds the draft from the funded proposal:

- note title: `Registered Report: {proposal.title}`
- note type: `REGISTERED_REPORT`
- note plain text: copied from `proposal.renderable_text`
- hubs: copied from the proposal's unified document

Current caveat: the backend currently seeds `NoteContent.plain_text`. If the
editor needs rich notebook JSON or full source content to show an exact editable
duplicate, the backend may need a follow-up change to seed `NoteContent.json` or
`NoteContent.src`.

## Publishing The Registered Report

When the user clicks publish from the notebook, call the existing post publish
endpoint:

```http
POST /api/researchhubpost/
```

Required payload fields:

```json
{
  "document_type": "REGISTERED_REPORT",
  "note_id": 123,
  "proposal_id": 456,
  "title": "Registered report title",
  "renderable_text": "Registered report body...",
  "full_src": "# Registered report"
}
```

Optional fields supported by the existing post-create path:

```json
{
  "editor_type": "CK_EDITOR",
  "image": "...",
  "preview_img": "..."
}
```

Publishing does create:

```text
ResearchhubPost(document_type="REGISTERED_REPORT")
```

Publishing also:

- creates a new `ResearchhubUnifiedDocument` for the report post.
- marks the report unified document `APPROVED`.
- copies hubs from the proposal.
- copies authors from the proposal.
- attaches the report post to the proposal's `ResearchJourney`.
- enforces one Registered Report per journey.

## Publish-Time Validation

The publish endpoint re-checks the important rules. It rejects the request when:

- the note does not exist.
- the note does not belong to the authenticated user.
- the note is not a `REGISTERED_REPORT` draft.
- the note is already published.
- the proposal does not belong to the authenticated user.
- the proposal is not funded by a completed funded fundraise.
- the proposal journey already has a Registered Report.

## Error Handling

Validation failures return:

```text
400
```

Typical response shape:

```json
{
  "error": "Fundraise is not completed."
}
```

Authentication failures return:

```text
401 or 403
```

Frontend should show a simple blocking error and should not route the user into
the editor unless the accept call returns `200`.

## What The Frontend Should Not Build Yet

Do not build against these later-phase concepts from this guide:

- results updates
- Registered Report results publishing
- new post-based journal feed
- journey tracker/pizza tracker
- stage badges
- journal feed filtering
- new search/indexing behavior
- notification payload contract

For now, the only frontend contract is:

1. accept journal entry from `user_id` and `fundraise_id`.
2. open the returned note draft.
3. publish that note with `document_type=REGISTERED_REPORT`, `note_id`, and
   `proposal_id`.





NOTES:
every time you add a stage, check for concise, idiomatic, canonical, user readability as if it reads like English, naming conventions for functions and variables are easily readable and efficient like reading an english sentence, dryness, remove redundancies, make sure it follows the standards and protocols used throughout the rest of the site, efficiency, optimization, and cohesiveness.  do a thorough check and be as harsh as possible.  Make sure all functions names are verbs for any functions you  create, make sure each function has a docstring, and make sure each function is concise and idiomatic. Do not attempt to run npm servers/services for testing, as all testing will be done manually.
