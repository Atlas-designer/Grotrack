import { useState, useRef, useEffect, useCallback } from 'react';
import { X, Barcode, Trash2, Loader2 } from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { lookupBarcode, BarcodeProduct } from '../../utils/barcodeApi';
import { ParsedReceiptItem } from '../../utils/receiptParser';
import { ScanResultsView } from './ScanResultsView';
import { getFoodIcon } from '../../utils/foodIcons';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ScannedItem {
  name: string;
  quantity: number;
  category: string;
  lookupFailed: boolean;
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1000;
    osc.type = 'sine';
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // Audio not available
  }
}

export function BarcodeScanner({ isOpen, onClose }: BarcodeScannerProps) {
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [parsedItems, setParsedItems] = useState<ParsedReceiptItem[] | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scannerReady, setScannerReady] = useState(false);
  const [lastScanned, setLastScanned] = useState('');

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scannedCodesRef = useRef<Map<string, string>>(new Map());
  const mountedRef = useRef(true);

  const stopScanner = useCallback(async () => {
    try {
      if (scannerRef.current) {
        const isScanning = scannerRef.current.isScanning;
        if (isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
        scannerRef.current = null;
      }
    } catch {
      scannerRef.current = null;
    }
    setScannerReady(false);
  }, []);

  const startScanner = useCallback(async () => {
    setCameraError('');

    // Wait for DOM element
    await new Promise((r) => setTimeout(r, 300));

    const el = document.getElementById('barcode-reader');
    if (!el || scannerRef.current) return;

    try {
      const scanner = new Html5Qrcode('barcode-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 280, height: 150 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          // Dedup check — increment quantity if same barcode scanned again
          if (scannedCodesRef.current.has(decodedText)) {
            const existingName = scannedCodesRef.current.get(decodedText)!;
            setScannedItems((prev) => prev.map((item) =>
              item.name.toLowerCase() === existingName.toLowerCase()
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ));
            setLastScanned(decodedText);
            playBeep();
            navigator.vibrate?.(50);
            return;
          }
          setLastScanned(decodedText);
          playBeep();
          navigator.vibrate?.(100);
          setIsLookingUp(true);

          const product: BarcodeProduct | null = await lookupBarcode(decodedText);

          if (!mountedRef.current) return;
          setIsLookingUp(false);

          if (product) {
            scannedCodesRef.current.set(decodedText, product.name);
            setScannedItems((prev) => {
              // Check if same product name already scanned via different barcode
              const existingIdx = prev.findIndex(
                (p) => p.name.toLowerCase() === product.name.toLowerCase()
              );
              if (existingIdx >= 0) {
                const updated = [...prev];
                updated[existingIdx] = {
                  ...updated[existingIdx],
                  quantity: updated[existingIdx].quantity + 1,
                };
                return updated;
              }
              return [...prev, {
                name: product.name,
                quantity: 1,
                category: product.category,
                lookupFailed: false,
              }];
            });
          } else {
            scannedCodesRef.current.set(decodedText, '');
            setScannedItems((prev) => [...prev, {
              name: '',
              quantity: 1,
              category: 'other',
              lookupFailed: true,
            }]);
          }
        },
        undefined // ignore decode errors (no barcode in frame)
      );

      setScannerReady(true);
    } catch (err: any) {
      if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission')) {
        setCameraError('Camera access denied. Please allow camera access in your browser settings.');
      } else {
        setCameraError('Could not start camera. Please try again.');
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    if (isOpen && !showResults) {
      startScanner();
    }
    return () => {
      mountedRef.current = false;
      stopScanner();
    };
  }, [isOpen, showResults, startScanner, stopScanner]);

  const handleRemoveItem = (index: number) => {
    setScannedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReviewItems = async () => {
    await stopScanner();
    const reviewItems: ParsedReceiptItem[] = scannedItems.map((item) => ({
      name: item.name || 'Unknown Item',
      quantity: item.quantity,
      selected: true,
    }));
    setParsedItems(reviewItems);
    setShowResults(true);
  };

  const handleBack = () => {
    setShowResults(false);
    setParsedItems(null);
    // Scanner will restart via useEffect
  };

  const handleDone = () => {
    setScannedItems([]);
    setParsedItems(null);
    setShowResults(false);
    scannedCodesRef.current.clear();
    setLastScanned('');
    onClose();
  };

  const handleClose = async () => {
    await stopScanner();
    setScannedItems([]);
    setParsedItems(null);
    setShowResults(false);
    scannedCodesRef.current.clear();
    setLastScanned('');
    setCameraError('');
    onClose();
  };

  if (!isOpen) return null;

  if (showResults && parsedItems) {
    return (
      <ScanResultsView
        items={parsedItems}
        onBack={handleBack}
        onDone={handleDone}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-navy-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-navy-900/80 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-white">Scan Barcodes</h1>
          <button onClick={handleClose} className="p-2 hover:bg-white/10 rounded-xl">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Camera viewfinder */}
        <div className="relative bg-black flex-shrink-0">
          <div id="barcode-reader" className="w-full" style={{ minHeight: 280 }} />

          {!scannerReady && !cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-navy-950">
              <div className="text-center space-y-3">
                <Loader2 size={32} className="text-accent-400 animate-spin mx-auto" />
                <p className="text-gray-400 text-sm">Starting camera...</p>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="absolute inset-0 flex items-center justify-center bg-navy-950 p-6">
              <div className="text-center space-y-3">
                <Barcode size={32} className="text-red-400 mx-auto" />
                <p className="text-red-400 text-sm">{cameraError}</p>
              </div>
            </div>
          )}

          {/* Lookup indicator */}
          {isLookingUp && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-navy-900/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2">
              <Loader2 size={14} className="text-accent-400 animate-spin" />
              <span className="text-xs text-gray-300">Looking up product...</span>
            </div>
          )}

          {/* Last scanned flash */}
          {lastScanned && !isLookingUp && scannedItems.length > 0 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-emerald-500/90 backdrop-blur px-3 py-1.5 rounded-full">
              <span className="text-xs text-white font-medium">
                {scannedItems[scannedItems.length - 1]?.name || 'Item added'}
              </span>
            </div>
          )}
        </div>

        {/* Instructions */}
        {scannedItems.length === 0 && !cameraError && (
          <div className="px-4 py-3 text-center">
            <p className="text-gray-500 text-sm">Point your camera at a barcode to scan</p>
          </div>
        )}

        {/* Scanned items list */}
        {scannedItems.length > 0 && (
          <div className="flex-1 overflow-y-auto px-4 pt-3 pb-24">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Scanned Items ({scannedItems.length})
              </h2>
            </div>

            <div className="space-y-2">
              {scannedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 bg-navy-800/60 border border-white/5 rounded-xl px-3 py-2.5"
                >
                  <span className="text-lg">
                    {item.lookupFailed ? '❓' : getFoodIcon(item.name)}
                  </span>
                  <div className="flex-1 min-w-0">
                    {item.lookupFailed ? (
                      <p className="text-amber-400 text-sm font-medium">Unknown barcode</p>
                    ) : (
                      <p className="text-white text-sm font-medium truncate">{item.name}</p>
                    )}
                    <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(idx)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} className="text-gray-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      {scannedItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-navy-900/95 backdrop-blur-lg border-t border-white/5 px-4 py-4 z-50">
          <button
            onClick={handleReviewItems}
            className="w-full py-3.5 bg-accent-400 text-navy-950 font-semibold rounded-xl hover:bg-accent-300 transition-colors"
          >
            Review & Add Items ({scannedItems.length})
          </button>
        </div>
      )}
    </div>
  );
}
