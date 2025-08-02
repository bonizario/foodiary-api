import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import KSUID from "ksuid";

import { Meal } from "@/application/entities/meal";
import { Injectable } from "@/core/decorators/injectable";
import { s3Client } from "@/infrastructure/clients/s3-client";
import { AppConfig } from "@/shared/config/app-config";
import { minutesToSeconds } from "@/shared/utils/minutes-to-seconds";

@Injectable()
export class MealsFileStorageGateway {
  constructor(private readonly config: AppConfig) {}

  public static generateInputFileKey({
    accountId,
    inputType,
  }: MealsFileStorageGateway.GenerateInputFileKeyParams): string {
    const extension = inputType === Meal.InputType.AUDIO ? "m4a" : "jpeg";
    const filename = `${KSUID.randomSync().string}.${extension}`;
    return `${accountId}/${filename}`;
  }

  public async createPOST({
    fileKey,
    fileSize,
    inputType,
  }: MealsFileStorageGateway.CreatePOSTParams): Promise<MealsFileStorageGateway.CreatePOSTResult> {
    const bucket = this.config.storage.mealsBucket;
    const contentType = inputType === Meal.InputType.AUDIO ? "audio/m4a" : "image/jpeg";

    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: bucket,
      Key: fileKey,
      Expires: minutesToSeconds(5),
      Conditions: [
        { bucket },
        ["eq", "$key", fileKey],
        ["eq", "$Content-Type", contentType],
        ["content-length-range", fileSize, fileSize],
      ],
    });

    const uploadSignature = Buffer.from(JSON.stringify({ url, fields })).toString("base64");

    return {
      uploadSignature,
    };
  }
}

export namespace MealsFileStorageGateway {
  export type GenerateInputFileKeyParams = {
    accountId: string;
    inputType: string;
  };

  export type CreatePOSTParams = {
    fileKey: string;
    fileSize: number;
    inputType: string;
  };

  export type CreatePOSTResult = {
    uploadSignature: string;
  };
}
