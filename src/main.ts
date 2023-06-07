import { session, Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import { ogg } from "./utils/ogg.js";

import config from "config";
import { openai } from "./utils/openai.js";
import { code } from "telegraf/format";

const bot = new Telegraf(config.get("TELEGRAM_TOKEN"));

const INITIAL_SESSION = {
  messages: [],
};

bot.use(session());

let SESSION: {
  messages: Array<any>;
} = {
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
      const mp3Path = await ogg.toMp3(oggPath as string, userId);

      const text = await openai.transcription(mp3Path as string);
      await ctx.reply(code(`Ваш запрос: ${text}`));
      await ctx.reply;

      SESSION.messages.push({
        role: openai.roles.USER,
        content: text as string,
      });

      const response = await openai.chat(SESSION.messages);
      if (response?.content) {
        await ctx.reply(response?.content).catch((e: any) => {
          console.log(`Error while voice message`, e.message);
        });
      }
    } catch (e: any) {
      console.log(`Error while voice message`, e.message);
    }
  } else if (ctx.update.message.hasOwnProperty("text")) {
    try {
      //@ts-ignore
      const text = ctx.message.text;
      SESSION.messages.push({
        role: openai.roles.USER,
        content: text as string,
      });

      await ctx.reply(code(`Запрос обрабатывается...`));

      const response = await openai.chat(SESSION.messages);

      await ctx.reply(response?.content || "Вопрос не понятен");
    } catch (e) {
      console.log(`Error while message: `, e);
    }
  }
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
