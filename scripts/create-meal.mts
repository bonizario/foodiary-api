import { access, readFile } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";

import { log, requireEnv } from "./utils.mts";

const ACCESS_TOKEN = requireEnv("ACCESS_TOKEN");
const CREATE_MEAL_API_URL = requireEnv("CREATE_MEAL_API_URL");

const MIME_BY_EXT: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".m4a": "audio/m4a",
};

type InputKind = "image" | "audio";

const SAMPLE_BY_KIND: Record<InputKind, string> = {
  image: "sample.jpg",
  audio: "sample.m4a",
};

interface IPresignResponse {
  uploadSignature: string;
}

interface IPresignDecoded {
  url: string;
  fields: Record<string, string>;
}

function resolveInputKind(): InputKind {
  const arg = process.argv[2]?.toLowerCase();
  if (arg === "audio") return "audio";
  if (arg === "image" || arg === undefined) return "image";

  log.fail(`Unknown input kind "${arg}". Supported: image, audio`);
  process.exit(1);
}

async function readInputFile(filePath: string): Promise<{
  data: Buffer;
  size: number;
  type: string;
}> {
  try {
    await access(filePath);
  } catch {
    log.fail(`File not found: ${filePath}`);
    process.exit(1);
  }

  const extension = extname(filePath).toLowerCase();
  const type = MIME_BY_EXT[extension];
  if (!type) {
    log.fail(
      `Unsupported file type "${extension}". Supported: ${Object.keys(MIME_BY_EXT).join(", ")}`,
    );
    process.exit(1);
  }

  log.step(`Reading file from disk: ${basename(filePath)}`);
  const data = await readFile(filePath);
  log.info(`  ${data.length} bytes, ${type}`);

  return { data, size: data.length, type };
}

async function createMeal(fileType: string, fileSize: number): Promise<IPresignDecoded> {
  log.step(`Requesting presigned POST (${fileSize} bytes, ${fileType})`);
  const res = await fetch(CREATE_MEAL_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ file: { type: fileType, size: fileSize } }),
  });

  if (!res.ok) {
    throw new Error(`Failed to get presigned POST: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as IPresignResponse;
  const decoded = JSON.parse(
    Buffer.from(json.uploadSignature, "base64").toString("utf-8"),
  ) as IPresignDecoded;

  log.ok("Received presigned POST data");

  return decoded;
}

function buildFormData(
  fields: Record<string, string>,
  fileData: Buffer,
  filename: string,
  fileType: string,
): FormData {
  log.step(`Building FormData (${Object.keys(fields).length} fields, file ${filename})`);
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }
  const blob = new Blob([new Uint8Array(fileData)], { type: fileType });
  form.append("file", blob, filename);
  return form;
}

async function uploadToS3(url: string, form: FormData): Promise<void> {
  log.step("Uploading to S3");
  const res = await fetch(url, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`S3 upload failed: ${res.status} ${res.statusText} — ${text}`);
  }

  log.ok("Upload completed successfully");
}

async function uploadMeal(kind: InputKind): Promise<void> {
  log.title(`Create meal from ${kind}`);
  const filePath = resolve(import.meta.dirname, "assets", SAMPLE_BY_KIND[kind]);
  const { data, size, type } = await readInputFile(filePath);
  const { url, fields } = await createMeal(type, size);
  const form = buildFormData(fields, data, basename(filePath), type);
  await uploadToS3(url, form);
}

uploadMeal(resolveInputKind()).catch((err) => {
  log.fail(`Error during uploadMeal: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});
