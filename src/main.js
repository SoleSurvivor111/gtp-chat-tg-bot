import { session, Telegraf } from "telegraf";
import { ogg } from "./ogg.js";

import { openai } from "./openai.js";
import { code } from "telegraf/format";

const bot = new Telegraf(process.env["TELEGRAM_TOKEN"], {
  telegram: { polling: true },
});

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

bot.on("message", async (ctx) => {
  if (ctx.update.message.hasOwnProperty("voice")) {
    try {
      //@ts-ignore
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
      if (response?.content) {
        await ctx.reply(response?.content).catch((e) => {
          console.log(`Error while voice message`, e.message);
        });
      }
    } catch (e) {
      console.log(`Error while voice message`, e.message);
    }
  } else if (ctx.update.message.hasOwnProperty("text")) {
    try {
      const text = ctx.message.text;
      SESSION.messages.push({
        role: openai.roles.USER,
        content: text,
      });

      await ctx.reply(code(`Запрос обрабатывается...`));

      const response = await openai.chat(SESSION.messages).catch(() => {});
      if (response?.content) {
        await ctx.reply(response?.content);
      } else {
        await ctx.reply("Произошла ошибка");
      }
    } catch (e) {
      console.log(`Error while message: `, e);
    }
  } else {
    ctx.reply("Данный формат сообщения не поддерживается.");
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
