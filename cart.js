// Shopping Cart Module
class CartManager {
    constructor() {
        this.cart = [];
        this.loadCart();
    }

    // Load cart from localStorage
    loadCart() {
        const savedCart = localStorage.getItem('abayas-cart');
        if (savedCart) {
            this.cart = JSON.parse(savedCart);
            this.updateCartCount();
        }
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('abayas-cart', JSON.stringify(this.cart));
    }

    // Add item to cart
    addToCart(item) {
        this.cart.push(item);
        this.updateCartCount();
        this.saveCart();
        this.showNotification('تمت إضافة المنتج إلى السلة', 'success');
        
        // Add animation to cart button
        const cartButton = document.querySelector('.floating-cart button');
        if (cartButton) {
            cartButton.classList.add('animate-bounce');
            setTimeout(() => {
                cartButton.classList.remove('animate-bounce');
            }, 1000);
        }
    }

    // Remove item from cart
    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.updateCartCount();
        this.saveCart();
        this.showNotification('تم حذف المنتج من السلة', 'info');
        this.renderCart();
    }

    // Update cart count
    updateCartCount() {
        const cartCount = document.getElementById('cart-count');
        const floatingCartCount = document.getElementById('floating-cart-count');
        
        if (cartCount) cartCount.textContent = this.cart.length;
        if (floatingCartCount) floatingCartCount.textContent = this.cart.length;
    }

    // Get cart total
    getCartTotal() {
        return this.cart.reduce((total, item) => total + item.price, 0);
    }

    // Show notification
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        notification.className = `notification ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg font-semibold`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 3000);
    }

    // Render cart modal
    renderCart() {
        const modal = document.getElementById('cart-modal');
        if (!modal) return;

        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        
        if (this.cart.length === 0) {
            cartItems.innerHTML = '<p class="text-center text-gray-500 py-8">السلة فارغة</p>';
            cartTotal.textContent = '0 ريال';
            return;
        }

        cartItems.innerHTML = this.cart.map(item => `
            <div class="flex items-center justify-between p-4 border-b hover:bg-gray-50">
                <div class="flex items-center space-x-reverse space-x-4">
                    <img src="${item.image}" alt="${item.title}" class="w-16 h-16 object-cover rounded">
                    <div>
                        <h4 class="font-semibold">${item.title}</h4>
                        <p class="text-sm text-gray-600">${item.price} ريال</p>
                    </div>
                </div>
                <button onclick="cartManager.removeFromCart(${item.id})" class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');

        cartTotal.textContent = `${this.getCartTotal()} ريال`;
    }

    // Clear cart
    clearCart() {
        this.cart = [];
        this.updateCartCount();
        this.saveCart();
        this.renderCart();
        this.showNotification('تم تفريغ السلة', 'info');
    }

    // Checkout
    checkout() {
        if (this.cart.length === 0) {
            this.showNotification('السلة فارغة', 'error');
            return;
        }

        // Here you would typically send the order to a server
        this.showNotification('جاري معالجة الطلب...', 'success');
        
        // Simulate order processing
        setTimeout(() => {
            this.clearCart();
            this.closeCartModal();
            this.showNotification('تم إرسال الطلب بنجاح!', 'success');
        }, 2000);
    }

    // Open cart modal
    openCartModal() {
        const modal = document.getElementById('cart-modal');
        if (modal) {
            modal.classList.remove('hidden');
            this.renderCart();
        }
    }

    // Close cart modal
    closeCartModal() {
        const modal = document.getElementById('cart-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
}

// Initialize Cart Manager
const cartManager = new CartManager();

// Make cartManager globally available
window.cartManager = cartManager;

// Global functions for onclick handlers
window.addToCart = (productId) => {
    const product = window.products.find(p => p.id === productId);
    if (product) {
        cartManager.addToCart(product);
    }
};

window.openCartModal = () => cartManager.openCartModal();
window.closeCartModal = () => cartManager.closeCartModal();
window.checkout = () => cartManager.checkout();
window.clearCart = () => cartManager.clearCart();
