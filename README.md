# Discord Bot

A simple Discord bot written in TypeScript that:
- responds to `ping` with `🏓 Pong!`
- retrieves upcoming events from Google Calendar with the `schedule` command

## Requirements

- Node.js
- npm
- Discord bot token and application credentials
- Google Service Account key file (`keys/google.json`)
- Google Calendar ID

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

## Running the bot

Start the bot with:

```bash
npx ts-node src/index.ts
```

## Commands

- `/ping` — replies with `🏓 Pong!`
- `/schedule` — displays the next 5 upcoming Google Calendar events

## Project structure

- `src/index.ts` — main bot entry point, register and handle slash commands
- `src/calendar.ts` — Google Calendar API integration for fetching events
- `keys/google.json` — Google Service Account key (do not commit this file)

## Notes

The `/schedule` command works only if the Google Service Account has access to the specified calendar.
