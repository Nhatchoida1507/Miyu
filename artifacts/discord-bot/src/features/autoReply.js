import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repliesPath = join(__dirname, '../data/replies.json');

function getReplies() {
  try {
    return JSON.parse(readFileSync(repliesPath, 'utf8'));
  } catch {
    return {};
  }
}

export async function handleAutoReply(message) {
  if (message.author.bot) return;

  const replies = getReplies();
  const content = message.content.toLowerCase();

  for (const [trigger, response] of Object.entries(replies)) {
    if (content.includes(trigger.toLowerCase())) {
      await message.reply(response);
      return;
    }
  }
}
