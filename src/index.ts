import {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder
} from "discord.js";

import { getEvents as getEvents } from "./calendar";

import dotenv from "dotenv";
dotenv.config();


// BOT
const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// 1. Slash commandok
const commands = [
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Válasz: pong"),

    new SlashCommandBuilder()
        .setName("schedule")
        .setDescription("Megmutatja a következő eseményeket")
].map(cmd => cmd.toJSON());

// 2. REST (parancsok feltöltése Discordra)
const rest = new REST({ version: "10" }).setToken(
    process.env.DISCORD_TOKEN!
);

// 3. Bot indulás
client.once("clientReady", async () => {
    console.log(`Bot online: ${client.user?.tag}`);

    const guildId = process.env.GUILD_ID;

    try {
        await rest.put(
            Routes.applicationGuildCommands(
                process.env.CLIENT_ID!,
                guildId!
            ),
            { body: commands }
        );

        console.log("Slash commandok feltöltve!");
    } catch (error) {
        console.error("Hiba a slash command regisztrációnál:", error);
    }
});

// 4. Command kezelés
client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "ping") {
        await interaction.reply("🏓 Pong!");
    }

    if (interaction.commandName === "schedule") {
        await interaction.deferReply();

        const events = await getEvents();

        const nextFive = events.slice(0, 5);

        if (!events || events.length === 0) {
            await interaction.editReply("📅 Nincs közelgő eseményed 👍");
            return;
        }

        const text = nextFive
            .map(e => {
                const time = e.start?.dateTime
                    ? new Date(e.start.dateTime).toLocaleTimeString("hu-HU", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit"
                    })
                    : "egész nap";

                return `📌 ${time} - ${e.summary}`;
            })
            .join("\n");

        await interaction.editReply(text);
    }
});

// 5. Login
client.login(process.env.DISCORD_TOKEN);