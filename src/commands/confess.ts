import { ApplyOptions } from '@sapphire/decorators';
import { Command } from '@sapphire/framework';
import {
  ActionRowBuilder,
  EmbedBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js';

@ApplyOptions<Command.Options>({
  description: 'Confess anything anonymously'
})
export class UserCommand extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((input) =>
          input
            .setName('confession')
            .setDescription('The confession to make')
            .setRequired(false)
        )
    );
  }

  private generateEmbed(confession: string) {
    return new EmbedBuilder()
      .setTitle('New Confession!')
      .setDescription(confession)
      .setColor(0x2b2d31)
      .setTimestamp();
  }

  public override async chatInputRun(
    interaction: Command.ChatInputCommandInteraction
  ) {
    const confession = interaction.options.getString('confession');

    if (confession) {
      await interaction.reply({
        ephemeral: true,
        content: 'Sending confession shortly...'
      });

      await this.container.confessChannel.send({
        embeds: [this.generateEmbed(confession)]
      });

      return await interaction.editReply({
        content: 'Confession sent successfully!'
      });
    }

    const modal = new ModalBuilder({
      customId: 'confessionModal',
      title: 'Create Confession'
    });

    modal.addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder({
          customId: 'confessionInput',
          label: 'What is the confession?',
          style: TextInputStyle.Paragraph
        })
      )
    );

    await interaction.showModal(modal);

    const submitted = await interaction
      .awaitModalSubmit({
        time: 1_000 * 60 * 10,
        filter: (i) => i.user.id === interaction.user.id
      })
      .catch((error) => {
        this.container.logger.error(error);
        return null;
      });

    if (!submitted) return;

    const modalConfession =
      submitted.fields.getTextInputValue('confessionInput');

    await submitted.reply({
      ephemeral: true,
      content: 'Sending confession shortly...'
    });

    await this.container.confessChannel.send({
      embeds: [this.generateEmbed(modalConfession)]
    });

    return await submitted.editReply({
      content: 'Confession sent successfully!'
    });
  }
}