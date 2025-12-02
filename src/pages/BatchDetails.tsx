import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { useSearchParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { 
  Sprout, 
  Truck, 
  Store, 
  User, 
  CheckCircle2, 
  Circle, 
  Calendar,
  DollarSign,
  Package,
  ArrowRight,
  Link as LinkIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function BatchDetails() {
  const [params] = useSearchParams();
  const id = params.get("id");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<any | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    const run = async () => {
      if (!id) { setError("missing id"); setLoading(false); return; }
      try {
        setLoading(true)
        const paid = new URLSearchParams(window.location.search).get('paid')
        const sessionId = new URLSearchParams(window.location.search).get('session_id')
        if (paid === '1' && sessionId) {
          try {
            await fetch('/api/confirm-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId, batchId: id })
            })
          } catch { }
        }
        const res = await fetch(`/api/batch/${encodeURIComponent(id)}`)
        const text = await res.text()
        let json: any = null
        try { json = JSON.parse(text) } catch {
          throw new Error('Non-JSON response (server offline or proxy misconfig)')
        }
        if (!res.ok) throw new Error(json?.error || 'failed')
        setData(json)
      } catch (e: any) {
        setError(e.message || 'failed')
      } finally { setLoading(false) }
    }
    run()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <Navigation />
        <main className="container mx-auto px-4 py-24 sm:py-28 max-w-3xl space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="space-y-12 pl-4 border-l-2 border-slate-200">
            {[1, 2, 3].map((i) => (
              <div key={i} className="relative pl-8">
                <Skeleton className="h-32 w-full" />
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50/50">
        <Navigation />
        <main className="container mx-auto px-4 py-32 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-4">
            <Package className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Batch Not Found</h1>
          <p className="text-slate-600 mb-8">{error || "We couldn't locate the batch details you requested."}</p>
          <Link to="/" className="text-emerald-600 hover:underline font-medium">Return Home</Link>
        </main>
      </div>
    );
  }

  const batch = data.batch;
  
  // Timeline Steps Configuration
  const steps = [
    {
      key: 'farmer',
      role: t('batchDetails.labels.farmer'),
      icon: Sprout,
      date: batch.harvestDate || batch.createdAt,
      price: batch.minPriceINR || batch.basePriceINR,
      actor: batch.farmer,
      isCompleted: true,
      description: "Crop harvested and registered on blockchain",
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
      borderColor: "border-emerald-200"
    },
    {
      key: 'distributor',
      role: "Distributor", // Using hardcoded fallback if translation key missing, ideally use t('roles.distributor')
      icon: Truck,
      date: batch.dates?.boughtByDistributor,
      price: batch.priceByDistributorINR,
      actor: null, // We don't always have the distributor name in the simple view unless we fetch profiles
      isCompleted: !!batch.dates?.boughtByDistributor,
      description: "Transported and verified by logistics partner",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      borderColor: "border-blue-200"
    },
    {
      key: 'retailer',
      role: "Retailer",
      icon: Store,
      date: batch.dates?.boughtByRetailer,
      price: batch.priceByRetailerINR,
      actor: null,
      isCompleted: !!batch.dates?.boughtByRetailer,
      description: "Received at retail location, quality checked",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      borderColor: "border-amber-200"
    },
    {
      key: 'consumer',
      role: "Consumer",
      icon: User,
      date: batch.dates?.boughtByConsumer,
      price: null, // Consumer doesn't set a price
      actor: null,
      isCompleted: !!batch.dates?.boughtByConsumer,
      description: "Purchased by end consumer",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      borderColor: "border-purple-200"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24 sm:py-28 max-w-4xl">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium mb-2">
            <Package className="w-4 h-4" />
            <span>Batch #{batch.id}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 mb-4">
            {batch.cropType} Journey
          </h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border shadow-sm">
              <span className="font-semibold text-slate-900">{batch.quantityKg} kg</span>
              <span>Quantity</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border shadow-sm">
              <span className="font-semibold text-slate-900">{batch.currentOwner.slice(0, 6)}...{batch.currentOwner.slice(-4)}</span>
              <span>Current Owner</span>
            </div>
            <Badge variant="outline" className={cn(
              "px-3 py-1.5 text-xs uppercase tracking-wider font-semibold",
              batch.currentHolderRole === 'CONSUMER' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-700"
            )}>
              {batch.currentHolderRole || 'IN TRANSIT'}
            </Badge>
          </div>
        </div>

        {/* Parent Batch Link */}
        {batch.parentId !== 0 && (
          <Card className="mb-12 border-l-4 border-l-blue-500 overflow-hidden">
            <CardContent className="p-6 flex items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  Origin Batch (Parent)
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  This batch was split from a larger harvest (Batch #{batch.parentId}).
                </p>
              </div>
              <Link 
                to={`/batch?id=${batch.parentId}`}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
              >
                View Parent <ArrowRight className="w-4 h-4" />
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Vertical Timeline */}
        <div className="relative pl-4 sm:pl-8 border-l-2 border-slate-200 space-y-12 pb-12">
          {steps.map((step, index) => {
            const isLast = index === steps.length - 1;
            const isActive = step.isCompleted;
            
            return (
              <div key={step.key} className={cn("relative pl-8 sm:pl-12 transition-all duration-500", isActive ? "opacity-100" : "opacity-50 grayscale")}>
                {/* Timeline Node */}
                <div className={cn(
                  "absolute -left-[21px] sm:-left-[25px] top-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10",
                  isActive ? step.bgColor : "bg-slate-100"
                )}>
                  <step.icon className={cn("w-5 h-5 sm:w-6 sm:h-6", isActive ? step.color : "text-slate-400")} />
                </div>

                {/* Content Card */}
                <Card className={cn("border-none shadow-md overflow-hidden transition-shadow hover:shadow-lg", isActive ? "ring-1 ring-slate-200" : "")}>
                  <div className={cn("h-1.5 w-full", isActive ? step.bgColor.replace('bg-', 'bg-') : "bg-slate-100")} /> {/* Colored top bar */}
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className={cn("text-lg font-bold flex items-center gap-2", isActive ? "text-slate-900" : "text-slate-500")}>
                          {step.role}
                          {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">{step.description}</p>
                      </div>
                      {isActive && step.date && (
                        <Badge variant="secondary" className="w-fit flex items-center gap-1.5 font-mono text-xs">
                          <Calendar className="w-3 h-3" />
                          {new Date(step.date * 1000).toLocaleDateString()}
                        </Badge>
                      )}
                    </div>

                    {isActive && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                        {step.actor && (
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Identity</span>
                            <div className="font-mono text-sm text-slate-700 break-all">{step.actor}</div>
                          </div>
                        )}
                        
                        {step.price && (
                          <div className="space-y-1">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Transaction Price</span>
                            <div className="flex items-center gap-1 text-emerald-700 font-medium">
                              <DollarSign className="w-4 h-4" />
                              {step.price} INR
                            </div>
                          </div>
                        )}

                        {!step.price && !step.actor && (
                          <div className="text-sm text-slate-400 italic">
                            Verified on blockchain
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Parent Batch Info (Hidden logic for data fetching, kept for compatibility if needed, but UI is moved up) */}
        {/* We already handled the parent link above. The original code had a separate component fetching it. 
            We can keep the component definition if we want to be safe, but I inlined the link logic. 
            Actually, let's keep the fetch logic if we want to show details, but a link is cleaner. 
            I'll stick to the link for now as it's cleaner. */}
      </main>
      <Footer />
    </div>
  );
}

