const cloudinary = require('cloudinary').v2;

// Configure Cloudinary credentials from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Upload an image buffer to Cloudinary
 * @param {Buffer} buffer - Image file buffer
 * @param {string} userId - User ID for organizing folder paths
 * @param {string} originalname - Original file name
 * @returns {Promise<{ secureUrl: string, publicId: string, format: string, bytes: number }>}
 */
const uploadToCloudinaryBuffer = (buffer, userId = 'common', originalname = 'garment.jpg') => {
  return new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME === 'your_cloudinary_cloud_name') {
      // Fallback mock mode for development if Cloudinary credentials are missing
      const mockPublicId = `shaili_wardrobe/${userId}/${Date.now()}_${Math.random().toString(36).substring(7)}`;
      return resolve({
        secureUrl: `https://res.cloudinary.com/demo/image/upload/${mockPublicId}.jpg`,
        publicId: mockPublicId,
        format: 'jpg',
        bytes: buffer ? buffer.length : 100000,
      });
    }

    const cleanFileName = originalname.replace(/[^a-zA-Z0-9]/g, '_');
    const folderPath = `shaili_wardrobe/${userId}`;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folderPath,
        public_id: `${Date.now()}_${cleanFileName}`,
        resource_type: 'image',
        transformation: [
          { width: 1200, height: 1200, crop: 'limit', quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary Upload Stream Error:', error);
          return reject(new Error('Cloudinary image upload failed: ' + error.message));
        }
        resolve({
          secureUrl: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          bytes: result.bytes,
        });
      }
    );

    stream.end(buffer);
  });
};

/**
 * Delete image from Cloudinary by public_id
 * @param {string} publicId - Cloudinary public ID
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId || publicId.includes('demo/image/upload')) return true;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (err) {
    console.warn('Cloudinary Delete Warning:', err.message);
    return false;
  }
};

/**
 * Generate optimized Cloudinary thumbnail URL
 * @param {string} publicId - Cloudinary public ID
 * @param {number} width - Target width
 * @param {number} height - Target height
 */
const getOptimizedThumbnailUrl = (publicId, width = 300, height = 300) => {
  if (!publicId) return '';
  return cloudinary.url(publicId, {
    width,
    height,
    crop: 'fill',
    gravity: 'center',
    quality: 'auto',
    fetch_format: 'auto',
    secure: true,
  });
};

module.exports = {
  uploadToCloudinaryBuffer,
  deleteFromCloudinary,
  getOptimizedThumbnailUrl,
};
