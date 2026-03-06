// Designer Dashboard Module
class DesignerDashboard {
    constructor() {
        this.orders = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        
        // Check authentication first
        if (!this.isAuthenticated()) {
            this.redirectToAuth();
            return;
        }
        
        this.init();
    }

    // Check if designer is authenticated
    isAuthenticated() {
        return sessionStorage.getItem('designer_authenticated') === 'true' || 
               localStorage.getItem('designer_authenticated') === 'true';
    }

    // Redirect to auth page
    redirectToAuth() {
        window.location.href = 'designer-auth.html';
    }

    // Logout
    logout() {
        sessionStorage.removeItem('designer_authenticated');
        localStorage.removeItem('designer_authenticated');
        
        // Show notification before redirecting
        this.showNotification('تم تسجيل الخروج بنجاح', 'info');
        
        // Redirect to main page after a short delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1000);
    }

    // Initialize dashboard
    init() {
        this.loadOrders();
        this.updateStatistics();
        this.renderOrders();
        this.setupAutoRefresh();
    }

    // Load all orders from all customers
    loadOrders() {
        this.orders = [];
        
        // Get all localStorage keys
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            // Load orders from all customers
            if (key.includes('abayas-orders')) {
                try {
                    const customerOrders = JSON.parse(localStorage.getItem(key) || '[]');
                    const customerId = key.replace('abayas-orders-', '');
                    
                    customerOrders.forEach(order => {
                        this.orders.push({
                            ...order,
                            customerId: customerId,
                            storageKey: key,
                            status: order.status || 'pending'
                        });
                    });
                } catch (error) {
                    console.error('Error loading orders from', key, error);
                }
            }
        }
        
