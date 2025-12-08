import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ChevronRight, Search, Package, ArrowRight, Leaf, ShieldCheck, Clock, QrCode, Copy, Link as LinkIcon, Download, Tractor, Store, ShoppingCart, User, Sprout, Target } from "lucide-react";
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

const CROP_IMAGES: Record<string, string> = {
  "banana": "https://images.unsplash.com/photo-1528825871115-3581a5387919?q=80&w=2070&auto=format&fit=crop",
  "banana - green": "https://images.unsplash.com/photo-1603833665858-e61d17a86224?q=80&w=2070&auto=format&fit=crop",
  "beans": "https://images.unsplash.com/photo-1567306301408-9b74779a11af?q=80&w=2070&auto=format&fit=crop",
  "bitter gourd": "https://images.unsplash.com/photo-1628773822503-93038c063306?q=80&w=2070&auto=format&fit=crop",
  "brinjal": "https://images.unsplash.com/photo-1613881553903-4543f5f2cac9?q=80&w=2070&auto=format&fit=crop",
  "cabbage": "https://images.unsplash.com/photo-1591586007768-40725cc562a1?q=80&w=2110&auto=format&fit=crop",

  "capsicum": "https://images.unsplash.com/photo-1563565375-f3fdf5d6c465?q=80&w=2070&auto=format&fit=crop",
  "carrot": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=1887&auto=format&fit=crop",
  "cashewnuts": "https://images.unsplash.com/photo-1686721635333-d71af2f1084b?q=80&w=1074&auto=format&fit=crop",
  "cauliflower": "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?q=80&w=2070&auto=format&fit=crop",
  "chili red": "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?q=80&w=2070&auto=format&fit=crop",
  "coconut": "https://images.unsplash.com/photo-1544376798-89aa6b82c6cd?q=80&w=2070&auto=format&fit=crop",
  "dry chillies": "https://images.unsplash.com/photo-1601648764658-ad3793bc91a9?q=80&w=2070&auto=format&fit=crop",
  "fish": "https://images.unsplash.com/photo-1535591273668-578e31182c4f?q=80&w=2070&auto=format&fit=crop",
  "garlic": "https://images.unsplash.com/photo-1615485500704-8e99099928b3?q=80&w=2070&auto=format&fit=crop",
  "green chilli": "https://images.unsplash.com/photo-1601648764658-ad3793bc91a9?q=80&w=2070&auto=format&fit=crop",
  "ground nut seed": "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?q=80&w=2071&auto=format&fit=crop",
  "groundnut": "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?q=80&w=2071&auto=format&fit=crop",
  "hen": "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=1974&auto=format&fit=crop",
  "jack fruit": "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=2070&auto=format&fit=crop",
  "jute": "https://images.unsplash.com/photo-1610970881699-44a5587cabec?q=80&w=2070&auto=format&fit=crop",
  "mango": "https://images.unsplash.com/photo-1553279768-865429fa0078?q=80&w=2070&auto=format&fit=crop",
  "mustard": "https://images.unsplash.com/photo-1508595165502-3e2652e5a405?q=80&w=2070&auto=format&fit=crop",
  "onion": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=2070&auto=format&fit=crop",
  "ox": "https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=2070&auto=format&fit=crop",
  "papaya": "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?q=80&w=2070&auto=format&fit=crop",
  "peas cod": "https://images.unsplash.com/photo-1592323360831-5f1f68947868?q=80&w=2070&auto=format&fit=crop",
  "potato": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=2070&auto=format&fit=crop",
  "pumpkin": "https://images.unsplash.com/photo-1570586437263-160f0d1e813d?q=80&w=2070&auto=format&fit=crop",
  "raddish": "https://images.unsplash.com/photo-1593157923663-27248b238446?q=80&w=2070&auto=format&fit=crop",
  "rice": "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=2070&auto=format&fit=crop",
  "tomato": "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=2070&auto=format&fit=crop",
  "water melon": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?q=80&w=2070&auto=format&fit=crop",
  "wheat": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?q=80&w=2070&auto=format&fit=crop",
  "corn": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=2070&auto=format&fit=crop",
  "maize": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=2070&auto=format&fit=crop",
  "apple": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?q=80&w=2074&auto=format&fit=crop"
};

