import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const emojisPath = join(__dirname, '../data/emojis.json');

function getEmojis() {
  try {
    return JSON.parse(readFileSync(emojisPath, 'utf8'));
  } catch {
    return [];
  }
}

export async function handleEmojiReact(message) {
  if (message.author.bot) return;

  const emojis = getEmojis();
  if (emojis.length === 0) return;

  const roll = Math.random();
  if (roll > 0.01) return;

  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  try {
    await message.react(randomEmoji);
  } catch {
  }
}
