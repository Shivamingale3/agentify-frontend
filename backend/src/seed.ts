/* eslint-disable no-console -- seed script is run from CLI; console is the intended output sink. */
import { db } from './config/db.config.js';

/**
 * Idempotent seed of 20 representative incidents.
 *
 * `incidentId` values are baked-in (pre-generated ULIDs) so re-running the
 * seed refreshes the same 20 rows via upsert instead of creating duplicates.
 * The Prisma `id` column auto-generates its own ULID on the create branch.
 *
 * Distribution (designed to surface every UI state):
 *   Severity: 4 LOW · 6 MEDIUM · 6 HIGH · 4 CRITICAL
 *   Status:   5 OPEN · 4 INVESTIGATING · 4 IN_PROGRESS · 4 RESOLVED · 3 CLOSED
 *   Services: 10 distinct  ·  Assignees: 6 distinct + a few null
 *   createdAt: spread across the last 30 days (oldest 30d ago, newest today)
 *   description: 17 populated (varied rich-text HTML) · 3 null
 *   AI fields (summary / possibleCauses / recommendedActions / rootCause): all null
 */

type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
type Status = 'OPEN' | 'INVESTIGATING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';

interface SeedIncident {
  incidentId: string;
  title: string;
  description: string | null;
  service: string;
  severity: Severity;
  status: Status;
  assignee: string | null;
  createdAt: Date;
}

const DAYS = 24 * 60 * 60 * 1000;
const NOW = Date.now();
const daysAgo = (n: number): Date => new Date(NOW - n * DAYS);

