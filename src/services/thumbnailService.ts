
interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
}

class ThumbnailService {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d')!;
  }

  async generateFromImage(file: File, options: ThumbnailOptions = {}): Promise<Blob> {
    const { width = 300, height = 200, quality = 0.8 } = options;
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Set canvas dimensions
          this.canvas.width = width;
          this.canvas.height = height;

          // Calculate aspect ratio and positioning
          const aspectRatio = img.width / img.height;
          const targetAspectRatio = width / height;

          let drawWidth = width;
          let drawHeight = height;
          let offsetX = 0;
          let offsetY = 0;

          if (aspectRatio > targetAspectRatio) {
            // Image is wider than target, crop width
            drawWidth = height * aspectRatio;
            offsetX = -(drawWidth - width) / 2;
          } else {
            // Image is taller than target, crop height
            drawHeight = width / aspectRatio;
            offsetY = -(drawHeight - height) / 2;
          }

          // Clear canvas and draw image
          this.ctx.clearRect(0, 0, width, height);
          this.ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

          // Convert to blob
          this.canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to generate thumbnail'));
              }
            },
            'image/jpeg',
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  async generateFromVideo(file: File, options: ThumbnailOptions = {}): Promise<Blob> {
    const { width = 300, height = 200, quality = 0.8 } = options;
    
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        // Seek to 25% of video duration for a good frame
        video.currentTime = video.duration * 0.25;
      };

      video.onseeked = () => {
        try {
          this.canvas.width = width;
          this.canvas.height = height;

          // Calculate aspect ratio and positioning
          const aspectRatio = video.videoWidth / video.videoHeight;
          const targetAspectRatio = width / height;

          let drawWidth = width;
          let drawHeight = height;
          let offsetX = 0;
          let offsetY = 0;

          if (aspectRatio > targetAspectRatio) {
            drawWidth = height * aspectRatio;
            offsetX = -(drawWidth - width) / 2;
          } else {
            drawHeight = width / aspectRatio;
            offsetY = -(drawHeight - height) / 2;
          }

          this.ctx.clearRect(0, 0, width, height);
          this.ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

          this.canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to generate video thumbnail'));
              }
            },
            'image/jpeg',
            quality
          );
        } catch (error) {
          reject(error);
        }
      };

      video.onerror = () => reject(new Error('Failed to load video'));
      video.src = URL.createObjectURL(file);
    });
  }

  generateFromText(text: string, options: ThumbnailOptions = {}): Promise<Blob> {
    const { width = 300, height = 200 } = options;
    
    return new Promise((resolve, reject) => {
      try {
        this.canvas.width = width;
        this.canvas.height = height;

        // Set background
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.fillRect(0, 0, width, height);

        // Add border
        this.ctx.strokeStyle = '#e9ecef';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(1, 1, width - 2, height - 2);

        // Set text properties
        this.ctx.fillStyle = '#495057';
        this.ctx.font = '16px system-ui, -apple-system, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        // Add document icon
        const iconSize = 40;
        const iconX = width / 2;
        const iconY = height / 2 - 20;

        this.ctx.fillStyle = '#6c757d';
        this.ctx.fillRect(iconX - iconSize/2, iconY - iconSize/2, iconSize * 0.8, iconSize);
        
        // Add folded corner
        this.ctx.fillStyle = '#adb5bd';
        this.ctx.beginPath();
        this.ctx.moveTo(iconX + iconSize/2 * 0.8 - 8, iconY - iconSize/2);
        this.ctx.lineTo(iconX + iconSize/2 * 0.8, iconY - iconSize/2 + 8);
        this.ctx.lineTo(iconX + iconSize/2 * 0.8, iconY - iconSize/2);
        this.ctx.closePath();
        this.ctx.fill();

        // Add text
        this.ctx.fillStyle = '#495057';
        const truncatedText = text.length > 20 ? text.substring(0, 17) + '...' : text;
        this.ctx.fillText(truncatedText, width / 2, height / 2 + 30);

        this.canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to generate text thumbnail'));
            }
          },
          'image/png'
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  async generateThumbnail(
    file: File, 
    type: 'image' | 'video' | 'document', 
    options: ThumbnailOptions = {}
  ): Promise<Blob> {
    switch (type) {
      case 'image':
        return this.generateFromImage(file, options);
      case 'video':
        return this.generateFromVideo(file, options);
      case 'document':
        return this.generateFromText(file.name, options);
      default:
        throw new Error(`Unsupported thumbnail type: ${type}`);
    }
  }
}

export const thumbnailService = new ThumbnailService();
