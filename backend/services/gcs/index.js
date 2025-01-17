import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const keyFilename = path.join(__dirname, "../../secrets/gcs.json");

dotenv.config();

class GoogleCloudService {
  constructor() {
    this.storage = new Storage({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      keyFilename: keyFilename,
    });
    this.bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME;
  }

  async uploadImageFromUrl(imageUrl, fileName) {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const response = await fetch(imageUrl);
      const buffer = await response.arrayBuffer();

      // Resize and compress image
      const resizedBuffer = await sharp(Buffer.from(buffer))
        .resize(1200, 1200, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: 80 }) // Convert to WebP with 80% quality
        .toBuffer();

      const uniqueFileName = `${fileName}.webp`; // Change extension to .webp
      const file = bucket.file(uniqueFileName);

      await file.save(resizedBuffer, {
        metadata: {
          contentType: "image/webp", // Update content type
        },
      });

      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${uniqueFileName}`;
      return publicUrl;
    } catch (error) {
      console.error("Error uploading image to Google Cloud Storage:", error);
      throw error;
    }
  }

  async uploadImageBuffer(buffer, fileName) {
    try {
      const bucket = this.storage.bucket(this.bucketName);
      const fileExtension = fileName.split(".").pop().toLowerCase();

      let processedBuffer;
      let finalExtension;
      let contentType;

      // Handle different image types
      if (fileExtension === "gif") {
        // For GIFs, keep original format but optimize
        processedBuffer = await sharp(buffer, { animated: true })
          .gif({ quality: 60 }) // Reduce GIF quality
          .toBuffer();
        finalExtension = "gif";
        contentType = "image/gif";
      } else {
        // For all other images, convert to WebP
        processedBuffer = await sharp(buffer)
          .resize(1200, 1200, {
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({
            quality: 80, // Adjust quality (0-100)
            effort: 6, // Compression effort (0-6)
            nearLossless: true, // Use near-lossless compression
          })
          .toBuffer();
        finalExtension = "webp";
        contentType = "image/webp";
      }

      // Create unique filename with new extension
      const uniqueFileName = `${fileName}.${finalExtension}`;
      const file = bucket.file(uniqueFileName);

      await file.save(processedBuffer, {
        metadata: {
          contentType: contentType,
        },
      });

      // Get the public URL
      const publicUrl = `https://storage.googleapis.com/${this.bucketName}/${uniqueFileName}`;
      return publicUrl;
    } catch (error) {
      console.error(
        "Error uploading image buffer to Google Cloud Storage:",
        error
      );
      throw error;
    }
  }
}

export default new GoogleCloudService();
