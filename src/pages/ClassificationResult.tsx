import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import PageMeta from '@/components/common/PageMeta';

export default function ClassificationResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { classification, imageUrl } = location.state || {};

  if (!classification) {
    navigate('/farmer/upload');
    return null;
  }

  const isValidWaste = classification.detectedType !== 'unknown';
  const materialTypeMap: Record<string, string> = {
    coconut_shell: 'Coconut Shell',
    banana_stem: 'Banana Stem',
    rice_husk: 'Rice Husk'
  };

  const guidanceSteps = classification.guidance
    .split(/\d+\.\s+/)
    .filter((step: string) => step.trim().length > 0);

  return (
    <>
      <PageMeta title="Classification Result" description="AI waste classification results" />
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/farmer/upload')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Upload Another
          </Button>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Uploaded Image</CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={imageUrl}
                  alt="Uploaded waste"
                  className="w-full rounded-lg object-cover"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Classification Result</CardTitle>
                <CardDescription>AI-powered waste identification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  {isValidWaste ? (
                    <CheckCircle2 className="w-8 h-8 text-primary" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-destructive" />
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Detected Type</p>
                    <p className="text-xl font-bold">
                      {isValidWaste ? materialTypeMap[classification.detectedType] : 'Unknown Waste'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">Confidence Level</p>
                  <Badge variant={classification.confidence === 'high' ? 'default' : 'secondary'}>
                    {classification.confidence.toUpperCase()}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {isValidWaste && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Step-by-Step Guidance</CardTitle>
                <CardDescription>
                  How to create handmade products from {materialTypeMap[classification.detectedType]}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {guidanceSteps.map((step: string, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-foreground">{step.trim()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you've created your handmade product, list it on our marketplace to connect with buyers!
                  </p>
                  <Button
                    onClick={() => navigate('/farmer/create-product', {
                      state: {
                        materialType: classification.detectedType,
                        wasteImageUrl: imageUrl
                      }
                    })}
                    className="w-full"
                    size="lg"
                  >
                    Create Product Listing
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!isValidWaste && (
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
                  <div>
                    <h3 className="text-xl font-bold mb-2">Unable to Classify</h3>
                    <p className="text-muted-foreground">{classification.guidance}</p>
                  </div>
                  <Button onClick={() => navigate('/farmer/upload')} variant="outline">
                    Try Another Image
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
