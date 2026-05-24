# Discord Bot

A simple Discord bot written in TypeScript that:
- responds to `/ping` with `🏓 Pong!`
- retrieves upcoming events from Google Calendar with `/schedule` and `/next`
- manages homework deadlines locally with `/deadline` subcommands

## Requirements

- Node.js
- npm
- Discord bot token and application credentials
- Google Service Account key file (`keys/google.json`)
- Google Calendar ID
- A calendar shared with the Google Service Account

## Installation

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file at the project root and add the following variables:

```env
DISCORD_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_application_client_id
GUILD_ID=your_test_guild_id
GOOGLE_CALENDAR_ID=your_google_calendar_id
```

3. Place the Google Service Account JSON key at `keys/google.json`.

4. Make sure the Google Service Account has access to the calendar configured in `GOOGLE_CALENDAR_ID`.

## Running the bot

During development:

```bash
npm run dev
```

Build and start from compiled output:

```bash
npm run build
npm start
```

## Available commands

- `/ping` — replies with `🏓 Pong!`
- `/help` — lists all available commands
- `/schedule` — shows the next 5 upcoming Google Calendar events
- `/next` — shows the next upcoming Google Calendar event
- `/deadline add` — add a new deadline
- `/deadline list` — list pending deadlines
- `/deadline done` — mark a deadline complete by ID
- `/deadline clear` — delete all completed deadlines

### Deadline usage examples

```bash
/deadline add tantargy:Math cim:Homework datum:2025-05-30
/deadline list
/deadline done id:1
/deadline clear confirm:true
```

## Project structure

- `src/index.ts` — main bot entry point and slash command handling
- `src/calendar.ts` — Google Calendar API integration for fetching events
- `src/database.ts` — local deadline storage using SQLite
- `keys/google.json` — Google Service Account key (do not commit this file)
- `data/deadlines.db` — local SQLite database file created automatically

## Notes

- The bot uploads slash commands to the configured guild when it starts.
- Keep `keys/google.json` private and out of version control.
- If the bot cannot access the calendar, `/schedule` and `/next` will return an error.
