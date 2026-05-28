import { REST, Routes } from 'discord.js';
import { readdirSync } from 'fs';
import { fileURLToPath, pathToFileURL } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const required = ['DISCORD_TOKEN', 'CLIENT_ID'];
for (const key of required) {
  if (!process.env[key]) {
    console.error(`[ERROR] Thiếu biến môi trường: ${key}`);
    process.exit(1);
  }
}

const commands = [];
const commandFiles = readdirSync(join(__dirname, 'commands')).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = pathToFileURL(join(__dirname, 'commands', file)).href;
  const command = await import(filePath);
  if (command.data) {
    commands.push(command.data.toJSON());
  }
}

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

console.log(`[Deploy] Đang đăng ký ${commands.length} slash command(s)...`);

try {
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands },
  );
  console.log(`[Deploy] ✅ Đã đăng ký thành công ${commands.length} slash command(s)!`);
  console.log('Danh sách:', commands.map(c => `/${c.name}`).join(', '));
} catch (err) {
  console.error('[Deploy] ❌ Lỗi:', err);
}
