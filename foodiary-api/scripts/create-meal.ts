import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// @ts-expect-error workaround for `__dirname is not defined in ES module scope` error
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = "https://vjm9dwgvbf.execute-api.sa-east-1.amazonaws.com/meals";
const TOKEN =
  "eyJraWQiOiI5N0dzVVcrYnhUSXMrZGFcL2lmWXQwU2lvVnlnVnFjeDdQZWxEUUw5OXp0ND0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI2M2FjMmE2YS04MDMxLTcwY2YtNTcxMi01NDE5MDUyMzRjOWYiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuc2EtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3NhLWVhc3QtMV9wemdPUW91UVkiLCJjbGllbnRfaWQiOiI3NHRqbzJ1YWtrb3Y5MGJubWptMHJxbG9hYSIsIm9yaWdpbl9qdGkiOiI4YWMzMjMwYi04MmNhLTRhZmUtYTVkOC1jNGRkYWIwOGM2NjQiLCJpbnRlcm5hbElkIjoiMzBXdFU5aEZyQktSb0tsazVzbXptNG1KeEtBIiwiZXZlbnRfaWQiOiJkMTNmYmMwNy1kYWRmLTQ3NjEtYTgwNS0xMjZjOGQzZTM1YWIiLCJ0b2tlbl91c2UiOiJhY2Nlc3MiLCJzY29wZSI6ImF3cy5jb2duaXRvLnNpZ25pbi51c2VyLmFkbWluIiwiYXV0aF90aW1lIjoxNzU0MTQzNTA5LCJleHAiOjE3NTQxODY3MDksImlhdCI6MTc1NDE0MzUwOSwianRpIjoiYTQ0OWI4ZTgtODBkNi00MzAwLTg3NjEtY2E4OWI4MDNlMTFkIiwidXNlcm5hbWUiOiI2M2FjMmE2YS04MDMxLTcwY2YtNTcxMi01NDE5MDUyMzRjOWYifQ.KlIIh-H-h5d3h_DHHuqQvaicM7z3Rn8m37xHVtJ2AaSaJ-8b8RTM3FBDIgDqwnKAVLgcTemPeWPyhDH107HwCO9U78mUli-ep8lXwP25h6HtG__sUXVpuCu0h8lSMzLBqU-6uamRkWpdtOFr7R4EPmJr0ceqNziyIpfm1eeGD7C92DZHAzA1_B3AHX4IDPYxjKfr_9Xx2k6O6ZmU50cAMhjZow7xc0oRC70FuM3EerApbnoYskfNNH6fBaUWVcv7wuE40CiZjRZKTs71q5ZzMwTB3DNohjthj9k623GD123No5DditKKgPr_SI4N_BWN0HHf5_iNugaq2C0hFXt48w";

interface IPresignResponse {
  uploadSignature: string;
}

interface IPresignDecoded {
  url: string;
  fields: Record<string, string>;
}

async function readImageFile(filePath: string): Promise<{
  data: Buffer;
  size: number;
  type: string;
}> {
  console.log(`🔍 Reading file from disk: ${filePath}`);
  const data = await fs.readFile(filePath);
  return {
    data,
    size: data.length,
    type: "image/jpeg",
  };
}

async function createMeal(fileType: string, fileSize: number): Promise<IPresignDecoded> {
  console.log(`🚀 Requesting presigned POST for ${fileSize} bytes of type ${fileType}`);
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOKEN}`,
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

  console.log("✅ Received presigned POST data");

  return decoded;
}

function buildFormData(
  fields: Record<string, string>,
  fileData: Buffer,
  filename: string,
  fileType: string,
): FormData {
  console.log(
    `📦 Building FormData with ${Object.keys(fields).length} fields and file ${filename}`,
  );
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    form.append(key, value);
  }
  const blob = new Blob([fileData], { type: fileType });
  form.append("file", blob, filename);
  return form;
}

async function uploadToS3(url: string, form: FormData): Promise<void> {
  console.log(`📤 Uploading to S3 at ${url}`);
  const res = await fetch(url, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`S3 upload failed: ${res.status} ${res.statusText} — ${text}`);
  }

  console.log("🎉 Upload completed successfully");
}

async function uploadMealImage(filePath: string): Promise<void> {
  try {
    const { data, size, type } = await readImageFile(filePath);
    const { url, fields } = await createMeal(type, size);
    const form = buildFormData(fields, data, path.basename(filePath), type);
    await uploadToS3(url, form);
  } catch (err) {
    console.error("❌ Error during uploadMealImage:", err);
    throw err;
  }
}

uploadMealImage(path.resolve(__dirname, "assets", "sample.jpg")).catch(() => process.exit(1));
