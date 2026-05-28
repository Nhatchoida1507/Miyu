import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const stickyPath = join(__dirname, '../data/sticky.json');

function getSticky() {
  try {
    return JSON.parse(readFileSync(stickyPath, 'utf8'));
  } catch {
    return {};
  }
}

function saveSticky(data) {
  writeFileSync(stickyPath, JSON.stringify(data, null, 2), 'utf8');
}

export async function handleStickyMessage(message) {
  if (message.author.bot) return;

  const sticky = getSticky();
  const entry = sticky[message.channelId];
  if (!entry) return;

  if (entry.messageId) {
    try {
      const old = await message.channel.messages.fetch(entry.messageId);
      await old.delete();
    } catch {
    }
  }

  try {
    const sent = await message.channel.send(entry.content);
    entry.messageId = sent.id;
    sticky[message.channelId] = entry;
    saveSticky(sticky);
  } catch {
  }
}

export function setStickyForChannel(channelId, content) {
  const sticky = getSticky();
  sticky[channelId] = { content, messageId: null };
  saveSticky(sticky);
}

export function removeStickyForChannel(channelId) {
  const sticky = getSticky();
  delete sticky[channelId];
  saveSticky(sticky);
}

export function getStickyForChannel(channelId) {
  return getSticky()[channelId] || null;
}
