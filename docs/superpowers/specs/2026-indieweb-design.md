# IndieWeb compatibility design

## Intent and approved scope

Make writing.natwelch.com readable by IndieWeb tools, display incoming
replies/likes/reposts/bookmarks/mentions, and send webmentions for every
published post. The owner selected server-side hourly fetching, facepiles
plus replies, markup of the existing author byline, a full historical
outgoing backfill, and a scheduled GitHub Action against the live site.

This document supersedes `/data/.opencode/plan/2026-indieweb-design.md`,
including the corrections below. Independent review was attempted twice but
the reviewer service was unavailable; these corrections come from self-review
and https://webmention.io/api.

## Constraints and non-goals

- Preserve existing appearance except for the new Responses section.
- Keep existing Next.js/Contentlayer publishing, permalinks, RSS and Atom.
- Node >=26, pnpm, TypeScript; follow AGENTS.md and existing Vitest patterns.
- No client JavaScript for reactions; never insert remote HTML.
- No IndieAuth/Micropub/Microsub, changes to natwelch.com, or automatic Bridgy signup.
- No sending from builds, previews, draft pages, or tests.
- No real outgoing POSTs during implementation verification.
- Retain 90% coverage thresholds; do not run prepare-posts.

## Approaches

Incoming: server fetching with 3600-second data caching was selected over
build-only fetching (stale until deployment) and browser fetching (extra JS).
The validator goal concerns identity/post markup; client-rendered reactions
would not by themselves make the author's post invalid.

Outgoing: scheduled GitHub Action reading production was selected over a
hosted feed watcher (limited backfill/control) and sending during builds
(receivers may not yet see the source). These are independently testable
subsystems sharing canonical URL and rendered markup contracts.

## Corrections to earlier discussion

- `metadata.other.webmention` emits a meta tag, not discovery. Replace it
  with a real `<link rel="webmention">`; existing strings do not prove the
  webmention.io account is configured.
- The earlier API query checked only the homepage, not all posts. The site's
  total existing mentions are unknown.
- A one-way rel=me link is not verified identity. The blog can link to
  natwelch.com but reciprocal verification requires owner action there.
- The documented avatar proxy is `https://avatars.webmention.io`, not
  `https://webmention.io/avatar/...`.
- Docker publication is not proof of deployment. Scheduled sending observes
  live content; it does not assume a deployment event exists.
- No universal IndieWeb certification exists. Acceptance is specific below;
  IndieAuth and outgoing-validator tests cannot be claimed until exercised.
- Social-account availability and Bridgy support must be checked during
  owner setup; the earlier profile scan was not a complete account inventory.

## 1. Microformats and discovery

Post `<article>`: `h-entry`; title `p-name`; canonical permalink `u-url u-uid`;
publication time `dt-published`; MDX body wrapper `e-content`; byline
`p-author h-card` with explicit `p-name` and `u-url` pointing to natwelch.com.
Use hidden `data.p-category` for tags and hidden `p-summary` when present.
Do not introduce dt-updated from filesystem mtime, which changes on checkout.
Header photo may use `u-photo` without changing its presentation.

PostCard: `h-entry`, explicit name/url/publication/summary/categories/author.
Keep draft preview links working; do not replace them with public permalinks.
Homepage/tag/year list: `h-feed` containing its name and entries. Avoid
wrappers that alter margins/layout; hidden feed properties are acceptable.
Homepage also needs a representative h-card for the blog: Nat Welch, blog
homepage as `u-url u-uid`, and natwelch.com as an additional `u-url` with
rel=me. This can be nonvisual; nested post author cards alone are not a
representative homepage card.

Root head: real rel=webmention and rel=pingback links to the existing
webmention.io endpoints, plus rel=me to https://natwelch.com. Do not claim
reciprocal identity or login works without verifying external configuration.

## 2. Receiving

`src/lib/webmentions.ts` fetches public JF2 target queries without tokens.
Query canonical post permalink and existing `/id`, `/posts/id` aliases
using target[]; use actual permalink, not an assumed path for canonical.
Follow zero-based paging with per-page=1000, dedupe by wm-id, reject private
records and invalid records, and normalize only the fields needed by the UI.
Use fixed API origin; never follow arbitrary paging URLs from a response.

Set fetch `next.revalidate=3600`. Bound the entire lookup to 3 seconds and
10 pages (10,000 records); log a limit warning, don't silently claim total
counts on incomplete results. For failures or incomplete pagination return
empty groups, not a misleading partial count. Re-fetch the full snapshot
on refresh so removed mentions disappear. No token or private data caching.
Hourly means request-driven revalidation, not an exact hourly cron.

Normalize likes, reposts, bookmarks, replies, mentions; ignore unsupported
explicit types. Missing legacy type can fall back to mention. Sort replies
and mentions oldest-first using valid published or received time; invalid
or absent dates remain displayable without a time label. URL fields must
be HTTP(S), without credentials; safe source URL can replace missing url.
Missing author name becomes Anonymous. Avatar URLs must be HTTPS on
avatars.webmention.io; other/missing photos use initials. Text only, no
content.html insertion; safely omit unavailable text.

Fetch only for public published posts. Keep the present draft preview
behavior; do not expose draft secret URLs through new markup. Async page
fetches normalized data and passes it to a synchronous server-rendered
component so existing renderToStaticMarkup tests can run.

## 3. Responses UI

`src/components/Webmentions.tsx`, after PostStats, before navigation,
inside the post h-entry but outside its e-content. Empty groups render no
section. Heading: Responses.

Likes/reposts/bookmarks: labeled counts and 32px facepiles linking to the
reaction, names available to assistive technology. Replies: author, valid
date, plain text and original link. Mentions: author and linked title or
source URL. Use existing colors/type/dark-mode styles, no new client logic.

