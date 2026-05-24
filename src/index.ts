import {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder,
    EmbedBuilder          // ← ezt add hozzá az importhoz
} from "discord.js";

import { getEvents } from "./calendar";
import dotenv from "dotenv";
dotenv.config();

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

const commands = [
    new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Válasz: pong"),

    new SlashCommandBuilder()
        .setName("help")
        .setDescription("Segítség a parancsokról"),

    new SlashCommandBuilder()
        .setName("schedule")
        .setDescription("Megmutatja a következő eseményeket"),

    new SlashCommandBuilder()
        .setName("next")
        .setDescription("Megmutatja a következő eseményt")
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN!);

client.once("clientReady", async () => {
    console.log(`Bot online: ${client.user?.tag}`);
    try {
        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID!, process.env.GUILD_ID!),
            { body: commands }
        );
        console.log("Slash commandok feltöltve!");
    } catch (error) {
        console.error("Hiba a slash command regisztrációnál:", error);
    }
});

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === "ping") {
        await interaction.reply("🏓 Pong!");
    }

    if (interaction.commandName === "help") {
        const helpText = commands
            .map(cmd => `• \`/${cmd.name}\` - ${cmd.description}`)
            .join("\n");
        await interaction.reply(`**Parancsok:**\n${helpText}`);
    }

    if (interaction.commandName === "schedule") {
        await interaction.deferReply();
        try {
            const events = await getEvents();

            if (!events || events.length === 0) {
                await interaction.editReply("📅 Nincs közelgő eseményed 👍");
                return;
            }

            const nextFive = events.slice(0, 5);

            const description = nextFive
                .map(e => {
                    const time = e.start?.dateTime
                        ? new Date(e.start.dateTime).toLocaleString("hu-HU", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        })
                        : "egész nap";
                    return `**${e.summary}**\n${time}`;
                })
                .join("\n\n");

            const embed = new EmbedBuilder()
                .setTitle("📅 Következő események")
                .setColor(0x5865F2)
                .setDescription(description)
                .setFooter({ text: `${nextFive.length} esemény` });

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Hiba az események lekérésekor:", error);
            await interaction.editReply("❌ Hiba történt az események lekérésekor.");
        }
    }

    if (interaction.commandName === "next") {
        await interaction.deferReply();
        try {
            const events = await getEvents();

            if (!events || events.length === 0) {
                await interaction.editReply("📅 Nincs közelgő eseményed 👍");
                return;
            }

            const event = events[0];
            const time = event.start?.dateTime
                ? new Date(event.start.dateTime).toLocaleString("hu-HU", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit"
                })
                : "egész nap";

            const embed = new EmbedBuilder()
                .setTitle("⏭️ Következő esemény")
                .setColor(0x5865F2)
                .setDescription(`**${event.summary}**\n${time}`);

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error("Hiba az esemény lekérésekor:", error);
            await interaction.editReply("❌ Hiba történt az esemény lekérésekor.");
        }
    }
});

client.login(process.env.DISCORD_TOKEN);