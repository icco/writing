# IndieWeb Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add parseable IndieWeb identity/posts, incoming Responses, and safe resumable outgoing webmentions including historical backfill.

**Architecture:** Three independently testable subsystems: HTML microformats, server-side cached incoming data with a pure rendering component, and a scheduled CLI sender with durable per-target state. Outgoing delivery observes production rather than assuming the container build deployed.

**Tech Stack:** Next.js, TypeScript, Contentlayer, Vitest, Node >=26, pnpm, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-indieweb-design.md` (supersedes the earlier plan-mode draft).

## Global Constraints

- Preserve existing appearance except for the new Responses section.
- No client JavaScript for reactions; never insert remote HTML.
- No sending from builds, previews, draft pages, or tests.
- No real outgoing POSTs during implementation verification.
- Retain 90% coverage thresholds; do not run prepare-posts.
- Source origin is https://writing.natwelch.com; public incoming API only.
- pnpm; Node >=26; double quotes, 2 spaces, no semicolons.
- All tests mock network unless explicitly performing read-only verification.

## Review Focus

1. HTML-only or href-only edits must not be missed by sender fingerprints (Task 5).
2. Interrupted partial deliveries must not mark remaining targets delivered (Task 5).
3. A missing body wrapper during deployment must never generate deletion notifications (Task 5).
4. DNS rebinding and mapped IPv6 must not bypass outbound private-network blocking (Task 4).
5. Nested reaction microformats must not replace the author's name/content (Task 3).

## File structure

- `src/lib/indieweb.ts`: canonical URL/identity constants and helpers.
- `src/components/AuthorCard.tsx`: shared explicit h-card properties.
- Existing layout, post, list pages and PostCard: semantic markup only.
- `src/lib/webmentions.ts`: receiving types, parsing, grouping, cached fetching.
- `src/components/Webmentions.tsx`: synchronous server rendering.
- `src/lib/webmentionSender/network.ts`: bounded SSRF-safe requests.
- `src/lib/webmentionSender/discovery.ts`: endpoint discovery and form delivery.
- `src/lib/webmentionSender/state.ts`: extraction/fingerprints and pure state decisions.
- `src/lib/webmentionSender/runner.ts`: source iteration and persisted progress.
- `scripts/send-webmentions.ts`: CLI only, no untested business logic.
- Adjacent tests for each helper; extend existing app/component tests.
- `webmentions/sent.json`, workflow, package scripts and README: operations.

## Task 1: Identity, discovery and entry/feed markup

**Files:** Create `src/lib/indieweb.ts`, `src/components/AuthorCard.tsx`, `src/lib/indieweb.test.ts`; modify `src/app/layout.tsx`, `src/app/post/[slug]/page.tsx`, `src/app/page.tsx`, `src/app/tag/[slug]/page.tsx`, `src/app/year/[year]/page.tsx`, `src/components/PostCard.tsx`, `src/components/PostHeaderImage.tsx`, existing app/component tests, package.json/lockfile for a test mf2 parser.

**Interfaces:** `canonicalPostUrl(permalink: string): string` uses production origin; `AuthorCard({ representative?: boolean, hidden?: boolean }): ReactElement` provides Nat Welch identity; representative card uses blog homepage u-uid/u-url and secondary natwelch.com URL.

- [ ] Write failing tests: `canonicalPostUrl('/post/7')` equals `https://writing.natwelch.com/post/7`; root output contains actual link rel=webmention and rel=me; parsed public entry name/url/date/author/content match fixture; homepage parses h-feed and representative card; draft card retains secret preview href. Parser assertions must use parsed properties, not only class strings.
- [ ] Run `pnpm exec vitest run src/lib/indieweb.test.ts src/app/app.test.tsx src/components/components.test.tsx`; confirm new assertions fail for missing functionality.
- [ ] Implement explicit properties from spec. Keep list container layout; add hidden feed name if necessary. Do not introduce filesystem-derived dt-updated. Replace erroneous metadata.other discovery fields with links. Add mf2 parser as dev dependency using pnpm and its documented API.
- [ ] Re-run targeted tests; verify post content excludes navigation and author remains Nat Welch. Run `pnpm exec prettier --check` on touched files.
- [ ] Commit task files with `feat: add IndieWeb identity and microformats`.

## Task 2: Incoming JF2 client

**Files:** Create `src/lib/webmentions.ts`, `src/lib/webmentions.test.ts`.

