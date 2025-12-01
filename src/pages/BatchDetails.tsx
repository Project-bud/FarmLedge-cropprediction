import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

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
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-24 sm:py-28 space-y-6">
        <h1 className="text-2xl sm:text-3xl font-bold">{t('batchDetails.title')}</h1>
        <Card className="p-6 space-y-4">
          {loading && (
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-64" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}
          {!loading && error && (
            <p className="text-sm text-destructive">{t('batchDetails.error')}: {error}</p>
          )}
          {!loading && data && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="text-sm text-muted-foreground font-mono break-all">{t('batchDetails.labels.batch')} #{data.batch.id}</div>
                <div className="grid sm:grid-cols-2 gap-2 text-sm">
                  <div><span className="font-semibold">{t('batchDetails.labels.crop')}:</span> {data.batch.cropType}</div>
                  <div><span className="font-semibold">{t('batchDetails.labels.quantity')}:</span> {data.batch.quantityKg} kg</div>
                  <div><span className="font-semibold">{t('batchDetails.labels.farmer')}:</span> {data.batch.farmer}</div>
                  <div><span className="font-semibold">{t('batchDetails.labels.owner')}:</span> {data.batch.currentOwner}</div>
                  <div><span className="font-semibold">{t('batchDetails.labels.ownerRole')}:</span> {data.batch.currentHolderRole || '—'}</div>
                  <div><span className="font-semibold">{t('batchDetails.labels.farmerPrice')}:</span> {data.batch.minPriceINR || data.batch.basePriceINR || '0'}</div>
                  <div><span className="font-semibold">{t('batchDetails.labels.harvest')}:</span> {new Date(data.batch.harvestDate * 1000).toLocaleDateString()}</div>
                  <div><span className="font-semibold">{t('batchDetails.labels.created')}:</span> {new Date(data.batch.createdAt * 1000).toLocaleString()}</div>
                  {!!data.batch?.priceByDistributorINR && (
                    <div><span className="font-semibold">{t('batchDetails.labels.distributorPrice')}:</span> {data.batch.priceByDistributorINR}</div>
                  )}
                  {!!data.batch?.priceByRetailerINR && (
                    <div><span className="font-semibold">{t('batchDetails.labels.retailerPrice')}:</span> {data.batch.priceByRetailerINR}</div>
                  )}
                </div>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div>{t('batchDetails.labels.f2d')}: {data.batch.dates?.boughtByDistributor ? new Date(data.batch.dates.boughtByDistributor * 1000).toLocaleString() : '—'}</div>
                  <div>{t('batchDetails.labels.d2r')}: {data.batch.dates?.boughtByRetailer ? new Date(data.batch.dates.boughtByRetailer * 1000).toLocaleString() : '—'}</div>
                  <div>{t('batchDetails.labels.r2c')}: {data.batch.dates?.boughtByConsumer ? new Date(data.batch.dates.boughtByConsumer * 1000).toLocaleString() : '—'}</div>
                </div>
              </div>

              {/* Parent Batch Info */}
{data.batch.parentId === 0 ? (
  <div className="pt-4 border-t">
    <h3 className="font-semibold text-lg mb-2">This is the parent block</h3>
  </div>
) : (
  data.batch.parentId && (
    <div className="pt-4 border-t">
      <h3 className="font-semibold text-lg mb-2">Origin Batch Details (Parent)</h3>
      <ParentBatchInfo parentId={data.batch.parentId} />
    </div>
  )
)}

            </div>
          )}
        </Card>
      </main>
      <Footer />
    </div>
  );
}

function ParentBatchInfo({ parentId }: { parentId: number }) {
  const [parent, setParent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/batch/${parentId}`)
      .then(res => res.json())
      .then(data => {
        if (data.batch) setParent(data.batch);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [parentId]);

  if (loading) return <Skeleton className="h-20 w-full" />;
  if (!parent) return <div className="text-sm text-muted-foreground">Parent batch info unavailable</div>;

  return (
    <div className="bg-muted/50 p-4 rounded-lg text-sm space-y-2">
      <div className="font-mono text-xs text-muted-foreground">Batch #{parent.id}</div>
      <div className="grid sm:grid-cols-2 gap-2">
        <div><span className="font-semibold">Crop:</span> {parent.cropType}</div>
        <div><span className="font-semibold">Original Quantity:</span> {parent.quantityKg} kg</div>
        <div><span className="font-semibold">Farmer:</span> {parent.farmer}</div>
        <div><span className="font-semibold">Created:</span> {new Date(parent.createdAt * 1000).toLocaleDateString()}</div>
      </div>
      <div className="text-xs text-blue-600">
        <a href={`/batch?id=${parent.id}`} className="hover:underline">View Parent Batch &rarr;</a>
      </div>
    </div>
  );
}
