import React, { useState, useEffect } from 'react';
import { ParkingEntry, ParkingRates } from '../types';
import { Clock, Car, Info, Palette, LogOut, DollarSign, Maximize2, ZoomIn, ZoomOut, X, CheckCircle, AlertTriangle } from 'lucide-react';

interface VehicleInfoCardProps {
  entry: ParkingEntry;
  onCheckOut: (entry: ParkingEntry) => void;
  rates: ParkingRates;
  overdueThreshold: number;
}

export const VehicleInfoCard: React.FC<VehicleInfoCardProps> = ({ entry, onCheckOut, rates, overdueThreshold }) => {
  const [imgError, setImgError] = useState(false);
  const [now, setNow] = useState(new Date());
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [zoom, setZoom] = useState(1);

  const hasImage = entry.imageUrl && !imgError;

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const calculateFee = () => {
    if (entry.status === 'COMPLETED' && entry.fee !== undefined) {
      return entry.fee;
    }
    const checkIn = new Date(entry.checkInTime);
    const durationMs = now.getTime() - checkIn.getTime();
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
    const chargeableHours = Math.max(1, durationHours);
    const rate = rates[entry.vehicleType] || 0;
    return rate * chargeableHours;
  };

  const currentFee = calculateFee();

  // Check Overdue Status
  const isOverdue = entry.status === 'PARKED' && (now.getTime() - new Date(entry.checkInTime).getTime() > overdueThreshold * 60 * 60 * 1000);

  const openModal = () => {
    if (hasImage) {
      setZoom(1);
      setShowModal(true);
    }
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(prev => Math.max(prev - 0.5, 1));
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <>
      <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${isOverdue ? 'border-red-200 ring-1 ring-red-200' : 'border-slate-100'}`}>
        <div className={`p-4 border-b flex justify-between items-center ${isOverdue ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
          <h4 className="font-bold text-slate-700 flex items-center gap-2">
            <Info className={`w-4 h-4 ${isOverdue ? 'text-red-500' : 'text-blue-500'}`} />
            {entry.status === 'PARKED' ? 'Xe đang đỗ (Mới nhất)' : 'Thông tin xe'}
          </h4>
          <span className={`px-2 py-1 text-xs font-bold rounded flex items-center gap-1 ${
            entry.status === 'PARKED' 
              ? (isOverdue ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700')
              : 'bg-gray-100 text-gray-700'
          }`}>
            {isOverdue && <AlertTriangle className="w-3 h-3" />}
            {entry.status === 'PARKED' ? (isOverdue ? 'Quá giờ' : 'Đang đỗ') : 'Đã ra'}
          </span>
        </div>
        <div className="p-4">
          <div className="flex gap-4">
            {/* Thumbnail Image */}
            <div 
              className={`w-24 h-24 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100 relative group ${hasImage ? 'cursor-pointer' : ''}`}
              onClick={openModal}
            >
              {hasImage ? (
                <>
                  <img 
                    src={entry.imageUrl} 
                    alt="Vehicle" 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={() => setImgError(true)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <Maximize2 className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow-md transform scale-75 group-hover:scale-100 transition-all" />
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  <Car className="w-8 h-8" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Biển số xe</p>
                <p className="text-2xl font-mono font-bold text-slate-800">{entry.plateNumber}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                 <div>
                    <p className="text-xs text-slate-500">Loại xe</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Car className="w-3.5 h-3.5 text-blue-500" />
                      <p className="text-sm font-medium text-slate-700">{entry.vehicleType}</p>
                    </div>
                 </div>
                 <div>
                    <p className="text-xs text-slate-500">Giờ vào</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-orange-500" />
                      <p className="text-sm font-medium text-slate-700">
                        {entry.checkInTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                 </div>

                 {entry.color && (
                  <div>
                      <p className="text-xs text-slate-500">Màu sắc</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Palette className="w-3.5 h-3.5 text-purple-500" />
                        <p className="text-sm text-slate-700">{entry.color}</p>
                      </div>
                  </div>
                 )}

                 <div>
                    <p className="text-xs text-slate-500">
                      {entry.status === 'COMPLETED' ? 'Phí thực tế' : 'Phí tạm tính'}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <DollarSign className="w-3.5 h-3.5 text-green-500" />
                      <p className="text-sm font-bold text-green-600">
                        {currentFee.toLocaleString()} đ
                      </p>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {entry.status === 'PARKED' ? (
            <button 
              onClick={() => onCheckOut(entry)}
              className="w-full mt-4 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 border border-red-100"
            >
              <LogOut className="w-4 h-4" /> 
              Check-out
            </button>
          ) : (
            <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/50 -mx-4 -mb-4 p-4 rounded-b-lg">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1 bg-green-100 rounded-full">
                   <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-sm font-bold text-slate-700">Hoàn thành lượt đỗ</span>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Thời gian vào</span>
                  <span className="font-mono text-slate-700 font-medium">{formatDateTime(entry.checkInTime)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Thời gian ra</span>
                  <span className="font-mono text-slate-700 font-medium">{entry.checkOutTime ? formatDateTime(entry.checkOutTime) : 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-200 mt-2">
                  <span className="font-bold text-slate-700">Tổng chi phí</span>
                  <span className="font-bold text-xl text-green-600">{entry.fee?.toLocaleString()} đ</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showModal && hasImage && (
        <div 
          className="fixed inset-0 z-50 flex flex-col bg-black/95 animate-in fade-in duration-200"
          onClick={() => setShowModal(false)}
        >
          {/* Toolbar */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-gradient-to-b from-black/50 to-transparent" onClick={e => e.stopPropagation()}>
            <h3 className="text-white font-mono font-bold text-lg">{entry.plateNumber}</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-white/10 rounded-lg p-1 backdrop-blur-sm">
                <button onClick={handleZoomOut} className="p-2 text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-50" disabled={zoom <= 1}>
                  <ZoomOut className="w-5 h-5" />
                </button>
                <span className="text-white text-xs font-medium w-12 text-center select-none">
                  {Math.round(zoom * 100)}%
                </span>
                <button onClick={handleZoomIn} className="p-2 text-white hover:bg-white/10 rounded-md transition-colors disabled:opacity-50" disabled={zoom >= 3}>
                  <ZoomIn className="w-5 h-5" />
                </button>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Scrollable Content Area */}
          <div className="flex-1 w-full h-full overflow-auto flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
            <img 
              src={entry.imageUrl} 
              alt="Full size"
              onClick={(e) => e.stopPropagation()}
              className="transition-all duration-200 ease-out shadow-2xl"
              style={{
                maxWidth: zoom === 1 ? '100%' : 'none',
                maxHeight: zoom === 1 ? '90vh' : 'none',
                width: zoom === 1 ? 'auto' : `${zoom * 100}%`,
                height: 'auto',
                cursor: zoom > 1 ? 'grab' : 'zoom-in'
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