const getCropImage = (cropType: string | undefined) => {
  const type = (cropType || "").toLowerCase();
  return CROP_IMAGES[type] || "https://images.unsplash.com/photo-1495107334309-fcf20504a5ab?q=80&w=2070&auto=format&fit=crop";
};

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
    expiryDate?: number | string;
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

  const getProgress = (b: Batch) => {
    const role = ownerRoleKey(b);
    if (role === 'consumer') return 100;
    if (role === 'retailer') return 75;
    if (role === 'distributor') return 50;
    return 25;
  };

  const openDetails = (b: Batch) => { setSelected(b); setOpen(true); };

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-slate-600">
      <Navigation />
      
      <main>
        {/* Hero Section - Full Width Background */}
        <section className="relative h-[900px] flex items-center overflow-hidden">
          {/* Background Slideshow */}
          <div className="absolute inset-0 z-0">
            {HERO_IMAGES.map((img, index) => {
              if (index > 0 && !imagesLoaded) return null;
              return (
                <img 
                  key={img}
                  src={img} 
                  alt="Supply Chain Background" 
                  loading={index === 0 ? "eager" : "lazy"}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                    index === currentImageIndex ? "opacity-100" : "opacity-0"
                  }`}
                />
              );
            })}
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/60 z-10"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 relative z-20">
            <div className="max-w-3xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight mb-6">
                {t('hero.titleMain')}<br />
                <span className="text-emerald-400">{t('hero.titleSpan')}</span>
              </h1>
              
              <p className="text-lg sm:text-xl text-slate-200 mb-10 max-w-2xl leading-relaxed">
                {t('hero.description')}
              </p>

              {/* Search Bar */}
<div className="w-full max-w-xl">
  <div className="flex flex-wrap items-center gap-2 bg-white rounded-lg shadow-2xl p-2">

    {/* Search Icon */}
    <Search className="w-5 h-5 text-slate-400 ml-2" />

    {/* Input */}
    <input
      type="text"
      placeholder={t("index.searchPlaceholder")}
      className="flex-1 min-w-[120px] bg-transparent border-none focus:ring-0 text-lg px-2 py-2 text-slate-800 placeholder:text-slate-400"
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
    />

    {/* QR Button */}
    <Button
      variant="ghost"
      className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 whitespace-nowrap"
      onClick={() => {
        setBatchId(search);
        setQrOpen(true);
      }}
      title="Generate QR"
    >
      <QrCode className="w-5 h-5" />
      Generate QR
    </Button>

    {/* Track Button */}
    <Button
      size="lg"
      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-md px-6 h-11 text-base font-medium flex items-center gap-2 whitespace-nowrap"
      onClick={handleSearch}
    >
      {t("index.trackButton")}
      <ArrowRight className="w-4 h-4" />
    </Button>

  </div>
</div>

            </div>
          </div>
        </section>

        {/* Crop Price Prediction Section */}
        <section className="py-16 bg-gradient-to-br from-emerald-50 to-white">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-serif font-bold text-emerald-900 mb-3 flex items-center justify-center gap-2">
                  <Sprout className="w-8 h-8 text-emerald-600" />
                  Smart Crop Price Prediction
                </h2>
                <p className="text-slate-600 text-lg">Get Real-time price predictions based on your district's soil type</p>
              </div>

              <Card className="border-emerald-200 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6 sm:p-8">
                  <Link to="/price-prediction" className="block">
                    <Button 
                      size="lg" 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      <Target className="w-5 h-5 mr-2" />
                      Open Advanced Price Predictor
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  
                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-700">30+</div>
                      <div className="text-sm text-slate-600">Districts Covered</div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-700">8</div>
                      <div className="text-sm text-slate-600">Soil Types</div>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <div className="text-2xl font-bold text-emerald-700">93%</div>
                      <div className="text-sm text-slate-600">Accuracy</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Recent Batches - Grid Layout */}
        <section id="recent-batches" className="py-20 bg-white">
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
                  <Card key={i} className="overflow-hidden border-slate-100 shadow-sm">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-5 space-y-4">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-10 w-full rounded-lg" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {recentBatches.map((b) => (
                  <Card 
                    key={String(b.id)} 
                    className="group relative bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden rounded-xl"
                    onClick={() => openDetails(b)}
                  >
                    {/* Image Header */}
                    <div className="relative h-56 overflow-hidden">
                      <img 
                        src={getCropImage(b.cropType)} 
                        alt={b.cropType}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                      
                      {/* Badges */}
                      <div className="absolute bottom-3 left-3">
                        <Badge className="bg-black/50 backdrop-blur-md text-white border-none font-mono">
                          #{String(b.id)}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        {b?.verification?.status === 'verified' ? (
                          <Badge className="bg-emerald-500 text-white border-none flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> {t('index.verified')}
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-400 text-amber-900 border-none flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {t('index.pending')}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-serif font-bold text-slate-800 group-hover:text-emerald-800 transition-colors">
                            {b.cropType || t('index.unknownCrop')}
                          </h3>
                          <p className="text-slate-500 text-sm mt-1 flex items-center gap-1">
                            <User className="w-3 h-3" /> Owner: <span className="font-medium text-slate-700 capitalize">{t(`index.${ownerRoleKey(b)}`)}</span>
                          </p>
                        </div>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                          {b.quantityKg || 0} kg
                        </Badge>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium text-slate-400 uppercase tracking-wider">
                          <span>FARMER</span>
                          <span>CONSUMER</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out"
                            style={{ width: `${getProgress(b)}%` }}
                          ></div>
                        </div>
                      </div>
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
              <div className="p-3 bg-stone-50 rounded-lg">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Harvest Date</div>
                <div className="font-medium text-slate-800 text-lg">
                  {selected?.harvestDate ? new Date(Number(selected.harvestDate) * 1000).toLocaleDateString() : '-'}
                </div>
              </div>
              <div className="p-3 bg-stone-50 rounded-lg">
                <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Use-By Date</div>
                <div className="font-medium text-red-600 text-lg">
                  {selected?.expiryDate ? new Date(Number(selected.expiryDate) * 1000).toLocaleDateString() : '-'}
                </div>
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
