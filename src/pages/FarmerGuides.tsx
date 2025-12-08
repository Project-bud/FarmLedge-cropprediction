import Navigation from '@/components/Navigation'
import Footer from '@/components/Footer'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ShieldCheck, Search, Leaf, Store, Factory, BookOpen } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

function useCropGuides() {
  return useQuery({
    queryKey: ['crop-guides'],
    queryFn: async () => {
      const res = await fetch('/api/crop-guides')
      const data = await res.json()
      if (!res.ok || !data?.ok) throw new Error(data?.error || 'crop_guides_error')
      return Array.isArray(data.guides) ? data.guides : []
    },
    staleTime: 10 * 60 * 1000,
  })
}

const FarmerGuides = () => {
  const { user } = useAuth()
  const { data: guides = [], isLoading, error } = useCropGuides()
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return guides.filter((g: any) => g?.cropName?.toLowerCase().includes(term))
  }, [guides, search])

  const active = useMemo(() => {
    if (!selected && filtered.length) return filtered[0]
    return filtered.find((g: any) => g.cropName === selected) || filtered[0]
  }, [filtered, selected])

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      <Navigation />
      <main className="container mx-auto px-4 py-24 sm:py-28 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-emerald-700 font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Zero-loss playbook
            </p>
            <h1 className="text-3xl font-serif font-bold text-slate-900">Farmer guides</h1>
            <p className="text-slate-500 mt-1">Practical handling, alternate markets, and processing options per crop.</p>
          </div>
          {user?.role && (
            <Badge variant="outline" className="border-emerald-200 text-emerald-700 bg-emerald-50">
              Signed in as {user.role}
            </Badge>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 border-emerald-100 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <Search className="w-4 h-4" /> Find a crop
              </CardTitle>
              <CardDescription>Choose a crop to view zero-loss steps.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Search crop name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="max-h-[420px] overflow-auto space-y-2 pr-1">
                {isLoading ? (
                  <p className="text-sm text-slate-500">Loading guides...</p>
                ) : error ? (
                  <p className="text-sm text-red-600">Failed to load guides.</p>
                ) : filtered.length === 0 ? (
                  <p className="text-sm text-slate-500">No crops match your search.</p>
                ) : (
                  filtered.map((g: any) => (
                    <Button
                      key={g.cropName}
                      variant={active?.cropName === g.cropName ? 'secondary' : 'ghost'}
                      className="w-full justify-start text-left"
                      onClick={() => setSelected(g.cropName)}
                    >
                      <Leaf className="w-4 h-4 mr-2 text-emerald-700" />
                      <span className="font-medium text-slate-800">{g.cropName}</span>
                      {g.category ? (
                        <Badge variant="outline" className="ml-auto text-xs bg-emerald-50 border-emerald-200 text-emerald-700">
                          {g.category}
                        </Badge>
                      ) : null}
                    </Button>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 shadow-sm border-slate-100">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
                {active?.cropName || 'Select a crop'}
              </CardTitle>
              <CardDescription>Handling steps, shelf life, processing and market alternatives.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 text-sm text-slate-700">
              {!active ? (
                <p className="text-slate-500">Pick a crop to see guidance.</p>
              ) : (
                <div className="space-y-4">
                  {active.shelfLife ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                      <p className="font-semibold text-emerald-900">Shelf life</p>
                      <p className="text-emerald-800">{active.shelfLife.normal ? `Ambient: ${active.shelfLife.normal}` : ''} {active.shelfLife.coldStorage ? `| Cold: ${active.shelfLife.coldStorage}` : ''}</p>
                    </div>
                  ) : null}

                  {active.zeroLossMeasures?.primary ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">Primary handling</p>
                      <p>{active.zeroLossMeasures.primary}</p>
                    </div>
                  ) : null}

                  {active.zeroLossMeasures?.secondary?.length ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">Secondary steps</p>
                      <div className="space-y-1">
                        {active.zeroLossMeasures.secondary.map((s: string, idx: number) => (
                          <p key={idx}>• {s}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {active.zeroLossMeasures?.processingOptions?.length ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 flex items-center gap-2"><Factory className="w-4 h-4" /> Processing options</p>
                      <div className="space-y-1">
                        {active.zeroLossMeasures.processingOptions.map((opt: any, idx: number) => (
                          <p key={idx}>• {opt.type}{opt.relatedUnits?.length ? ` — ${opt.relatedUnits.join(', ')}` : ''}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {active.alternateMarkets?.length ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 flex items-center gap-2"><Store className="w-4 h-4" /> Alternate markets</p>
                      <div className="space-y-1">
                        {active.alternateMarkets.map((m: any, idx: number) => (
                          <p key={idx}>• {m.marketType}: {m.description} {m.priceRange ? `(${m.priceRange})` : ''}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {active.recommendations?.length ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900 flex items-center gap-2"><BookOpen className="w-4 h-4" /> Recommendations</p>
                      <div className="space-y-1">
                        {active.recommendations.map((r: string, idx: number) => (
                          <p key={idx}>• {r}</p>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {active.mnregaPotential ? (
                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">MNREGA potential</p>
                      <p>Eligible: {active.mnregaPotential.eligible ? 'Yes' : 'No'}{active.mnregaPotential.dailyWage ? ` | Daily wage ~₹${active.mnregaPotential.dailyWage}` : ''}</p>
                      {active.mnregaPotential.wasteConversionRate ? <p>Waste conversion: {active.mnregaPotential.wasteConversionRate}</p> : null}
                    </div>
                  ) : null}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default FarmerGuides
