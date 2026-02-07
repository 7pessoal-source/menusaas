
import React, { useMemo, useState } from 'react';
import { 
  ShoppingBag, 
  Info, 
  MapPin, 
  Phone, 
  Plus, 
  Minus, 
  ChevronRight, 
  Search, 
  ArrowLeft, 
  X as XIcon, 
  AlertCircle, 
  Clock, 
  Upload, 
  Star,
  CreditCard,
  QrCode,
  Banknote,
  Truck,
  Store as StoreIcon
} from 'lucide-react';
import { Restaurant, Category, Product, OrderItem } from '../types';

interface PublicMenuProps {
  restaurant: Restaurant;
  categories: Category[];
  products: Product[];
  onExit: () => void;
}

const PublicMenu: React.FC<PublicMenuProps> = ({ 
  restaurant, 
  categories, 
  products, 
  onExit
}) => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState<Map<string, number>>(new Map());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Checkout States
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cartão' | 'Pix' | 'Dinheiro' | ''>('');

  // Sincronização explícita com as propriedades do objeto restaurant
  const effectiveIsOpen = Boolean(restaurant.isOpen);
  const allowsDelivery = Boolean(restaurant.allows_delivery);

  const menuCategories = useMemo(() => [
    { id: 'all', name: 'Todos', restaurant_id: restaurant.id, order: -1 },
    ...categories
  ], [categories, restaurant.id]);

  const addToCart = (productId: string) => {
    if (!effectiveIsOpen) return;
    setCart((prev) => {
      const newCart = new Map<string, number>(prev);
      const currentQty = newCart.get(productId) || 0;
      newCart.set(productId, currentQty + 1);
      return newCart;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const newCart = new Map<string, number>(prev);
      const current = newCart.get(productId) || 0;
      if (current <= 1) newCart.delete(productId);
      else newCart.set(productId, current - 1);
      return newCart;
    });
  };

  const cartTotal: number = [...cart].reduce((sum, [id, qty]) => {
    const product = products.find(p => p.id === id);
    return sum + (Number(product?.price) || 0) * qty;
  }, 0);

  const cartItemsCount: number = [...cart.values()].reduce((sum, qty) => sum + qty, 0);

  // Validação de Pedido Mínimo e Campos Obrigatórios
  const isBelowMinOrder = cartTotal < (restaurant.min_order_value || 0);
  
  const isFormInvalid = () => {
    if (!customerName.trim()) return true;
    if (!paymentMethod) return true;
    // Se permitir entrega, o endereço passa a ser obrigatório
    if (allowsDelivery && !customerAddress.trim()) return true;
    return false;
  };

  const filteredProducts = products
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            p.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'all' || p.category_id === activeCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (a.is_promotion && !b.is_promotion) return -1;
      if (!a.is_promotion && b.is_promotion) return 1;
      return 0;
    });

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormInvalid() || isBelowMinOrder || !effectiveIsOpen) return;

    const items: OrderItem[] = Array.from(cart.entries()).map(([id, qty]) => {
      const p = products.find(prod => prod.id === id)!;
      return {
        productId: id,
        productName: p.name,
        quantity: qty,
        price: Number(p.price)
      };
    });

    const serviceType = allowsDelivery ? '✅ ENTREGA EM CASA' : '✅ RETIRADA NO LOCAL';
    const addressDetails = allowsDelivery ? `\n📍 *Endereço:* ${customerAddress}` : `\n📍 *Ponto de Retirada:* ${restaurant.address}`;

    const message = `*🍕 NOVO PEDIDO - ${restaurant.name}*\n\n` +
      `*Itens:*\n${items.map(i => `• ${i.quantity}x ${i.productName}`).join('\n')}\n\n` +
      `💰 *Total:* R$ ${cartTotal.toFixed(2)}\n\n` +
      `*👤 Dados do Cliente:*\n` +
      `• Nome: ${customerName}\n` +
      `• Pagamento: ${paymentMethod}\n` +
      `• Modo: ${serviceType}${addressDetails}`;

    window.open(`https://wa.me/${restaurant.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
    setCart(new Map());
    setIsCartOpen(false);
  };

  return (
    <div className={`min-h-screen bg-gray-50 pb-24 text-gray-900 ${!effectiveIsOpen ? 'grayscale-[0.5]' : ''}`}>
      {!effectiveIsOpen && (
        <div className="bg-red-600 text-white text-center py-3 px-4 sticky top-0 z-[60] font-black flex items-center justify-center">
           <AlertCircle size={18} className="mr-2" /> RESTAURANTE FECHADO AGORA
        </div>
      )}

      <header className="bg-black text-white relative">
        <div className="h-44 w-full opacity-40 overflow-hidden">
           <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000" className="w-full h-full object-cover" alt="Banner" />
        </div>
        <div className="absolute top-4 left-4 z-10">
           <button onClick={onExit} className="p-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20"><ArrowLeft size={20} /></button>
        </div>
        <div className="px-6 -mt-12 relative z-10 pb-8">
          <div className="bg-white p-2 rounded-3xl shadow-2xl inline-block mb-4">
             {restaurant.logo ? <img src={restaurant.logo} className="w-24 h-24 rounded-2xl object-cover" alt="Logo" /> : <div className="w-24 h-24 bg-gray-200 rounded-2xl flex items-center justify-center text-gray-400"><StoreIcon size={32} /></div>}
          </div>
          <h1 className="text-3xl font-black">{restaurant.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3">
             <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${effectiveIsOpen ? 'bg-green-500' : 'bg-red-500'}`}>
               {effectiveIsOpen ? 'Loja Aberta' : 'Loja Fechada'}
             </span>
             <span className="text-gray-300 text-sm flex items-center font-medium"><MapPin size={14} className="mr-1 text-amber-400" /> {restaurant.address}</span>
          </div>
          {restaurant.min_order_value > 0 && (
            <div className="mt-3 inline-flex items-center px-3 py-1 bg-amber-400/10 border border-amber-400/20 rounded-lg text-amber-400 text-[10px] font-black uppercase tracking-widest">
               <AlertCircle size={12} className="mr-1.5" /> Pedido mínimo: R$ {Number(restaurant.min_order_value).toFixed(2)}
            </div>
          )}
        </div>
      </header>

      <div className="sticky top-0 bg-gray-50/80 backdrop-blur-md z-20 pt-4 px-4 border-b border-gray-200">
        <div className="relative mb-4 max-w-2xl mx-auto">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           <input type="text" placeholder="Pesquisar no menu..." className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-400 transition-all shadow-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        {!searchTerm && (
          <div className="flex overflow-x-auto space-x-2 pb-4 scrollbar-hide max-w-4xl mx-auto">
            {menuCategories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`whitespace-nowrap px-8 py-2.5 rounded-2xl font-black text-xs uppercase transition-all ${activeCategory === cat.id ? 'bg-amber-400 text-black shadow-xl scale-105' : 'bg-white text-gray-400 border border-gray-100 hover:border-amber-200'}`}>{cat.name}</button>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {filteredProducts.map((product) => (
          <div key={product.id} className={`p-5 rounded-3xl shadow-sm border flex items-center space-x-5 transition-all ${product.is_promotion ? 'bg-amber-50 border-amber-200' : 'bg-white border-gray-100 hover:shadow-md'}`}>
             <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {product.is_promotion && <Star size={16} className="text-amber-500 fill-amber-500" />}
                  <h3 className="font-black text-xl text-gray-900">{product.name}</h3>
                </div>
                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product.description}</p>
                <div className="mt-5 flex items-center justify-between">
                   <span className="font-black text-lg text-amber-600">R$ {Number(product.price).toFixed(2)}</span>
                   <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-gray-100">
                      {cart.has(product.id) ? (
                        <>
                          <button onClick={() => removeFromCart(product.id)} className="p-2 bg-white rounded-xl text-amber-500 shadow-sm transition-all"><Minus size={16} /></button>
                          <span className="px-4 font-black text-sm">{cart.get(product.id)}</span>
                          <button onClick={() => addToCart(product.id)} className="p-2 bg-amber-400 rounded-xl text-black shadow-sm transition-all"><Plus size={16} /></button>
                        </>
                      ) : (
                        <button onClick={() => addToCart(product.id)} disabled={!effectiveIsOpen} className={`px-6 py-2 rounded-xl text-black font-black text-xs uppercase flex items-center shadow-md transition-all ${effectiveIsOpen ? 'bg-amber-400 hover:scale-105 active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}><Plus size={16} className="mr-1.5" /> Comprar</button>
                      )}
                   </div>
                </div>
             </div>
             <div className="w-28 h-28 rounded-3xl overflow-hidden bg-gray-100 flex-shrink-0">
                {product.image && <img src={product.image} className="w-full h-full object-cover" alt={product.name} />}
             </div>
          </div>
        ))}
      </div>

      {cartItemsCount > 0 && !isCartOpen && (
        <div className="fixed bottom-0 left-0 right-0 p-6 z-40 max-w-xl mx-auto">
          <button 
            onClick={() => setIsCartOpen(true)} 
            className={`w-full p-6 rounded-3xl flex items-center justify-between shadow-2xl transition-all ${isBelowMinOrder ? 'bg-gray-700 cursor-not-allowed' : 'bg-black text-white hover:scale-[1.02]'}`}
          >
            <div className="flex items-center space-x-4">
               <div className="bg-amber-400 text-black w-9 h-9 rounded-2xl flex items-center justify-center font-black">{cartItemsCount}</div>
               <span className="font-black text-sm uppercase tracking-widest">Meu Carrinho</span>
            </div>
            <div className="text-right">
               <span className="font-black text-xl text-amber-400 block leading-none">R$ {cartTotal.toFixed(2)}</span>
               {isBelowMinOrder && <span className="text-[10px] text-white/50 font-bold uppercase">Abaixo do mínimo</span>}
            </div>
          </button>
        </div>
      )}

      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-end justify-center">
          <div className="bg-white w-full max-w-2xl rounded-t-[40px] h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50">
               <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Finalizar Pedido</h2>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{restaurant.name}</p>
               </div>
               <button onClick={() => setIsCartOpen(false)} className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-400 hover:text-black transition-all"><XIcon size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
               <div className="space-y-3">
                  {Array.from(cart.entries()).map(([id, qty]) => {
                    const p = products.find(prod => prod.id === id)!;
                    return (
                      <div key={id} className="flex justify-between items-center bg-gray-50 p-4 rounded-3xl border border-gray-100">
                          <div className="flex-1">
                             <h4 className="font-black text-gray-800">{p.name}</h4>
                             <p className="text-xs font-bold text-amber-600">Un: R$ {Number(p.price).toFixed(2)}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center bg-white rounded-2xl p-1.5 border border-gray-200">
                                <button onClick={() => removeFromCart(id)} className="p-1.5 text-amber-500"><Minus size={14} /></button>
                                <span className="px-4 font-black text-sm">{qty}</span>
                                <button onClick={() => addToCart(id)} className="p-1.5 bg-amber-400 rounded-lg text-black"><Plus size={14} /></button>
                            </div>
                            <span className="font-black text-gray-900 min-w-[80px] text-right">R$ {(Number(p.price) * qty).toFixed(2)}</span>
                          </div>
                      </div>
                    );
                  })}
               </div>

               <div className="pt-4 space-y-5">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-1.5 bg-amber-400 rounded-full" />
                    <h3 className="font-black text-lg uppercase tracking-tight">Seus Dados</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <input type="text" placeholder="Digite seu nome completo *" className="w-full p-5 bg-gray-100 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-amber-400 transition-all shadow-sm" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                    
                    {allowsDelivery ? (
                      <div className="relative">
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500" size={18} />
                        <input type="text" placeholder="Endereço Completo com Bairro *" className="w-full p-5 pl-14 bg-gray-100 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-amber-400 transition-all shadow-sm" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
                      </div>
                    ) : (
                      <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex flex-col space-y-2 text-amber-900 shadow-inner">
                         <div className="flex items-center space-x-2 font-black uppercase text-xs">
                            <StoreIcon size={16} /> <span>Este restaurante não faz entregas</span>
                         </div>
                         <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Retirar pedido em:</p>
                         <p className="font-black text-sm leading-tight">{restaurant.address}</p>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 space-y-4">
                    <div className="flex items-center space-x-2">
                      <div className="h-6 w-1.5 bg-amber-400 rounded-full" />
                      <h3 className="font-black text-lg uppercase tracking-tight">Forma de Pagamento</h3>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                       {[
                         { id: 'Cartão', icon: CreditCard },
                         { id: 'Pix', icon: QrCode },
                         { id: 'Dinheiro', icon: Banknote }
                       ].map(method => (
                         <button 
                           key={method.id}
                           onClick={() => setPaymentMethod(method.id as any)}
                           className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all space-y-2 ${paymentMethod === method.id ? 'bg-amber-400 border-amber-400 text-black shadow-lg shadow-amber-400/20 scale-105' : 'bg-white border-gray-100 text-gray-400 hover:border-amber-200'}`}
                         >
                           <method.icon size={24} />
                           <span className="text-[10px] font-black uppercase tracking-widest">{method.id}</span>
                         </button>
                       ))}
                    </div>
                  </div>
               </div>

               {isBelowMinOrder && (
                 <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600 animate-in fade-in zoom-in">
                    <AlertCircle size={20} className="shrink-0" />
                    <span className="text-sm font-bold uppercase tracking-tight">Pedido mínimo: R$ {Number(restaurant.min_order_value).toFixed(2)}.</span>
                 </div>
               )}
            </div>

            <div className="p-8 bg-black">
               <div className="flex justify-between items-center text-white mb-6">
                  <span className="font-bold text-gray-500 uppercase text-[10px] tracking-widest">Total do Pedido</span>
                  <span className="text-3xl font-black text-amber-400">R$ {cartTotal.toFixed(2)}</span>
               </div>
               <button 
                 onClick={handleSubmitOrder} 
                 disabled={isFormInvalid() || isBelowMinOrder}
                 className={`w-full p-6 rounded-3xl font-black text-lg uppercase tracking-widest shadow-xl transition-all flex items-center justify-center space-x-3 ${
                   isFormInvalid() || isBelowMinOrder 
                   ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50' 
                   : 'bg-amber-400 text-black hover:scale-[1.02] active:scale-95'
                 }`}
               >
                 <span>{isBelowMinOrder ? 'Mínimo não atingido' : (isFormInvalid() ? 'Preencha os dados' : 'Enviar para o WhatsApp')}</span>
                 {!isFormInvalid() && !isBelowMinOrder && <ChevronRight size={20} />}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicMenu;
