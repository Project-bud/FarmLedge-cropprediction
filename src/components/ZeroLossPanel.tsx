import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Factory, Leaf, Link2, ShieldCheck, Store, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ZeroLossPanel({ batchId, cropType }: { batchId: string; cropType?: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["zero-loss", batchId],
    queryFn: async () => {
      const res = await fetch(`/api/batch/${encodeURIComponent(batchId)}/zero-loss`);
      const json = await res.json();
      if (!res.ok || !json?.ok) throw new Error(json?.error || "zero_loss_error");
      return json;
    },
    enabled: !!batchId,
    staleTime: 5 * 60 * 1000,
  });

  if (error) return null;

  const days = data?.batch?.daysRemaining;
  const urgency = data?.batch?.urgency;
  const guide = data?.guide;
  const options = data?.options || [];
  const awareness = data?.awareness || [];

  const urgencyLabel = () => {
    if (days == null) return "Unknown";
    if (days <= 0) return "Expired";
    if (days <= 3) return "Critical";
    if (days <= 7) return "Urgent";
    return "Normal";
  };

  const urgencyColor = () => {
    if (days == null) return "bg-slate-100 text-slate-700";
    if (days <= 0) return "bg-red-100 text-red-700";
    if (days <= 3) return "bg-red-100 text-red-700";
    if (days <= 7) return "bg-amber-100 text-amber-800";
    return "bg-emerald-100 text-emerald-800";
  };

  return (
    <Card className="mb-10 border-red-100 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="w-5 h-5" />
          Zero-loss options
        </CardTitle>
        <CardDescription>Act before spoilage; switch to alternates or processing.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 items-center text-sm">
          <Badge className={urgencyColor()}>{urgencyLabel()} {days != null ? `(~${days} days left)` : ''}</Badge>
          {cropType ? (
            <Badge variant="outline" className="border-slate-200 text-slate-700">Crop: {cropType}</Badge>
          ) : null}
        </div>

        {isLoading ? <p className="text-sm text-slate-500">Loading zero-loss options...</p> : null}

        {!isLoading && options.length === 0 ? (
          <p className="text-sm text-slate-500">No zero-loss guidance found.</p>
        ) : null}

        <div className="grid sm:grid-cols-2 gap-3">
          {options.map((opt: any, idx: number) => (
            <div key={idx} className="border rounded-lg p-3 bg-white shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                {opt.option}
              </div>
              {opt.description ? <p className="text-sm text-slate-600 mt-1">{opt.description}</p> : null}
              {opt.markets?.length ? (
                <div className="mt-2 space-y-1 text-sm text-slate-600">
                  {opt.markets.map((m: any, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <Store className="w-4 h-4 text-amber-600 mt-0.5" />
                      <span>{m.type}: {m.description}{m.priceRange ? ` (${m.priceRange})` : ''}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              {opt.processors?.length ? (
                <div className="mt-2 space-y-1 text-sm text-slate-600">
                  {opt.processors.map((p: any, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <Factory className="w-4 h-4 text-blue-600 mt-0.5" />
                      <span>{p.type}{p.relatedUnits?.length ? ` — ${p.relatedUnits.join(', ')}` : ''}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              {opt.dailyWage ? (
                <p className="mt-2 text-sm text-emerald-700">MNREGA approx wage: ₹{opt.dailyWage}</p>
              ) : null}
              {opt.recommendation ? (
                <p className="mt-1 text-xs text-slate-500 uppercase tracking-wide">Tag: {opt.recommendation}</p>
              ) : null}
            </div>
          ))}
        </div>

        {guide?.shelfLife ? (
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <Timer className="w-4 h-4 text-slate-500" />
            Shelf life: {guide.shelfLife.normal ? `Ambient ${guide.shelfLife.normal}` : ''} {guide.shelfLife.coldStorage ? `| Cold ${guide.shelfLife.coldStorage}` : ''}
          </div>
        ) : null}

        {awareness?.length ? (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <Leaf className="w-4 h-4 text-emerald-700" /> Awareness resources
            </p>
            <div className="grid sm:grid-cols-2 gap-2">
              {awareness.map((r: any) => (
                <a key={r._id || r.title} href={r.link || '#'} target="_blank" rel="noreferrer" className="block border rounded-lg p-3 bg-white hover:border-emerald-200 hover:shadow-sm">
                  <div className="text-sm font-semibold text-slate-800">{r.title}</div>
                  {r.summary ? <p className="text-xs text-slate-600 mt-1">{r.summary}</p> : null}
                  {r.scope ? <p className="text-[11px] text-emerald-700 mt-1 uppercase tracking-wide">{r.scope}</p> : null}
                  {r.link ? (
                    <span className="inline-flex items-center gap-1 text-xs text-blue-600 mt-1">
                      <Link2 className="w-3 h-3" /> Open
                    </span>
                  ) : null}
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
