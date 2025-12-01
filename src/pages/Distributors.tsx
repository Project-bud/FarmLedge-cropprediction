import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { DEFAULT_ADDRESSES, isHexAddress } from "@/lib/addresses";
import TestingAddresses from "@/components/TestingAddresses";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Distributors = () => {
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [buyQuantity, setBuyQuantity] = useState<string>("");
  const [completeBatch, setCompleteBatch] = useState(false);
  const [resalePrice, setResalePrice] = useState<string>("");
  const [buyerAddress, setBuyerAddress] = useState<string>(DEFAULT_ADDRESSES.DISTRIBUTOR);
  const [addrError, setAddrError] = useState<string>("");
  const [actionMsg, setActionMsg] = useState<string>("");
  const [paying, setPaying] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();
  const [batches, setBatches] = useState<any[]>([]);

  const fetchBatches = async () => {
    try {
      const res = await fetch("/api/batches");
      const data = await res.json();
      setBatches(data.batches || []);
    } catch (e) { console.error(e); }
  }

  useEffect(() => { fetchBatches(); }, []);
  // Handle successful payment redirect
  useEffect(() => {
    const checkPayment = async () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('paid') === '1' && user?.email) {
        setIsProcessingPayment(true);
        const originalBatchId = params.get('batchId');
        const isComplete = params.get('complete') === '1';
        const sessionId = params.get('session_id');

        toast.info("Payment successful! Processing...");

        // Manually confirm payment to handle localhost webhook issues
        if (sessionId) {
          try {
            await fetch('/api/confirm-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId })
            });
          } catch (e) {
            console.error("Manual confirmation failed", e);
          }
        }

        // Wait a moment for chain update
        await new Promise(r => setTimeout(r, 2500));

        if (isComplete && originalBatchId) {
          window.location.href = `/batch?id=${originalBatchId}`;
          return;
        }

        try {
          // Fetch all batches to find the new one
          const res = await fetch('/api/batches');
          const data = await res.json();

          if (data.batches && Array.isArray(data.batches)) {
            // Find batches created in the last 5 minutes that are split batches
            const now = Math.floor(Date.now() / 1000);
            const recentBatches = data.batches.filter((b: any) =>
              b.isSplit &&
              (now - b.createdAt) < 300 && // Created in last 5 mins
              (!originalBatchId || String(b.parentId) === String(originalBatchId))
            );

            if (recentBatches.length > 0) {
              // Sort by ID descending to get the newest
              recentBatches.sort((a: any, b: any) => b.id - a.id);
              const newBatch = recentBatches[0];
              window.location.href = `/batch?id=${newBatch.id}`;
              return;
            }
          }
        } catch (e) {
          console.error("Failed to find new batch", e);
        }

        // Fallback if not found
        toast.success("Payment processed. Your batch will appear shortly.");
        // Clear param
        window.history.replaceState({}, '', window.location.pathname);
        fetchBatches();
      } else if (params.get('canceled') === '1') {
        fetchBatches();
      }
    };

    checkPayment();
  }, [user]);

  const available = useMemo(() => {
    // Available = currently held by farmer (owner == farmer) and VERIFIED
    return (batches || []).filter((b: any) => {
      const heldByFarmer = b.currentOwner && b.farmer && b.currentOwner.toLowerCase?.() === b.farmer.toLowerCase?.()
      const isVerified = (b?.verification?.status || 'unverified') === 'verified'
      return heldByFarmer && isVerified
    })
  }, [batches]);

  const selectedBatchData = useMemo(() => {
    return available.find((b: any) => String(b.id) === String(selectedBatch))
  }, [available, selectedBatch]);

  // Auto-fill quantity when complete batch is checked
  useEffect(() => {
    if (completeBatch && selectedBatchData?.quantityKg) {
      setBuyQuantity(String(selectedBatchData.quantityKg));
    }
  }, [completeBatch, selectedBatchData?.quantityKg]);

  const pricePerKg = useMemo(() => {
    if (!selectedBatchData) return 0;
    const qty = selectedBatchData.quantityKg;
    if (qty === 0) return 0;
    const basePrice = Number(selectedBatchData.minPriceINR || selectedBatchData.basePriceINR || 0);
    return basePrice;
  }, [selectedBatchData]);

  const totalPrice = useMemo(() => {
    if (!selectedBatchData) return 0;
    const qty = Number(buyQuantity);
    if (!Number.isFinite(qty) || qty <= 0) return 0;
    return pricePerKg * qty;
  }, [buyQuantity, pricePerKg, selectedBatchData]);

  useEffect(() => {
    if (!user) { setActionMsg(t('distributors.messages.login')); return; }
    if (!selectedBatch) { setActionMsg(t('distributors.messages.select')); return; }
    if (!buyQuantity || Number(buyQuantity) <= 0) { setActionMsg("Enter a valid quantity"); return; }
    if (Number(buyQuantity) > selectedBatchData?.quantityKg) { setActionMsg("Quantity exceeds available"); return; }
    if (!resalePrice) { setActionMsg("Set your resale price"); return; }
    setActionMsg("");
  }, [buyQuantity, completeBatch, resalePrice, selectedBatch, selectedBatchData?.quantityKg, t, user]);

  const validateAddress = (value: string) => {
    const trimmed = value?.trim();
    if (!trimmed) {
      setAddrError("Address is required");
      return false;
    }
    if (!isHexAddress(trimmed)) {
      setAddrError("Invalid address format");
      return false;
    }
    if (addrError) setAddrError("");
    return true;
  };

  const pay = async () => {
    if (!user) { setActionMsg(t('distributors.messages.login')); toast.error(t('distributors.messages.login')); return; }
    if (!selectedBatch) { setActionMsg(t('distributors.messages.select')); return; }
    if (!buyQuantity || Number(buyQuantity) <= 0) { setActionMsg("Enter a valid quantity"); return; }
    if (!selectedBatchData) { setActionMsg("Select a valid batch"); return; }
    if (Number(buyQuantity) > selectedBatchData.quantityKg) { setActionMsg("Quantity exceeds available"); return; }
    if (!resalePrice || Number(resalePrice) <= 0) { setActionMsg("Set your resale price"); return; }

    const finalBuyer = buyerAddress?.trim() ? buyerAddress : DEFAULT_ADDRESSES.DISTRIBUTOR;
    if (!validateAddress(finalBuyer)) { return; }

    const priceInr = totalPrice;
    if (priceInr <= 0) { setActionMsg("Unable to calculate total price"); return; }

    // Calculate total resale price for complete batch logic
    const totalResalePrice = resalePrice ? (Number(resalePrice)).toFixed(0) : '0';

    try {
      setPaying(true);
      const res = await fetch("/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lineItems: [{
            price_data: {
              currency: "inr",
              product_data: { name: `Batch ${selectedBatch} (${buyQuantity}kg)` },
              unit_amount: Math.round(priceInr * 100)
            },
            quantity: 1
          }],
          successUrl: `${window.location.origin}/distributors?paid=1&batchId=${selectedBatch}&complete=${completeBatch ? '1' : '0'}&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/distributors?canceled=1`,
          metadata: {
            batchId: String(selectedBatch),
            role: "distributor",
            payer: user.email || 'distributor',
            payee: selectedBatchData?.farmer || '',
            toAddress: finalBuyer,
            isSplit: !completeBatch,
            splitQuantity: buyQuantity,
            completeBatch: completeBatch ? 'true' : 'false',
            resalePricePerKg: resalePrice || '0',
            distributorPriceINR: totalResalePrice
          }
        })
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else setActionMsg(t('distributors.messages.startFailed'));
    } catch (e) {
      console.error(e);
      toast.error("Failed to start payment");
    } finally {
      setPaying(false);
    }
  };

  if (isProcessingPayment) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">Processing Payment...</h2>
        <p className="text-muted-foreground">Please wait while we confirm your transaction.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="container mx-auto px-4 py-24 sm:py-28 space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold">{t('distributors.title')}</h1>

        <TestingAddresses />

        <Card className="p-6 space-y-4">
          <h2 className="font-semibold">{t('distributors.browse')}</h2>
          {!!actionMsg && (
            <div className="text-sm text-red-600">{actionMsg}</div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Batch</Label>
              <select
                className="border rounded px-3 py-2 w-full"
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
              >
                <option value="">{t('distributors.selectBatch')}</option>
                {available.map((b: any) => (
                  <option key={b.id} value={b.id}>
                    #{b.id} • {b.cropType || '—'} • {b.quantityKg}kg • ₹{pricePerKg.toFixed(2)}/kg • {b?.verification?.status || 'unverified'}
                  </option>
                ))}
              </select>
            </div>

            {selectedBatch && (
              <>
                <div className="p-3 bg-muted rounded-md text-sm">
                  <p><strong>Available:</strong> {selectedBatchData?.quantityKg} kg</p>
                  <p><strong>Price per kg:</strong> ₹{pricePerKg.toFixed(2)}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="completeBatch"
                    checked={completeBatch}
                    onCheckedChange={(checked) => setCompleteBatch(checked as boolean)}
                  />
                  <Label htmlFor="completeBatch" className="cursor-pointer text-sm font-medium">
                    Purchase Complete Batch
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label>Quantity to Purchase (kg)</Label>
                  <Input
                    type="number"
                    value={buyQuantity}
                    onChange={(e) => setBuyQuantity(e.target.value)}
                    placeholder={`Max ${selectedBatchData?.quantityKg}`}
                    max={selectedBatchData?.quantityKg}
                    min={1}
                    disabled={completeBatch}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Set Your Resale Price (₹ per kg)</Label>
                  <Input
                    type="number"
                    value={resalePrice}
                    onChange={(e) => setResalePrice(e.target.value)}
                    placeholder="Price for next buyer"
                    min={pricePerKg}
                  />
                  <p className="text-xs text-muted-foreground">
                    Minimum: ₹{pricePerKg.toFixed(2)}/kg
                  </p>
                </div>

                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-semibold">Total Price: ₹{totalPrice.toLocaleString()}</p>
                  {resalePrice && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Your resale price: ₹{Number(resalePrice).toFixed(2)}/kg
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="flex items-end gap-2 flex-wrap">
              <Button
                onClick={pay}
                disabled={paying || !selectedBatch || !buyQuantity || !resalePrice || Number(resalePrice) <= 0}
              >
                {paying ? t('distributors.starting') : t('distributors.buttons.pay')}
              </Button>
              <Button variant="ghost" onClick={fetchBatches}>{t('distributors.buttons.refresh')}</Button>
            </div>

            {available.length === 0 && (
              <div className="text-sm text-muted-foreground">{t('distributors.noneAvailable')}</div>
            )}
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>{t('distributors.buyerAddress')}</Label>
            <Input
              placeholder="0x..."
              value={buyerAddress}
              onChange={(e) => {
                setBuyerAddress(e.target.value);
                if (addrError) validateAddress(e.target.value);
              }}
            />
            {!!addrError && <div className="text-xs text-red-600">{addrError}</div>}
          </div>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default Distributors;
