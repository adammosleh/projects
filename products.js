// Products Data Module
const products = [
    {
        id: 1,
        name: "عباية سوداء كلاسيكية",
        price: 299,
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        category: "عبايات سوداء",
        description: "عباية سوداء أنيقة بتصميم كلاسيكي",
        badge: "الأكثر مبيعاً"
    },
    {
        id: 2,
        name: "عباية سوداء بتفاصيل فضية",
        price: 399,
        image: "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        category: "عبايات سوداء",
        description: "عباية سوداء بتفاصيل فضية رائعة",
        badge: "جديد"
    },
    {
        id: 3,
        name: "عباية بنفسجية أنيقة",
        price: 349,
        image: "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        category: "عبايات ملونة",
        description: "عباية بنفسجية بتصميم عصري",
        badge: "مميز"
    },
    {
        id: 4,
        name: "عباية زرقاء كحلية",
        price: 379,
        image: "https://images.unsplash.com/photo-1572804013652-2f5e0c2de800?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        category: "عبايات ملونة",
        description: "عباية زرقاء كحلية بلمسة عصرية"
    },
    {
        id: 5,
        name: "عباية تراثية ذهبية",
        price: 599,
        image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        category: "عبايات تراثية",
        description: "عباية تراثية بتفاصيل ذهبية فاخرة",
        badge: "فاخر"
    },
    {
        id: 6,
        name: "عباية تراثية فضية",
        price: 549,
        image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        category: "عبايات تراثية",
        description: "عباية تراثية بلمسة فضية أنيقة"
    },
    {
        id: 7,
        name: "عباية عصرية رمادية",
        price: 429,
        image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        category: "عبايات عصرية",
        description: "عباية عصرية بتصميم مبتكر",
        badge: "عصري"
    },
    {
        id: 8,
        name: "عباية عصرية خضراء",
        price: 459,
        image: "https://images.unsplash.com/photo-1589829085413-56a8f7517e31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        category: "عبايات عصرية",
        description: "عباية عصرية باللون الأخضر الزمردي"
    }
];

// Products Manager Class
class ProductsManager {
    constructor() {
        this.products = products;
        this.selectedCategory = null;
    }

    // Get all products
    getAllProducts() {
        return this.products;
    }

    // Get products by category
    getProductsByCategory(category) {
        return this.products.filter(product => product.category === category);
    }

    // Get product by ID
    getProductById(id) {
        return this.products.find(product => product.id === id);
    }

    // Search products
    searchProducts(query) {
        const searchTerm = query.toLowerCase();
        return this.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }

    // Get categories
    getCategories() {
        const categories = [...new Set(this.products.map(product => product.category))];
        return categories.map(category => ({
            name: category,
            count: this.products.filter(product => product.category === category).length
        }));
    }

    // Get featured products
    getFeaturedProducts() {
        return this.products.filter(product => product.badge);
    }

    // Get products in price range
    getProductsByPriceRange(minPrice, maxPrice) {
        return this.products.filter(product => 
            product.price >= minPrice && product.price <= maxPrice
        );
    }

    // Sort products
    sortProducts(products, sortBy) {
        const sortedProducts = [...products];
        
        switch(sortBy) {
            case 'price-low':
                return sortedProducts.sort((a, b) => a.price - b.price);
            case 'price-high':
                return sortedProducts.sort((a, b) => b.price - a.price);
            case 'name':
                return sortedProducts.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
            case 'featured':
                return sortedProducts.sort((a, b) => (b.badge ? 1 : 0) - (a.badge ? 1 : 0));
            default:
                return sortedProducts;
        }
    }

    // Create product card HTML
    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card bg-white rounded-xl shadow-lg overflow-hidden';
        
        card.innerHTML = `
            <div class="relative">
                <img src="${product.image}" alt="${product.name}" class="w-full h-80 object-cover">
                ${product.badge ? `<span class="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-semibold">${product.badge}</span>` : ''}
                <div class="absolute top-4 left-4">
                    <button onclick="toggleFavorite(${product.id})" class="bg-white w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:bg-purple-50 transition">
                        <i class="far fa-heart text-purple-600"></i>
                    </button>
                </div>
            </div>
            <div class="p-6">
                <h4 class="font-bold text-xl mb-3">${product.name}</h4>
                <p class="text-gray-600 text-sm mb-4">${product.description}</p>
                <div class="flex justify-between items-center mb-4">
                    <span class="text-2xl font-bold text-purple-600">${product.price} ريال</span>
                    <div class="flex items-center text-yellow-400">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star-half-alt"></i>
                        <span class="text-gray-600 text-sm mr-2">(4.5)</span>
                    </div>
                </div>
                <div class="flex gap-2">
                    <button onclick="addToCart(${product.id})" class="btn-primary text-white px-4 py-3 rounded-lg flex-1 font-semibold">
                        <i class="fas fa-cart-plus ml-2"></i>
                        أضف للسلة
                    </button>
                    <button onclick="quickView(${product.id})" class="border-2 border-purple-600 text-purple-600 px-4 py-3 rounded-lg hover:bg-purple-50 transition">
                        <i class="fas fa-eye"></i>
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    // Render products
    renderProducts(productsToRender = this.products) {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;

        productsGrid.innerHTML = '';

        if (productsToRender.length === 0) {
            productsGrid.innerHTML = '<p class="text-center text-gray-500 col-span-full py-8">لا توجد منتجات</p>';
            return;
        }

        productsToRender.forEach(product => {
            const productCard = this.createProductCard(product);
            productsGrid.appendChild(productCard);
        });
    }

    // Filter by category
    filterByCategory(category) {
        this.selectedCategory = category;
        const filteredProducts = this.getProductsByCategory(category);
        this.renderProducts(filteredProducts);
        
        // Update active category
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
        });
        
        const activeCard = document.querySelector(`[onclick*="${category}"]`);
        if (activeCard) {
            activeCard.classList.add('active');
        }
        
        // Scroll to products
        const productsSection = document.getElementById('products');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }

    // Reset filters
    resetFilters() {
        this.selectedCategory = null;
        this.renderProducts();
        
        // Remove active class from all categories
        document.querySelectorAll('.category-card').forEach(card => {
            card.classList.remove('active');
        });
    }
}

// Initialize Products Manager
const productsManager = new ProductsManager();

// Make products and productsManager globally available
window.products = products;
window.productsManager = productsManager;

// Global functions for onclick handlers
window.filterByCategory = (category) => productsManager.filterByCategory(category);
window.resetFilters = () => productsManager.resetFilters();
window.quickView = (productId) => {
    const product = productsManager.getProductById(productId);
    if (window.cartManager) {
        window.cartManager.showNotification(`معاينة سريعة: ${product.name}`, 'info');
    }
};
window.toggleFavorite = (productId) => {
    const product = productsManager.getProductById(productId);
    if (window.cartManager) {
        window.cartManager.showNotification(`تمت إضافة ${product.name} إلى المفضلة`, 'success');
    }
};
