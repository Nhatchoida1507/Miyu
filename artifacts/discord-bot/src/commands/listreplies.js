import { SlashCommandBuilder } from 'discord.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repliesPath = join(__dirname, '../data/replies.json');

export const data = new SlashCommandBuilder()
  .setName('listreplies')
  .setDescription('Xem danh sách câu trả lời tự động (owner only)');

export async function execute(interaction) {
  if (interaction.user.id !== process.env.OWNER_ID) {
    return interaction.reply({ content: '❌ Chỉ owner mới dùng được lệnh này.', ephemeral: true });
  }

  let replies = {};
  try {
    replies = JSON.parse(readFileSync(repliesPath, 'utf8'));
  } catch {}

  const entries = Object.entries(replies);
  if (entries.length === 0) {
    return interaction.reply({ content: '📭 Chưa có auto-reply nào.', ephemeral: true });
  }

  const list = entries.map(([t, r]) => `• **${t}** → ${r}`).join('\n');
  await interaction.reply({ content: `📋 **Danh sách auto-reply:**\n${list}`, ephemeral: true });
}