Use nested h-cite with explicit u-url and p-author h-card; replies nest as
p-comment, likes as p-like, reposts as p-repost. Bookmarks and mentions can
be h-cite children without claiming a standard parent property. Include
u-in-reply-to/u-like-of/u-repost-of/u-bookmark-of on appropriate citations.
Keep reaction properties from leaking into the enclosing post or e-content.

Plain img (not the imgix Next loader), width/height, lazy loading and
no-referrer. Placeholder for unavailable/disallowed URLs. External links
rel="nofollow ugc". Add only https://avatars.webmention.io to CSP img-src.

## 4. Outgoing delivery

A thin `scripts/send-webmentions.ts` CLI calls tested helpers under
`src/lib/webmentionSender/`. Default dry-run; `--send` required to POST.
Scheduled workflow explicitly supplies --send. Production origin is fixed
https://writing.natwelch.com; do not accept arbitrary source URLs from feed.

Fetch /posts.json and validate published source paths. Read live post HTML,
require exactly the post h-entry's e-content, extract anchors only within
it, resolve relative URLs against the live source, ignore self/non-http
links and deduplicate. Preserve target fragments (receivers can use them).
Hash stable post semantic fields (title, published, summary, categories)
and serialized e-content, including hrefs; never filesystem mtime or only
textContent. Unchanged redeploys must not re-send everything.

A missing e-content, bad page, or non-200 source must not mean all links were
removed. Skip that source with a warning and preserve its state. Failure
of the index aborts the run. Removing whole posts is outside this iteration;
link removal in a still-published source is supported.

Discover endpoint from HTTP Link first, then HTML link/a rel token
webmention in document order. Handle relative and empty hrefs and redirects
per spec; parse HTML only with an HTML content type. POST form-encoded
source/target. 2xx means accepted, not proof of receiver display.

All external network operations must prevent SSRF: HTTP(S) only, no
credentials, only normal HTTP/HTTPS ports, reject local/private/reserved IPv4
and IPv6 including mapped IPv4, validate DNS results and pin the validated
address for the connection, repeat checks at every redirect including
endpoint redirects. No forwarding auth/cookies. Max 5 redirects, 10 seconds
per operation and 2 MiB response body; parse without scripts or subresources.
Use Node http/https with a validated lookup or an equivalent audited client.
At most 4 concurrent requests and 1 per host; sequential processing also
satisfies these limits and is the initial implementation choice.

Persist versioned `webmentions/sent.json`, keyed by source and target.
Each target independently tracks attempted version, accepted version,
operation (present/removed), attempts, endpoint, status and timestamp.
Version includes the post fingerprint and target presence. Never advance
all targets just because one succeeded. Successful removal becomes a
tombstone and is not repeated on later edits; readding the target resets it.

Failed operations: max 3 attempts per version on separate runs; honor
Retry-After for 429/503 (bounded by a sensible next-run time), and report
exhaustion. Recheck no-endpoint after 90 days. A new version resets attempt
count. This is at-least-once delivery: interruption after remote acceptance
but before recording may duplicate a send; source/target permits receiver
updates. Do not promise exactly once.

Per run: 300 target operations maximum, configurable downward/upward with
an explicit bounded CLI option; initial backfill oldest-first and resumable.
Save successful progress atomically. Dry-run reads live source pages and
prints planned operations without target discovery, POSTs or state writes.
Provide a single-post selector for controlled testing. Never silently reset
a corrupt state file; fail rather than repeat the entire historical send.

## 5. Workflow and operations

`.github/workflows/webmentions.yml`: manual plus six-hour schedule, main
branch only, no PR execution, concurrency group cancel-in-progress=false,
job timeout, contents:write only on state persistence. Install with existing
pnpm/Node conventions; checkout persist-credentials=false during sender.
Persist state after ordinary per-target failures. Separate persistence from
untrusted network work; obtain push credentials only in the commit step.
Serialize runs and handle branch advancement without overwriting state.
Avoid passing repository tokens to the network subprocess. Follow existing
pinned action versions where possible.

State-only commits must not trigger container publication; add paths-ignore
for webmentions/** to Docker push trigger. Confirm repository rules allow
bot commits; if not, disable scheduled sends until durable persistence is
configured. Deployment/backfill is not performed by this coding task.

## 6. Acceptance

Mocked tests cover all five reaction types, aliases/paging/dedupe/deletions,
unsafe URLs, missing authors/dates, escaped content, empty/failure behavior,
and no draft fetches. Parse rendered post/feed/card HTML with a real mf2
parser in addition to DOM assertions; verify representative identity and
reaction isolation. Verify emitted discovery links and CSP.

Sender tests: scope extraction; href-only edits; unchanged redeploy; removed
then readded targets; interruption mid-post; retry exhaustion and 429 delay;
header/HTML discovery and redirects; private DNS/mapped IPv6/rebinding
prevention; size/time limits; state corruption; safe dry-run and resume.

Run pnpm test:coverage, non-mutating ESLint, TypeScript, and pnpm build if
the environment permits. Document any environment blockers accurately.
No real sends as a test. After owner deployment: validate a post, homepage
and feed via mf2 parser/indiewebify.me, confirm webmention.io account setup,
receive a controlled test mention, and manually enable/smoke-test sending.

## Owner setup

Connect desired supported accounts at brid.gy and share links to blog posts.
Bridgy is optional for receiving ordinary webmentions. Confirm webmention.io
ownership and moderation preferences; replies are untrusted public content.
Add reciprocal rel=me on natwelch.com if verified cross-domain identity is
wanted. External service configuration is not implied by local tests.
