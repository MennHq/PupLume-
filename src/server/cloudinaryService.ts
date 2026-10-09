import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const cloud_name = process.env.CLOUDINARY_CLOUD_NAME || 'iy8oa0qj';
const api_key = process.env.CLOUDINARY_API_KEY || '676714719837168';
const api_secret = process.env.CLOUDINARY_API_SECRET || 'OdMstlADoBFXHObvTBGhUR091Lk';

cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
  secure: true,
});

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
  transformation?: any[];
}

export async function uploadToCloudinary(
  fileData: string,
  options: UploadOptions = {}
): Promise<{ url: string; publicId: string; width?: number; height?: number; format?: string }> {
  try {
    if (!fileData) {
      throw new Error('No image data provided for upload');
    }

    const folder = options.folder || 'puplume/pets';
    const uploadResult: UploadApiResponse = await cloudinary.uploader.upload(fileData, {
      folder,
      resource_type: 'auto',
      tags: options.tags || ['puplume', 'pets'],
      transformation: options.transformation || [
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    return {
      url: uploadResult.secure_url || uploadResult.url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
    };
  } catch (error: any) {
    console.error('[Cloudinary] Upload failed:', error);
    throw new Error(error?.message || 'Failed to upload image to Cloudinary');
  }
}
