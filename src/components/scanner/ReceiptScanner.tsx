import { useState, useRef } from 'react';
import { X, Camera, Upload, Loader2 } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { parseReceiptText, ParsedReceiptItem } from '../../utils/receiptParser';
import { ScanResultsView } from './ScanResultsView';

interface ReceiptScannerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReceiptScanner({ isOpen, onClose }: ReceiptScannerProps) {
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<ParsedReceiptItem[] | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    setError('');
    setScanning(true);
    setProgress(0);

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      const worker = await createWorker('eng', undefined, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const { data } = await worker.recognize(file);
      await worker.terminate();

      const items = parseReceiptText(data.text);
      setParsedItems(items);
    } catch (err: any) {
      setError(err?.message || 'Failed to scan receipt');
    } finally {
      setScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImage(file);
    e.target.value = '';
  };

  const handleReset = () => {
    setImagePreview(null);
    setParsedItems(null);
    setError('');
    setProgress(0);
  };

  const handleDone = () => {
    handleReset();
    onClose();
  };

  if (!isOpen) return null;

  // Show results view if we have parsed items
  if (parsedItems) {
    return (
      <ScanResultsView
        items={parsedItems}
        onBack={handleReset}
        onDone={handleDone}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-navy-950 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-navy-900/80 backdrop-blur-lg border-b border-white/5">
        <div className="flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-white">Scan Receipt</h1>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl">
            <X size={20} className="text-gray-400" />
          </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {scanning ? (
          <div className="text-center space-y-4">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Receipt preview"
                className="max-h-48 rounded-xl mx-auto border border-white/10 object-contain"
              />
            )}
            <Loader2 size={32} className="text-accent-400 animate-spin mx-auto" />
            <div>
              <p className="text-white font-medium">Scanning receipt...</p>
              <p className="text-sm text-gray-500 mt-1">{progress}% complete</p>
            </div>
            <div className="w-48 h-1.5 bg-navy-700 rounded-full overflow-hidden mx-auto">
              <div
                className="h-full bg-accent-400 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6 w-full max-w-sm">
            <div className="space-y-2">
              <div className="w-16 h-16 bg-accent-400/15 rounded-2xl flex items-center justify-center mx-auto">
                <Camera size={32} className="text-accent-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Scan a Receipt</h2>
              <p className="text-sm text-gray-500">
                Take a photo or upload an image of your grocery receipt to quickly add items
              </p>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 px-3 py-2 rounded-lg">{error}</p>
            )}

            <div className="space-y-3">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-accent-400 text-navy-950 font-semibold rounded-xl hover:bg-accent-300 transition-colors"
              >
                <Camera size={20} />
                Take Photo
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-navy-800 border border-white/10 text-white font-semibold rounded-xl hover:bg-navy-700 transition-colors"
              >
                <Upload size={20} />
                Upload Image
              </button>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}
      </div>
    </div>
  );
}
