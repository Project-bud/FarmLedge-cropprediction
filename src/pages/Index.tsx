import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ChevronRight, Search, Package, ArrowRight, Leaf, ShieldCheck, Clock, QrCode, Copy, Link as LinkIcon, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import hero1 from "@/assets/hero1.jpg";
import hero2 from "@/assets/hero2.jpg";
import hero3 from "@/assets/hero3.jpg";
import hero4 from "@/assets/hero4.jpg";
import { QRCodeCanvas } from "qrcode.react";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { useRef } from "react";

const HERO_IMAGES = [hero1, hero2, hero3, hero4];

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { toast } = useToast();

  // QR Modal state
  const [qrOpen, setQrOpen] = useState(false);
  const [batchId, setBatchId] = useState("");
  const qrWrapRef = useRef<HTMLDivElement | null>(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    // Delay loading of secondary images to prioritize LCP
    const t = setTimeout(() => setImagesLoaded(true), 1500);
    return () => clearTimeout(t);
  }, []);

  // Build destination using env-based site URL, fallback to current origin
  const SITE_URL = (import.meta.env.VITE_SITE_URL as string) ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const BASE_URL = `${SITE_URL.replace(/\/$/, "")}/batch?id=`;
  // Sanitize id (digits only) but keep user's input for display
  const sanitizedId = useMemo(() => batchId.replace(/\D/g, ""), [batchId]);
  const hasInput = batchId.trim().length > 0;
  const isValid = sanitizedId.length > 0;
  const targetUrl = isValid ? `${BASE_URL}${encodeURIComponent(sanitizedId)}` : "";

  const handleCopyUrl = async () => {
    try {
      if (!isValid) return;
      await navigator.clipboard.writeText(targetUrl);
      toast({ title: "Link copied", description: targetUrl, duration: 1800 });
    } catch {
      // no-op
    }
  };

  const handleDownload = () => {
    const canvas = qrWrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `batch-${sanitizedId || "qr"}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };
  const handleShare = async () => {
    try {
      if (!isValid || typeof navigator === "undefined" || !navigator.share) return;
      await navigator.share({ title: "AgriTruthChain Batch", text: `Batch #${sanitizedId}`, url: targetUrl });
    } catch {
      // user might cancel share; ignore
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);
  
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
                      variant="ghost" 
                      className="mr-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50"
                      onClick={() => {
                        setBatchId(search);
                        setQrOpen(true);
                      }}
                      title="Generate QR"
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Generate QR
                    </Button>
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
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[15/9]">
                  {HERO_IMAGES.map((img, index) => {
                    // Only render the first image immediately. Render others after delay.
                    if (index > 0 && !imagesLoaded) return null;
                    return (
                      <img 
                        key={img}
                        src={img} 
                        alt="Supply Chain Technology" 
                        loading={index === 0 ? "eager" : "lazy"}
                        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                          index === currentImageIndex ? "opacity-100 scale-105" : "opacity-0 scale-100"
                        }`}
                      />
                    );
                  })}
                  <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 to-transparent z-10"></div>
                  <div className="absolute bottom-8 left-8 text-white z-20">
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

      {/* QR Generator Modal */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Scan or Generate Product QR</DialogTitle>
            <DialogDescription>
              QR Code for Batch #{sanitizedId || "..."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-2">
            <div className="flex flex-col items-center gap-3">
              <div className="p-4 rounded-lg bg-muted border min-h-[268px] min-w-[268px] flex items-center justify-center" ref={qrWrapRef}>
                {isValid ? (
                  <QRCodeCanvas value={targetUrl} size={220} level="M" includeMargin />
                ) : (
                  <div className="flex flex-col items-center text-muted-foreground">
                    <QrCode className="w-12 h-12 mb-2" />
                    <span className="text-sm">Enter a valid batch ID to preview the QR</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-muted-foreground break-all text-center w-full">
                {isValid ? (
                  <a href={targetUrl} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                    {targetUrl}
                  </a>
                ) : (
                  `${BASE_URL}<id>`
                )}
              </p>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 justify-between sm:items-center">
            <div className="flex flex-wrap gap-2 order-2 sm:order-1">
              <Button variant="outline" size="sm" onClick={handleCopyUrl} disabled={!isValid}>
                <Copy className="w-4 h-4 mr-1" /> Copy URL
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload} disabled={!isValid}>
                <Download className="w-4 h-4 mr-1" /> Download QR
              </Button>
              <a href={isValid ? targetUrl : undefined} target="_blank" rel="noreferrer noopener">
                <Button variant="ghost" size="sm" disabled={!isValid}>
                  <LinkIcon className="w-4 h-4 mr-1" /> Open Link
                </Button>
              </a>
              {typeof navigator !== "undefined" && (navigator as any).share ? (
                <Button variant="ghost" size="sm" onClick={handleShare} disabled={!isValid}>
                  <LinkIcon className="w-4 h-4 mr-1" /> Share
                </Button>
              ) : null}
            </div>
            <div className="order-1 sm:order-2">
              <Button onClick={() => setQrOpen(false)}>Close</Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Index;
