
import React, { useState, useEffect, useRef } from 'react';
import AdminLayout from './components/AdminLayout';
import PublicMenu from './components/PublicMenu';
import Auth from './components/Auth';
import { supabase } from './services/supabase';
import { 
  Restaurant, 
  Category, 
  Product
} from './types';
import { 
  PlusCircle,
  Sparkles,
  ExternalLink,
  Trash2,
  Edit2,
  Settings,
  X,
  Save,
  Store,
  Camera,
  MapPin,
  ChevronRight,
  Package,
  Upload,
  Image as ImageIcon,
  Star,
  Loader2,
  AlertTriangle,
  Truck,
  DollarSign,
  Copy,
  Check,
  User
} from 'lucide-react';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<'landing' | 'auth' | 'admin' | 'menu'>('landing');
  const [activeAdminTab, setActiveAdminTab] = useState('menu');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [session, setSession] = useState<any>(null);
  
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [currentRestaurant, setCurrentRestaurant] = useState<Restaurant | null>(null);
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productFormData, setProductFormData] = useState<Partial<Product>>({});
  const [settingsForm, setSettingsForm] = useState<Partial<Restaurant>>({});

  const logoInputRef = useRef<HTMLInputElement>(null);
  const productImageRef = useRef<HTMLInputElement>(null);

  // Monitorar Autenticação
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) setView('admin');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setView('admin');
      else setView('landing');
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (session && restaurants.length > 0) {
      // Tentar encontrar o restaurante do usuário logado
      const userRest = restaurants.find(r => (r as any).user_id === session.user.id);
      if (userRest) {
        setCurrentRestaurant(userRest);
      } else if (view === 'admin') {
        // Se estiver no admin mas não tiver restaurante, usar o primeiro (para demo) ou criar um
        setCurrentRestaurant(restaurants[0]);
      }
    }
  }, [session, restaurants, view]);

  useEffect(() => {
    if (currentRestaurant) {
      fetchRestaurantData(currentRestaurant.id);
      setSettingsForm({
        ...currentRestaurant,
        allows_delivery: currentRestaurant.allows_delivery ?? true,
        min_order_value: currentRestaurant.min_order_value ?? 0,
        isOpen: currentRestaurant.isOpen ?? true
      });
    }
  }, [currentRestaurant]);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const { data, error: sbError } = await supabase.from('restaurants').select('*').order('name');
      if (sbError) throw sbError;
      if (data) setRestaurants(data);
    } catch (e: any) {
      console.error(e);
      setError('Falha ao carregar dados do banco.');
    } finally {
      setLoading(false);
    }
  };

  const fetchRestaurantData = async (restaurantId: string) => {
    try {
      const [cats, prods] = await Promise.all([
        supabase.from('categories').select('*').eq('restaurant_id', restaurantId).order('order'),
        supabase.from('products').select('*').eq('restaurant_id', restaurantId).order('created_at', { ascending: false })
      ]);
      if (cats.error) throw cats.error;
      if (prods.error) throw prods.error;
      setCategories(cats.data || []);
      setProducts(prods.data || []);
    } catch (e: any) {
      console.error('Fetch Data Error:', e);
    }
  };

  const handleUpdateRestaurant = async () => {
    if (!currentRestaurant) return;
    setLoading(true);
    try {
      const { created_at, id, slug, ...payload } = settingsForm as any;
      const { data, error } = await supabase
        .from('restaurants')
        .update(payload)
        .eq('id', currentRestaurant.id)
        .select()
        .single();
      if (error) throw error;
      setCurrentRestaurant(data);
      alert('Alterações salvas com sucesso!');
    } catch (e: any) {
      alert('Erro ao salvar: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentRestaurant(null);
    setView('landing');
  };

  const handleCopyLink = () => {
    if (!currentRestaurant) return;
    const url = `${window.location.origin}?menu=${currentRestaurant.slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'product') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === 'logo') setSettingsForm({ ...settingsForm, logo: base64 });
        else setProductFormData({ ...productFormData, image: base64 });
      };
      reader.readAsDataURL(file);
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productFormData.name || !currentRestaurant) return;
    setLoading(true);
    try {
      if (productFormData.id) {
        const { error } = await supabase.from('products').update(productFormData).eq('id', productFormData.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([{ ...productFormData, restaurant_id: currentRestaurant.id }]);
        if (error) throw error;
      }
      await fetchRestaurantData(currentRestaurant.id);
      setIsProductModalOpen(false);
    } catch (e: any) {
      alert('Erro ao salvar: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  if (view === 'auth') {
    return <Auth onAuthSuccess={() => setView('admin')} onBack={() => setView('landing')} />;
  }

  if (view === 'landing') {
    return (
      <div className="min-h-screen bg-black text-white selection:bg-amber-400 selection:text-black">
        <header className="p-6 flex justify-between items-center max-w-7xl mx-auto">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center">
                <span className="text-black font-black text-xl">M</span>
             </div>
             <span className="text-2xl font-black tracking-tighter">MenuSaaS</span>
          </div>
          <button 
            onClick={() => session ? setView('admin') : setView('auth')}
            className="px-6 py-2 bg-white text-black font-bold rounded-xl hover:bg-amber-400 transition-colors flex items-center space-x-2"
          >
            <User size={18} />
            <span>{session ? 'Meu Painel' : 'Acesso Admin'}</span>
          </button>
        </header>

        <main className="max-w-5xl mx-auto px-6 py-20 text-center">
          {error && (
            <div className="mb-8 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-center justify-center text-red-200">
               <AlertTriangle className="mr-2" /> {error}
            </div>
          )}
          
          <div className="inline-block px-4 py-1.5 bg-gray-900 border border-gray-800 rounded-full text-amber-400 text-sm font-bold mb-8 uppercase tracking-widest">
            Cardápio Digital Inteligente
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8">
            Seu delivery <span className="text-amber-400">profissional.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-16">
            Aumente suas vendas com um cardápio conectado ao WhatsApp e gestão simplificada.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {loading ? <div className="col-span-2 py-12"><Loader2 className="animate-spin text-amber-400 mx-auto" size={48} /></div> : 
             restaurants.map(rest => (
              <div key={rest.id} className="group bg-gray-900 border border-gray-800 p-8 rounded-[40px] text-left hover:border-amber-400/50 transition-all cursor-pointer" onClick={() => { setCurrentRestaurant(rest); setView('menu'); }}>
                 <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center overflow-hidden">
                       {rest.logo ? <img src={rest.logo} className="w-full h-full object-cover" alt={rest.name} /> : <Store className="text-black" />}
                    </div>
                    <div className="p-3 bg-white/5 rounded-full group-hover:bg-amber-400 group-hover:text-black transition-all">
                      <ExternalLink size={20} />
                    </div>
                 </div>
                 <h3 className="text-2xl font-bold mb-2">{rest.name}</h3>
                 <p className="text-gray-500 mb-6 text-sm line-clamp-1">{rest.address || 'Sem endereço configurado'}</p>
                 <div className="flex items-center text-amber-400 font-bold uppercase text-xs tracking-widest">
                    <span>Ver Cardápio</span>
                    <ChevronRight size={14} className="ml-1" />
                 </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (view === 'menu' && currentRestaurant) {
    return (
      <PublicMenu 
        restaurant={currentRestaurant}
        categories={categories}
        products={products}
        onExit={() => setView('landing')}
      />
    );
  }

  if (view === 'admin' && session && currentRestaurant) {
    return (
      <AdminLayout 
        restaurant={currentRestaurant} 
        activeTab={activeAdminTab} 
        onTabChange={setActiveAdminTab}
        onLogout={handleLogout}
      >
        {activeAdminTab === 'menu' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black">Produtos</h2>
                <button 
                  onClick={() => {
                    setProductFormData({
                      name: '', description: '', price: 0, 
                      is_available: true, is_promotion: false,
                      category_id: categories[0]?.id || ''
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="bg-black text-white px-6 py-3 rounded-2xl font-bold flex items-center hover:bg-gray-800 transition-all shadow-lg"
                >
                   <PlusCircle size={18} className="mr-2" /> Novo Prato
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length === 0 ? (
                  <div className="col-span-full py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-bold">
                    Nenhum produto cadastrado.
                  </div>
                ) : products.map(p => (
                  <div key={p.id} className="bg-white rounded-3xl border border-gray-100 overflow-hidden group shadow-sm hover:shadow-xl transition-all relative">
                     {p.is_promotion && (
                        <div className="absolute top-4 left-4 z-10 bg-amber-400 text-black px-3 py-1 rounded-full text-xs font-black shadow-md">
                           <Star size={12} className="mr-1 fill-current" /> PROMO
                        </div>
                     )}
                     <div className="h-48 overflow-hidden relative bg-gray-50">
                        {p.image ? <img src={p.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.name} /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><ImageIcon size={48} /></div>}
                        <div className="absolute top-4 right-4 flex space-x-2">
                           <button onClick={() => { setProductFormData(p); setIsProductModalOpen(true); }} className="p-2 bg-white rounded-xl shadow-md text-gray-700 hover:text-black"><Edit2 size={16} /></button>
                           <button onClick={async () => {
                              if(confirm('Excluir produto?')) {
                                await supabase.from('products').delete().eq('id', p.id);
                                fetchRestaurantData(currentRestaurant.id);
                              }
                           }} className="p-2 bg-white rounded-xl shadow-md text-red-500 hover:bg-red-50"><Trash2 size={16} /></button>
                        </div>
                     </div>
                     <div className="p-6">
                        <div className="flex justify-between items-start mb-2">
                           <h4 className="font-bold text-lg">{p.name}</h4>
                           <span className="font-black text-amber-600">R$ {Number(p.price).toFixed(2)}</span>
                        </div>
                        <p className="text-gray-500 text-sm line-clamp-2">{p.description}</p>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeAdminTab === 'inventory' && (
          <div className="space-y-6 animate-in fade-in duration-500">
             <h2 className="text-3xl font-black">Categorias</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map(cat => (
                  <div key={cat.id} className="bg-white p-6 rounded-3xl border border-gray-100 flex justify-between items-center shadow-sm">
                    <span className="font-bold text-lg">{cat.name}</span>
                    <button className="p-2 text-red-400 hover:text-red-600 transition-colors" onClick={async () => {
                      if(confirm('Excluir categoria?')) {
                        await supabase.from('categories').delete().eq('id', cat.id);
                        fetchRestaurantData(currentRestaurant.id);
                      }
                    }}><Trash2 size={18}/></button>
                  </div>
                ))}
                <button onClick={async () => {
                  const name = prompt('Nome da categoria:');
                  if (name) {
                    await supabase.from('categories').insert([{ restaurant_id: currentRestaurant.id, name }]);
                    fetchRestaurantData(currentRestaurant.id);
                  }
                }} className="border-2 border-dashed border-gray-200 p-6 rounded-3xl flex items-center justify-center text-gray-400 hover:border-amber-400 hover:text-amber-400 transition-all font-bold">
                   <PlusCircle className="mr-2" size={20} /> Nova Categoria
                </button>
             </div>
          </div>
        )}

        {activeAdminTab === 'settings' && (
          <div className="space-y-8 max-w-4xl animate-in slide-in-from-bottom-4 duration-500 pb-20">
             <div className="flex justify-between items-end">
               <h2 className="text-3xl font-black">Configurações</h2>
               <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Divulgação</p>
                  <button 
                    onClick={handleCopyLink}
                    className={`px-6 py-2 rounded-xl flex items-center space-x-2 text-sm font-bold transition-all ${copiedLink ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-800 hover:border-amber-400'}`}
                  >
                    {copiedLink ? <Check size={16} /> : <Copy size={16} />}
                    <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link da Loja'}</span>
                  </button>
               </div>
             </div>

             <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex items-center justify-between">
                    <div>
                      <h4 className="font-black text-gray-900 text-xs uppercase tracking-tight">Disponibilidade</h4>
                      <p className="text-[10px] text-gray-500 uppercase font-bold">{settingsForm.isOpen ? 'Loja Aberta' : 'Loja Fechada'}</p>
                    </div>
                    <button 
                      onClick={() => setSettingsForm({ ...settingsForm, isOpen: !settingsForm.isOpen })}
                      className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] transition-all shadow-xl ${
                        settingsForm.isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                      }`}
                    >
                      {settingsForm.isOpen ? 'Ativo' : 'Pausado'}
                    </button>
                  </div>

                  <div className="p-6 bg-gray-50 rounded-[32px] border border-gray-100 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       <Truck className="text-amber-500" size={20} />
                       <div>
                         <h4 className="font-black text-gray-900 text-xs uppercase tracking-tight">Delivery</h4>
                         <p className="text-[10px] text-gray-500 uppercase font-bold">{settingsForm.allows_delivery ? 'Ativado' : 'Apenas Retirada'}</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => setSettingsForm({ ...settingsForm, allows_delivery: !settingsForm.allows_delivery })}
                      className={`px-6 py-3 rounded-2xl font-black uppercase text-[10px] transition-all shadow-xl ${
                        settingsForm.allows_delivery ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {settingsForm.allows_delivery ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <label className="block">
                      <span className="text-xs font-bold text-gray-400 uppercase ml-1">Nome Fantasia</span>
                      <input type="text" className="mt-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none" value={settingsForm.name || ''} onChange={(e) => setSettingsForm({ ...settingsForm, name: e.target.value })} />
                   </label>
                   <label className="block">
                      <span className="text-xs font-bold text-gray-400 uppercase ml-1">WhatsApp</span>
                      <input type="text" placeholder="5511999999999" className="mt-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none" value={settingsForm.whatsapp || ''} onChange={(e) => setSettingsForm({ ...settingsForm, whatsapp: e.target.value })} />
                   </label>
                   <label className="block md:col-span-2">
                      <span className="text-xs font-bold text-gray-400 uppercase ml-1">Endereço</span>
                      <input type="text" className="mt-1 w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none" value={settingsForm.address || ''} onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })} />
                   </label>
                   <label className="block">
                      <span className="text-xs font-bold text-gray-400 uppercase ml-1">Mínimo (R$)</span>
                      <div className="relative mt-1">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="number" step="0.01" className="w-full p-4 pl-12 bg-gray-50 border border-gray-100 rounded-2xl font-bold outline-none" value={settingsForm.min_order_value || 0} onChange={(e) => setSettingsForm({ ...settingsForm, min_order_value: parseFloat(e.target.value) })} />
                      </div>
                   </label>
                   <div className="block">
                      <span className="text-xs font-bold text-gray-400 uppercase ml-1">Logo</span>
                      <div className="mt-1 flex items-center space-x-4">
                         <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 flex items-center justify-center">
                            {settingsForm.logo ? <img src={settingsForm.logo} className="w-full h-full object-cover" alt="Logo" /> : <ImageIcon className="text-gray-300" />}
                         </div>
                         <button onClick={() => logoInputRef.current?.click()} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all text-sm uppercase tracking-tighter">
                            Atualizar
                         </button>
                         <input type="file" ref={logoInputRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'logo')} />
                      </div>
                   </div>
                </div>
                <button onClick={handleUpdateRestaurant} disabled={loading} className="w-full bg-black text-white p-6 rounded-3xl font-black text-xl flex items-center justify-center space-x-2 active:scale-95 shadow-xl disabled:opacity-50 transition-all">
                   {loading ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                   <span>Salvar Alterações</span>
                </button>
             </div>
          </div>
        )}

        {isProductModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <form onSubmit={saveProduct} className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
               <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                  <h3 className="text-xl font-bold uppercase tracking-tight">{productFormData.id ? 'Editar Produto' : 'Novo Produto'}</h3>
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors"><X size={20} /></button>
               </div>
               
               <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div className="relative h-48 rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 group cursor-pointer" onClick={() => productImageRef.current?.click()}>
                     {productFormData.image ? <img src={productFormData.image} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Preview" /> : <div className="text-center"><Upload className="mx-auto text-gray-400" size={32} /><p className="text-xs text-gray-400 font-bold mt-2 uppercase">Subir Foto</p></div>}
                     <input type="file" ref={productImageRef} hidden accept="image/*" onChange={(e) => handleFileUpload(e, 'product')} />
                  </div>
                  
                  <div className="flex justify-between items-center bg-amber-50 p-4 rounded-2xl border border-amber-200">
                    <div className="flex-1 mr-4">
                      <h4 className="font-bold text-amber-900 text-sm">IA Assistente</h4>
                      <p className="text-[10px] text-amber-700">Gera descrição com Inteligência Artificial.</p>
                    </div>
                    <button type="button" onClick={async () => {
                      if (!productFormData.name) return alert('Dê um nome ao produto!');
                      const desc = await geminiService.generateDescription(productFormData.name, 'Culinária');
                      setProductFormData({ ...productFormData, description: desc });
                    }} className="p-3 bg-amber-400 rounded-xl shadow-md hover:scale-110 active:scale-95 transition-all text-black"><Sparkles size={20} /></button>
                  </div>

                  <label className="block">
                     <span className="text-xs font-bold text-gray-500 uppercase ml-1">Nome</span>
                     <input type="text" required className="mt-1 w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none" value={productFormData.name || ''} onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })} />
                  </label>

                  <label className="block">
                     <span className="text-xs font-bold text-gray-500 uppercase ml-1">Descrição</span>
                     <textarea className="mt-1 w-full p-4 bg-gray-50 border-none rounded-2xl h-24 resize-none font-medium outline-none" value={productFormData.description || ''} onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })} />
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                     <label className="block">
                        <span className="text-xs font-bold text-gray-500 uppercase ml-1">Preço (R$)</span>
                        <input type="number" step="0.01" required className="mt-1 w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none" value={productFormData.price || 0} onChange={(e) => setProductFormData({ ...productFormData, price: parseFloat(e.target.value) })} />
                     </label>
                     <label className="block">
                        <span className="text-xs font-bold text-gray-500 uppercase ml-1">Categoria</span>
                        <select required className="mt-1 w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none" value={productFormData.category_id || ''} onChange={(e) => setProductFormData({ ...productFormData, category_id: e.target.value })}>
                           <option value="" disabled>Selecione...</option>
                           {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                     </label>
                  </div>
               </div>

               <div className="p-6 bg-gray-50 border-t flex space-x-3">
                  <button type="button" onClick={() => setIsProductModalOpen(false)} className="flex-1 p-4 rounded-2xl font-bold text-gray-600 hover:bg-gray-200 transition-colors">Sair</button>
                  <button type="submit" disabled={loading} className="flex-1 p-4 bg-black text-white rounded-2xl font-black shadow-lg disabled:opacity-50 transition-all">
                    {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Confirmar'}
                  </button>
               </div>
            </form>
          </div>
        )}
      </AdminLayout>
    );
  }

  return null;
};

export default App;
