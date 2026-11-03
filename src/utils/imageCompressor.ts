/**
 * Image compression and scaling utility
 * Solves the issue where high-resolution smartphone camera photos fail to send over MQTT/storage
 * by automatically downscaling large images to a web-optimized resolution (max 1280px) and compressing to JPEG.
 */

export async function compressImageFile(file: File, maxWidth = 1280, maxHeight = 1280, quality = 0.8): Promise<string> {
  return new Promise((resolve, reject) => {
    // If already small SVG or gif, read directly
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio preserved dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        // Fill white background for transparent PNG converted to JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to web-friendly JPEG with quality compression
        let dataUrl = canvas.toDataURL('image/jpeg', quality);

        // If still too large (> 600KB base64), compress a bit more
        if (dataUrl.length > 600000 && quality > 0.5) {
          dataUrl = canvas.toDataURL('image/jpeg', 0.6);
        }

        resolve(dataUrl);
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
