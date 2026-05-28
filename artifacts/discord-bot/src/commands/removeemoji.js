import { SlashCommandBuilder } from 'discord.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const emojisPath = join(__dirname, '../data/emojis.json');

export const data = new SlashCommandBuilder()
  .setName('removeemoji')
  .setDescription('Xoá emoji khỏi danh sách react (owner only)')
  .addStringOption(opt =>
    opt.setName('emoji').setDescription('Emoji hoặc ID emoji muốn xoá').setRequired(true)
  );

export async function execute(interaction) {
  if (interaction.user.id !== process.env.OWNER_ID) {
    return interaction.reply({ content: '❌ Chỉ owner mới dùng được lệnh này.', ephemeral: true });
  }

  const emoji = interaction.options.getString('emoji').trim();

  let emojis = [];
  try {
    emojis = JSON.parse(readFileSync(emojisPath, 'utf8'));
  } catch {}

  const idx = emojis.indexOf(emoji);
  if (idx === -1) {
    return interaction.reply({ content: `❌ Không tìm thấy emoji **${emoji}** trong danh sách.`, ephemeral: true });
  }

  emojis.splice(idx, 1);
  writeFileSync(emojisPath, JSON.stringify(emojis, null, 2), 'utf8');

  await interaction.reply({ content: `✅ Đã xoá emoji **${emoji}** (còn lại: ${emojis.length} emoji)`, ephemeral: true });
}