const SEED: SeedIncident[] = [
  {
    incidentId: 'INC-01KWTWE35BMQK07YNSC6SHB4XT',
    title: 'Primary database CPU spikes to 95% during nightly backup window',
    description:
      '<p>During the nightly backup window at <strong>03:14 UTC</strong>, primary database CPU usage spiked to <em>95%</em> and stayed elevated for 18 minutes, causing request latency to degrade across all read-heavy endpoints.</p><p>Initial findings:</p><ul><li>Backup job overlapped with the analytics rollup cron</li><li>Connection pool hit its max of 50</li><li>Replication lag grew to 4.2 seconds</li></ul><p>Customers reported intermittent 504s on the dashboard between 03:14 and 03:32 UTC.</p>',
    service: 'Database',
    severity: 'CRITICAL',
    status: 'RESOLVED',
    assignee: 'Alice Johnson',
    createdAt: daysAgo(29),
  },
  {
    incidentId: 'INC-01KWTWE35F1BFEMHY16AFS7Y7N',
    title: 'OAuth callback returns 500 for Google SSO since config push',
    description:
      '<p>After merging PR #4821 (<code>auth-config-refactor</code>), the Google OAuth callback at <code>/api/auth/callback/google</code> returns HTTP 500 for ~30% of login attempts.</p><p>Error in logs:</p><pre><code>Error: Invalid assert: audience mismatch\n  at OAuthClient.validateAssertion (oauth.js:142)\n  at handleCallback (auth.controller.ts:78)</code></pre><p>Suspected cause: the <strong>GOOGLE_CLIENT_ID</strong> env var was renamed but the deploy pipeline still sets the old name.</p>',
    service: 'Authentication Service',
    severity: 'HIGH',
    status: 'OPEN',
    assignee: 'Bob Chen',
    createdAt: daysAgo(27),
  },
  {
    incidentId: 'INC-01KWTWE35FR3JN4P0JAW1SV6ZB',
    title: 'Payment webhook verifications failing intermittently in production',
    description:
      '<p>Stripe webhook signature verification is failing for roughly 1 in 200 events in production. Failures are not correlated with a specific webhook type — they hit <code>payment_intent.succeeded</code>, <code>charge.refunded</code>, and <code>invoice.paid</code> equally.</p><p>Reproduction steps:</p><ol><li>Send a test webhook from the Stripe dashboard</li><li>Check the webhook handler logs for the matching event id</li><li>Observe <code>signature_verification_failed</code> error</li><li>Resend the same webhook — usually succeeds on the second attempt</li></ol><p>Pattern suggests a race between webhook arrival and the signing secret rotation that finished last week.</p>',
    service: 'Payment Service',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    assignee: 'Carol White',
    createdAt: daysAgo(25),
  },
  {
    incidentId: 'INC-01KWTWE35GYCPEZC343F8TN1Z9',
    title: 'Frontend dashboard shows stale KPI counts after refresh',
    description:
      "<p>Users report KPI cards on the dashboard show counts from the previous page load even after a hard refresh. TanStack Query's <code>staleTime</code> was bumped from 0 to 60 seconds in PR #4798 to reduce API load — looks like the refetch-on-mount is now being skipped entirely.</p><p>Quote from the customer report:</p><blockquote>Our ops team almost missed a critical incident yesterday because the dashboard happily showed '0 active incidents' for 40 minutes after a real outage started.</blockquote><p>Need to either lower staleTime or wire up the existing <code>refetchOnWindowFocus</code> + <code>refetchOnMount</code> flags explicitly.</p>",
    service: 'Frontend',
    severity: 'MEDIUM',
    status: 'IN_PROGRESS',
    assignee: 'David Patel',
    createdAt: daysAgo(23),
  },
  {
    incidentId: 'INC-01KWTWE35GE8N0745EDB4FQMTF',
    title: 'Worker queue backlog growing on the email-processing consumer',
    description:
      '<p>The <code>email-queue-consumer</code> worker is processing jobs at ~40% of its usual throughput. Backlog has grown from a steady ~50 jobs to over 4,800 jobs in the last two hours.</p><p>Affected endpoints:</p><ul><li>Transactional: signup-confirm, password-reset</li><li>Bulk: weekly-digest, announcement</li><li>Billing: invoice-paid, trial-ending</li></ul><p>Not an outage yet — p95 delivery time is 8 minutes vs. the usual 12 seconds — but will hit the 24h SLA on bulk sends within ~6 hours if unaddressed.</p>',
    service: 'Email Service',
    severity: 'MEDIUM',
    status: 'OPEN',
    assignee: 'Eve Martinez',
    createdAt: daysAgo(21),
  },
  {
    incidentId: 'INC-01KWTWE35GQE11DQSR37QST3T1',
    title: 'CDN cache hit ratio dropped after the cache-key change',
    description:
      '<p>CDN cache hit ratio fell from 94% to 61% over 6 hours after deploying PR #4810 which changed the cache key format from <code>{path}</code> to <code>{path}:{accept-language}</code>.</p><p>Edge vitals before/after:</p><table><thead><tr><th>Metric</th><th>Before</th><th>After</th></tr></thead><tbody><tr><td>Hit ratio</td><td>94.2%</td><td>61.4%</td></tr><tr><td>Origin requests/s</td><td>180</td><td>1,240</td></tr><tr><td>p95 TTFB</td><td>110ms</td><td>520ms</td></tr></tbody></table><p>Origin is handling the load for now but costs are spiking. Either revert the key change or add the <code>Vary: Accept-Language</code> header instead.</p>',
    service: 'CDN',
    severity: 'MEDIUM',
    status: 'OPEN',
    assignee: 'Frank Kim',
    createdAt: daysAgo(19),
  },
  {
    incidentId: 'INC-01KWTWE35GE1S58DYS7GRTRV5Y',
    title: 'Grafana alert storm — false positives every 30s for the last hour',
    description:
      '<p>The <code>api-p99-latency</code> alert has fired 1,847 times in the last hour. Each alert clears itself within 10–15 seconds, but the 30-second eval window is enough to re-fire constantly.</p><p>Looks like a misconfigured <code>for: 0s</code> on the alert rule combined with a noisy test workload that hammers the <code>/api/health/loaded</code> debug endpoint every 30 seconds.</p><ul><li>Incident channel: #alerts-api</li><li>Pager rotations have been silenced temporarily to stop the on-call burnout</li></ul><p>Quick fix: drop the test workload or change <code>for: 5m</code> on the alert rule.</p>',
    service: 'API Gateway',
    severity: 'LOW',
    status: 'RESOLVED',
    assignee: 'Alice Johnson',
    createdAt: daysAgo(18),
  },
  {
    incidentId: 'INC-01KWTWE35G0K0MZQMPQ0KX8MC8',
    title: 'Notification delivery latency 12x baseline for push channel',
    description:
      '<p>Push notification delivery p95 latency is 12x baseline (4.8 seconds vs. 400ms) starting at 14:02 UTC. No deploys in the window — correlate with upstream FCM incident report.</p><p>Channels observed:</p><ul><li>iOS (APNS): 380ms — normal</li><li>Android (FCM): 4.8s — degraded</li><li>Web (FCM): 4.6s — degraded</li></ul><p>Following the upstream Google Cloud incident. Watching the FCM status page; will close once it resolves.</p>',
    service: 'Notification Service',
    severity: 'MEDIUM',
    status: 'CLOSED',
    assignee: 'Bob Chen',
    createdAt: daysAgo(16),
  },
  {
    incidentId: 'INC-01KWTWE35GV8Z6F3ZV6NE6NTX9',
    title: 'Redis cluster eviction policy changed unexpectedly, cache churn rose',
    description:
      "<p>Redis cluster eviction policy was changed from <code>allkeys-lru</code> to <code>noeviction</code> by an unknown deploy at 09:48 UTC. Eviction attempts now fail with OOM errors and the cache hit ratio is dropping minute by minute as keys can't be evicted.</p><p>Quote from the platform team:</p><blockquote>The cluster just rejects writes when it's full instead of evicting — which sounds safer but actually trashes the hit ratio because our workload needs the LRU churn.</blockquote><p>Plan: revert the eviction policy via the infrastructure-as-code repo and clear the affected node's keyspace to reset the working set.</p>",
    service: 'Cache',
    severity: 'HIGH',
    status: 'INVESTIGATING',
    assignee: 'Carol White',
    createdAt: daysAgo(15),
  },
  {
    incidentId: 'INC-01KWTWE35G306H6PZ4SJDW7Q5A',
    title: 'API Gateway returning 502 on /api/incidents route for ~3% of requests',
    description:
      '<p>The <code>GET /api/incidents</code> endpoint returns HTTP 502 for ~3% of requests, primarily when the response is large (page 5+ at pageSize=50). No recent deploy on the gateway; backend shows healthy.</p><p>NGINX upstream logs:</p><pre><code>upstream prematurely closed connection while reading response header\n  (client: 10.0.4.21, server: api.internal, request: "GET /api/incidents?pageNo=5&amp;pageSize=50")</code></pre><p>Suspect the 60-second <code>proxy_read_timeout</code> is too low for the slowest queries when the DB is under load. Tune to 90s and add a <code>X-Accel-Buffering: no</code> hint from the upstream service.</p>',
    service: 'API Gateway',
    severity: 'HIGH',
    status: 'OPEN',
    assignee: 'David Patel',
    createdAt: daysAgo(14),
  },
  {
    incidentId: 'INC-01KWTWE35GE3DP78FKT2F9PMRA',
    title: 'Frontend bundle size grew 35% on the latest release',
    description:
      "<p>Production JS bundle grew from 412 KB to 557 KB gzipped after the v2.4.0 release. Initial triage: a vendor charting library got imported into the main bundle instead of being lazy-loaded on the analytics page.</p><p>Looks like an accidental <code>import { Chart } from '@vendor/charts'</code> at the top of a shared format utility pulled the whole library into the entry chunk.</p><p>Need to either:</p><ul><li>Move the import to be dynamic in the analytics module</li><li>Or split the format utility into a smaller module that doesn't transitively depend on the chart library</li></ul>",
    service: 'Frontend',
    severity: 'LOW',
    status: 'IN_PROGRESS',
    assignee: 'Eve Martinez',
    createdAt: daysAgo(12),
  },
  {
    incidentId: 'INC-01KWTWE35H7K8TZJN3PRGC6EH2',
    title: 'Worker queue consumer crashed on a malformed job payload',
    description:
      '<p>The <code>email-queue-consumer</code> worker crashed at 11:42 UTC on a job with payload <code>{ "to": null, "subject": "" }</code>. The consumer\'s validation guard checks for missing <code>to</code> but treats an empty string differently — the SMTP client then throws on the empty recipient list.</p><p>Stack trace:</p><pre><code>Error: SMTP recipient list cannot be empty\n  at SMTPClient.send (smtp.js:88)\n  at EmailConsumer.handleJob (consumer.ts:124)\n  at Worker.process (bullmq.js:311)</code></pre><p>Fix is to make the validator treat <code>""</code> and <code>null</code> identically and dead-letter the offending job rather than crashing the consumer.</p>',
    service: 'Worker Queue',
    severity: 'MEDIUM',
    status: 'OPEN',
    assignee: 'Frank Kim',
    createdAt: daysAgo(10),
  },
  {
    incidentId: 'INC-01KWTWE35H1SBB9CEKJ6RRSX2A',
    title: 'Duplicate OAuth sessions — user logged in twice from different IPs',
    description:
      "<p>Two users have reported seeing another user's data after logging in. Investigation shows session affinity in the auth service was treating requests from two different source IPs as the same session for ~7 minutes during the rolling deploy at 18:20 UTC.</p><p>Affected scopes: <code>read:incidents</code>, <code>write:incidents</code>. No data was modified — the second user only had read access and reported it immediately.</p><p>Need to invalidate all sessions issued during the deploy window (18:20–18:32 UTC) and audit the session lookup code path.</p>",
    service: 'Authentication Service',
    severity: 'CRITICAL',
    status: 'RESOLVED',
    assignee: 'Alice Johnson',
    createdAt: daysAgo(9),
  },
  {
    incidentId: 'INC-01KWTWE35H51ZJT8WTYNRNETT6',
    title: 'Stripe charge refund endpoint slow to respond under load',
    description:
      "<p>The <code>POST /api/payments/:id/refund</code> endpoint occasionally exceeds 8 seconds during peak traffic. Stripe's own API responds in < 400ms, so the bottleneck is on our side — likely the synchronous database write inside the handler plus the audit log insert both running in the same transaction as the Stripe call.</p><p>Reproduction:</p><ol><li>Hit the refund endpoint 50 times in parallel against staging</li><li>p95 latency is 7.9 seconds</li><li>CPU on the refund worker hits 100% while DB write lock contention builds</li></ol><p>Move the audit log insert out of the transaction and into a background job; re-measure p95.</p>",
    service: 'Payment Service',
    severity: 'HIGH',
    status: 'IN_PROGRESS',
    assignee: 'Bob Chen',
    createdAt: daysAgo(8),
  },
  {
    incidentId: 'INC-01KWTWE35HWNHCRKY61T6A1XH8',
    title: 'Database replication lag alarms firing above 10s threshold',
    description:
      '<p>Read replica lag is oscillating between 6 and 14 seconds, hitting our 10s alert threshold every few minutes and causing the on-call to wake up unnecessarily. Root load is a sustained increase in read queries from the new reporting dashboard.</p><p>Reporting dashboard was deployed to read from the replica specifically to offload the primary; we underestimated the query volume.</p><p>Short term: raise the alert threshold to 15s. Longer term: move the heaviest reporting queries to a dedicated OLAP store instead of the OLTP replica.</p>',
    service: 'Database',
    severity: 'MEDIUM',
    status: 'OPEN',
    assignee: 'Carol White',
    createdAt: daysAgo(6),
  },
  {
    incidentId: 'INC-01KWTWE35HYMEE1APGHQQ8X04Z',
    title: 'Frontend toast notifications not dismissing after 5s timeout',
    description:
      '<p>Toast notifications are no longer auto-dismissing after 5 seconds — they stay on screen until manually closed. Started after the Sonner library bump in PR #4833.</p><p>Looks like the <code>duration</code> prop now needs to be set explicitly; the previous default of 4000ms was removed in the major version bump and our code relied on it silently.</p><p>Default the <code>duration</code> on the <code>&lt;Toaster /&gt;</code> in <code>app-providers.tsx</code> to 5000 and confirm dismiss behavior across toast variants (success, error, loading).</p>',
    service: 'Frontend',
    severity: 'LOW',
    status: 'INVESTIGATING',
    assignee: 'David Patel',
    createdAt: daysAgo(5),
  },
  {
    incidentId: 'INC-01KWTWE35HT07V4VJVFJRKGVQE',
    title: 'Authentication rate limiter returning 429 for legitimate traffic',
    description:
      "<p>The login rate limit is returning 429 for a rising share of legitimate users — cluster of reports from a corporate IP that sits behind a NAT egress with ~3,000 internal users all hitting our auth endpoint at 09:00 local time each weekday.</p><p>Current limit is 5 requests per 60s per IP, which is too strict for NAT'd traffic.</p><p>Recommended action:</p><ul><li>Move from IP-keyed limits to a sliding window keyed on a combination of <code>&lt;nationality&gt;:&lt;username attempt&gt;</code> so NAT'd users aren't collectively throttled</li><li>Keep an IP-level throttle as a coarse backstop, but set it to 100/60s instead of 5/60s</li></ul>",
    service: 'Authentication Service',
    severity: 'MEDIUM',
    status: 'OPEN',
    assignee: 'Eve Martinez',
    createdAt: daysAgo(4),
  },
  {
    incidentId: 'INC-01KWTWE35H6AVM0NCR8KVCPSV1',
    title: 'Email Service bouncing on a specific recipient domain',
    description: null,
    service: 'Email Service',
    severity: 'LOW',
    status: 'RESOLVED',
    assignee: null,
    createdAt: daysAgo(3),
  },
  {
    incidentId: 'INC-01KWTWE35HVSMJHNZGQMABCCM7',
    title: 'Cache write timeouts causing read-through stampede on hot keys',
    description:
      "<p>A small set of hot cache keys (~3 keys, each driving ~2,400 reads/sec) is timing out on write. When a write times out, we currently invalidate the local read-through entry — which triggers a thundering herd of upstream reads.</p><p>Upstream is currently absorbing the load (peak CPU 78%) but the next deploy window will ride this hard.</p><p>Fix outline:</p><ol><li>Switch writes to fire-and-forget (don't invalidate the local entry on write timeout)</li><li>Add a jittered refresh-ahead job for the hot key set every 15s</li><li>Tune the upstream write timeout from 250ms to 1s</li></ol>",
    service: 'Cache',
    severity: 'HIGH',
    status: 'IN_PROGRESS',
    assignee: 'Frank Kim',
    createdAt: daysAgo(2),
  },
  {
    incidentId: 'INC-01KWTWE35HE0Q6FKV26ANSKVTP',
    title: 'CDN TLS certificate auto-renewal failed, expiry in 6 days',
    description:
      "<p>The automated Let's Encrypt renewal for the CDN edge certificate failed silently during the last renewal window. ACME challenge endpoint returned 404 because the <code>/.well-known/acme-challenge/</code> location block was inadvertently dropped from the NGINX config in the last deploy.</p><p>Current cert expires in 6 days. Renewal has been retried manually and is now queued; expected to complete within the next 30 minutes once DNS propagation settles.</p><p>Process improvement needed: monitor cert expiry &lt; 14 days as a CRITICAL alert, not a soft warning.</p>",
    service: 'CDN',
    severity: 'CRITICAL',
    status: 'OPEN',
    assignee: 'Alice Johnson',
    createdAt: daysAgo(0),
  },
];

async function main(): Promise<void> {
  if (SEED.length !== 20) {
    throw new Error(`Expected 20 seed incidents, got ${SEED.length}`);
  }
  for (const it of SEED) {
    await db.incident.upsert({
      where: { incidentId: it.incidentId },
      create: it,
      update: it, // refresh seed data on re-run (id/createdAt stay stable via create branch)
    });
  }
  console.log(`Seeded ${SEED.length} incidents.`);
  console.log(`Distribution — severity: ${summarize('severity')} | status: ${summarize('status')}`);
}

function summarize(key: keyof SeedIncident): string {
  const counts = new Map<string, number>();
  for (const it of SEED) {
    const v = String(it[key]);
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }
  return [...counts.entries()].map(([k, v]) => `${k}:${v}`).join(' · ');
}

main()
  .catch((err: unknown) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
