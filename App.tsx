import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Car, History, Menu, X, LogOut, Info } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { CameraCapture } from './components/CameraCapture';
import { EntryForm } from './components/EntryForm';
import { HistoryTable } from './components/HistoryTable';
import { CheckoutModal } from './components/CheckoutModal';
import { Settings } from './components/Settings';
import { analyzeLicensePlate } from './services/geminiService';
import { ParkingEntry, LicensePlateAnalysis, VehicleType, ParkingRates, Employee, Shift } from './types';
import { NAV_ITEMS, PARKING_RATES } from './constants';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Data State
  const [entries, setEntries] = useState<ParkingEntry[]>([]);
  const [rates, setRates] = useState<ParkingRates>(PARKING_RATES);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  
  // Settings State
  const [overdueThreshold, setOverdueThreshold] = useState<number>(12); // Default 12 hours
  const [maxCapacity, setMaxCapacity] = useState<number>(100); // Default 100 spots

  // Interaction State
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<LicensePlateAnalysis | null>(null);
  const [viewMode, setViewMode] = useState<'CAPTURE' | 'CONFIRM' | 'LIST'>('CAPTURE');
  
  // Checkout State
  const [checkoutEntry, setCheckoutEntry] = useState<ParkingEntry | null>(null);

  // Load data from local storage on mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('parking_entries');
    if (savedEntries) {
      const parsed = JSON.parse(savedEntries).map((e: any) => ({
        ...e,
        checkInTime: new Date(e.checkInTime),
        checkOutTime: e.checkOutTime ? new Date(e.checkOutTime) : undefined
      }));
      setEntries(parsed);
    }

    const savedRates = localStorage.getItem('parking_rates');
    if (savedRates) setRates(JSON.parse(savedRates));

    const savedEmployees = localStorage.getItem('parking_employees');
    if (savedEmployees) setEmployees(JSON.parse(savedEmployees));

    const savedShifts = localStorage.getItem('parking_shifts');
    if (savedShifts) setShifts(JSON.parse(savedShifts));

    const savedThreshold = localStorage.getItem('parking_threshold');
    if (savedThreshold) setOverdueThreshold(parseInt(savedThreshold));

    const savedCapacity = localStorage.getItem('parking_capacity');
    if (savedCapacity) setMaxCapacity(parseInt(savedCapacity));
  }, []);

  // Save data effects
  useEffect(() => {
    localStorage.setItem('parking_entries', JSON.stringify(entries));
  }, [entries]);

  useEffect(() => {
    localStorage.setItem('parking_rates', JSON.stringify(rates));
  }, [rates]);

  useEffect(() => {
    localStorage.setItem('parking_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('parking_shifts', JSON.stringify(shifts));
  }, [shifts]);

  useEffect(() => {
    localStorage.setItem('parking_threshold', overdueThreshold.toString());
  }, [overdueThreshold]);

  useEffect(() => {
    localStorage.setItem('parking_capacity', maxCapacity.toString());
  }, [maxCapacity]);

  const resetEntryFlow = () => {
    setCapturedImage(null);
    setAnalysisResult(null);
    setViewMode('CAPTURE');
    setIsProcessing(false);
  };

  // Automatically reset entry flow when navigating away from the entry tab
  useEffect(() => {
    if (activeTab !== 'entry') {
      resetEntryFlow();
    }
  }, [activeTab]);

  const handleCapture = async (imageData: string) => {
    setCapturedImage(imageData);
    setIsProcessing(true);
    
    try {
      const result = await analyzeLicensePlate(imageData);
      setCapturedImage(current => {
        if (current) {
          setAnalysisResult(result);
          setViewMode('CONFIRM');
          return current;
        }
        return null;
      });
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Nhận diện thất bại. Vui lòng thử lại hoặc nhập tay.");
      
      setCapturedImage(current => {
        if (current) {
          setAnalysisResult({
            plateNumber: '',
            vehicleType: VehicleType.CAR,
            color: '',
            confidence: 0
          });
          setViewMode('CONFIRM');
          return current;
        }
        return null;
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmEntry = (data: LicensePlateAnalysis) => {
    const newEntry: ParkingEntry = {
      id: Date.now().toString(),
      plateNumber: data.plateNumber,
      vehicleType: data.vehicleType,
      color: data.color,
      checkInTime: new Date(),
      status: 'PARKED',
      imageUrl: capturedImage || undefined
    };

    setEntries(prev => [newEntry, ...prev]);
    setActiveTab('dashboard'); 
  };

  const handleCheckOut = (entry: ParkingEntry) => {
    setCheckoutEntry(entry);
  };

  const processCheckout = () => {
    if (!checkoutEntry) return;

    const checkOutTime = new Date();
    const durationMs = checkOutTime.getTime() - checkoutEntry.checkInTime.getTime();
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
    const chargeableHours = Math.max(1, durationHours);
    
    // Use dynamic rates
    const rate = rates[checkoutEntry.vehicleType];
    const fee = rate * chargeableHours;

    const updatedEntries = entries.map(e => {
      if (e.id === checkoutEntry.id) {
        return {
          ...e,
          checkOutTime, 
          status: 'COMPLETED',
          fee
        } as ParkingEntry;
      }
      return e;
    });

    setEntries(updatedEntries);
    setCheckoutEntry(null); 
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            entries={entries} 
            onCheckOut={handleCheckOut} 
            rates={rates} 
            overdueThreshold={overdueThreshold}
            maxCapacity={maxCapacity}
          />
        );
      case 'entry':
        return (
          <div className="max-w-4xl mx-auto">
            {viewMode === 'CAPTURE' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800">Nhận diện xe vào</h2>
                <CameraCapture onCapture={handleCapture} isProcessing={isProcessing} />
                <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-800">
                    Hướng camera vào biển số xe. Đảm bảo đủ ánh sáng. Hệ thống sẽ tự động nhận diện biển số, loại xe và màu sắc.
                  </p>
                </div>
              </div>
            )}
            {viewMode === 'CONFIRM' && capturedImage && (
              <EntryForm 
                analysis={analysisResult} 
                capturedImage={capturedImage}
                onConfirm={handleConfirmEntry}
                onCancel={resetEntryFlow}
              />
            )}
          </div>
        );
      case 'history':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Lịch sử & Quản lý xe ra</h2>
            <HistoryTable 
              entries={entries} 
              onCheckOut={handleCheckOut} 
              overdueThreshold={overdueThreshold}
            />
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Cài đặt & Quản trị</h2>
            <Settings 
              rates={rates} 
              onUpdateRates={setRates}
              employees={employees}
              onUpdateEmployees={setEmployees}
              shifts={shifts}
              onUpdateShifts={setShifts}
              overdueThreshold={overdueThreshold}
              onUpdateThreshold={setOverdueThreshold}
              maxCapacity={maxCapacity}
              onUpdateMaxCapacity={setMaxCapacity}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:block
      `}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800">
          <Car className="w-8 h-8 text-blue-500 mr-3" />
          <h1 className="font-bold text-xl tracking-tight">SmartPark</h1>
        </div>
        
        <nav className="p-4 space-y-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-3 text-slate-400">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-xs">Hệ thống hoạt động</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header Mobile */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:hidden z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="p-2 text-slate-600">
              <Menu className="w-6 h-6" />
            </button>
            <span className="font-bold text-slate-800">SmartPark</span>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto p-4 md:p-8">
          {renderContent()}
        </div>
      </main>

      {/* Global Checkout Modal */}
      {checkoutEntry && (
        <CheckoutModal 
          entry={checkoutEntry} 
          onConfirm={processCheckout} 
          onClose={() => setCheckoutEntry(null)}
          rates={rates}
        />
      )}
    </div>
  );
}

export default App;