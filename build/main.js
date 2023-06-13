import { session, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { ogg } from "./utils/ogg.js";
import { openai } from "./utils/openai.js";
import { code } from "telegraf/format";
const bot = new Telegraf(process.env.TELEGRAM_API_TOKEN);
const INITIAL_SESSION = {
  messages: [],
};
bot.use(session());
let SESSION = {
  messages: [],
};
bot.command("new", async (ctx) => {
  SESSION = INITIAL_SESSION;
  await ctx.reply("Жду вашего голосового или текстового сообщения");
});
bot.command("start", async (ctx) => {
  SESSION = INITIAL_SESSION;
  await ctx.reply("Жду вашего голосового или текстового сообщения");
});
bot.on(message("voice"), async (ctx) => {
  try {
    const link = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
    const userId = String(ctx.message.from.id);
    const oggPath = await ogg.create(link.href, userId);
    const mp3Path = await ogg.toMp3(oggPath, userId);
    const text = await openai.transcription(mp3Path);
    await ctx.reply(code(`Ваш запрос: ${text}`));
    await ctx.reply;
    SESSION.messages.push({
      role: openai.roles.USER,
      content: text,
    });
    const response = await openai.chat(SESSION.messages);
    await ctx.reply(
      (response === null || response === void 0 ? void 0 : response.content) ||
        "Не удалось разобрать голосовое сообщение"
    );
  } catch (e) {
    console.log(`Error while voice message`, e);
  }
});
bot.launch();
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
//# sourceMappingURL=main.js.map
