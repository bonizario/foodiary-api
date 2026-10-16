/** Fetches `url` and returns its body as a Buffer. */
export async function downloadFileFromUrl(url: string): Promise<Buffer> {
  const response = await fetch(url);
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
