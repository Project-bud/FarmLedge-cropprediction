import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, BookOpen, MapPin, AlertCircle, FileText } from "lucide-react";
import { useTranslation } from "react-i18next";

const StorageServices = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-r from-amber-700 via-orange-600 to-yellow-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-white/90 rounded-xl shadow-lg">
              <Package className="h-12 w-12 text-amber-600" />
            </div>
            <div>
              <Badge className="mb-2 bg-white/20 text-white border-white/30">
                Storage Solutions
              </Badge>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Nearby Storage & Alternate Use Cases
              </h1>
              <p className="text-amber-50 text-lg">
                Find storage facilities and explore alternate use cases for surplus produce
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="p-6 bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Package className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="text-xl font-semibold text-amber-900">Storage Facilities</h3>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-600 mt-0.5">✓</span>
                  <span>Locate nearest warehouses and godowns</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-600 mt-0.5">✓</span>
                  <span>Cold storage for perishable goods</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-600 mt-0.5">✓</span>
                  <span>Real-time availability and pricing</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-amber-600 mt-0.5">✓</span>
                  <span>Quality preservation techniques</span>
                </li>
              </ul>
              <Button className="w-full" variant="default">
                <MapPin className="h-4 w-4 mr-2" />
                Find Storage Near Me
              </Button>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-teal-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-green-100 rounded-xl">
                  <BookOpen className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-green-900">Alternate Use Cases</h3>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Processing units for value addition</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Organic fertilizer and compost production</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Animal feed manufacturing contacts</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-green-600 mt-0.5">✓</span>
                  <span>Bio-energy and industrial use options</span>
                </li>
              </ul>
              <Button className="w-full" variant="default">
                <BookOpen className="h-4 w-4 mr-2" />
                Explore Options
              </Button>
            </Card>
          </div>

          {/* Storage Types */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Available Storage Types</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="p-6 hover:shadow-lg transition-shadow">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Warehouses</h4>
                <p className="text-sm text-gray-600 mb-4">Large-scale storage for grains, pulses, and non-perishable crops</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Temperature controlled</li>
                  <li>• Pest management</li>
                  <li>• Insurance coverage</li>
                  <li>• 24/7 security</li>
                </ul>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Cold Storage</h4>
                <p className="text-sm text-gray-600 mb-4">Specialized facilities for fruits, vegetables, and dairy products</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Controlled temperature (-5°C to 15°C)</li>
                  <li>• Humidity control</li>
                  <li>• Extended shelf life</li>
                  <li>• Quality preservation</li>
                </ul>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">Godowns</h4>
                <p className="text-sm text-gray-600 mb-4">Traditional storage for immediate and short-term needs</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Affordable rates</li>
                  <li>• Flexible durations</li>
                  <li>• Easy accessibility</li>
                  <li>• Community-based</li>
                </ul>
              </Card>
            </div>
          </div>

          {/* Best Practices */}
          <Card className="p-6 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border-amber-200 mb-8">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Storage Best Practices</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Proper storage can reduce post-harvest losses by up to 30%. Follow CSIR-CFTRI guidelines for optimal storage conditions, 
                  temperature control, and humidity management to maintain crop quality and extend shelf life.
                </p>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Download Storage Guidelines
                </Button>
              </div>
            </div>
          </Card>

          {/* Alternate Use Cases Details */}
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Surplus Produce Solutions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
                <h4 className="text-lg font-semibold text-blue-900 mb-3">Value Addition</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Convert surplus produce into processed products with higher market value
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Fruit pulping and juice extraction</li>
                  <li>• Vegetable pickling and canning</li>
                  <li>• Grain flour production</li>
                  <li>• Dry fruit and nut processing</li>
                </ul>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50">
                <h4 className="text-lg font-semibold text-green-900 mb-3">Organic Solutions</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Transform waste into valuable organic products for sustainable farming
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Composting services</li>
                  <li>• Vermicompost production</li>
                  <li>• Bio-fertilizer manufacturing</li>
                  <li>• Green manure preparation</li>
                </ul>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50">
                <h4 className="text-lg font-semibold text-purple-900 mb-3">Industrial Use</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Connect with industries using agricultural produce as raw material
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Bio-fuel and ethanol production</li>
                  <li>• Paper and pulp industries</li>
                  <li>• Pharmaceutical applications</li>
                  <li>• Textile and fiber manufacturing</li>
                </ul>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50">
                <h4 className="text-lg font-semibold text-orange-900 mb-3">Animal Feed</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Supply quality animal feed to dairy farms and livestock owners
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Cattle feed suppliers</li>
                  <li>• Poultry feed manufacturers</li>
                  <li>• Silage preparation units</li>
                  <li>• Pet food industries</li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default StorageServices;
