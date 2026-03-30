import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  cacheStoryDraftMeta,
  clearStoryDraftMeta,
  createOptimisticStory,
  getCaptureFacingMode,
  isMobileStoryDevice,
  mergeUploadedStory,
  supportsGetUserMedia,
  uploadStoryMedia,
  validateStoryFile,
} from "../services/storyService";

export default function useStoryUpload({
  user,
  preferredCamera = "environment",
  onOptimisticStory,
  onUploadSuccess,
  onUploadError,
  onRefreshStories,
}) {
  const inputRef = useRef(null);
  const optimisticIdRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [captureMode, setCaptureMode] = useState(getCaptureFacingMode(preferredCamera));
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isPreparing, setIsPreparing] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [toast, setToast] = useState({ open: false, severity: "info", message: "" });

  useEffect(() => {
    setCaptureMode(getCaptureFacingMode(preferredCamera));
  }, [preferredCamera]);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return undefined;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    cacheStoryDraftMeta({
      name: selectedFile.name,
      size: selectedFile.size,
      type: selectedFile.type,
      caption,
      mode: "draft",
    });

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile, caption]);

  const mediaKind = useMemo(() => {
    if (!selectedFile?.type) return "image";
    return selectedFile.type.startsWith("video/") ? "video" : "image";
  }, [selectedFile]);

  const canUseFullscreenCamera = useMemo(() => supportsGetUserMedia(), []);
  const shouldPreferNativeCamera = useMemo(() => isMobileStoryDevice(), []);

  const resetDraft = useCallback((options = {}) => {
    const { keepToast = false } = options;
    setSelectedFile(null);
    setCaption("");
    setIsUploading(false);
    setUploadProgress(0);
    setIsPreparing(false);
    setCameraOpen(false);
    optimisticIdRef.current = null;
    clearStoryDraftMeta();

    if (!keepToast) {
      setToast((prev) => ({ ...prev, open: false }));
    }
  }, []);

  const openNativeCapture = useCallback((facing = preferredCamera) => {
    setCaptureMode(getCaptureFacingMode(facing));
    setCameraOpen(false);
    inputRef.current?.click();
  }, [preferredCamera]);

  const openFilePicker = useCallback(() => {
    setCaptureMode("");
    inputRef.current?.click();
  }, []);

  const openProCamera = useCallback((facing = preferredCamera) => {
    setCaptureMode(getCaptureFacingMode(facing));
    setCameraOpen(true);
  }, [preferredCamera]);

  const closeProCamera = useCallback(() => {
    setCameraOpen(false);
  }, []);

  const uploadSelectedStory = useCallback(async (nextFile = selectedFile, nextCaption = caption) => {
    if (!nextFile) {
      setToast({
        open: true,
        severity: "error",
        message: "Primero captura o selecciona una foto/video.",
      });
      return { success: false };
    }

    setIsPreparing(true);

    let fallbackPreviewUrl = "";
    let shouldRevokeFallbackPreview = false;

    try {
      await validateStoryFile(nextFile);
      setIsPreparing(false);
      setIsUploading(true);
      setUploadProgress(6);

      fallbackPreviewUrl = previewUrl || URL.createObjectURL(nextFile);
      shouldRevokeFallbackPreview = !previewUrl;

      const optimisticStory = createOptimisticStory({
        file: nextFile,
        caption: nextCaption,
        user,
        previewUrl: fallbackPreviewUrl,
      });

      optimisticIdRef.current = optimisticStory.id;
      onOptimisticStory?.(optimisticStory);

      const responseData = await uploadStoryMedia({
        file: nextFile,
        caption: nextCaption,
        onUploadProgress: (event) => {
          const total = Number(event?.total || 0);
          const loaded = Number(event?.loaded || 0);

          if (!total) {
            setUploadProgress((prev) => Math.min(92, prev + 4));
            return;
          }

          const percent = Math.round((loaded * 100) / total);
          setUploadProgress(Math.min(100, Math.max(8, percent)));
        },
      });

      const savedStory = mergeUploadedStory(responseData, optimisticStory);
      setUploadProgress(100);
      setToast({
        open: true,
        severity: "success",
        message: "Historia publicada con éxito.",
      });

      await Promise.resolve(onUploadSuccess?.(savedStory, optimisticStory.id));
      await Promise.resolve(onRefreshStories?.());

      cacheStoryDraftMeta({
        name: nextFile.name,
        type: nextFile.type,
        status: "uploaded",
      });

      if (shouldRevokeFallbackPreview) {
        setTimeout(() => URL.revokeObjectURL(fallbackPreviewUrl), 3000);
      }

      return {
        success: true,
        story: savedStory,
        optimisticId: optimisticStory.id,
      };
    } catch (error) {
      const message = error?.response?.data?.message || error?.message || "No se pudo publicar la historia.";

      setToast({
        open: true,
        severity: "error",
        message,
      });

      if (typeof fallbackPreviewUrl !== "undefined" && shouldRevokeFallbackPreview) {
        setTimeout(() => URL.revokeObjectURL(fallbackPreviewUrl), 1200);
      }

      onUploadError?.(error, optimisticIdRef.current);
      return { success: false, error };
    } finally {
      setIsPreparing(false);
      setIsUploading(false);
    }
  }, [caption, onOptimisticStory, onRefreshStories, onUploadError, onUploadSuccess, previewUrl, selectedFile, user]);

  const handleSelectedFile = useCallback(async (file, { autoUpload = true } = {}) => {
    if (!file) return { success: false };

    setSelectedFile(file);

    if (!autoUpload) {
      return { success: true, file };
    }

    return uploadSelectedStory(file, caption);
  }, [caption, uploadSelectedStory]);

  const handleInputChange = useCallback(async (event) => {
    const pickedFile = event?.target?.files?.[0];
    if (!pickedFile) return;

    await handleSelectedFile(pickedFile, { autoUpload: true });

    if (event?.target) {
      event.target.value = "";
    }
  }, [handleSelectedFile]);

  const handleCameraCapture = useCallback(async (capturedFile, options = {}) => {
    setCameraOpen(false);
    return handleSelectedFile(capturedFile, options);
  }, [handleSelectedFile]);

  return {
    inputRef,
    selectedFile,
    setSelectedFile,
    previewUrl,
    caption,
    setCaption,
    captureMode,
    mediaKind,
    isPreparing,
    isUploading,
    uploadProgress,
    cameraOpen,
    toast,
    setToast,
    canUseFullscreenCamera,
    shouldPreferNativeCamera,
    resetDraft,
    openNativeCapture,
    openFilePicker,
    openProCamera,
    closeProCamera,
    handleInputChange,
    handleCameraCapture,
    uploadSelectedStory,
  };
}
