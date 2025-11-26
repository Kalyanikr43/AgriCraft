import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sprout, ShoppingBag, Leaf } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      <PageMeta title="Home" description="Transform agricultural waste into valuable handmade products" />
      <div className="min-h-screen relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url('https://miaoda-site-img.s3cdn.medo.dev/images/70b9476c-1fe8-4eed-857e-de9de1446c44.jpg')`
          }}
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />

        <div className="relative z-10 min-h-screen flex flex-col">
          <header className="p-6 xl:p-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                <Leaf className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">AgriCraft</h1>
                <p className="text-sm text-muted-foreground">Sustainable Innovation</p>
              </div>
            </div>
          </header>

          <main className="flex-1 flex items-center justify-center p-6">
            <div className="max-w-6xl w-full">
              <div className="text-center mb-12 xl:mb-16">
                <h2 className="text-4xl xl:text-6xl font-bold text-foreground mb-4 xl:mb-6">
                  Transform Waste into Value
                </h2>
                <p className="text-lg xl:text-xl text-muted-foreground max-w-2xl mx-auto">
                  Empowering farmers to create handmade products from agricultural waste while connecting with environmentally conscious buyers
                </p>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-8 max-w-4xl mx-auto">
                <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-primary" onClick={() => navigate('/farmer/upload')}>
                  <CardContent className="p-8 xl:p-10">
                    <div className="flex flex-col items-center text-center space-y-6">
                      <div className="w-20 h-20 xl:w-24 xl:h-24 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Sprout className="w-10 h-10 xl:w-12 xl:h-12 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl xl:text-3xl font-bold text-foreground mb-3">I'm a Farmer</h3>
                        <p className="text-muted-foreground">
                          Upload agricultural waste, get AI-powered guidance, and list your handmade products
                        </p>
                      </div>
                      <Button size="lg" className="w-full">
                        Get Started
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-secondary" onClick={() => navigate('/marketplace')}>
                  <CardContent className="p-8 xl:p-10">
                    <div className="flex flex-col items-center text-center space-y-6">
                      <div className="w-20 h-20 xl:w-24 xl:h-24 bg-secondary/10 rounded-full flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                        <ShoppingBag className="w-10 h-10 xl:w-12 xl:h-12 text-secondary" />
                      </div>
                      <div>
                        <h3 className="text-2xl xl:text-3xl font-bold text-foreground mb-3">I'm a Buyer</h3>
                        <p className="text-muted-foreground">
                          Discover unique handmade products crafted from sustainable agricultural materials
                        </p>
                      </div>
                      <Button size="lg" variant="secondary" className="w-full">
                        Browse Products
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-12 xl:mt-16 text-center">
                <div className="inline-flex items-center gap-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    <span>AI-Powered Classification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-secondary rounded-full" />
                    <span>Direct Farmer Connection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full" />
                    <span>Eco-Friendly Products</span>
                  </div>
                </div>
              </div>
            </div>
          </main>

          <footer className="p-6 text-center text-sm text-muted-foreground">
            <p>2025 AgriCraft</p>
          </footer>
        </div>
      </div>
    </>
  );
}
