import { Client, GatewayIntentBits, Partials, Collection } from 'discord.js';
import { readdirSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

import { startStatusRotator } from './features/statusRotator.js';
import { handleAutoReply } from './features/autoReply.js';
import { handleEmojiReact } from './features/emojiReact.js';
import { handleStickyMessage } from './features/stickyMessage.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const required = ['DISCORD_TOKEN', 'OWNER_ID', 'CLIENT_ID'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`[ERROR] Thiếu biến môi trường: ${key}`);
    process.exit(1);
  }
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.commands = new Collection();

const commandFiles = readdirSync(join(__dirname, 'commands')).filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
  const filePath = pathToFileURL(join(__dirname, 'commands', file)).href;
  const command = await import(filePath);
  if (command.data && command.execute) {
    client.commands.set(command.data.name, command);
  }
}

client.once('ready', () => {
  console.log(`[Miyu Bot] Đã đăng nhập: ${client.user.tag}`);
  startStatusRotator(client);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (err) {
    console.error(`[ERROR] Lệnh ${interaction.commandName}:`, err);
    const msg = { content: '❌ Có lỗi xảy ra khi thực hiện lệnh này.', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(msg);
    } else {
      await interaction.reply(msg);
    }
  }
});

client.on('messageCreate', async message => {
  await Promise.allSettled([
    handleAutoReply(message),
    handleEmojiReact(message),
    handleStickyMessage(message),
  ]);
});

client.login(process.env.DISCORD_TOKEN);