        // Sort by timestamp (newest first)
        this.orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        console.log(`Loaded ${this.orders.length} orders from ${this.getUniqueCustomersCount()} customers`);
    }

    // Get unique customers count
    getUniqueCustomersCount() {
        const uniqueCustomers = new Set(this.orders.map(order => order.customerId));
        return uniqueCustomers.size;
    }

    // Update statistics
    updateStatistics() {
        const stats = {
            total: this.orders.length,
            pending: this.orders.filter(o => o.status === 'pending').length,
            approved: this.orders.filter(o => o.status === 'approved').length,
            completed: this.orders.filter(o => o.status === 'completed').length
        };

        document.getElementById('total-orders').textContent = stats.total;
        document.getElementById('pending-orders').textContent = stats.pending;
        document.getElementById('approved-orders').textContent = stats.approved;
        document.getElementById('completed-orders').textContent = stats.completed;
    }

    // Render orders
    renderOrders() {
        const container = document.getElementById('orders-container');
        const emptyState = document.getElementById('empty-state');
        
        // Filter orders
        let filteredOrders = this.getFilteredOrders();
        
        if (filteredOrders.length === 0) {
            container.innerHTML = '';
            emptyState.classList.remove('hidden');
            return;
        }
        
        emptyState.classList.add('hidden');
        
        container.innerHTML = filteredOrders.map(order => this.createOrderCard(order)).join('');
    }

    // Get filtered orders
    getFilteredOrders() {
        let filtered = this.orders;
        
        // Status filter
        if (this.currentFilter !== 'all') {
            filtered = filtered.filter(order => order.status === this.currentFilter);
        }
        
        // Search filter
        if (this.searchTerm) {
            filtered = filtered.filter(order => 
                order.customerId.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                order.customerInfo?.name?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                order.customerInfo?.phone?.includes(this.searchTerm)
            );
        }
        
        return filtered;
    }

    // Create order card HTML
    createOrderCard(order) {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            approved: 'bg-green-100 text-green-800',
            completed: 'bg-purple-100 text-purple-800'
        };

        const statusTexts = {
            pending: 'قيد المراجعة',
            approved: 'موافق عليها',
            completed: 'مكتملة'
        };

        const partsCount = Object.keys(order.designs || {}).length;
        const totalPrice = order.totalPrice || '0';

        return `
            <div class="order-card bg-white rounded-xl shadow-lg p-6 hover:shadow-xl border-2 border-gray-200">
                <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                            <span class="status-badge ${statusColors[order.status]}">
                                ${statusTexts[order.status]}
                            </span>
                            <span class="text-sm text-gray-500">
                                <i class="fas fa-calendar ml-1"></i>
                                ${new Date(order.timestamp).toLocaleDateString('ar-SA')}
                            </span>
                        </div>
                        <h4 class="text-lg font-bold text-gray-800 mb-2">
                            طلب رقم #${order.customerId.substring(0, 8)}
                        </h4>
                        <div class="customer-info">
                            <p class="text-sm text-gray-600">
                                <i class="fas fa-user ml-2"></i>
                                ${order.customerInfo?.name || 'عميل'}
                            </p>
                            <p class="text-sm text-gray-600">
                                <i class="fas fa-phone ml-2"></i>
                                ${order.customerInfo?.phone || 'غير متوفر'}
                            </p>
                        </div>
                    </div>
                    <div class="text-left">
                        <p class="text-2xl font-bold text-purple-600">${totalPrice} ريال</p>
                        <p class="text-sm text-gray-500">${partsCount} أجزاء</p>
                    </div>
                </div>

                <div class="mb-4">
                    <p class="text-sm font-semibold text-gray-700 mb-2">الأجزاء المطلوبة:</p>
                    <div class="flex flex-wrap gap-2">
                        ${Object.entries(order.designs || {}).map(([partType, design]) => 
                            `<span class="design-part text-xs">
                                ${this.getPartName(partType)}: ${design.styles?.name || 'غير محدد'}
                            </span>`
                        ).join('')}
                    </div>
                </div>

                <div class="flex gap-2">
                    <button onclick="dashboard.viewOrderDetails('${order.customerId}', '${order.timestamp}')" 
                            class="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                        <i class="fas fa-eye ml-2"></i>
                        عرض التفاصيل
                    </button>
                    
                    ${order.status === 'pending' ? `
                        <button onclick="dashboard.updateOrderStatus('${order.customerId}', '${order.timestamp}', 'approved')" 
                                class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition">
                            <i class="fas fa-check ml-2"></i>
                            موافقة
                        </button>
                    ` : ''}
                    
                    ${order.status === 'approved' ? `
                        <button onclick="dashboard.updateOrderStatus('${order.customerId}', '${order.timestamp}', 'completed')" 
                                class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
                            <i class="fas fa-trophy ml-2"></i>
                            إكمال
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Get part name in Arabic
    getPartName(partType) {
        const names = {
            'main-body': 'الجسم',
            'scarf': 'الوشاح',
            'hat': 'القبعة',
            'sleeves': 'الأكمام'
        };
        return names[partType] || partType;
    }

    // View order details
    viewOrderDetails(customerId, timestamp) {
        const order = this.orders.find(o => 
            o.customerId === customerId && o.timestamp === timestamp
        );
        
        if (!order) return;
        
        const modal = document.getElementById('order-modal');
        const content = document.getElementById('order-details-content');
        
        content.innerHTML = this.generateOrderDetailsHTML(order);
        modal.classList.remove('hidden');
    }

    // Generate order details HTML
    generateOrderDetailsHTML(order) {
        const parts = ['main-body', 'scarf', 'hat', 'sleeves'];
        
        return `
            <div class="space-y-6">
                <!-- Customer Information -->
                <div class="bg-gray-50 rounded-xl p-6">
                    <h4 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-user ml-2"></i>
                        معلومات العميل
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-gray-600">رقم العميل</p>
                            <p class="font-semibold">${order.customerId}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">الاسم</p>
                            <p class="font-semibold">${order.customerInfo?.name || 'عميل'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">الهاتف</p>
                            <p class="font-semibold">${order.customerInfo?.phone || 'غير متوفر'}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">البريد الإلكتروني</p>
                            <p class="font-semibold">${order.customerInfo?.email || 'غير متوفر'}</p>
                        </div>
                    </div>
                </div>

                <!-- Order Information -->
                <div class="bg-purple-50 rounded-xl p-6">
                    <h4 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-shopping-bag ml-2"></i>
                        معلومات الطلب
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <p class="text-sm text-gray-600">رقم الطلب</p>
                            <p class="font-semibold">#${order.customerId.substring(0, 8)}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">تاريخ الطلب</p>
                            <p class="font-semibold">${new Date(order.timestamp).toLocaleString('ar-SA')}</p>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">السعر الإجمالي</p>
                            <p class="font-semibold text-purple-600">${order.totalPrice} ريال</p>
                        </div>
                    </div>
                </div>

                <!-- Design Details -->
                <div class="bg-white rounded-xl p-6 border-2 border-gray-200">
                    <h4 class="text-lg font-bold text-gray-800 mb-4">
                        <i class="fas fa-palette ml-2"></i>
                        تفاصيل التصميم
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        ${parts.map(partType => {
                            const design = order.designs[partType];
                            if (!design) return '';
                            
                            return `
                                <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4">
                                    <h5 class="font-bold text-purple-800 mb-3">
                                        ${this.getPartName(partType)}
                                    </h5>
                                    <div class="space-y-2 text-sm">
                                        ${design.styles ? `
                                            <div class="flex justify-between">
                                                <span class="text-gray-600">النمط:</span>
                                                <span class="font-semibold">${design.styles.name}</span>
                                            </div>
                                        ` : ''}
                                        ${design.fabrics ? `
                                            <div class="flex justify-between">
                                                <span class="text-gray-600">القماش:</span>
                                                <span class="font-semibold">${design.fabrics.name}</span>
                                            </div>
                                        ` : ''}
                                        ${design.materials ? `
                                            <div class="flex justify-between">
                                                <span class="text-gray-600">المادة:</span>
                                                <span class="font-semibold">${design.materials.name}</span>
                                            </div>
                                        ` : ''}
                                        ${design.embroidery ? `
                                            <div class="flex justify-between">
                                                <span class="text-gray-600">التطريز:</span>
                                                <span class="font-semibold">${design.embroidery.name}</span>
                                            </div>
                                        ` : ''}
                                        <div class="flex justify-between pt-2 border-t">
                                            <span class="text-gray-600">السعر:</span>
                                            <span class="font-bold text-purple-600">${design.basePrice} ريال</span>
                                        </div>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-4">
                    ${order.status === 'pending' ? `
                        <button onclick="dashboard.updateOrderStatus('${order.customerId}', '${order.timestamp}', 'approved')" 
                                class="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                            <i class="fas fa-check ml-2"></i>
                            موافقة على الطلب
                        </button>
                    ` : ''}
                    
                    ${order.status === 'approved' ? `
                        <button onclick="dashboard.updateOrderStatus('${order.customerId}', '${order.timestamp}', 'completed')" 
                                class="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition">
                            <i class="fas fa-trophy ml-2"></i>
                            إكمال الطلب
                        </button>
                    ` : ''}
                    
                    ${order.status === 'completed' ? `
                        <div class="flex-1 bg-green-100 text-green-800 px-6 py-3 rounded-lg text-center">
                            <i class="fas fa-check-circle ml-2"></i>
                            الطلب مكتمل بنجاح
                        </div>
                    ` : ''}
                    
                    <button onclick="dashboard.printOrder('${order.customerId}', '${order.timestamp}')" 
                            class="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition">
                        <i class="fas fa-print ml-2"></i>
                        طباعة
                    </button>
                </div>
            </div>
        `;
    }

    // Update order status
    updateOrderStatus(customerId, timestamp, newStatus) {
        // Find and update the order
        const orderIndex = this.orders.findIndex(o => 
            o.customerId === customerId && o.timestamp === timestamp
        );
        
        if (orderIndex === -1) return;
        
        // Update in memory
        this.orders[orderIndex].status = newStatus;
        
        // Update in localStorage
        const storageKey = this.orders[orderIndex].storageKey;
        const customerOrders = JSON.parse(localStorage.getItem(storageKey) || '[]');
        
        const orderInStorage = customerOrders.find(o => 
            o.customerId === customerId && o.timestamp === timestamp
        );
        
        if (orderInStorage) {
            orderInStorage.status = newStatus;
            localStorage.setItem(storageKey, JSON.stringify(customerOrders));
        }
        
        // Refresh display
        this.updateStatistics();
        this.renderOrders();
        
        // Show success message
        this.showNotification(`تم تحديث حالة الطلب إلى ${this.getStatusText(newStatus)}`, 'success');
        
        // Close modal if open
        this.closeOrderModal();
    }

    // Get status text
    getStatusText(status) {
        const texts = {
            pending: 'قيد المراجعة',
            approved: 'موافق عليها',
            completed: 'مكتملة'
        };
        return texts[status] || status;
    }

    // Print order
    printOrder(customerId, timestamp) {
        const order = this.orders.find(o => 
            o.customerId === customerId && o.timestamp === timestamp
        );
        
        if (!order) return;
        
        // Create printable content
        const printContent = `
            <html dir="rtl">
            <head>
                <title>طلب رقم #${customerId.substring(0, 8)}</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .section { margin-bottom: 20px; }
                    .part { background: #f5f5f5; padding: 10px; margin: 10px 0; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>طلب تصميم عباية</h1>
                    <p>رقم الطلب: #${customerId.substring(0, 8)}</p>
                    <p>التاريخ: ${new Date(timestamp).toLocaleDateString('ar-SA')}</p>
                </div>
                
                <div class="section">
                    <h2>معلومات العميل</h2>
                    <p>الاسم: ${order.customerInfo?.name || 'عميل'}</p>
                    <p>الهاتف: ${order.customerInfo?.phone || 'غير متوفر'}</p>
                </div>
                
                <div class="section">
                    <h2>تفاصيل التصميم</h2>
                    ${Object.entries(order.designs || {}).map(([partType, design]) => `
                        <div class="part">
                            <h3>${this.getPartName(partType)}</h3>
                            <p>النمط: ${design.styles?.name || 'غير محدد'}</p>
                            <p>السعر: ${design.basePrice} ريال</p>
                        </div>
                    `).join('')}
                </div>
                
                <div class="section">
                    <h2>السعر الإجمالي: ${order.totalPrice} ريال</h2>
                </div>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    }

    // Show notification
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 font-semibold`;
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

    // Setup auto refresh
    setupAutoRefresh() {
        // Refresh every 30 seconds
        setInterval(() => {
            this.loadOrders();
            this.updateStatistics();
            this.renderOrders();
        }, 30000);
    }

    // Close order modal
    closeOrderModal() {
        document.getElementById('order-modal').classList.add('hidden');
    }
}

// Global functions
let dashboard;

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the designer dashboard page
    if (window.location.pathname.endsWith('designer-dashboard.html')) {
        console.log('Designer dashboard page loaded');
        
        dashboard = new DesignerDashboard();
        window.dashboard = dashboard;
        console.log('✅ Designer dashboard system initialized successfully!');
    } else {
        console.log('Not on designer dashboard page, skipping initialization');
    }
});

// Filter orders
function filterOrders(filter) {
    dashboard.currentFilter = filter;
    
    // Update button styles
    document.querySelectorAll('.filter-btn').forEach(btn => {
        if (btn.dataset.filter === filter) {
            btn.className = 'filter-btn px-4 py-2 rounded-lg bg-purple-600 text-white';
        } else {
            btn.className = 'filter-btn px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300';
        }
    });
    
    dashboard.renderOrders();
}

// Search orders
function searchOrders() {
    dashboard.searchTerm = document.getElementById('search-input').value;
    dashboard.renderOrders();
}

// Refresh orders
function refreshOrders() {
    dashboard.loadOrders();
    dashboard.updateStatistics();
    dashboard.renderOrders();
    dashboard.showNotification('تم تحديث الطلبات', 'success');
}

// Close order modal
function closeOrderModal() {
    dashboard.closeOrderModal();
}
