import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
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
  Sprout, 
  Tractor, 
  Scale, 
  IndianRupee, 
  Calendar as CalendarIcon, 
  Plus,
  Search,
  ArrowUpRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const Farmers = () => {
  const [form, setForm] = useState<{ cropType: string; quantityKg: string; basePricePerKg: string; harvestDate: string; farmerAddress: string }>({ cropType: "", quantityKg: "", basePricePerKg: "", harvestDate: "", farmerAddress: DEFAULT_ADDRESSES.FARMER as string });
  const [batches, setBatches] = useState<any[]>([]); // TODO: load from chain
  const [submitting, setSubmitting] = useState(false);
  const nav = useNavigate();
  const { t } = useTranslation();

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
      
      const farmerAddress = form.farmerAddress?.trim() || DEFAULT_ADDRESSES.FARMER
      if (!isHexAddress(farmerAddress)) { 
        toast.error(t('farmers.errors.enterEOA')); 
        return 
      }

      const basePriceINR = Math.round(basePricePerKg) // total ₹ for batch
      const minPriceINR = basePriceINR // simple default; can add UI later
      const harvestDateSec = Math.floor(new Date(form.harvestDate).getTime() / 1000)
      
      const res = await fetch('/api/register-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cropType: form.cropType, quantityKg, basePriceINR, minPriceINR, harvestDate: harvestDateSec, metadataCID: '' , farmerAddress })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(`${data?.error || 'failed'}${data?.message ? `: ${data.message}` : ''}`)
      
      if (!data.batchId || !/^[0-9]+$/.test(data.batchId)) {
        toast.error(t('farmers.errors.registeredNoId'))
      } else {
        const newItem = {
          batchId: data.batchId,
          cropType: form.cropType,
          quantityKg,
          basePricePerKg,
          harvestDate: form.harvestDate,
          farmer: 'you',
          owner: 'you',
        }
        setBatches(prev => [newItem, ...prev])
        toast.success(`Batch #${data.batchId} registered successfully!`)
        // Navigate to details for immediate feedback
        nav(`/batch?id=${encodeURIComponent(newItem.batchId)}`)
      }
      setForm({ cropType: "", quantityKg: "", basePricePerKg: "", harvestDate: "", farmerAddress: DEFAULT_ADDRESSES.FARMER });
    } catch (e: any) { 
      console.error(e); 
      toast.error(`${t('farmers.errors.registerFailed')}${e?.message ? `: ${e.message}` : ''}`); 
    } finally { 
      setSubmitting(false) 
    }
  };

  // Calculate stats
  const totalBatches = batches.length;
  const totalVolume = batches.reduce((acc, b) => acc + Number(b.quantityKg), 0);
  const totalRevenue = batches.reduce((acc, b) => acc + (Number(b.quantityKg) * Number(b.basePricePerKg)), 0);

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
                <p className="text-sm font-medium text-slate-500">Total Batches</p>
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
                <p className="text-sm font-medium text-slate-500">Total Volume</p>
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
                <p className="text-sm font-medium text-slate-500">Est. Revenue</p>
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
                  Register Harvest
                </CardTitle>
                <CardDescription>Create a new digital twin for your produce.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t('farmers.form.cropType')}</Label>
                  <div className="relative">
                    <Sprout className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input 
                      className="pl-9" 
                      placeholder="e.g. Wheat, Rice, Cotton"
                      value={form.cropType} 
                      onChange={(e) => setForm({ ...form, cropType: e.target.value })} 
                    />
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
                  </div>
                </div>

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
                  <Label>{t('farmers.form.farmerAddress')}</Label>
                  <Input 
                    className="font-mono text-xs" 
                    placeholder="0x..." 
                    value={form.farmerAddress} 
                    onChange={(e) => setForm({ ...form, farmerAddress: e.target.value })} 
                  />
                  <p className="text-[10px] text-slate-400">The Ethereum address that owns this batch.</p>
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
                <CardDescription>Recent batches registered on the network.</CardDescription>
              </CardHeader>
              <CardContent>
                {batches.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Tractor className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No batches registered yet.</p>
                    <p className="text-sm">Use the form to create your first batch.</p>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Batch ID</TableHead>
                          <TableHead>Crop</TableHead>
                          <TableHead>Harvest Date</TableHead>
                          <TableHead className="text-right">Qty (kg)</TableHead>
                          <TableHead className="text-right">Price/Kg</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {batches.map((b) => (
                          <TableRow key={b.batchId}>
                            <TableCell className="font-mono font-medium">#{b.batchId}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                  {b.cropType}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>{new Date(b.harvestDate).toLocaleDateString()}</TableCell>
                            <TableCell className="text-right">{b.quantityKg}</TableCell>
                            <TableCell className="text-right">₹{b.basePricePerKg}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link to={`/batch?id=${encodeURIComponent(b.batchId)}`}>
                                  View <ArrowUpRight className="w-4 h-4 ml-1" />
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
