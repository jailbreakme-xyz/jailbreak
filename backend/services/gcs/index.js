import { Storage } from "@google-cloud/storage";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

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

      // Create a unique file name with timestamp
      const timestamp = Date.now();
      const uniqueFileName = `${timestamp}-${fileName}.png`;
      const file = bucket.file(uniqueFileName);

      await file.save(Buffer.from(buffer), {
        metadata: {
          contentType: "image/png",
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

      // Extract file extension from original filename or default to png
      const fileExtension = fileName.split(".").pop().toLowerCase();
      const validExtensions = ["png", "jpg", "jpeg", "gif"];
      const extension = validExtensions.includes(fileExtension)
        ? fileExtension
        : "png";

      // Create a unique file name with timestamp and proper extension
      const uniqueFileName = `${fileName}.${extension}`;
      const file = bucket.file(uniqueFileName);

      // Set the appropriate content type based on extension
      const contentType =
        extension === "gif"
          ? "image/gif"
          : extension === "jpg" || extension === "jpeg"
          ? "image/jpeg"
          : "image/png";

      await file.save(buffer, {
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
