import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingUp, TrendingDown, Info, Sprout, Target, MapPin, Layers, CheckCircle2, Leaf } from "lucide-react";

interface PredictionResult {
    predicted_price: number;
    confidence: number;
    unit: string;
    district: string;
    soil_type: string;
    crop: string;
}

const CROPS = ['Rice', 'Moong', 'Brinjal', 'Groundnut', 'Cotton', 'Sugarcane', 'Wheat', 'Maize', 'Onion', 'Tomato'];

// Real crop-soil suitability data based on Odisha agricultural practices
const CROP_SOIL_SUITABILITY = {
    "Rice": {
        best: ["Deltaic Alluvial", "Mixed Red and Yellow"],
        good: ["Black", "Red"],
        season: "Kharif",
        avgYield: "2.5-3.5 tons/hectare"
    },
    "Moong": {
        best: ["Red", "Mixed Red and Black"],
        good: ["Laterite", "Mixed Red and Yellow"],
        season: "Rabi",
        avgYield: "0.8-1.2 tons/hectare"
    },
    "Brinjal": {
        best: ["Red", "Laterite", "Deltaic Alluvial"],
        good: ["Black", "Mixed Red and Yellow"],
        season: "All Year",
        avgYield: "20-25 tons/hectare"
    },
    "Groundnut": {
        best: ["Red", "Laterite"],
        good: ["Mixed Red and Yellow"],
        season: "Kharif",
        avgYield: "1.5-2.0 tons/hectare"
    },
    "Cotton": {
        best: ["Black", "Red"],
        good: ["Mixed Red and Black"],
        season: "Kharif",
        avgYield: "1.2-1.8 tons/hectare"
    },
    "Sugarcane": {
        best: ["Black", "Deltaic Alluvial"],
        good: ["Red", "Mixed Red and Yellow"],
        season: "All Year",
        avgYield: "60-80 tons/hectare"
    },
    "Wheat": {
        best: ["Deltaic Alluvial", "Black"],
        good: ["Mixed Red and Yellow"],
        season: "Rabi",
        avgYield: "2.0-2.8 tons/hectare"
    },
    "Maize": {
        best: ["Red", "Mixed Red and Yellow"],
        good: ["Black", "Laterite"],
        season: "Kharif",
        avgYield: "2.5-3.5 tons/hectare"
    },
    "Onion": {
        best: ["Red", "Black"],
        good: ["Mixed Red and Black", "Laterite"],
        season: "Rabi",
        avgYield: "15-20 tons/hectare"
    },
    "Tomato": {
        best: ["Red", "Laterite"],
        good: ["Mixed Red and Yellow", "Black"],
        season: "All Year",
        avgYield: "25-30 tons/hectare"
    }
};

