import React, { forwardRef } from "react";
import StoryUploader from "../stories/StoryUploader";

const CreateStoryModalPremium = forwardRef(function CreateStoryModalPremium(
  {
    open,
    user,
    onClose,
    onOptimisticStory,
    onStoryUploaded,
    onStoryUploadError,
    onRefreshStories,
    preferredCamera = "environment",
  },
  ref
) {
  return (
    <StoryUploader
      ref={ref}
      open={open}
      user={user}
      onClose={onClose}
      preferredCamera={preferredCamera}
      onOptimisticStory={onOptimisticStory}
      onStoryUploaded={onStoryUploaded}
      onStoryUploadError={onStoryUploadError}
      onRefreshStories={onRefreshStories}
    />
  );
});

export default CreateStoryModalPremium;