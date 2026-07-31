import { HeadObjectCommand } from "@aws-sdk/client-s3";
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

  public getFileUrl(fileKey: string): string {
    return `https://${this.config.cdns.mealsCdn}/${fileKey}`;
  }

  public async createPost({
    file,
    accountId,
    mealId,
  }: MealsFileStorageGateway.CreatePostParams): Promise<MealsFileStorageGateway.CreatePostResult> {
    const bucket = this.config.storage.mealsBucket;
    const contentType = file.inputType === Meal.InputType.AUDIO ? "audio/m4a" : "image/jpeg";

    const { url, fields } = await createPresignedPost(s3Client, {
      Bucket: bucket,
      Key: file.key,
      Expires: minutesToSeconds(5),
      Conditions: [
        { bucket },
        ["eq", "$key", file.key],
        ["eq", "$Content-Type", contentType],
        ["content-length-range", file.size, file.size],
      ],
      Fields: {
        "x-amz-meta-account-id": accountId,
        "x-amz-meta-meal-id": mealId,
      },
    });

    const uploadSignature = Buffer.from(
      JSON.stringify({
        url,
        fields: {
          ...fields,
          "Content-Type": contentType,
        },
      }),
    ).toString("base64");

    return {
      uploadSignature,
    };
  }

  public async getFileMetadata({
    fileKey,
  }: MealsFileStorageGateway.GetFileMetadataParams): Promise<MealsFileStorageGateway.GetFileMetadataResult> {
    const command = new HeadObjectCommand({
      Bucket: this.config.storage.mealsBucket,
      Key: fileKey,
    });

    const { Metadata } = await s3Client.send(command);

    const accountId = Metadata?.["account-id"];
    const mealId = Metadata?.["meal-id"];

    if (!accountId || !mealId) {
      throw new Error(
        `[getFileMetadata] Cannot process file: "${fileKey}" | Metadata: ${JSON.stringify(Metadata)}`,
      );
    }

    return {
      accountId,
      mealId,
    };
  }
}

export namespace MealsFileStorageGateway {
  export type GenerateInputFileKeyParams = {
    accountId: string;
    inputType: string;
  };

  export type CreatePostParams = {
    mealId: string;
    accountId: string;
    file: {
      key: string;
      size: number;
      inputType: string;
    };
  };

  export type CreatePostResult = {
    uploadSignature: string;
  };

  export type GetFileMetadataParams = {
    fileKey: string;
  };

  export type GetFileMetadataResult = {
    accountId: string;
    mealId: string;
  };
}
