import { SlashCommandBuilder } from 'discord.js';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repliesPath = join(__dirname, '../data/replies.json');

export const data = new SlashCommandBuilder()
  .setName('addreply')
  .setDescription('Thêm câu trả lời tự động (owner only)')
  .addStringOption(opt =>
    opt.setName('trigger').setDescription('Từ khoá kích hoạt').setRequired(true)
  )
  .addStringOption(opt =>
    opt.setName('response').setDescription('Nội dung bot sẽ reply').setRequired(true)
  );

export async function execute(interaction) {
  if (interaction.user.id !== process.env.OWNER_ID) {
    return interaction.reply({ content: '❌ Chỉ owner mới dùng được lệnh này.', ephemeral: true });
  }

  const trigger = interaction.options.getString('trigger');
  const response = interaction.options.getString('response');

  let replies = {};
  try {
    replies = JSON.parse(readFileSync(repliesPath, 'utf8'));
  } catch {}

  replies[trigger] = response;
  writeFileSync(repliesPath, JSON.stringify(replies, null, 2), 'utf8');

  await interaction.reply({ content: `✅ Đã thêm: khi có ai nhắn **${trigger}**, bot sẽ reply: **${response}**`, ephemeral: true });
}
