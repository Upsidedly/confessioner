import './lib/setup';

import { LogLevel, SapphireClient, container } from '@sapphire/framework';
import { GatewayIntentBits, TextChannel } from 'discord.js';

const client = new SapphireClient({
  defaultPrefix: '!',
  caseInsensitiveCommands: true,
  logger: {
    level: LogLevel.Debug
  },
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.MessageContent
  ],
  loadMessageCommandListeners: true
});

try {
  client.logger.info('Logging in');
  await client.login();
  container.guild = await client.guilds.fetch('1178534896973647893');
  container.confessChannel = (await container.guild.channels.fetch(
    '1178534927122321478'
  )) as TextChannel;
  client.logger.info('logged in');
} catch (error) {
  client.logger.fatal(error);
  await client.destroy();
  process.exit(1);
}
