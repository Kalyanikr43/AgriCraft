import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Phone, Leaf } from 'lucide-react';
import { productsApi } from '@/db/api';
import type { Product } from '@/types';
import { useToast } from '@/hooks/use-toast';
import PageMeta from '@/components/common/PageMeta';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const materialTypeMap: Record<string, string> = {
    coconut_shell: 'Coconut Shell',
    banana_stem: 'Banana Stem',
    rice_husk: 'Rice Husk',
    other: 'Other'
  };

  useEffect(() => {
    if (id) {
      loadProduct(id);
    }
  }, [id]);

  const loadProduct = async (productId: string) => {
    try {
      setIsLoading(true);
      const data = await productsApi.getById(productId);
      if (!data) {
        toast({
          title: 'Product not found',
          description: 'This product may have been removed.',
          variant: 'destructive'
        });
        navigate('/marketplace');
        return;
      }
      setProduct(data);
    } catch (error) {
      console.error('Failed to load product:', error);
      toast({
        title: 'Failed to load product',
        description: 'Please try again later.',
        variant: 'destructive'
      });
      navigate('/marketplace');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuy = () => {
    setShowContact(true);
    toast({
      title: 'Contact Information Revealed',
      description: 'You can now contact the farmer directly to purchase this product.'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Leaf className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <>
      <PageMeta title={product.title} description={product.description || 'Handmade product from agricultural waste'} />
      <div className="min-h-screen bg-background">
        <header className="bg-card border-b border-border sticky top-0 z-10">
          <div className="max-w-7xl mx-auto p-4 xl:p-6">
            <Button variant="ghost" onClick={() => navigate('/marketplace')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Marketplace
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-4 xl:p-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div>
              <Card>
                <CardContent className="p-0">
                  <img
                    src={product.image_url}
                    alt={product.title}
                    className="w-full rounded-lg object-cover"
                  />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl xl:text-4xl font-bold text-foreground mb-4">
                  {product.title}
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="secondary" className="text-sm">
                    {materialTypeMap[product.material_type] || product.material_type}
                  </Badge>
                  <Badge variant="outline" className="text-sm">
                    Handmade
                  </Badge>
                </div>
                <p className="text-4xl font-bold text-primary mb-6">
                  ₹{product.price.toFixed(2)}
                </p>
              </div>

              {product.description && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-3">Description</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3">Product Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Material:</span>
                      <span className="font-medium">
                        {materialTypeMap[product.material_type] || product.material_type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="default">Available</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Listed:</span>
                      <span className="font-medium">
                        {new Date(product.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {showContact ? (
                <Card className="border-primary">
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Farmer Contact</h3>
                    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Phone Number</p>
                        <p className="text-lg font-bold">{product.farmer_phone}</p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      Contact the farmer directly to discuss pricing, delivery, and product details.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Button onClick={handleBuy} size="lg" className="w-full">
                  <Phone className="w-5 h-5 mr-2" />
                  Contact Farmer to Buy
                </Button>
              )}

              <Card className="bg-muted">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <Leaf className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold mb-2">Eco-Friendly Product</h4>
                      <p className="text-sm text-muted-foreground">
                        This product is handcrafted from agricultural waste, supporting sustainable practices 
                        and empowering local farmers.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
