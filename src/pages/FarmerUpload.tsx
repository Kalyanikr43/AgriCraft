import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { compressImage, validateImageFile } from '@/lib/imageCompression';
import { storageApi } from '@/db/api';
import { classifyWaste } from '@/services/aiService';
import { supabase } from '@/db/supabase';
import PageMeta from '@/components/common/PageMeta';

export default function FarmerUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: 'Invalid file',
        description: validation.error,
        variant: 'destructive'
      });
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to upload waste images.',
          variant: 'destructive'
        });
        navigate('/login');
        return;
      }

      setUploadProgress(20);
      let fileToUpload = selectedFile;
      let wasCompressed = false;
      const originalSize = selectedFile.size;

      if (selectedFile.size > 1024 * 1024) {
        toast({
          title: 'Compressing image',
          description: 'Your image is being compressed to meet size requirements...'
        });
        fileToUpload = await compressImage(selectedFile);
        wasCompressed = true;
      }

      setUploadProgress(40);

      const fileName = `waste_${user.id}_${Date.now()}.${fileToUpload.name.split('.').pop()}`;
      const imageUrl = await storageApi.uploadImage(fileToUpload, fileName);

      setUploadProgress(60);

      toast({
        title: 'Classifying waste',
        description: 'AI is analyzing your image...'
      });

      const classification = await classifyWaste(fileToUpload);

      setUploadProgress(80);

      const { error } = await supabase
        .from('waste_classifications')
        .insert([{
          farmer_id: user.id,
          image_url: imageUrl,
          detected_type: classification.detectedType,
          confidence: classification.confidence,
          ai_response: classification.fullResponse
        }]);

      if (error) throw error;

      setUploadProgress(100);

      if (wasCompressed) {
        toast({
          title: 'Image compressed',
          description: `Image size reduced from ${(originalSize / 1024 / 1024).toFixed(2)}MB to ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB`
        });
      }

      toast({
        title: 'Classification complete!',
        description: 'Redirecting to results...'
      });

      navigate('/farmer/classification-result', {
        state: {
          classification,
          imageUrl
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload and classify waste',
        variant: 'destructive'
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <>
      <PageMeta title="Upload Waste" description="Upload agricultural waste for AI classification" />
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Upload Agricultural Waste</CardTitle>
              <CardDescription>
                Upload an image of your agricultural waste for AI-powered classification and guidance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                {preview ? (
                  <div className="space-y-4">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-64 mx-auto rounded-lg object-contain"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreview('');
                      }}
                    >
                      Choose Different Image
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={isUploading}
                    />
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-lg font-medium">Click to upload image</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Supported: JPEG, PNG, GIF, WEBP, AVIF (max 1MB)
                        </p>
                      </div>
                    </div>
                  </label>
                )}
              </div>

              {selectedFile && (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">Supported Waste Types:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                      <li>Coconut shell</li>
                      <li>Banana stem</li>
                      <li>Rice husk</li>
                    </ul>
                  </div>

                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Processing...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full"
                    size="lg"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload & Classify
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
