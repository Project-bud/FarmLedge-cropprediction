import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { getAvailableCrops, getSeasonalityFactor, fetchRecentPrice } from "@/lib/pricePrediction";
import TestingAddresses from "@/components/TestingAddresses";
import { DEFAULT_ADDRESSES, isHexAddress } from "@/lib/addresses";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Sprout, 
  Tractor, 
  Scale, 
  IndianRupee, 
  Calendar as CalendarIcon, 
  Plus,
  Search,
  ArrowUpRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { 
  ChevronLeft, 
  ChevronRight 
} from "lucide-react";

const Farmers = () => {
  const [form, setForm] = useState<{ cropType: string; quantityKg: string; basePricePerKg: string; harvestDate: string; farmerAddress: string; expiryDate: string }>({ cropType: "", quantityKg: "", basePricePerKg: "", harvestDate: "", farmerAddress: DEFAULT_ADDRESSES.FARMER as string, expiryDate: "" });
  const [page, setPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();
  const { t } = useTranslation();

  const [suggestedPrice, setSuggestedPrice] = useState<string | null>(null);
  const availableCrops = getAvailableCrops();

  // Fetch batches with pagination and filtering
  const { data: batchesData, isLoading, refetch } = useQuery({
    queryKey: ['batches', form.farmerAddress, page],
    queryFn: async () => {
      // Use currentOwner filter to show only batches currently held by this address
      const res = await fetch(`/api/batches?limit=5&page=${page}&currentOwner=${form.farmerAddress}`);
      if (!res.ok) throw new Error('Failed to fetch batches');
      return res.json();
    },
    enabled: !!form.farmerAddress && isHexAddress(form.farmerAddress)
  });

  const batches = batchesData?.batches || [];
  const totalBatches = batchesData?.total || 0;
  const totalPages = Math.ceil(totalBatches / 5);

  useEffect(() => {
    const updateSuggestion = async () => {
      if (!form.cropType) {
        setSuggestedPrice(null);
        return;
      }

      // Check if entered crop matches one of our known crops (case insensitive)
      const matchedCrop = availableCrops.find(c => c.toLowerCase() === form.cropType.toLowerCase());
      
      if (matchedCrop) {
        try {
          const factor = getSeasonalityFactor(matchedCrop);
          const recentPriceQuintal = await fetchRecentPrice(matchedCrop);
          
          if (recentPriceQuintal) {
            const pricePerKg = (recentPriceQuintal / 100) * factor;
            setSuggestedPrice(pricePerKg.toFixed(2));
          } else {
            setSuggestedPrice(null);
          }
        } catch (e) {
          console.error("Prediction error", e);
          setSuggestedPrice(null);
        }
      } else {
        setSuggestedPrice(null);
      }
    };

    const timer = setTimeout(updateSuggestion, 500); // Debounce
    return () => clearTimeout(timer);
  }, [form.cropType]);

  const register = async () => {
    try {
      setSubmitting(true)
      const quantityKg = Number(form.quantityKg || 0)
      const basePricePerKg = Number(form.basePricePerKg || 0)
      
      if (!form.cropType.trim()) { 
        toast.error(t('farmers.errors.enterCrop')); 
        return 
      }
      if (!quantityKg || Number.isNaN(quantityKg)) { 
        toast.error(t('farmers.errors.enterQty')); 
        return 
      }
      if (!basePricePerKg || Number.isNaN(basePricePerKg)) { 
        toast.error(t('farmers.errors.enterPrice')); 
        return 
      }
      if (!form.harvestDate) { 
        toast.error(t('farmers.errors.chooseHarvest')); 
        return 
      }
      if (!form.expiryDate) { 
        toast.error(t('farmers.errors.chooseExpiry')); 
        return 
      }
      
      const farmerAddress = form.farmerAddress?.trim() || DEFAULT_ADDRESSES.FARMER
      if (!isHexAddress(farmerAddress)) { 
        toast.error(t('farmers.errors.enterEOA')); 
        return 
      }

      const basePriceINR = Math.round(basePricePerKg) // total ₹ for batch
      const minPriceINR = basePriceINR // simple default; can add UI later
      const harvestDateSec = Math.floor(new Date(form.harvestDate).getTime() / 1000)
      const expiryDateSec = Math.floor(new Date(form.expiryDate).getTime() / 1000)
      
      const res = await fetch('/api/register-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cropType: form.cropType, quantityKg, basePriceINR, minPriceINR, harvestDate: harvestDateSec, metadataCID: '' , farmerAddress, expiryDate: expiryDateSec })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(`${data?.error || 'failed'}${data?.message ? `: ${data.message}` : ''}`)
      
      if (!data.batchId || !/^[0-9]+$/.test(data.batchId)) {
        toast.error(t('farmers.errors.registeredNoId'))
      } else {
        toast.success(`Batch #${data.batchId} registered successfully!`)
        refetch(); // Refresh list
        // Navigate to details for immediate feedback
        nav(`/batch?id=${encodeURIComponent(data.batchId)}`)
      }
      setForm({ ...form, cropType: "", quantityKg: "", basePricePerKg: "", harvestDate: "", expiryDate: "" });
    } catch (e: any) { 
      console.error(e); 
      toast.error(`${t('farmers.errors.registerFailed')}${e?.message ? `: ${e.message}` : ''}`); 
    } finally { 
      setSubmitting(false) 
    }
  };

  // Calculate stats (approximate based on current view or total if available)
  // Note: Total volume/revenue would require a separate aggregate API call for accuracy
  const totalVolume = batches.reduce((acc: number, b: any) => acc + Number(b.quantityKg), 0);
  const totalRevenue = batches.reduce((acc: number, b: any) => acc + (Number(b.quantityKg) * Number(b.basePriceINR || 0)), 0);

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24 sm:py-28 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-slate-900">{t('farmers.title')}</h1>
            <p className="text-slate-500 mt-1">Manage your harvests and register new batches on the blockchain.</p>
          </div>
          <div className="flex gap-2">
             {/* Placeholder for future actions */}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{t('farmers.stats.totalBatches')}</p>
                <h3 className="text-2xl font-bold text-slate-900">{totalBatches}</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                <Scale className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{t('farmers.stats.totalVolume')}</p>
                <h3 className="text-2xl font-bold text-slate-900">{totalVolume} kg</h3>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
                <IndianRupee className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{t('farmers.stats.estRevenue')}</p>
                <h3 className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString()}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Registration Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-t-4 border-t-emerald-500 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-600" />
                  {t('farmers.registerHarvest')}
                </CardTitle>
                <CardDescription>{t('farmers.createDigitalTwin')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('farmers.form.cropType')}</Label>
                  <div className="relative">
                    <Sprout className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      className="pl-9"
                      list="crop-suggestions"
                      placeholder={t('farmers.form.cropType')}
                      value={form.cropType}
                      onChange={(e) => setForm({ ...form, cropType: e.target.value })}
                    />
                    <datalist id="crop-suggestions">
                      {availableCrops.map(crop => (
                        <option key={crop} value={crop} />
                      ))}
                    </datalist>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('farmers.form.quantityKg')}</Label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input 
                        className="pl-9" 
                        type="number"
                        placeholder="0"
                        value={form.quantityKg} 
                        onChange={(e) => setForm({ ...form, quantityKg: e.target.value })} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('farmers.form.pricePerKg')}</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input 
                        className="pl-9" 
                        type="number"
                        placeholder="0"
                        value={form.basePricePerKg} 
                        onChange={(e) => setForm({ ...form, basePricePerKg: e.target.value })} 
                      />
                    </div>
                    {suggestedPrice && (
                      <p className="text-xs text-emerald-600 font-medium animate-in fade-in slide-in-from-top-1">
                        Suggested: ₹{suggestedPrice} / kg
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t('farmers.form.harvestDate')}</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input 
                        className="pl-9" 
                        type="date" 
                        value={form.harvestDate} 
                        onChange={(e) => setForm({ ...form, harvestDate: e.target.value })} 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('farmers.form.expiryDate')}</Label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input 
                        className="pl-9" 
                        type="date" 
                        value={form.expiryDate} 
                        onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} 
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t('farmers.form.farmerAddress')}</Label>
                  <Input 
                    className="font-mono text-xs" 
                    placeholder="0x..." 
                    value={form.farmerAddress} 
                    onChange={(e) => {
                      setForm({ ...form, farmerAddress: e.target.value });
                      setPage(1); // Reset to first page on address change
                    }} 
                  />
                  <p className="text-[10px] text-slate-400">{t('farmers.sections.ownerAddress')}</p>
                </div>

                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                  onClick={register} 
                  disabled={submitting}
                >
                  {submitting ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Tractor className="w-4 h-4 mr-2" />
                      {t('farmers.actions.register')}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
              <h4 className="font-semibold text-sm mb-2 text-slate-700">Dev Tools</h4>
              <TestingAddresses />
            </div>
          </div>

          {/* Recent Batches List */}
          <div className="lg:col-span-2">
            <Card className="h-full shadow-sm">
              <CardHeader>
                <CardTitle>{t('farmers.sections.myBatches')}</CardTitle>
                <CardDescription>{t('farmers.sections.recentBatches')}</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-12 text-slate-400">
                    <p>{t('common.loading')}</p>
                  </div>
                ) : batches.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Tractor className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No batches registered yet.</p>
                    <p className="text-sm">Use the form to create your first batch.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Batch ID</TableHead>
                            <TableHead>Crop</TableHead>
                            <TableHead>Harvest Date</TableHead>
                            <TableHead>Use-By Date</TableHead>
                            <TableHead className="text-right">Qty (kg)</TableHead>
                            <TableHead className="text-right">Price/Kg</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {batches.map((b: any) => (
                            <TableRow key={b.id}>
                              <TableCell className="font-mono font-medium">#{b.id}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                    {t(`${b.cropType}`) || b.cropType}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>{new Date(b.harvestDate * 1000).toLocaleDateString()}</TableCell>
                              <TableCell>{b.expiryDate ? new Date(b.expiryDate * 1000).toLocaleDateString() : '-'}</TableCell>
                              <TableCell className="text-right">{b.quantityKg}</TableCell>
                              <TableCell className="text-right">₹{b.basePriceINR}</TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="sm" asChild>
                                  <Link to={`/batch?id=${encodeURIComponent(b.id)}`}>
                                    {t('farmers.sections.view')} <ArrowUpRight className="w-4 h-4 ml-1" />
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    
                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between px-2">
                      <p className="text-sm text-slate-500">
                        Page {page} of {totalPages || 1}
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setPage(p => Math.max(1, p - 1))}
                          disabled={page === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                          disabled={page >= totalPages}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Farmers;
