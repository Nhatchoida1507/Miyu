import { SlashCommandBuilder, ChannelType } from 'discord.js';
import { setStickyForChannel, removeStickyForChannel, getStickyForChannel } from '../features/stickyMessage.js';

export const data = new SlashCommandBuilder()
  .setName('setsticky')
  .setDescription('Đặt tin nhắn ghim cuối kênh (owner only)')
  .addChannelOption(opt =>
    opt
      .setName('channel')
      .setDescription('Kênh cần đặt sticky')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(true)
  )
  .addStringOption(opt =>
    opt.setName('message').setDescription('Nội dung tin nhắn sticky (bỏ trống để xoá)').setRequired(false)
  );

export async function execute(interaction) {
  if (interaction.user.id !== process.env.OWNER_ID) {
    return interaction.reply({ content: '❌ Chỉ owner mới dùng được lệnh này.', ephemeral: true });
  }

  const channel = interaction.options.getChannel('channel');
  const content = interaction.options.getString('message');

  if (!content) {
    const existing = getStickyForChannel(channel.id);
    if (!existing) {
      return interaction.reply({ content: `❌ Kênh ${channel} chưa có sticky message.`, ephemeral: true });
    }

    if (existing.messageId) {
      try {
        const old = await channel.messages.fetch(existing.messageId);
        await old.delete();
      } catch {}
    }

    removeStickyForChannel(channel.id);
    return interaction.reply({ content: `✅ Đã xoá sticky message khỏi ${channel}.`, ephemeral: true });
  }

  const existing = getStickyForChannel(channel.id);
  if (existing?.messageId) {
    try {
      const old = await channel.messages.fetch(existing.messageId);
      await old.delete();
    } catch {}
  }

  const sent = await channel.send(content);
  setStickyForChannel(channel.id, content);

  const { readFileSync, writeFileSync } = await import('fs');
  const { fileURLToPath } = await import('url');
  const { dirname, join } = await import('path');
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const stickyPath = join(__dirname, '../data/sticky.json');
  const sticky = JSON.parse(readFileSync(stickyPath, 'utf8'));
  sticky[channel.id].messageId = sent.id;
  writeFileSync(stickyPath, JSON.stringify(sticky, null, 2), 'utf8');

  await interaction.reply({ content: `✅ Đã đặt sticky message cho ${channel}.`, ephemeral: true });
}
