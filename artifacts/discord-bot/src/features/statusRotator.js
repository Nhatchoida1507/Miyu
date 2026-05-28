import { ActivityType } from 'discord.js';

const statuses = [
  {
    type: ActivityType.Custom,
    name: 'custom',
    state: 'Created by Pham Van Nhat (Akahime)',
  },
  {
    type: ActivityType.Playing,
    name: 'Sword Master Story',
  },
];

let currentIndex = 0;

export function startStatusRotator(client) {
  const rotate = () => {
    const s = statuses[currentIndex % statuses.length];
    client.user.setPresence({
      activities: [s],
      status: 'online',
    });
    currentIndex++;
  };

  rotate();
  setInterval(rotate, 20_000);
}