const CropPricePrediction = () => {
    const { t } = useTranslation();
    const [selectedCrop, setSelectedCrop] = useState<string>('');
    const [selectedDistrict, setSelectedDistrict] = useState<string>('');
    const [selectedSoil, setSelectedSoil] = useState<string>('');
    const [districts, setDistricts] = useState<string[]>([]);
    const [soils, setSoils] = useState<string[]>([]);
    const [prediction, setPrediction] = useState<PredictionResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch districts on mount
    useEffect(() => {
        fetch('http://localhost:5001/districts')
            .then(res => res.json())
            .then(data => {
                setDistricts(data.districts);
                if (data.districts.length > 0) {
                    setSelectedDistrict(data.districts[0]);
                }
            })
            .catch(err => console.error('Failed to fetch districts:', err));
    }, []);

    // Fetch soils when district changes
    useEffect(() => {
        if (!selectedDistrict) return;
        
        fetch(`http://localhost:5001/soils/${selectedDistrict}`)
            .then(res => res.json())
            .then(data => {
                setSoils(data.soils);
                if (data.soils.length > 0) {
                    setSelectedSoil(data.soils[0]);
                }
            })
            .catch(err => console.error('Failed to fetch soils:', err));
    }, [selectedDistrict]);

    // Get recommended crops based on selected soil
    const getRecommendedCrops = () => {
        if (!selectedSoil) return [];
        
        const recommendations: Array<{crop: string, suitability: 'best' | 'good', data: any}> = [];
        
        Object.entries(CROP_SOIL_SUITABILITY).forEach(([crop, data]) => {
            if (data.best.some(soil => selectedSoil.includes(soil) || soil.includes(selectedSoil))) {
                recommendations.push({ crop, suitability: 'best', data });
            } else if (data.good.some(soil => selectedSoil.includes(soil) || soil.includes(selectedSoil))) {
                recommendations.push({ crop, suitability: 'good', data });
            }
        });
        
        // Sort: best first, then by crop name
        return recommendations.sort((a, b) => {
            if (a.suitability === b.suitability) return a.crop.localeCompare(b.crop);
            return a.suitability === 'best' ? -1 : 1;
        });
    };

    // Calculate prediction
    const calculatePrediction = async () => {
        if (!selectedCrop || !selectedDistrict || !selectedSoil) {
            setError('Please select crop, district, and soil type');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('http://localhost:5001/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    crop: selectedCrop,
                    district: selectedDistrict,
                    soil_type: selectedSoil,
                    rainfall: 1200
                })
            });

            if (!response.ok) {
                throw new Error('Prediction failed');
            }

            const data = await response.json();
            setPrediction(data);

        } catch (err: any) {
            setError(err.message || 'Failed to get prediction');
        } finally {
            setLoading(false);
        }
    };

    // Auto-predict disabled - user must click button
    // useEffect(() => {
    //     if (selectedCrop && selectedDistrict && selectedSoil) {
    //         calculatePrediction();
    //     }
    // }, [selectedCrop, selectedDistrict, selectedSoil]);

    const recommendedCrops = getRecommendedCrops();

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-serif font-bold text-emerald-900 flex items-center justify-center gap-2">
                    <Sprout className="w-8 h-8 text-emerald-600" />
                    Smart Crop Price Prediction
                </h2>
                <p className="text-slate-600">Real-time predictions based on government soil data and market prices</p>
            </div>

            <Card className="border-emerald-100 shadow-lg bg-white/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Select Parameters</CardTitle>
                    <CardDescription>Choose your crop, district, and soil type for accurate predictions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Crop Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Sprout className="w-4 h-4" />
                                Crop
                            </label>
                            <Select value={selectedCrop} onValueChange={setSelectedCrop} disabled={loading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Crop" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CROPS.map(crop => (
                                        <SelectItem key={crop} value={crop}>{crop}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* District Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                District
                            </label>
                            <Select value={selectedDistrict} onValueChange={setSelectedDistrict} disabled={loading}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select District" />
                                </SelectTrigger>
                                <SelectContent>
                                    {districts.map(district => (
                                        <SelectItem key={district} value={district}>{district}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Soil Type Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                <Layers className="w-4 h-4" />
                                Soil Type
                            </label>
                            <Select value={selectedSoil} onValueChange={setSelectedSoil} disabled={loading || !selectedDistrict}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Soil" />
                                </SelectTrigger>
                                <SelectContent>
                                    {soils.map(soil => (
                                        <SelectItem key={soil} value={soil}>{soil}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Button 
                        onClick={calculatePrediction} 
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                        disabled={loading || !selectedCrop || !selectedDistrict || !selectedSoil}
                    >
                        <Target className="w-4 h-4 mr-2" />
                        {loading ? 'Calculating...' : 'Get Prediction'}
                    </Button>
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
                <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-200 shadow-md">
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>{prediction.crop} Price Prediction</span>
                            <Badge variant="outline" className="bg-white text-emerald-700 border-emerald-200">
                                {prediction.confidence}% Confidence
                            </Badge>
                        </CardTitle>
                        <CardDescription>
                            {prediction.district} • {prediction.soil_type}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Predicted Price</p>
                                <div className="flex items-baseline gap-1">
                                    <p className="text-4xl font-bold text-emerald-900">₹{prediction.predicted_price.toFixed(2)}</p>
                                    <span className="text-slate-500 font-medium">/ Quintal</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                                <TrendingUp className="w-4 h-4" />
                                High Accuracy
                            </div>
                        </div>

                        <div className="flex items-start gap-2 text-xs text-slate-500 pt-2 border-t border-emerald-100">
                            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <p>Prediction based on real Odisha government soil data and historical crop prices</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Crop Recommendations */}
            {selectedSoil && recommendedCrops.length > 0 && (
                <Card className="border-emerald-100 shadow-lg bg-gradient-to-br from-emerald-50 to-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Leaf className="w-5 h-5 text-emerald-600" />
                            Recommended Crops for {selectedSoil}
                        </CardTitle>
                        <CardDescription>Based on real Odisha agricultural data and soil suitability</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {recommendedCrops.map(({ crop, suitability, data }) => (
                                <div 
                                    key={crop}
                                    className={`p-4 rounded-lg border-2 ${
                                        suitability === 'best' 
                                            ? 'bg-emerald-50 border-emerald-300' 
                                            : 'bg-white border-slate-200'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="font-semibold text-lg text-slate-800">{crop}</h3>
                                        <Badge 
                                            className={
                                                suitability === 'best'
                                                    ? 'bg-emerald-600 text-white'
                                                    : 'bg-blue-100 text-blue-700'
                                            }
                                        >
                                            {suitability === 'best' ? (
                                                <><CheckCircle2 className="w-3 h-3 mr-1" /> Best Match</>
                                            ) : (
                                                'Good Match'
                                            )}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1 text-sm text-slate-600">
                                        <p><strong>Season:</strong> {data.season}</p>
                                        <p><strong>Avg Yield:</strong> {data.avgYield}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default CropPricePrediction;

