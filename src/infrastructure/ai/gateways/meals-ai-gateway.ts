import { OpenAI } from "openai/client";
import { zodResponseFormat } from "openai/helpers/zod";
import type {
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from "openai/resources";
import { toFile } from "openai/uploads";
import { z } from "zod";

import { Meal } from "@/application/entities/meal";
import { Injectable } from "@/core/decorators/injectable";
import { getImagePrompt } from "@/infrastructure/ai/prompts/get-image-prompt";
import { getTextPrompt } from "@/infrastructure/ai/prompts/get-text-prompt";
import { OpenAIResponseError } from "@/infrastructure/errors/open-ai-response-error";
import { MealsFileStorageGateway } from "@/infrastructure/gateways/meals-file-storage-gateway";
import { downloadFileFromUrl } from "@/shared/utils/download-file-from-url";
import { jsonCodec } from "@/shared/utils/zod-json-codec";

const mealSchema = z.object({
  name: z.string(),
  icon: z.string(),
  foods: z.array(
    z.object({
      name: z.string(),
      quantity: z.string(),
      calories: z.number(),
      carbohydrates: z.number(),
      proteins: z.number(),
      fats: z.number(),
    }),
  ),
});

const mealJsonCodec = jsonCodec(mealSchema);

@Injectable()
export class MealsAIGateway {
  private readonly client = new OpenAI();

  constructor(private readonly mealsFileStorageGateway: MealsFileStorageGateway) {}

  public async processMeal(meal: Meal): Promise<MealsAIGateway.ProcessMealResult> {
    const mealFileUrl = this.mealsFileStorageGateway.getFileUrl(meal.inputFileKey);

    if (meal.inputType === Meal.InputType.IMAGE) {
      return await this.callAI({
        mealId: meal.id,
        systemPrompt: getImagePrompt(),
        userPrompt: [
          {
            type: "image_url",
            image_url: {
              url: mealFileUrl,
              detail: "high",
            },
          },
          {
            type: "text",
            text: `Meal date: ${meal.createdAt}`,
          },
        ],
      });
    }

    const mealTranscription = await this.transcribe(mealFileUrl);

    return await this.callAI({
      mealId: meal.id,
      systemPrompt: getTextPrompt(),
      userPrompt: `Meal date: ${meal.createdAt}\n\nMeal: ${mealTranscription}`,
    });
  }

  private async callAI({
    mealId,
    systemPrompt,
    userPrompt,
  }: MealsAIGateway.CallAIParams): Promise<MealsAIGateway.ProcessMealResult> {
    const response = await this.client.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: zodResponseFormat(mealSchema, "meal"),
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    const content = response.choices[0]?.message.content;

    if (!content) {
      throw new OpenAIResponseError(`Open AI returned an empty response for meal "${mealId}"`);
    }

    const { success, data, error } = mealJsonCodec.safeDecode(content);

    if (!success) {
      throw new OpenAIResponseError(`Open AI returned an invalid response for meal "${mealId}"`, {
        cause: error,
      });
    }

    return data;
  }

  private async transcribe(audioFileUrl: string): Promise<string> {
    const audioFile = await downloadFileFromUrl(audioFileUrl);

    const { text } = await this.client.audio.transcriptions.create({
      model: "gpt-4o-mini-transcribe",
      file: await toFile(audioFile, "audio.m4a", { type: "audio/m4a" }),
    });

    return text;
  }
}

export namespace MealsAIGateway {
  export type ProcessMealResult = {
    name: string;
    icon: string;
    foods: Meal.Food[];
  };

  export type CallAIParams = {
    mealId: string;
    systemPrompt: ChatCompletionSystemMessageParam["content"];
    userPrompt: ChatCompletionUserMessageParam["content"];
  };
}
