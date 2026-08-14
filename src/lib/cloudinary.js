const API_BASE = import.meta.env.VITE_API_BASE_URL || "";
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
const UPLOAD_FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER || "palimpsest";

export const isCloudinaryConfigured = Boolean(CLOUD_NAME && API_KEY && API_BASE);

/**
 * Uploads one file straight to Cloudinary using a short-lived signature
 * issued by our backend worker (keeps the Cloudinary API secret off the
 * client). Returns { url, publicId, resourceType, bytes }.
 */
export async function uploadToCloudinary(file, { folder = UPLOAD_FOLDER, onProgress } = {}) {
  if (!isCloudinaryConfigured) {
    throw new Error(
      "Cloudinary isn't configured — set VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_API_KEY and VITE_API_BASE_URL in frontend/.env."
    );
  }

  const signRes = await fetch(`${API_BASE}/api/cloudinary/sign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  if (!signRes.ok) throw new Error("Could not get an upload signature from the backend.");
  const { signature, timestamp, apiKey, cloudName, folder: signedFolder } = await signRes.json();

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp);
  form.append("signature", signature);
  form.append("folder", signedFolder);

  const resourceType = file.type.startsWith("image/") ? "image" : "raw";
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadUrl);
    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        resolve({
          url: data.secure_url,
          publicId: data.public_id,
          resourceType: data.resource_type,
          bytes: data.bytes,
        });
      } else {
        reject(new Error(`Cloudinary upload failed (${xhr.status}): ${xhr.responseText}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error while uploading to Cloudinary."));
    xhr.send(form);
  });
}
