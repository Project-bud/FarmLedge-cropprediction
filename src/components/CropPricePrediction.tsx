import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, TrendingUp, TrendingDown, Info, Sprout } from "lucide-react";
import { 
    getAvailableCrops, 
    getCropData, 
    getSeasonalityFactor, 
    fetchRecentPrice 
} from '@/lib/pricePrediction';

interface PredictionResult {
  crop: string;
  predictionDate: string;
  predictedPrice: string;
  recentAveragePrice: string;
  seasonalFactor: string;
  priceChangePercent: string;
  weights: {
    recent: number;
    long_term: number;
  };
  dataInfo: {
    start: string;
    end: string;
  };
}

const CropPricePrediction = () => {
    const { t } = useTranslation();
    const [selectedCrop, setSelectedCrop] = useState<string>('Onion');
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Get list of available crops
    const availableCrops = getAvailableCrops();

    // Calculate prediction
    const calculatePrediction = async () => {
        setLoading(true);
        setError(null);

        try {
            const cropData = getCropData(selectedCrop);

            if (!cropData) {
                setError(`Crop "${selectedCrop}" not found in database`);
                setLoading(false);
                return;
            }

            // Get seasonality factor
            const seasonalFactor = getSeasonalityFactor(selectedCrop);

            // Fetch recent price (Returns price per Quintal/100kg)
            const recentPriceQuintal = await fetchRecentPrice(selectedCrop);

            if (!recentPriceQuintal) {
                setError('No recent price data available from API for this crop in Odisha.');
                setLoading(false);
                return;
            }

            // Convert to per kg
            const recentPriceKg = recentPriceQuintal / 100;

            // Calculate prediction
            const predictedPriceKg = recentPriceKg * seasonalFactor;
            const priceChange = ((predictedPriceKg - recentPriceKg) / recentPriceKg) * 100;

            setPrediction({
                crop: selectedCrop,
                predictionDate: new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
                predictedPrice: predictedPriceKg.toFixed(2),
                recentAveragePrice: recentPriceKg.toFixed(2),
                seasonalFactor: seasonalFactor.toFixed(3),
                priceChangePercent: priceChange.toFixed(2),
                weights: cropData.weights,
                dataInfo: cropData.date_range
            });

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Auto-predict on crop change
    useEffect(() => {
        calculatePrediction();
    }, [selectedCrop]);

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-serif font-bold text-emerald-900 flex items-center justify-center gap-2">
                    <Sprout className="w-8 h-8 text-emerald-600" />
                    {t('prediction.title')}
                </h2>
                <p className="text-slate-600">{t('prediction.subtitle')}</p>
            </div>

            <Card className="border-emerald-100 shadow-lg bg-white/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>{t('prediction.selectCrop')}</CardTitle>
                    <CardDescription>{t('prediction.selectCropDesc')}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select value={selectedCrop} onValueChange={setSelectedCrop} disabled={loading}>
                        <SelectTrigger className="w-full md:w-[300px]">
                            <SelectValue placeholder={t('prediction.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                            {availableCrops.map(crop => (
                                <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {loading && (
                <div className="space-y-4">
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>
            )}

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {prediction && !loading && !error && (
                <div className="grid gap-6 md:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200 shadow-md">
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>{prediction.crop}</span>
                                <Badge variant="outline" className="bg-white text-emerald-700 border-emerald-200">
                                    {prediction.predictionDate}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{t('prediction.predictedPrice')}</p>
                                    <div className="flex items-baseline gap-1">
                                        <p className="text-4xl font-bold text-emerald-900">₹{prediction.predictedPrice}</p>
                                        <span className="text-slate-500 font-medium">/ kg</span>
                                    </div>
                                </div>
                                <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${parseFloat(prediction.priceChangePercent) >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {parseFloat(prediction.priceChangePercent) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                                    {parseFloat(prediction.priceChangePercent) > 0 ? '+' : ''}{prediction.priceChangePercent}%
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-emerald-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-600">{t('prediction.currentAverage')}</span>
                                    <span className="font-mono font-medium">₹{prediction.recentAveragePrice} / kg</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg">{t('prediction.modelInsights')}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase">{t('prediction.seasonalFactor')}</p>
                                    <p className="text-xl font-semibold text-slate-800">{prediction.seasonalFactor}x</p>
                                </div>
                                <div className="p-3 bg-slate-50 rounded-lg">
                                    <p className="text-xs text-slate-500 uppercase">{t('prediction.method')}</p>
                                    <p className="text-sm font-semibold text-slate-800">Performance-based</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-medium text-slate-700">{t('prediction.weightDistribution')}</p>
                                <div className="flex gap-2 text-xs">
                                    <Badge variant="secondary">{t('prediction.recent')}: {(prediction.weights.recent * 100).toFixed(0)}%</Badge>
                                    <Badge variant="secondary">{t('prediction.longTerm')}: {(prediction.weights.long_term * 100).toFixed(0)}%</Badge>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 text-xs text-slate-500 pt-2">
                                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <p>{t('prediction.basedOn', { start: prediction.dataInfo.start, end: prediction.dataInfo.end })}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default CropPricePrediction;
