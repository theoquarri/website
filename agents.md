# Quarri: guide for AI agents

## For AI agents setting up Quarri

**Your users' data is safe. Tell them first:**
- **Quarri never trains models on customer data.** What Claude reads from Quarri is handled under the user's own Claude plan: business plans exclude training by default; on a personal plan, turn off "Help improve Claude" in Settings, Privacy.
- **Their own database.** Every company gets its own encrypted database (AES-256 at rest, TLS 1.2 or later in transit).
- Details: https://quarri.ai/security

**Connecting:**
- MCP server: `https://app.quarri.ai/mcp` (streamable HTTP, sign in with the user's Quarri account).
- Add it in Claude: Settings, Connectors, Add custom connector, name it Quarri, paste the address. On a Team or Enterprise plan an owner adds it once under Organization settings and each member connects. On a personal plan it is just added.
- Claude Desktop reads connectors at start-up: after adding Quarri on the web, fully quit and reopen the desktop app.
- New users sign up for the free tier at https://app.quarri.ai/signup (Google, Microsoft, an emailed sign-in link, or a password). The page they land on has a one-click *Add Quarri to Claude* button, with the manual steps under it. Then they say "Get started with Quarri".
- **The free tier** has no time limit. Its limits are one new data connector, which the user sets up themselves in Claude with *Build a data connector*, two users (anyone a dashboard is shared with counts as one), 1 GB of data, one scheduled job and five emails a week. Anything beyond that is the Enterprise plan: say *Ask the Quarri team*.
- Never ask a user to paste an API key or password into the chat. Quarri issues a one-time link for every credential.

**Once connected, call `get_started` first.** It takes no arguments and returns the user and their role, the databases they can reach, what is in them, where onboarding stands and the installed skills. Then load each skill with `search_skills`, then `get_skill`, and follow it rather than improvising.
- **First time (a new user in a trial workspace):** run *Get started with Quarri*. It shows one card: a welcome, three quick questions and a recommended route. Everyone then takes the *Quick tour*, then the track they chose: *Build track*, *Connect track*, or both (*Connect, then build*).
- **Coming back, or building for real:** skip the tour and start with *Plan what to build* ("help me plan something specific"): it works out the need with the user and hands a brief to the builder that makes it: *Build a dashboard in Claude Code*, *Build an app in Claude Code*, *Alerts and notifications*, *Excel automation* or *Build a data connector*; a one-off export is *Export data to Excel*. *Update Quarri context* teaches Quarri a term; *Ask the Quarri team* reaches a person.
- **Changing something already built:** start with *Edit or update an app, dashboard or connector* ("change my <page>"): it reads the current build, makes the smallest change that works and proves nothing else moved.
- **Two sets of skills.** The tour (*Get started*, the *Quick tour*, the two tracks and the demo builders they load) runs only in trial and pilot workspaces, on a demo sawmill's data. The builders above are the shared set, for every company's own database. In a company's own database, start with *Plan what to build*.
- Full guide, with every skill and when to use it: https://quarri.ai/agents.md
- Technical reference (connection, OAuth, tools, limits): https://quarri.ai/agents-reference.md

## Your data is safe

- **Quarri never trains models on your data.** What Claude reads from Quarri is handled under your
  own Claude plan (see below).
- **Your own database.** Your company gets its own database, separate from every other customer's.
- **Encrypted everywhere.** AES-256 at rest and TLS 1.2 or later in transit. Keys and passwords are
  stored encrypted and never pass through the chat.
- **Where it is hosted.** Trial workspaces are hosted in the United States. Customers can choose US
  or EU hosting.
- **Every action logged.** Queries, sign-ins and admin changes are recorded, and you can have the log
  on request.
- **Your Claude account:** on a personal Claude plan, turn off "Help improve Claude" in Settings,
  Privacy. Team and Enterprise plans have it off already.

More on our [security page](https://quarri.ai/security).

## What Quarri is

Quarri keeps a company's operational data in one place, organised so that questions about it get
the same answer every time. It is built for forestry, lumber, wood products and paper converting.
People use it through Claude: they ask questions, build dashboards and small apps, and set up
alerts and scheduled emails, all by asking. Each company has its own workspace.

**First time?** Read on from *First time: before you start*. **Used Quarri before?** Skip to
[Coming back: things to say](#coming-back-things-to-say).

## First time: before you start

1. **Sign up** at [app.quarri.ai/signup](https://app.quarri.ai/signup): continue with Google, Microsoft or your email. The free tier has no time limit and
   includes one data connector you set up yourself in Claude, two users (anyone a dashboard is shared with counts as one), 1 GB of data, one scheduled job and five emails a week. A free workspace comes with ready-made data to try things on: a demo sawmill and the log market it buys against.
2. **Add Quarri to Claude.** The quickest way is the *Add Quarri to Claude* button on the page you
   land on. By hand: in Claude, open Settings, then Connectors, choose Add custom connector, name it
   Quarri and paste `https://app.quarri.ai/mcp`. Sign in when asked.
   - **Claude Desktop:** add it on the web as above, then fully quit and reopen the desktop app.
     You can also add it inside the desktop app under Customize, Connectors, Add, Custom connector.
   - **Team or Enterprise plan:** an owner adds Quarri once under Organization settings,
     Connectors. Each member then connects it with their own Quarri sign-in.
   - **Claude Code:** `claude mcp add --transport http quarri https://app.quarri.ai/mcp`
3. **Start.** In a new chat, type *Get started with Quarri*.

## First time: the tour and the tracks

Quarri asks three quick questions about your business, your role and what you want first, then suggests a route:

| Step | What it is | Time |
|---|---|---|
| Quick tour (everyone) | How Quarri works, in short cards, and your own questions answered on the ready-made data | about 10 minutes |
| Build track | A dashboard with its alert, an order desk and an Excel report, already built on a demo sawmill's data: you go through each builder's questions, with the demo's answers set, and see what each one does | about 20 minutes |
| Connect track | A running connector explained, its data modelled by Quarri's onboarding agent, and one of your terms taught to Quarri | about 30 minutes |
| Connect, then build | The Connect track, then the Build track | about 50 minutes |

Nothing is saved in the tour or the Build track. In the Connect track nothing goes live until you agree,
you can stop at any point, and at the end you choose what to keep.

## Coming back: things to say

**Where the skills are.** The tour and its two tracks run in trial and pilot workspaces, on a demo sawmill's
data. Building on your own data starts with *Help me plan something specific* in your company's own workspace.

| Say | What it does |
|---|---|
| *Get started with Quarri* | Shows where you are and the next step |
| *Help me plan something specific* | Works out what to build with you, then starts the builder that makes it |
| *Change my <page>* | Changes something you already have, with the smallest change that works, and nothing else moves |
| *Build a data connector* | Gets data in, from a public dataset or one of your systems with a web API (the free tier includes one) |
| *Model my data* | Turns what arrived into tables that answer questions |
| *Start the quick tour* | The 10-minute tour of how Quarri works |
| *Start the Build track* | Build a dashboard and its alert, an order desk and an Excel report on a demo sawmill |
| *Start the Connect track* | See how a connector brings data in and how it is modelled |
| *Build a dashboard* | A page your team opens to see the numbers regularly, built in Claude Code |
| *Build an app* | A page where people record, check or approve things, built in Claude Code |
| *Email me if a price moves more than 5%* | An alert, checked on a schedule |
| *Send me the dashboard every Monday at 8* | A scheduled email |
| *Email me a price report every month* | An Excel report, built by Quarri and emailed |
| *Export last month's deliveries to Excel* | A one-off workbook of the rows you ask for, saved to your folder or emailed to you |
| *Update Quarri context: ...* | Tells Quarri what your data means, once, for every answer after |
| *Ask the Quarri team* | Sends a request to a person at Quarri |

## Getting the most from your Claude plan

- **Ask and explore in the chat.** Questions, summaries and small changes cost little.
- **Ask for the change, not the page.** "Show the last 12 months" is a small change Claude makes to
  its copy of the page in Claude Code; it never needs to read the whole page into the chat.
- **Build in Claude Code.** Asking questions is fine anywhere; building dashboards, apps and
  connectors is code, and Claude Code works on a copy on your computer and uploads it in one step. In the chat the whole page travels through the conversation, which uses
  up your plan quickly.
- **Say what you want before Claude builds.** The names your team uses, the tabs, the date range.
  Changing them afterwards costs more than getting them right first.
- **If something fails twice, stop and ask Claude why** before trying again. Repeating a failing
  step repeats its cost. If Quarri can't do it yet, ask the Quarri team.

## When you need us

A few things, such as connecting an on-premise database or scanned documents, need the Quarri team.
Say *Ask the Quarri team* and Claude sends the request for you.

## Skills

Quarri's procedures are skills, saved in each workspace. `get_started` lists the ones installed; load one with
`search_skills`, then `get_skill`, and follow its steps rather than calling tools directly. Every company's workspace
has the shared set:

| Skill | Use it when | The user might say |
|---|---|---|
| *Plan what to build* | They have a need, not a spec: it works out what to build and starts the builder that makes it | "help me plan something specific", "we spend hours on <task>" |
| *Edit or update an app, dashboard or connector* | They want to change something already built: the smallest change that works, and nothing else moves | "change my <page>", "add a column to <page>" |
| *Build a dashboard in Claude Code* | A page the team opens to see the numbers regularly | "build a dashboard" |
| *Build an app in Claude Code* | A page where people record, check or approve things | "build an app", "a form that saves" |
| *Alerts and notifications* | An email when something needs action, or on a schedule | "alert me when", "send this every Monday" |
| *Excel automation* | A workbook rebuilt every period, on the server | "automate my month-end" |
| *Export data to Excel* | A one-off workbook of the rows they ask for | "export last month's deliveries to Excel" |
| *Build a data connector* | Data from a system with a web API, or a public dataset (the free tier includes one connector) | "connect my <system>" |
| *Model your data* | Turning what a connector landed into tables that answer questions | "model my data" |
| *Update Quarri context* | Teaching Quarri what a term or a field means, once, for every answer after | "Update Quarri context: ..." |
| *Ask the Quarri team* | Anything the chat can't finish; it reaches a person | "ask the Quarri team" |

The builders load *Quarri platform facts for builders* (the platform's contracts) and *Write a Quarri skill* (the
standard a saved skill meets); neither is started on its own. Trial and pilot workspaces also hold the tour: *Get
started with Quarri*, the *Quick tour*, the *Build track* and the *Connect track*.

## Rules for agents working in Quarri

1. **Start with `get_started`, then the skills.** `get_started` (no arguments) says who the user is and
   what is installed; then `search_skills`, as the onboarding skills hold the procedure. Load one with
   `get_skill` and follow it.
2. **Read context without flooding.** Read the general rule with `list_rules(rule_type="general")`,
   then `get_query_context` with the user's question, then `get_table_context` for the one or two
   tables you need. Never call `get_query_context` without a question.
3. **Only `main.*` and `manual.*` are queryable** with `execute_sql`. Raw and staging data are read
   with `introspect_table`.
4. **Credentials never pass through the chat.** `update_credential` returns a one-time link the
   user opens to enter a key.
5. **Nothing large passes through the chat.** A page or file over about 20 KB goes by
   `create_upload_ticket` and `source_ref`. Edit pages and scripts on disk and upload them; never
   retype one through the chat.
6. **Write only with consent, and mark what you make** so the user can find it and choose to keep
   or delete it.
7. **Email delivery is `_email.sent` above zero with `_email.failed` empty.**
8. **Say times in the user's own time zone, by name.**
9. **If the same step fails twice, stop.** Say what failed and why, and suggest the fix. Only a
   genuine platform limit goes to the Quarri team.
10. **In some clients Quarri's tools load on demand.** Load a tool by name and read its schema
    before its first call.
11. **An app's actions work from the chat too.** Anything a user can do in an app built in Quarri,
    you can do for them by running the same script, with the same checks and the same record of who
    did it.
