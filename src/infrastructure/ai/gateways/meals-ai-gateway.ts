import OpenAI, { toFile } from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

import { Meal } from "@/application/entities/meal";
import { Injectable } from "@/core/decorators/injectable";
import { getImagePrompt } from "@/infrastructure/ai/prompts/get-image-prompt";
import { MealsFileStorageGateway } from "@/infrastructure/gateways/meals-file-storage-gateway";
import { downloadFileFromUrl } from "@/shared/utils/download-file-from-url";

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

@Injectable()
export class MealsAIGateway {
  private readonly client = new OpenAI();

  constructor(private readonly mealsFileStorageGateway: MealsFileStorageGateway) {}

  public async processMeal(meal: Meal): Promise<MealsAIGateway.ProcessMealResult> {
    const mealFileUrl = this.mealsFileStorageGateway.getFileUrl(meal.inputFileKey);

    if (meal.inputType === Meal.InputType.IMAGE) {
      const response = await this.client.chat.completions.create({
        model: "gpt-4.1-mini",
        response_format: zodResponseFormat(mealSchema, "meal"),
        messages: [
          {
            role: "system",
            content: getImagePrompt(),
          },
          {
            role: "user",
            content: [
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
          },
        ],
      });

      const content = response.choices[0]?.message.content;

      if (!content) {
        console.error("OpenAI response:", response);
        throw new Error(`Failed to process meal with id "${meal.id}"`);
      }

      const { success, data, error } = mealSchema.safeParse(JSON.parse(content));

      if (!success) {
        console.error("Zod error:", error);
        console.error("OpenAI response:", response);
        throw new Error(`Failed to process meal with id "${meal.id}"`);
      }

      return data;
    }

    const audioFile = await downloadFileFromUrl(mealFileUrl);

    const response = await this.client.audio.transcriptions.create({
      model: "whisper-1",
      file: await toFile(audioFile, `${meal.id}.m4a`, { type: "audio/m4a" }),
    });

    console.log(JSON.stringify(response, null, 2));

    return {
      name: "Meal name",
      icon: "Meal icon",
      foods: [],
    };
  }
}

export namespace MealsAIGateway {
  export type ProcessMealResult = {
    name: string;
    icon: string;
    foods: Meal.Food[];
  };
}
