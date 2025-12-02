import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronRight, Search, Package, ArrowRight, Leaf, ShieldCheck, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroImage from "@/assets/hero-agriculture.jpg";

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  type Batch = {
    id: number | string;
    cropType?: string;
    quantityKg?: number | string;
    basePriceINR?: number | string;
    minPriceINR?: number | string;
    priceByDistributorINR?: number | string;
    priceByRetailerINR?: number | string;
    farmer?: string;
    distributor?: string;
    retailer?: string;
    consumer?: string;
    currentOwner?: string;
    harvestDate?: number | string;
    createdAt?: number | string;
    metadataCID?: string;
    boughtByDistributorAt?: number | string;
    boughtByRetailerAt?: number | string;
    boughtByConsumerAt?: number | string;
    verification?: { status: 'unverified' | 'pending' | 'verified'; by?: string | null; timestamp?: number | null };
  };

  const [allBatches, setAllBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<Batch | null>(null);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalBatches, setTotalBatches] = useState(0);
  const [pagesCache, setPagesCache] = useState<Record<number, Batch[]>>({});

  useEffect(() => {
    const fetchBatches = async () => {
      if (pagesCache[page]) {
        setAllBatches(pagesCache[page]);
        return;
      }

      try {
        setLoading(true); setError(null);
        const res = await fetch(`/api/batches?limit=6&page=${page}`);
        const data = await res.json();
        const batches = Array.isArray(data?.batches) ? data.batches : [];
        setAllBatches(batches);
        setTotalBatches(data?.total || 0);
        setPagesCache(prev => ({ ...prev, [page]: batches }));
      } catch (e: any) {
        setError(e?.message || "Failed to load batches");
      } finally { setLoading(false); }
    };
    fetchBatches();
  }, [page]);

  // Backend now handles sorting and pagination
  const recentBatches = allBatches;

  const handleSearch = () => {
    if (!search.trim()) return;
    // If numeric, assume ID and go to details
    if (/^\d+$/.test(search.trim())) {
      navigate(`/batch?id=${search.trim()}`);
    } else {
      // Otherwise just filter the list (not implemented in this view, maybe redirect to a search page)
      // For now, let's just scroll to list
      document.getElementById('recent-batches')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const ownerRoleKey = (b: Batch) => {
    const owner = (b.currentOwner || "").toLowerCase();
    if (!owner) return "unknown" as const;
    if (owner === (b.consumer || "").toLowerCase()) return "consumer" as const;
    if (owner === (b.retailer || "").toLowerCase()) return "retailer" as const;
    if (owner === (b.distributor || "").toLowerCase()) return "distributor" as const;
    if (owner === (b.farmer || "").toLowerCase()) return "farmer" as const;
    return "holder" as const;
  };

  const openDetails = (b: Batch) => { setSelected(b); setOpen(true); };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-slate-600">
      <Navigation />
      
      <main>
        {/* Hero Section - Split Layout */}
        <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              
              {/* Left: Text Content */}
              <div className="space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/50 border border-emerald-200 text-emerald-800 text-sm font-medium">
                  <Leaf className="w-4 h-4" />
                  <span>{t('hero.badge')}</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold text-emerald-900 leading-[1.1]">
                  {t('hero.titleMain')} <span className="text-emerald-600">{t('hero.titleSpan')}</span>
                </h1>
                
                <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                  {t('hero.description')}
                </p>

                {/* Massive Search Bar */}
                <div className="max-w-xl mx-auto lg:mx-0 relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-emerald-300 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                  <div className="relative flex items-center bg-white rounded-xl shadow-xl border border-slate-100 p-2">
                    <Search className="w-6 h-6 text-slate-400 ml-3" />
                    <input 
                      type="text"
                      placeholder={t('index.searchPlaceholder')}
                      className="flex-1 bg-transparent border-none focus:ring-0 text-lg px-4 py-3 text-slate-800 placeholder:text-slate-300"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button 
                      size="lg" 
                      className="bg-emerald-900 hover:bg-emerald-800 text-white rounded-lg px-8 h-12 text-base font-medium shadow-lg shadow-emerald-900/20"
                      onClick={handleSearch}
                    >
                      {t('index.trackButton')}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Right: Abstract/Image */}
              <div className="relative hidden lg:block">
                <div className="absolute inset-0 bg-emerald-900/5 rounded-3xl transform rotate-3"></div>
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                  <img 
                    src={heroImage} 
                    alt="Supply Chain Technology" 
                    className="w-full h-full object-cover scale-105 hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-transparent"></div>
                  <div className="absolute bottom-8 left-8 text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span className="font-medium text-emerald-100">{t('hero.secure')}</span>
                    </div>
                    <p className="text-2xl font-serif font-bold">{t('hero.trusted')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Batches - Grid Layout */}
        <section id="recent-batches" className="py-20 bg-white border-t border-slate-100">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-serif font-bold text-emerald-900 mb-2">{t('index.recentShipments')}</h2>
                <p className="text-slate-500">{t('index.liveUpdates')}</p>
              </div>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-6 space-y-4 border-slate-100 shadow-sm">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-20 w-full rounded-lg" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentBatches.map((b) => (
                  <Card 
                    key={String(b.id)} 
                    className="group relative p-6 bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                    onClick={() => openDetails(b)}
                  >
                    <div className="absolute top-0 right-0 p-4">
                      {b?.verification?.status === 'verified' ? (
                        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200">{t('index.verified')}</Badge>
                      ) : (
                        <Badge variant="outline" className="text-slate-500 border-slate-200">{t('index.pending')}</Badge>
                      )}
                    </div>

                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                          <Package className="w-5 h-5" />
                        </div>
                        <span className="font-mono text-sm text-slate-400">#{String(b.id)}</span>
                      </div>
                      <h3 className="text-xl font-serif font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">
                        {b.cropType || t('index.unknownCrop')}
                      </h3>
                      <p className="text-slate-500 text-sm mt-1">{b.quantityKg || 0} kg</p>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-50">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">{t('index.currentOwner')}</span>
                        <span className="font-medium text-slate-700 capitalize">{t(`index.${ownerRoleKey(b)}`)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">{t('index.lastUpdate')}</span>
                        <span className="font-medium text-slate-700 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {b.createdAt ? new Date(Number(b.createdAt) * 1000).toLocaleDateString() : "—"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-4 flex items-center justify-between text-emerald-600 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                      {t('index.viewDetails')} <ArrowRight className="w-4 h-4" />
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {!loading && totalBatches > 6 && (
              <div className="flex justify-center items-center gap-2 mt-12">
                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-700"
                >
                  {t('index.prev')}
                </Button>
                
                {Array.from({ length: Math.ceil(totalBatches / 6) }).map((_, i) => {
                   const p = i + 1;
                   const totalPages = Math.ceil(totalBatches / 6);
                   // Show first, last, and current +/- 1
                   if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                     return (
                        <Button
                            key={p}
                            variant={page === p ? "default" : "outline"}
                            className={page === p ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}
                            onClick={() => setPage(p)}
                        >
                            {p}
                        </Button>
                     );
                   }
                   if (p === page - 2 || p === page + 2) {
                       return <span key={p} className="text-slate-400">...</span>
                   }
                   return null;
                })}

                <Button 
                  variant="outline" 
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * 6 >= totalBatches}
                  className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-emerald-700"
                >
                  {t('index.next')}
                </Button>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Details Dialog - Kept mostly same logic but styled */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg bg-white/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-emerald-900">{t('index.batch')} #{selected?.id}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-stone-50 rounded-lg">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">{t('index.product')}</div>
                <div className="font-medium text-slate-800 text-lg">{selected?.cropType}</div>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">{t('index.quantity')}</div>
                <div className="font-medium text-slate-800 text-lg">{selected?.quantityKg} kg</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900 border-b pb-2">{t('index.priceHistory')}</h4>
              <div className="flex justify-between text-sm py-1">
                <span className="text-slate-500">{t('index.farmerPrice')}</span>
                <span className="font-mono font-medium text-amber-600">₹{selected?.minPriceINR || selected?.basePriceINR || 0}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-slate-500">{t('index.distributorPrice')}</span>
                <span className="font-mono font-medium text-amber-600">₹{selected?.priceByDistributorINR || 0}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-slate-500">{t('index.retailerPrice')}</span>
                <span className="font-mono font-medium text-amber-600">₹{selected?.priceByRetailerINR || 0}</span>
              </div>
            </div>

            <div className="pt-4">
              <Link to={`/batch?id=${encodeURIComponent(String(selected?.id || ""))}`} className="w-full">
                <Button className="w-full bg-emerald-900 hover:bg-emerald-800 text-white">
                  {t('index.viewFullJourney')}
                </Button>
              </Link>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Index;
