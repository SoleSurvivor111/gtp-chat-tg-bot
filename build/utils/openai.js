import { Configuration, OpenAIApi, } from "openai";
import config from "config";
import { createReadStream } from "fs";
class OpenAI {
    constructor(apiKey) {
        this.roles = {
            USER: "user",
            SYSTEM: "system",
            ASSISTANT: "assistant",
        };
        const configuration = new Configuration({
            apiKey,
        });
        this.openai = new OpenAIApi(configuration);
    }
    async chat(messages) {
        try {
            const response = await this.openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages,
            });
            return response.data.choices[0].message;
        }
        catch (e) {
            console.log("Error while send request to chat GRPT");
        }
    }
    async transcription(path) {
        try {
            const response = await this.openai.createTranscription(createReadStream(path), "whisper-1");
            return response.data.text || "нет ответа";
        }
        catch (e) {
            console.log("Error while try to transcription mp3", e.message);
        }
    }
}
export const openai = new OpenAI(config.get("OPENAI_API_KEY"));
//# sourceMappingURL=openai.js.map