import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
  isProcessing: boolean;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, isProcessing }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>('');
  
  // Zoom state
  const [zoom, setZoom] = useState(1);
  const [minZoom, setMinZoom] = useState(1);
  const [maxZoom, setMaxZoom] = useState(1); // Default to 1 if not supported
  const [zoomSupported, setZoomSupported] = useState(false);

  const startCamera = async () => {
    try {
      // Request higher resolution for better OCR
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 } 
        } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      // Check and setup zoom capabilities
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
      
      if (capabilities.zoom) {
        setZoomSupported(true);
        setMinZoom(capabilities.zoom.min);
        setMaxZoom(capabilities.zoom.max);
        setZoom(capabilities.zoom.min || 1);
      } else {
        setZoomSupported(false);
      }
      
      setError('');
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError('Không thể truy cập camera. Vui lòng cấp quyền.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newZoom = parseFloat(e.target.value);
    setZoom(newZoom);
    
    if (stream) {
      const track = stream.getVideoTracks()[0];
      const constraints = { advanced: [{ zoom: newZoom }] } as any;
      track.applyConstraints(constraints).catch(err => {
        console.warn('Error applying zoom:', err);
      });
    }
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        // Set canvas dimensions to match video
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        // Draw video frame to canvas
        context.drawImage(videoRef.current, 0, 0);
        
        // Get base64 string
        const imageData = canvasRef.current.toDataURL('image/jpeg', 0.8);
        onCapture(imageData);
      }
    }
  };

  return (
    <div className="relative w-full bg-slate-900 rounded-xl overflow-hidden shadow-lg aspect-video flex flex-col items-center justify-center group">
      {error ? (
        <div className="text-red-400 p-4 text-center">
          <p>{error}</p>
          <button 
            onClick={startCamera}
            className="mt-2 px-4 py-2 bg-slate-800 rounded-md text-sm hover:bg-slate-700"
          >
            Thử lại
          </button>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {/* Zoom Controls Overlay */}
          {zoomSupported && (
            <div className="absolute bottom-24 left-0 right-0 px-12 flex items-center justify-center gap-3 z-20 transition-opacity opacity-100">
              <ZoomOut className="w-4 h-4 text-white/70 shadow-sm" />
              <input 
                type="range" 
                min={minZoom} 
                max={maxZoom} 
                step={0.1} 
                value={zoom} 
                onChange={handleZoomChange}
                className="w-full max-w-[200px] h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-white hover:bg-white/40 focus:outline-none"
              />
              <ZoomIn className="w-4 h-4 text-white/70 shadow-sm" />
            </div>
          )}
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-10">
            <button
              onClick={handleCapture}
              disabled={isProcessing || !!error}
              className={`
                h-16 w-16 rounded-full border-4 border-white flex items-center justify-center
                transition-transform hover:scale-105 active:scale-95 shadow-xl
                ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500'}
              `}
            >
              {isProcessing ? (
                <RefreshCw className="w-8 h-8 text-white animate-spin" />
              ) : (
                <Camera className="w-8 h-8 text-white" />
              )}
            </button>
          </div>
          
          {!stream && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 text-white">
              Đang khởi động camera...
            </div>
          )}
        </>
      )}
    </div>
  );
};