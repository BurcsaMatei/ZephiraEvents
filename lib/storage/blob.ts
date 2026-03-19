// lib/blob.ts
// ==============================
// Vercel Blob helper — signed URL via API
// ==============================

export type BlobUploadRequest = {
  filename: string;
  contentType: string;
  prefix?: string;
};

export type BlobUploadResponse = {
  uploadUrl: string;
  url: string; // public URL (after PUT)
};

export async function getSignedUploadUrl(body: BlobUploadRequest): Promise<BlobUploadResponse> {
  const res = await fetch("/api/reviews?upload=1", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`[blob] Failed to get upload URL: ${text}`);
  }
  return (await res.json()) as BlobUploadResponse;
}

export async function uploadFileViaSignedUrl(file: File, prefix = "reviews"): Promise<string> {
  const { name, type } = file;
  const { uploadUrl, url } = await getSignedUploadUrl({
    filename: name,
    contentType: type || "application/octet-stream",
    prefix,
  });
  const put = await fetch(uploadUrl, { method: "PUT", body: file });
  if (!put.ok) {
    const text = await put.text();
    throw new Error(`[blob] PUT failed: ${text}`);
  }
  return url; // public URL
}