**Interfaces:** Export `Reaction { id: number; kind: 'likes'|'reposts'|'bookmarks'|'replies'|'mentions'; url: string; author: { name: string; url?: string; photo?: string }; published?: string; text: string; name: string }`; `ReactionGroups = Record<Reaction['kind'], Reaction[]>`; `emptyReactions(): ReactionGroups`; `getWebmentions(id: number, permalink: string): Promise<ReactionGroups>`.

- [ ] Write failing tests for all five kinds, missing legacy type, ignored explicit unknown types, private records, duplicate IDs, invalid dates/URLs, photo allowlist, aliases and zero-based paging. Assert `next.revalidate === 3600`, total deadline 3000ms, page cap 10, and error/incomplete lookup equals emptyReactions(). Test refreshed snapshot drops a deleted record.
- [ ] Run `pnpm exec vitest run src/lib/webmentions.test.ts`; expect missing exports to fail.
- [ ] Implement fixed-origin target[] requests, bounded pagination and runtime field checks. Read only plain-text content; use safe wm-source fallback. Sort deterministically, omit invalid dates and use Anonymous name fallback.
- [ ] Re-run tests and coverage for the module; no real API calls.
- [ ] Commit `feat: fetch and normalize incoming webmentions`.

## Task 3: Response display and integration

**Files:** Create `src/components/Webmentions.tsx`, `src/components/Webmentions.test.tsx`; modify post page, app tests, next.config.js.

**Interfaces:** `Webmentions({ reactions, target }: { reactions: ReactionGroups; target: string }): ReactElement | null`; consumes Task 2 types and Task 1 canonical URL.

- [ ] Write failing render tests: empty returns empty markup; all five groups render; 32px avatars only use avatars.webmention.io; names/links available without images; malicious text is escaped; no invalid dates or nested anchors. Parse nested h-cites and assert outer h-entry author/content unchanged. In app tests mock getWebmentions and assert draft previews do not call it.
- [ ] Run `pnpm exec vitest run src/components/Webmentions.test.tsx src/app/app.test.tsx`; expect missing component/assertion failures.
- [ ] Implement labeled facepiles and full plain-text replies, semantic h-cites from spec, and safe mention titles. Await data in the page and pass into synchronous component. Skip draft/future post lookups. Add only https://avatars.webmention.io to CSP img-src.
- [ ] Re-run tests and inspect fixture HTML for escaping, reaction isolation, lazy image/referrer attributes, and unchanged existing navigation.
- [ ] Commit `feat: display IndieWeb responses on posts`.

## Task 4: Safe endpoint discovery and delivery

**Files:** Create `src/lib/webmentionSender/network.ts`, `network.test.ts`, `discovery.ts`, `discovery.test.ts`. Add an audited IP classification dependency if Node primitives are insufficient; use pnpm and record reason.

**Interfaces:** `SafeResponse { url: string; status: number; headers: Headers; body: string }`; `safeRequest(url: string, options?: { method?: 'GET'|'POST'; body?: string; headers?: Record<string,string> }): Promise<SafeResponse>`; `discoverEndpoint(target: string): Promise<string | null>`; `deliverWebmention(source: string, target: string): Promise<{ status: 'accepted'|'no-endpoint'|'failed'; endpoint?: string; httpStatus?: number; retryAt?: string }>`.

- [ ] Write failing network tests: reject credentials, non-http protocols, nonstandard ports, private/reserved IPv4/IPv6/mapped IPv4, mixed public/private DNS answers, redirect-to-private and rebinding. Assert actual connection uses validated DNS address, maximum 5 redirects, 10-second operation timeout, 2 MiB streamed body ceiling. No tokens/cookies forwarded.
- [ ] Write failing discovery tests: Link header precedes HTML; relative endpoint, empty href and tokenized rel; first matching HTML link/a in document order; redirect base URL; non-HTML skipped; form contains exact source/target including fragments; 2xx accepted, 429/503 Retry-After captured.
- [ ] Run `pnpm exec vitest run src/lib/webmentionSender/network.test.ts src/lib/webmentionSender/discovery.test.ts`; verify failures.
- [ ] Implement pinned validated DNS lookup with Node http/https, manual redirects and bounded streaming. Parse HTML using installed jsdom without scripts/resources. Do not use a DNS precheck followed by ordinary unpinned fetch.
- [ ] Re-run tests including all Review Focus security cases; run TypeScript checking.
- [ ] Commit `feat: add safe outgoing webmention delivery`.

## Task 5: Resumable sender state and CLI

