# AssistCone

**Turn website content into a searchable knowledge base for an embeddable AI support assistant.**

AssistCone is a RAG-based support agent that uses website content to answer customer questions. It brings together Crawlee/Playwright ingestion implementations, OpenAI embeddings and inference, Qdrant retrieval, stored conversations, a browser widget, and human escalation.

## Why this project exists

Visitors often need a specific answer that is already somewhere on a website, but finding it can mean searching several pages or contacting support. Meanwhile, support teams spend time answering repeated questions about the same information.

AssistCone was built to make a business's existing website content usable as a support knowledge base. Instead of asking visitors to navigate every page or asking a support team to answer the same questions repeatedly, it retrieves relevant content and uses OpenAI inference to generate an answer in a chat interface. Conversation history is stored, and visitors can request human assistance when the automated answer is insufficient.

The product centres on using a business's existing content as the starting point for support, rather than requiring every answer to be written into a separate FAQ system.

## Development results

| Metric | Reported result |
| --- | --- |
| Website pages crawled and embedded into Qdrant | 50+ |
| Ingestion time for that run | Under 60 seconds |
| Chat latency | Under 1.5 seconds |

These results were reported by the author from development testing. No benchmark harness, hardware details, or latency percentile is included in the repository. Results depend on page content, network conditions, and provider response times.

The repository contains a Crawlee/Playwright ingestion implementation in `lib/crawler.ts`, while the current API uses the Cheerio implementation in `src/lib/crawler.ts`. The reported ingestion result describes the project's development testing; it should not be interpreted as a claim that the currently wired route automatically discovers 50+ pages from one URL.

## What is implemented

- **Agent management:** create and list agents associated with a Clerk account.
- **Setup wizard:** configure sources, model preferences, features, escalation settings, and widget appearance.
- **Website ingestion:** fetch content, split it into chunks, generate embeddings, and store them in Qdrant.
- **Crawl progress:** persist page-processing status in MongoDB and poll it from the interface.
- **Retrieval-augmented chat:** search the knowledge collection with an `agentId` filter and use retrieved text to answer questions.
- **Conversation memory:** load recent messages for the chat request and persist user/assistant exchanges.
- **Playground:** test an agent from the dashboard.
- **Embeddable widget:** a JavaScript chat launcher with chat and escalation requests.
- **Escalation:** mark a conversation as escalated, record a system message, and attempt a Resend email when configured.

## How the AI pipeline works

During ingestion, the application extracts page text, generates `text-embedding-3-small` embeddings, and stores vectors with the source URL, chunk text, and agent ID.

At chat time:

1. Embed the visitor's question with `text-embedding-3-small`.
2. Retrieve the top three matching chunks for that agent from Qdrant.
3. Load recent conversation history from MongoDB.
4. Supply the retrieved context and history to `gpt-4o-mini`.
5. Store and return the answer and conversation ID.

The prompt asks the assistant to acknowledge missing information or offer escalation. This is a prompt-level instruction, not a guarantee of answer correctness.

## Stack

| Layer | Technology |
| --- | --- |
| Application | Next.js 16.1.6, React 19.2.3, TypeScript |
| Interface | Tailwind CSS 4, shadcn/ui, Lucide |
| Authentication | Clerk |
| Application data | MongoDB and Mongoose |
| Vector search | Qdrant |
| Embeddings and answers | OpenAI |
| Crawling | Crawlee; Cheerio and Playwright implementations |
| Escalation email | Resend |

## Run locally

You need a Node.js/npm installation compatible with the lockfile, MongoDB, Qdrant, Clerk credentials, and an OpenAI API key with access to the models used by the code. Resend is optional for testing the escalation state change, but required for actual escalation emails.

```bash
git clone https://github.com/zaidajani/assistcone.git
cd assistcone
npm ci
```

Create `.env.local`:

```dotenv
MONGODB_URI=mongodb://localhost:27017/assistcone
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
OPENAI_API_KEY=your_openai_api_key
QDRANT_URL=http://localhost:6333
QDRANT_API_KEY=your_qdrant_api_key
RESEND_API_KEY=your_resend_api_key
```

The active `src/lib/qdrant.ts` accepts a local Qdrant instance without an API key. The older root-level Qdrant helper requires both URL and key, so provide them if using those scripts.

```bash
npm run dev
```

Open [localhost:3000/agents/new](http://localhost:3000/agents/new), sign in, add a source URL, and save the agent. Use its playground at `/agents/<agent-id>/playground` to test retrieval and answers.

The knowledge collection is `assistcone_knowledge`, with 1,536-dimensional cosine vectors and an `agentId` payload index. The active crawler initialises it during ingestion.

## Widget integration

The widget reads its agent ID from the script tag:

```html
<script
  src="http://localhost:3000/widget.js"
  data-agent-id="YOUR_AGENT_ID"
></script>
```

This demonstrates the intended local embed contract. Before hosting it, update the hardcoded `BASE_URL` in `public/widget.js` to your application origin and verify the script runs and cross-origin API requests work on the target website. Changing only the script URL does not change the API origin used by the widget.

Saved widget branding is not currently fetched by the standalone script; its appearance is largely hardcoded.

## Main endpoints

| Endpoint | Purpose |
| --- | --- |
| `GET /api/agents` | List the signed-in user's agents |
| `POST /api/agents` | Save agent configuration |
| `/api/agents/[id]` | Individual agent operations |
| `POST /api/crawl` | Start content ingestion |
| `GET /api/crawl/status?agentId=...` | Read ingestion progress |
| `POST /api/chat` | Answer a question and persist conversation messages |
| `POST /api/escalate` | Record escalation and attempt a support email |

The chat request expects `message` and `agentId`, with optional `conversationId` and `visitorId`. It returns `response`, `conversationId`, and retrieval debug counts.

## Repository guide

| Path | Purpose |
| --- | --- |
| `src/app/(dashboard)/` | Agent setup, playground, and dashboard pages |
| `src/app/api/` | Agent, crawler, chat, and escalation routes |
| `src/lib/` | Active runtime helpers and Mongoose models |
| `public/widget.js` | Standalone browser widget |
| `lib/` | Alternate/earlier helper implementations |
| `scripts/` | Qdrant inspection, repair, and API debugging tools |

The `@/*` alias resolves to `src/*`. The API routes therefore use **`src/lib/crawler.ts`**, a Cheerio crawler. The separate root `lib/crawler.ts` implements Playwright rendering and same-host link discovery, but is not the crawler imported by the current API route.

## Current prototype boundaries

- The active crawler processes supplied start URLs without enqueueing discovered links. Its page-limit setting does not currently make it a full-site crawler.
- Ingestion starts in the request process without a durable worker queue; an interrupted process can interrupt ingestion.
- The chat route uses `gpt-4o-mini` directly. Saved model/tone selections and several feature switches are not wired into inference.
- Image support, repository/document ingestion, and rendered source citations are not complete features merely because they appear in the setup interface.
- Escalation currently uses hardcoded AssistCone sender/support addresses and a conversation link. Configure these for a real deployment and verify your Resend sender domain. Without a Resend key, the route logs a mock email.
- Crawled content and chat data are sent to external AI services. MongoDB stores conversations; Qdrant stores content chunks and vectors.

## Development

```bash
npm run lint
npm run build
npm start
```

These are the declared commands. This documentation is based on source inspection, not a completed end-to-end deployment test.

## Author and licence

Built by [Zaid Ajani](https://github.com/zaidajani).

No licence file is present in this repository.
