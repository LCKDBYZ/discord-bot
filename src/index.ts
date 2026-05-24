import {
    Client,
    GatewayIntentBits,
    REST,
    Routes,
    SlashCommandBuilder,
    EmbedBuilder          // ← ezt add hozzá az importhoz
} from "discord.js";

import { getEvents } from "./calendar";
import { addDeadline, clearDone, listDeadlines, markDone } from "./database";
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
        .setDescription("Megmutatja a következő eseményt"),

    new SlashCommandBuilder()
        .setName("deadline")
        .setDescription("Beadandók kezelése")
        .addSubcommand(sub => sub
            .setName("add")
            .setDescription("Új határidő hozzáadása")
            .addStringOption(opt => opt
                .setName("tantargy")
                .setDescription("Tantárgy neve")
                .setRequired(true))
            .addStringOption(opt => opt
                .setName("cim")
                .setDescription("Beadandó címe")
                .setRequired(true))
            .addStringOption(opt => opt
                .setName("datum")
                .setDescription("Határidő (pl. 2025-05-30)")
                .setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName("list")
            .setDescription("Közelgő határidők listája")
        )
        .addSubcommand(sub => sub
            .setName("done")
            .setDescription("Beadandó teljesítettnek jelölése")
            .addIntegerOption(opt => opt
                .setName("id")
                .setDescription("A beadandó ID-ja")
                .setRequired(true))
        )
        .addSubcommand(sub => sub
            .setName("clear")
            .setDescription("Törli az összes teljesített beadandót")
            .addBooleanOption(opt => opt
                .setName("confirm")
                .setDescription("Biztosan törlöd?")
                .setRequired(true))
        )
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

    switch (interaction.commandName) {
        case "ping":
            await interaction.reply("🏓 Pong!");
            break;

        case "help": {
            const helpText = commands
                .map(cmd => `• \`/${cmd.name}\` - ${cmd.description}`)
                .join("\n");
            await interaction.reply(`**Parancsok:**\n${helpText}`);
            break;
        }

        case "schedule": {
            await interaction.deferReply();
            try {
                const events = await getEvents();
                if (!events || events.length === 0) {
                    await interaction.editReply("📅 Nincs közelgő eseményed 👍");
                    break;
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
            break;
        }

        case "next": {
            await interaction.deferReply();
            try {
                const events = await getEvents();
                if (!events || events.length === 0) {
                    await interaction.editReply("📅 Nincs közelgő eseményed 👍");
                    break;
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
            break;
        }

        case "deadline": {
            const sub = interaction.options.getSubcommand();

            if (sub === "add") {
                const subject = interaction.options.getString("tantargy", true);
                const title = interaction.options.getString("cim", true);
                const dueDate = interaction.options.getString("datum", true);

                addDeadline(subject, title, dueDate);
                await interaction.reply(`✅ Hozzáadva: **${subject} - ${title}** (${dueDate})`);
            }

            else if (sub === "list") {
                const deadlines = listDeadlines() as {
                    id: number;
                    subject: string;
                    title: string;
                    due_date: string;
                }[];

                if (deadlines.length === 0) {
                    await interaction.reply("📭 Nincs közelgő határidő!");
                    break;
                }

                const description = deadlines
                    .map(d => `**${d.id}.** ${d.subject} - ${d.title}\n📅 ${d.due_date}`)
                    .join("\n\n");

                const embed = new EmbedBuilder()
                    .setTitle("📋 Közelgő határidők")
                    .setColor(0xED4245)
                    .setDescription(description)
                    .setFooter({ text: `${deadlines.length} beadandó` });

                await interaction.reply({ embeds: [embed] });
            }

            else if (sub === "done") {
                const id = interaction.options.getInteger("id", true);
                markDone(id);
                await interaction.reply(`✅ Kész! A **${id}.** beadandó teljesítve.`);
            }

            else if (sub === "clear") {
                const confirm = interaction.options.getBoolean("confirm", true);
                if (!confirm) {
                    await interaction.reply("❌ A törlés megerősítése szükséges!");
                    break;
                }
                clearDone();
                await interaction.reply("🧹 Törölve minden teljesített beadandó!");
            }

            break;
        }
    }
});

client.login(process.env.DISCORD_TOKEN);