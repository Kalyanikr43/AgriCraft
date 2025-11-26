import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { compressImage, validateImageFile } from '@/lib/imageCompression';
import { storageApi, productsApi } from '@/db/api';
import { supabase } from '@/db/supabase';
import PageMeta from '@/components/common/PageMeta';

export default function CreateProduct() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { materialType } = location.state || {};

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [productImage, setProductImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    phone: ''
  });

  const materialTypeMap: Record<string, string> = {
    coconut_shell: 'Coconut Shell',
    banana_stem: 'Banana Stem',
    rice_husk: 'Rice Husk'
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setProductImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Authentication required',
          description: 'Please log in to create a product listing.',
          variant: 'destructive'
        });
        navigate('/login');
        return;
      }

      if (!productImage) {
        toast({
          title: 'Image required',
          description: 'Please upload a product image.',
          variant: 'destructive'
        });
        return;
      }

      const price = Number.parseFloat(formData.price);
      if (Number.isNaN(price) || price <= 0) {
        toast({
          title: 'Invalid price',
          description: 'Please enter a valid price greater than 0.',
          variant: 'destructive'
        });
        return;
      }

      const phoneRegex = /^[0-9+\-() ]+$/;
      if (!phoneRegex.test(formData.phone)) {
        toast({
          title: 'Invalid phone number',
          description: 'Please enter a valid phone number.',
          variant: 'destructive'
        });
        return;
      }

      let fileToUpload = productImage;
      if (productImage.size > 1024 * 1024) {
        toast({
          title: 'Compressing image',
          description: 'Your image is being compressed...'
        });
        fileToUpload = await compressImage(productImage);
      }

      const fileName = `product_${user.id}_${Date.now()}.${fileToUpload.name.split('.').pop()}`;
      const imageUrl = await storageApi.uploadImage(fileToUpload, fileName);

      await productsApi.create({
        farmer_id: user.id,
        title: formData.title,
        description: formData.description || null,
        image_url: imageUrl,
        price,
        material_type: materialType || 'other',
        farmer_phone: formData.phone
      });

      toast({
        title: 'Product listed!',
        description: 'Your product is now available in the marketplace.'
      });

      navigate('/marketplace');
    } catch (error) {
      console.error('Product creation error:', error);
      toast({
        title: 'Failed to create product',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PageMeta title="Create Product" description="List your handmade product" />
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-3xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create Product Listing</CardTitle>
              <CardDescription>
                List your handmade product made from {materialType ? materialTypeMap[materialType] : 'agricultural waste'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="product-image">Product Image *</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6">
                    {preview ? (
                      <div className="space-y-4">
                        <img
                          src={preview}
                          alt="Product preview"
                          className="max-h-48 mx-auto rounded-lg object-contain"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setProductImage(null);
                            setPreview('');
                          }}
                          className="w-full"
                        >
                          Choose Different Image
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer block text-center">
                        <input
                          id="product-image"
                          type="file"
                          accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <div className="flex flex-col items-center gap-3">
                          <Upload className="w-10 h-10 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Click to upload product image</p>
                            <p className="text-sm text-muted-foreground">Max 1MB</p>
                          </div>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Product Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Handwoven Coconut Shell Basket"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your product, its features, and how it was made..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 1234567890"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Your product will be automatically listed in the marketplace. 
                    Buyers will be able to contact you directly using the phone number provided.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Listing...
                    </>
                  ) : (
                    'Create Product Listing'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
