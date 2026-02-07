
import React, { useState } from 'react';
import { 
  UtensilsCrossed, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Package,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react';
import { Restaurant } from '../types';

interface AdminLayoutProps {
  restaurant: Restaurant;
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  restaurant, 
  children, 
  activeTab, 
  onTabChange, 
  onLogout 
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [copied, setCopied] = useState(false);

  const menuItems = [
    { id: 'menu', label: 'Cardápio', icon: UtensilsCrossed },
    { id: 'inventory', label: 'Categorias', icon: Package },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ];

  const handleCopyLink = () => {
    // Simula o link real do cardápio. Em produção seria algo como https://sua-url.com/cardapio/slug
    const url = `${window.location.origin}?menu=${restaurant.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-black text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
             <span className="text-black font-bold">M</span>
          </div>
          <span className="font-bold text-lg truncate max-w-[150px]">{restaurant.name}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleCopyLink}
            className="p-2 bg-gray-800 rounded-lg text-amber-400"
            title="Copiar Link"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
          </button>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed inset-0 z-40 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
        bg-black text-white w-64 flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:block'}
      `}>
        <div className="p-6 border-b border-gray-800 hidden md:block">
           <div className="flex items-center space-x-3 mb-1">
              <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center">
                <span className="text-black font-black text-xl">M</span>
              </div>
              <h1 className="text-xl font-bold">MenuSaaS</h1>
           </div>
           <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold mt-4">Painel do Restaurante</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto mt-10 md:mt-0">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`
                w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                ${activeTab === item.id 
                  ? 'bg-amber-400 text-black font-bold shadow-lg shadow-amber-400/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'}
              `}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
           <div className="bg-gray-900 rounded-2xl p-4 mb-4">
              <div className="flex items-center space-x-3 mb-3">
                <img src={restaurant.logo || 'https://via.placeholder.com/40'} alt="Logo" className="w-10 h-10 rounded-full object-cover border border-gray-700" />
                <div className="overflow-hidden">
                  <p className="text-sm font-bold truncate">{restaurant.name}</p>
                  <p className="text-[10px] text-gray-500 truncate uppercase font-bold tracking-tighter">@{restaurant.slug}</p>
                </div>
              </div>
              
              <button 
                onClick={handleCopyLink}
                className={`w-full py-2.5 rounded-xl flex items-center justify-center space-x-2 text-xs font-black uppercase transition-all ${copied ? 'bg-green-500 text-white' : 'bg-amber-400 text-black shadow-lg shadow-amber-400/10'}`}
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    <span>Link Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copiar Link</span>
                  </>
                )}
              </button>
           </div>

          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-sm font-bold"
          >
            <LogOut size={18} />
            <span>Sair do Painel</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
