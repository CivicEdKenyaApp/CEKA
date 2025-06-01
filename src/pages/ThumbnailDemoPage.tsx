
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThumbnailGenerator } from '@/components/ui/ThumbnailGenerator';
import { ThumbnailPreview } from '@/components/ui/ThumbnailPreview';
import { Button } from '@/components/ui/button';
import { getFileType } from '@/utils/fileUtils';
import { Upload, FileImage, FileVideo, FileText } from 'lucide-react';

const ThumbnailDemoPage = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generatedThumbnail, setGeneratedThumbnail] = useState<Blob | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setGeneratedThumbnail(null);
    }
  };

  const handleThumbnailGenerated = (thumbnail: Blob) => {
    setGeneratedThumbnail(thumbnail);
  };

  const fileType = selectedFile ? getFileType(selectedFile) : 'document';

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Thumbnail System Demo</h1>
            <p className="text-muted-foreground text-lg">
              Upload files and generate thumbnails for images, videos, and documents
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  File Upload
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-lg font-medium">Choose a file</p>
                      <p className="text-sm text-muted-foreground">
                        Supports images, videos, PDFs, and documents
                      </p>
                    </label>
                  </div>

                  {selectedFile && (
                    <div className="bg-muted rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        {fileType === 'image' && <FileImage className="h-8 w-8 text-blue-500" />}
                        {fileType === 'video' && <FileVideo className="h-8 w-8 text-green-500" />}
                        {fileType === 'document' && <FileText className="h-8 w-8 text-orange-500" />}
                        <div>
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {fileType}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thumbnail Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <ThumbnailPreview
                  file={selectedFile}
                  type={fileType}
                  width={300}
                  height={200}
                  quality={0.8}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Advanced Thumbnail Generator</CardTitle>
            </CardHeader>
            <CardContent>
              <ThumbnailGenerator
                onThumbnailGenerated={handleThumbnailGenerated}
                defaultWidth={400}
                defaultHeight={300}
              />
            </CardContent>
          </Card>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileImage className="h-5 w-5 text-blue-500" />
                  Image Thumbnails
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Generates optimized thumbnails for JPEG, PNG, GIF, and WebP images with 
                  automatic aspect ratio preservation and cropping.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileVideo className="h-5 w-5 text-green-500" />
                  Video Thumbnails
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Extracts frame thumbnails from MP4, WebM, and other video formats at 
                  25% duration for representative preview images.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  Document Thumbnails
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Creates visual representations for PDFs, Word documents, and text files 
                  with document icons and filename preview.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ThumbnailDemoPage;
