import { useState } from "react";

export const useUploadLoader = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startUploading = () => {
    setUploading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) {
          clearInterval(interval);
          return 95;
        }
        return p + Math.random() * 8;
      });
    }, 200);
  };

  const finishUploading = () => {
    setProgress(100);
    setTimeout(() => {
      setUploading(false);
      setProgress(0);
    }, 400);
  };

  return { uploading, progress, startUploading, finishUploading };
};
