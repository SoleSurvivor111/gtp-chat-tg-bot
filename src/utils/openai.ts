import {
  ChatCompletionRequestMessage,
  ChatCompletionRequestMessageRoleEnum,
  Configuration,
  OpenAIApi,
} from "openai";
import { createReadStream } from "fs";
import dotenv from "dotenv";

dotenv.config();

class OpenAI {
  openai: OpenAIApi;
  roles: { [key: string]: ChatCompletionRequestMessageRoleEnum } = {
    USER: "user",
    SYSTEM: "system",
    ASSISTANT: "assistant",
  };

  constructor(apiKey: string) {
    const configuration = new Configuration({
      apiKey,
    });
    this.openai = new OpenAIApi(configuration);
  }

  async chat(messages: ChatCompletionRequestMessage[]) {
    try {
      const response = await this.openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages,
      });

      return response.data.choices[0].message;
    } catch (e: any) {
      console.log("Error while send request to chat GRPT:  ", e.message);
    }
  }

  async transcription(path: string) {
    try {
      const response = await this.openai.createTranscription(
        createReadStream(path),
        "whisper-1"
      );

      return response.data.text || "нет ответа";
    } catch (e: any) {
      console.log("Error while try to transcription mp3", e.message);
    }
  }
}

export const openai = new OpenAI(process.env.OPENAI_API_KEY as string);
