import fs from 'fs';
import path from 'path';

export class FileHandler {
  /**
   * Read and convert image file to base64
   */
  static async imageToBase64(imagePath: string): Promise<string> {
    try {
      // Resolve path (handle relative paths)
      const resolvedPath = path.resolve(imagePath);

      // Check if file exists
      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Image file not found: ${imagePath}`);
      }

      // Read file stats
      const stats = fs.statSync(resolvedPath);

      // Check if it's a file (not a directory)
      if (!stats.isFile()) {
        throw new Error(`Path is not a file: ${imagePath}`);
      }

      // Check file size (limit to 10MB for safety)
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      if (stats.size > MAX_FILE_SIZE) {
        throw new Error(`Image file too large: ${imagePath} (${(stats.size / 1024 / 1024).toFixed(2)}MB, max 10MB)`);
      }

      // Read file
      const imageBuffer = fs.readFileSync(resolvedPath);

      // Convert to base64
      const base64 = imageBuffer.toString('base64');

      // Get file extension for MIME type
      const ext = path.extname(resolvedPath).toLowerCase();
      const mimeType = this.getMimeType(ext);

      return `data:${mimeType};base64,${base64}`;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to process image ${imagePath}: ${error.message}`);
      }
      throw new Error(`Failed to process image ${imagePath}: ${error}`);
    }
  }

  /**
   * Get MIME type based on file extension
   */
  private static getMimeType(ext: string): string {
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.bmp': 'image/bmp'
    };

    return mimeTypes[ext] || 'image/jpeg'; // Default to JPEG
  }

  /**
   * Validate multiple image paths
   */
  static validateImagePaths(imagePaths: string[]): void {
    if (!imagePaths || imagePaths.length === 0) {
      throw new Error("At least one image path must be provided");
    }

    if (imagePaths.length > 10) {
      throw new Error("Too many images provided. Maximum 10 images per request.");
    }

    // Check for duplicate paths
    const uniquePaths = [...new Set(imagePaths)];
    if (uniquePaths.length !== imagePaths.length) {
      throw new Error("Duplicate image paths provided");
    }
  }

  /**
   * Get image file information
   */
  static getImageInfo(imagePath: string): { size: number; format: string } {
    try {
      const resolvedPath = path.resolve(imagePath);
      const stats = fs.statSync(resolvedPath);
      const ext = path.extname(resolvedPath).toLowerCase();

      return {
        size: stats.size,
        format: ext || 'unknown'
      };
    } catch (error) {
      throw new Error(`Failed to get image info for ${imagePath}: ${error}`);
    }
  }
}
