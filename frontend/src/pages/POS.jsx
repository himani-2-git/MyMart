import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import { useAuth } from '../context/auth-context';
import { useSettings } from '../context/settings-context';
import { useToast } from '../components/toast-context';
import { Search, ShoppingCart, Trash2, CheckCircle, Receipt, CreditCard, Banknote, Smartphone, User, Phone, Printer } from 'lucide-react';

const S = { card: '#1e1e1e', surface: '#060c06', border: '#3e3f3e', muted: '#6b7280' };

const PAYMENT_METHODS = [
    { value: 'Cash', label: 'Cash', icon: <Banknote size={16} /> },
    { value: 'Card', label: 'Card', icon: <CreditCard size={16} /> },
    { value: 'UPI', label: 'UPI', icon: <Smartphone size={16} /> },
];

const POS = () => {
    const { user } = useAuth();
    const store = user?.storeDetails || {};
    const { currency } = useSettings();
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [checkoutStatus, setCheckoutStatus] = useState(null);
    const [lastSale, setLastSale] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [checkingOut, setCheckingOut] = useState(false);
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerName, setCustomerName] = useState('');
    const [customerStatus, setCustomerStatus] = useState(''); // 'new', 'returning', 'loading', ''
    const toast = useToast();

    const fetchProducts = useCallback(async () => {
        try {
            const { data } = await API.get('/api/products');
            setProducts(data); setLoading(false);
        } catch {
            toast.error('Failed to load products');
            setLoading(false);
        }
    }, [toast]);
    useEffect(() => { fetchProducts(); }, [fetchProducts]);

    const addToCart = (product) => {
        if (product.quantity <= 0) { toast.error('Out of stock!'); return; }
        const existing = cart.find(i => i.product === product._id);
        if (existing) {
            if (existing.qty >= product.quantity) { toast.error(`Only ${product.quantity} available.`); return; }
            setCart(cart.map(i => i.product === product._id ? { ...i, qty: i.qty + 1 } : i));
        } else {
            setCart([...cart, { product: product._id, name: product.name, price: product.sellingPrice, qty: 1, maxQty: product.quantity }]);
        }
    };
    const removeFromCart = (id) => setCart(cart.filter(i => i.product !== id));
    const updateQty = (id, delta) => setCart(cart.map(i => {
        if (i.product === id) { const n = i.qty + delta; return (n > 0 && n <= i.maxQty) ? { ...i, qty: n } : i; }
        return i;
    }));
    const total = () => cart.reduce((s, i) => s + i.price * i.qty, 0).toFixed(2);

    const handlePhoneBlur = async () => {
        if (!customerPhone || customerPhone.length < 5) {
            setCustomerStatus('');
            if(!customerName) setCustomerName('');
            return;
        }
        setCustomerStatus('loading');
        try {
            const { data } = await API.get(`/api/sales/customer/${customerPhone}`);
            if (data.found) {
                setCustomerName(data.customerName);
                setCustomerStatus('returning');
                toast.success(`Welcome back, ${data.customerName}!`);
            } else {
                setCustomerStatus('new');
            }
        } catch {
            setCustomerStatus('');
        }
    };

    const handleCheckout = async () => {
        if (!cart.length) return;
        setCheckingOut(true);
        try {
            const { data } = await API.post('/api/sales', { 
                orderItems: cart, 
                paymentMethod,
                customerName: customerName || undefined,
                customerPhone: customerPhone || undefined
            });
            setLastSale({ ...data, orderItems: cart, paymentMethod, customerName, customerPhone });
            setCheckoutStatus('success'); setCart([]); fetchProducts();
            setCustomerName(''); setCustomerPhone(''); setCustomerStatus('');
            toast.success('Transaction completed successfully!');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Checkout failed!');
        } finally {
            setCheckingOut(false);
        }
    };

    const categories = ['All', ...new Set(products.map(p => p.category))];
    const filteredProducts = products
        .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
        .filter(p => categoryFilter === 'All' || p.category === categoryFilter);

    const ReceiptModal = () => (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
            <div className="print-area w-full max-w-sm rounded-2xl p-7 shadow-2xl font-mono text-sm bg-[#060c06] border border-[#3e3f3e]">
                <div className="text-center pb-4 mb-4" style={{ borderBottom: '1px dashed #3e3f3e' }}>
                    <CheckCircle className="mx-auto h-10 w-10 mb-2 text-green-400" />
                    <h2 className="text-xl font-bold text-white">Transaction Successful</h2>
                    <p className="text-base font-bold text-white mt-2">{store.name || 'MyMart Receipt'}</p>
                    {store.address && <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{store.address}</p>}
                    {(store.state || store.country) && (
                        <p className="text-xs" style={{ color: '#9ca3af' }}>{[store.state, store.country, store.pin].filter(Boolean).join(', ')}</p>
                    )}
                    {store.phone && <p className="text-xs mt-1 font-semibold" style={{ color: '#9ca3af' }}>Contact: {store.phone}</p>}
                    <p className="text-xs mt-2" style={{ color: S.muted }}>{new Date().toLocaleString()}</p>
                    {(lastSale?.customerName || lastSale?.customerPhone) && (
                        <div className="mt-3 p-2 rounded-lg text-left" style={{ backgroundColor: '#1e1e1e', border: '1px solid #3e3f3e' }}>
                            <p className="font-semibold text-white">Customer: {lastSale?.customerName || 'Walk-In'}</p>
                            {lastSale?.customerPhone && <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>{lastSale.customerPhone}</p>}
                        </div>
                    )}
                </div>
                <div className="space-y-2 mb-4">
                    {lastSale?.orderItems.map((item, i) => (
                        <div key={i} className="flex justify-between">
                            <div>
                                <p className="font-semibold text-white">{item.name}</p>
                                <p className="text-xs" style={{ color: S.muted }}>{item.qty} x {currency}{item.price.toFixed(2)}</p>
                            </div>
                            <p className="font-bold text-white">{currency}{(item.qty * item.price).toFixed(2)}</p>
                        </div>
                    ))}
                </div>
                <div className="py-2 mb-2 text-xs" style={{ borderTop: '1px dashed #3e3f3e' }}>
                    <div className="flex justify-between" style={{ color: S.muted }}>
                        <span>Payment Method</span>
                        <span className="font-semibold text-white">{lastSale?.paymentMethod}</span>
                    </div>
                </div>
                <div className="flex justify-between font-bold text-lg text-white pt-2 mb-5"
                    style={{ borderTop: '1px dashed #3e3f3e' }}>
                    <span>Total</span><span className="text-white">{currency}{lastSale?.totalPrice?.toFixed(2)}</span>
                </div>
                <div className="flex gap-2 print:hidden">
                    <button onClick={() => window.print()}
                        className="flex-1 py-3 rounded-xl font-bold text-black transition-all flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#e2e8f0' }}>
                        <Printer size={16} /> Print
                    </button>
                    <button onClick={() => setCheckoutStatus(null)}
                        className="flex-1 py-3 rounded-xl font-bold text-black transition-all flex items-center justify-center gap-2"
                        style={{ backgroundColor: '#54c750' }}>
                        <Receipt size={16} /> New Sale
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row gap-5" style={{ minHeight: 'calc(100vh - 7rem)' }}>
            {checkoutStatus === 'success' && <ReceiptModal />}

            {/* Products Grid */}
            <div className="flex-1 min-h-0 rounded-2xl flex flex-col overflow-hidden" style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                <div className="p-4 flex-shrink-0" style={{ borderBottom: `1px solid ${S.border}` }}>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: S.muted }} />
                        <input type="text" placeholder="Search products..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm outline-none"
                            style={{ backgroundColor: '#060c06', border: '1px solid #3e3f3e', color: '#e2e8f0' }}
                            onFocus={e => e.target.style.borderColor = '#54c750'}
                            onBlur={e => e.target.style.borderColor = '#3e3f3e'}
                            value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                </div>
                <div className="flex gap-2 p-3 overflow-x-auto flex-shrink-0 scrollbar-hide" style={{ borderBottom: `1px solid ${S.border}` }}>
                    {categories.map(c => (
                        <button key={c} onClick={() => setCategoryFilter(c)}
                            className="px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors"
                            style={{
                                backgroundColor: categoryFilter === c ? '#54c750' : '#3e3f3e',
                                color: categoryFilter === c ? '#000' : '#e2e8f0'
                            }}>
                            {c}
                        </button>
                    ))}
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center items-center h-full">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
                        </div>
                    ) : (
                        filteredProducts.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                <Search className="h-10 w-10 mb-3" style={{ color: '#3e3f3e' }} />
                                <p className="font-medium" style={{ color: S.muted }}>No products match your search</p>
                                <p className="text-xs mt-1" style={{ color: '#4a4a6a' }}>Try another keyword or category.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {filteredProducts.map(product => (
                                    <div key={product._id} onClick={() => addToCart(product)}
                                        className="rounded-xl p-4 flex flex-col justify-between transition-all"
                                        style={{
                                            backgroundColor: '#060c06',
                                            border: product.quantity > 0 ? '1px solid #3e3f3e' : '1px solid #ef444433',
                                            cursor: product.quantity > 0 ? 'pointer' : 'not-allowed',
                                            opacity: product.quantity <= 0 ? 0.5 : 1,
                                        }}
                                        onMouseEnter={e => product.quantity > 0 && (e.currentTarget.style.borderColor = '#54c750')}
                                        onMouseLeave={e => product.quantity > 0 && (e.currentTarget.style.borderColor = '#3e3f3e')}>
                                        <div>
                                            <div className="flex items-start justify-between mb-2">
                                                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md"
                                                    style={{ backgroundColor: '#3e3f3e', color: '#9ca3af' }}>{product.category}</span>
                                                {product.quantity <= 0 && (
                                                    <span className="text-xs font-bold px-2 py-0.5 rounded-md"
                                                        style={{ backgroundColor: '#ef444422', color: '#ef4444' }}>Out</span>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-white text-sm leading-tight mb-1">{product.name}</h3>
                                            <p className="font-bold text-white">{currency}{product.sellingPrice.toFixed(2)}</p>
                                        </div>
                                        <div className="mt-3 flex items-center gap-1.5 text-xs" style={{ color: S.muted }}>
                                            <span className="w-2 h-2 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: product.quantity > 10 ? '#22c55e' : product.quantity > 0 ? '#54c750' : '#ef4444' }} />
                                            Stock: {product.quantity}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Cart */}
            <div className="w-full lg:w-80 flex-shrink-0 rounded-2xl flex flex-col overflow-hidden"
                style={{ backgroundColor: S.card, border: `1px solid ${S.border}` }}>
                <div className="p-4 flex-shrink-0" style={{ background: 'linear-gradient(135deg, #54c75022, #3e9b3822)', borderBottom: `1px solid #54c75033` }}>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                        <ShoppingCart size={18} /> Current Sale
                        {cart.length > 0 && (
                            <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full text-black bg-emerald-400">
                                {cart.reduce((a, i) => a + i.qty, 0)}
                            </span>
                        )}
                    </h2>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                    {cart.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                            <ShoppingCart className="h-12 w-12 mb-3" style={{ color: '#3e3f3e' }} />
                            <p className="font-medium" style={{ color: S.muted }}>Cart is empty</p>
                            <p className="text-xs mt-1" style={{ color: '#4a4a6a' }}>Click products to add them.</p>
                        </div>
                    ) : cart.map(item => (
                        <div key={item.product} className="flex items-center gap-2 p-3 rounded-xl"
                            style={{ backgroundColor: '#060c06', border: '1px solid #3e3f3e' }}>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white text-sm truncate">{item.name}</p>
                                <p className="text-xs" style={{ color: S.muted }}>{currency}{item.price.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-1" style={{ backgroundColor: '#3e3f3e', borderRadius: '8px', padding: '2px' }}>
                                <button onClick={() => updateQty(item.product, -1)}
                                    className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-white transition-colors hover:bg-emerald-500"
                                    style={{ backgroundColor: '#3a3a4a', fontSize: '16px' }}>−</button>
                                <span className="w-6 text-center font-bold text-white text-sm">{item.qty}</span>
                                <button onClick={() => updateQty(item.product, 1)}
                                    className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-white transition-colors hover:bg-emerald-500"
                                    style={{ backgroundColor: '#3a3a4a', fontSize: '14px' }}>+</button>
                            </div>
                            <button onClick={() => removeFromCart(item.product)}
                                className="p-1.5 rounded-lg transition-colors hover:text-red-400"
                                style={{ color: '#4a4a6a' }}><Trash2 size={14} /></button>
                        </div>
                    ))}
                </div>
                <div className="p-4 flex-shrink-0 space-y-3" style={{ borderTop: `1px solid ${S.border}` }}>
                    {/* Customer Info */}
                    <div className="space-y-2 mb-2 pb-3" style={{ borderBottom: `1px dashed ${S.border}` }}>
                        <div className="flex justify-between items-center">
                            <p className="text-xs font-medium" style={{ color: S.muted }}>Customer details</p>
                            {customerStatus === 'returning' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-emerald-400 bg-emerald-400/10">Returning ✓</span>}
                            {customerStatus === 'new' && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded text-cyan-400 bg-cyan-400/10">New</span>}
                        </div>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: S.muted }} />
                            <input type="tel" placeholder="Phone Number (Auto-lookup)"
                                className="w-full pl-8 pr-3 py-2 rounded-lg text-xs outline-none transition-colors"
                                style={{ backgroundColor: '#060c06', border: '1px solid #3e3f3e', color: '#e2e8f0' }}
                                onFocus={e => e.target.style.borderColor = '#54c750'}
                                onBlur={(e) => { e.target.style.borderColor = '#3e3f3e'; handlePhoneBlur(); }}
                                value={customerPhone} onChange={e => { setCustomerPhone(e.target.value); if(customerStatus === 'returning') setCustomerStatus(''); }} />
                        </div>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: S.muted }} />
                            <input type="text" placeholder="Customer Name (Optional)"
                                className="w-full pl-8 pr-3 py-2 rounded-lg text-xs outline-none transition-colors"
                                style={{ backgroundColor: '#060c06', border: '1px solid #3e3f3e', color: '#e2e8f0' }}
                                onFocus={e => e.target.style.borderColor = '#54c750'}
                                onBlur={e => e.target.style.borderColor = '#3e3f3e'}
                                value={customerName} onChange={e => setCustomerName(e.target.value)} />
                        </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div>
                        <p className="text-xs font-medium mb-2" style={{ color: S.muted }}>Payment Method</p>
                        <div className="flex gap-2">
                            {PAYMENT_METHODS.map(m => (
                                <button key={m.value}
                                    onClick={() => setPaymentMethod(m.value)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all"
                                    style={{
                                        backgroundColor: paymentMethod === m.value ? '#54c75022' : '#060c06',
                                        border: paymentMethod === m.value ? '1px solid #54c750' : '1px solid #3e3f3e',
                                        color: paymentMethod === m.value ? '#54c750' : '#6b7280',
                                    }}>
                                    {m.icon} {m.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between text-sm" style={{ color: S.muted }}>
                        <span>Items</span><span>{cart.reduce((a, i) => a + i.qty, 0)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl text-white">
                        <span>Total</span><span className="text-white">{currency}{total()}</span>
                    </div>
                    <button onClick={handleCheckout} disabled={cart.length === 0 || checkingOut}
                        className="w-full py-3.5 rounded-xl font-bold text-black transition-all active:scale-[0.98]"
                        style={cart.length === 0
                            ? { backgroundColor: '#3e3f3e', color: '#4a4a6a', cursor: 'not-allowed' }
                            : { backgroundColor: '#54c750', boxShadow: '0 4px 20px #54c75033' }}>
                        {checkingOut ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                Processing...
                            </span>
                        ) : 'Complete Checkout'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default POS;
