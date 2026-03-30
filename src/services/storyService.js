import axios from "axios";
import API_URL from "../utils/config";

export const STORY_ACCEPT = "image/*,video/*";
export const STORY_MAX_IMAGE_SIZE_MB = 12;
export const STORY_MAX_VIDEO_SIZE_MB = 60;
export const STORY_MAX_VIDEO_DURATION_SECONDS = 15;

const MOBILE_REGEX = /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i;

const getAuthHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export function isMobileStoryDevice() {
  if (typeof navigator === "undefined") return false;
  return MOBILE_REGEX.test(navigator.userAgent || "");
}

export function supportsGetUserMedia() {
  return Boolean(navigator?.mediaDevices?.getUserMedia);
}

export function supportsMediaRecorder() {
  return typeof window !== "undefined" && typeof window.MediaRecorder !== "undefined";
}

export function getCaptureFacingMode(preferredFacing = "environment") {
  return preferredFacing === "user" ? "user" : "environment";
}

export function getStoryMediaType(story) {
  const rawType = String(
    story?.mediaType ||
      story?.media_type ||
      story?.mimeType ||
      story?.fileType ||
      story?.type ||
      ""
  ).toLowerCase();

  if (
    rawType.includes("video") ||
    story?.video_url ||
    story?.video ||
    story?.videoUrl ||
    story?.isVideo
  ) {
    return "video";
  }

  return "image";
}

export async function getVideoDuration(file) {
  if (!file?.type?.startsWith("video/")) return 0;

  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.removeAttribute("src");
      video.load();
    };

    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      cleanup();
      resolve(duration);
    };
    video.onerror = () => {
      cleanup();
      reject(new Error("No se pudo leer la duración del video."));
    };

    video.src = objectUrl;
  });
}

export async function validateStoryFile(file) {
  if (!file) {
    throw new Error("Selecciona una imagen o video para la historia.");
  }

  const isImage = file.type?.startsWith("image/");
  const isVideo = file.type?.startsWith("video/");

  if (!isImage && !isVideo) {
    throw new Error("Solo se permiten imágenes o videos en las historias.");
  }

  const maxSizeMb = isVideo ? STORY_MAX_VIDEO_SIZE_MB : STORY_MAX_IMAGE_SIZE_MB;
  const sizeInMb = file.size / (1024 * 1024);

  if (sizeInMb > maxSizeMb) {
    throw new Error(
      `El ${isVideo ? "video" : "archivo"} supera el límite de ${maxSizeMb} MB.`
    );
  }

  if (isVideo) {
    const duration = await getVideoDuration(file);
    if (duration > STORY_MAX_VIDEO_DURATION_SECONDS) {
      throw new Error(
        `El video no puede durar más de ${STORY_MAX_VIDEO_DURATION_SECONDS} segundos.`
      );
    }
    return { mediaType: "video", duration };
  }

  return { mediaType: "image", duration: 5 };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("No se pudo leer la imagen."));
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("No se pudo procesar la imagen."));
    image.src = dataUrl;
  });
}

function renameToJpeg(filename = "story.jpg") {
  const baseName = filename.replace(/\.[^.]+$/, "") || "story";
  return `${baseName}.jpg`;
}

export async function compressImageForStory(file, options = {}) {
  if (!file?.type?.startsWith("image/")) return file;

  const { maxWidth = 1080, maxHeight = 1920, quality = 0.82 } = options;

  if (file.size <= 1.5 * 1024 * 1024) {
    return file;
  }

  const dataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(dataUrl);

  const widthRatio = maxWidth / image.width;
  const heightRatio = maxHeight / image.height;
  const ratio = Math.min(1, widthRatio, heightRatio);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(image.width * ratio);
  canvas.height = Math.round(image.height * ratio);

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return file;

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", quality);
  });

  if (!blob) return file;

  return new File([blob], renameToJpeg(file.name), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

export async function prepareStoryFile(file) {
  const { mediaType } = await validateStoryFile(file);

  if (mediaType === "image") {
    return compressImageForStory(file);
  }

  return file;
}

export function cacheStoryDraftMeta(payload) {
  if (typeof sessionStorage === "undefined") return;

  sessionStorage.setItem(
    "story-draft-meta",
    JSON.stringify({
      ...payload,
      updatedAt: Date.now(),
    })
  );
}

export function clearStoryDraftMeta() {
  if (typeof sessionStorage === "undefined") return;
  sessionStorage.removeItem("story-draft-meta");
}

function buildCurrentUser(user = {}) {
  const fallbackName = user?.nombre || user?.username || user?.email?.split("@")[0] || "Tu historia";
  return {
    name: fallbackName,
    username: user?.username || fallbackName,
    avatar: user?.avatar || user?.image || "/default-avatar.png",
  };
}

export function createOptimisticStory({ file, caption, user, previewUrl }) {
  const owner = buildCurrentUser(user);
  const mediaType = file?.type?.startsWith("video/") ? "video" : "image";

  return {
    id: `story-temp-${Date.now()}`,
    caption: caption?.trim() || "",
    image_url: previewUrl,
    image: previewUrl,
    media_url: previewUrl,
    mediaUrl: previewUrl,
    video_url: mediaType === "video" ? previewUrl : undefined,
    video: mediaType === "video" ? previewUrl : undefined,
    mediaType,
    media_type: mediaType,
    mimeType: file?.type,
    nombre: owner.name,
    username: owner.username,
    avatar: owner.avatar,
    user: {
      nombre: owner.name,
      username: owner.username,
      avatar: owner.avatar,
    },
    createdAt: new Date().toISOString(),
    seen: false,
    visto: false,
    isUploading: true,
    isOptimistic: true,
  };
}

export function mergeUploadedStory(responseData, optimisticStory) {
  const incomingStory = responseData?.story || responseData?.data?.story || responseData;

  if (!incomingStory || typeof incomingStory !== "object") {
    return {
      ...optimisticStory,
      isUploading: false,
      isOptimistic: false,
    };
  }

  return {
    ...optimisticStory,
    ...incomingStory,
    user: {
      ...(optimisticStory?.user || {}),
      ...(incomingStory?.user || {}),
    },
    isUploading: false,
    isOptimistic: false,
  };
}

export async function uploadStoryMedia({ file, caption = "", onUploadProgress }) {
  const preparedFile = await prepareStoryFile(file);
  const formData = new FormData();

  formData.append("image", preparedFile, preparedFile.name);
  formData.append("media", preparedFile, preparedFile.name);
  formData.append(
    "mediaType",
    preparedFile?.type?.startsWith("video/") ? "video" : "image"
  );

  if (caption?.trim()) {
    formData.append("caption", caption.trim());
  }

  const response = await axios.post(`${API_URL}/api/stories`, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress,
  });

  return response.data;
}
