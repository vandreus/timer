import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

// Process and compress uploaded image
export const processImage = async (filePath, maxWidth = 1920, maxHeight = 1080, quality = 80) => {
  try {
    const image = sharp(filePath);
    const metadata = await image.metadata();

    // Resize if necessary
    let processedImage = image;
    if (metadata.width > maxWidth || metadata.height > maxHeight) {
      processedImage = image.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    // Convert HEIC/HEIF to JPEG and compress
    if (metadata.format === 'heif' || metadata.format === 'heic') {
      const jpegPath = filePath.replace(/\.(heic|heif)$/i, '.jpg');
      await processedImage
        .jpeg({ quality })
        .toFile(jpegPath);
      
      // Delete original HEIC file
      await fs.unlink(filePath);
      return jpegPath;
    }

    // Compress existing image
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg') {
      await processedImage
        .jpeg({ quality })
        .toFile(filePath + '.tmp');
      await fs.rename(filePath + '.tmp', filePath);
    } else if (ext === '.png') {
      await processedImage
        .png({ quality })
        .toFile(filePath + '.tmp');
      await fs.rename(filePath + '.tmp', filePath);
    }

    return filePath;
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process image');
  }
};

// Delete image file
export const deleteImage = async (filePath) => {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error('Failed to delete image:', error);
    return false;
  }
};
