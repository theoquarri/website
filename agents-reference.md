# Quarri: technical reference for AI agents

For setting up and orienting, read the guide first: https://quarri.ai/agents.md
## Connecting

| | |
|---|---|
| MCP endpoint | `https://app.quarri.ai/mcp`, streamable HTTP |
| Sign-up | `https://app.quarri.ai/signup`: the free tier, with Google, Microsoft, an emailed sign-in link or a password |
| Sign-in | OAuth 2.1 authorization code with PKCE (S256), dynamic client registration, refresh tokens |
| Discovery | `https://app.quarri.ai/.well-known/oauth-protected-resource` and `/.well-known/oauth-authorization-server` |
| Endpoints | authorise `/oauth/authorize`, token `/oauth/token`, register `/oauth/register`, revoke `/oauth/revoke` |
| Scope | Each token is bound to one user; every tool call names its target database (`database_name`), and a user sees only the databases they have been given |

## Your data

- Quarri never trains models on your data, and never passes it to Anthropic for training.
- One isolated, encrypted database per company (AES-256 at rest, TLS 1.2 or later in transit), in the
  US or EU region chosen at set-up.
- Full audit trail of queries, sign-ins and admin changes.
- Details: https://quarri.ai/security

## What can be queried

- `execute_sql` reads the modelled tables in `main.*` and the manual tables in `manual.*`, SELECT only.
  Raw and staging data are read with `introspect_table`.
- `get_query_context` must be called in the conversation before `execute_sql`; the server refuses a
  query otherwise.
- A truncated result says so and carries totals for the
  whole population; page through the rest with `fetch_query_page`. Never compute a total from
  truncated rows.

## The order that works

1. `get_started`, once per conversation: no arguments; the user, their databases, what is installed, where onboarding stands.
2. `search_skills` (a skill may already hold the procedure; follow it with `get_skill`).
3. `list_rules(rule_type="general")`, then `get_query_context` with the user's question.
4. `get_table_context` for the one or two tables needed. A column not listed there doesn't exist.
5. `search_values` to match names the user typed.
6. `execute_sql`.

## Limits worth knowing

| Limit | Value |
|---|---|
| Published pages | Pages should read pre-built tables, not views |
| Large files | Over about 20 KB, upload with `create_upload_ticket` and pass `source_ref` |
| Credentials | Never through the chat. `update_credential` returns a one-time link (single use, about 15 minutes) where the user enters the key |
| Scripts | Run on the server; `run_script` never loads the script's body into the conversation. Inline scripts must `import quarri` and define `main()` |
| Email from scripts | Returned as `_email`; delivery is `_email.sent` above zero with nothing in `_email.failed`. `email_to` replaces the default recipient |
| Trials | Free, in a workspace with ready-made demo data |

## Tools (134, in 12 families)

Tools may load on demand in some clients: load a tool by name and read its schema before its first
call. Read tools only look; write tools change the workspace and should run only with the user's consent.

| Family | For | Read | Write |
|---|---|---|---|
| Orient and read context | Find the right tables and meaning before any query | 11 | 0 |
| Query | Read data | 4 | 2 |
| Skills and learnings | Saved procedures, and lessons the workspace has learned | 5 | 7 |
| Context: rules, metrics and relationships | What the data means, once, for every answer | 5 | 11 |
| Manual tables | Tables people maintain in plain English or from a file | 2 | 8 |
| Connectors and landed data | Getting data in | 9 | 10 |
| Modelling and environments | Organising landed data into the tables questions are asked of | 5 | 14 |
| Scripts, schedules and jobs | Server-side code that runs on demand or on a schedule | 6 | 9 |
| Dashboards, apps and sharing | Publishing pages and apps, and who sees them | 4 | 10 |
| Alerts | Platform alert notifications | 1 | 1 |
| Versions | History and roll-back of rules, metrics, skills, scripts, content and connectors | 1 | 1 |
| Workspace administration | Databases, users, teams, limits and security | 4 | 4 |

The tools an agent needs most: `get_started`, `search_skills`, `get_skill`, `list_rules`, `get_query_context`,
`get_table_context`, `search_values`, `execute_sql`, `fetch_query_page`, `run_script`,
`create_upload_ticket`, `publish_content`, `update_credential`.