**Files:** Create `src/lib/webmentionSender/state.ts`, `state.test.ts`, `runner.ts`, `runner.test.ts`, `scripts/send-webmentions.ts`, `webmentions/sent.json`; modify package.json.

**Interfaces:** `SourceSnapshot { source: string; fingerprint: string; targets: string[] }`; `extractSnapshot(source: string, html: string): SourceSnapshot` throws for missing/ambiguous content; `DeliveryRecord { version: string; acceptedVersion?: string; operation: 'present'|'removed'; attempts: number; status: 'accepted'|'no-endpoint'|'failed'; endpoint?: string; lastAttempt: string; retryAt?: string }`; `SenderState { version: 1; sources: Record<string, { targets: Record<string, DeliveryRecord> }> }`; `planOperations(snapshot: SourceSnapshot, state: SenderState, now: Date): Array<{ source: string; target: string; version: string; operation: 'present'|'removed' }>`; `runSender({ send, limit, post, statePath }: { send: boolean; limit: number; post?: number; statePath: string }): Promise<void>`.

- [ ] Write failing extraction tests: only own e-content anchors; preserved fragments; self links excluded; href-only edits change fingerprint; unchanged content with changed outer navigation does not. Missing body throws rather than returning empty targets.
- [ ] Write failing state tests: cap/resume partway through one post, per-target accepted versions, three failed attempts per version, retry delay, 90-day no-endpoint retry, removal acknowledged once despite later unrelated edits, readdition resets version, corrupt state aborts.
- [ ] Write failing runner tests: index failure preserves log; invalid/off-origin sources rejected; source failure skips without deletion; dry-run makes no target requests and writes no state; cap 300 operations; oldest-first; single-post filter; atomic checkpoint after completed operations; mocked interrupted run resumes pending work.
- [ ] Run `pnpm exec vitest run src/lib/webmentionSender/state.test.ts src/lib/webmentionSender/runner.test.ts`; confirm expected failures.
- [ ] Implement extraction and stable fingerprint of semantic header/body fields, pure operation planner and sequential runner using Task 4. CLI defaults to dry-run, --send explicit, --limit defaults 300 (range 1..1000), --post optional. Add package script `webmentions:send` without implicit --send. Initialize versioned empty state.
- [ ] Re-run tests and `pnpm exec tsx scripts/send-webmentions.ts --help`; no production POSTs or live backfill.
- [ ] Commit `feat: add resumable historical webmention sender`.

## Task 6: Scheduling, documentation and end-to-end verification

**Files:** Create `.github/workflows/webmentions.yml`; modify `.github/workflows/docker.yml`, README.md, and integration tests as needed.

**Interfaces:** workflow calls `pnpm exec tsx scripts/send-webmentions.ts --send`; state persists exclusively in webmentions/sent.json.

- [ ] Add tests/assertions for script argument rejection and workflow invariants: schedule every six hours plus manual, main only, concurrency cancel-in-progress=false, no PR trigger, nonpersistent checkout credentials, explicit state persistence step, Docker state-only paths-ignore.
- [ ] Run focused tests to establish missing CLI/workflow guarantees fail.
- [ ] Implement workflow using existing Node/pnpm/pinned action patterns; job timeout 45 minutes. Keep tokens out of sender environment; commit/push state only afterward and handle branch advancement via rebase without overwriting state. Persist progress after ordinary target errors. Document repository branch-protection requirement before enabling schedule.
- [ ] Document dry-run, full backfill cap/resume, at-least-once semantics, diagnostics/retry exhaustion, owner Bridgy/webmention.io setup, cache timing, and manual validator checks. Note real send/receive validation requires deployment.
- [ ] Run `pnpm test:coverage`, `pnpm exec eslint .`, `pnpm exec tsc --noEmit`, `pnpm build`. Record exact blockers; do not change unrelated user work. Do not run `pnpm lint` indiscriminately (it autofixes) or prepare-posts.
- [ ] Inspect git diff and status, confirm no secrets/generated artifacts included; commit `ci: schedule outgoing webmentions and document setup`.

## Self-review

Spec sections map to tasks 1 (markup), 2 (receiving), 3 (UI/CSP), 4-5
(delivery/security/state), 6 (operations/acceptance). All five Review Focus
items have explicit owning tests. Interfaces share ReactionGroups,
SourceSnapshot, SenderState and DeliveryRecord without alternate shapes.
Owner-side deployment, service signup and real protocol checks remain manual;
local tests must not be described as passing public validators.
