// Order Summary Module - Fixed Version with Multiple Designs Support
class OrderSummary {
    constructor() {
        this.savedDesigns = {};
        this.customerId = null;
        
        // Initialize customer session
        this.initCustomerSession();
        
        // Load saved designs
        this.loadSavedDesigns();
    }

    // Initialize customer session
    initCustomerSession() {
        if (window.customerSession) {
            this.customerId = window.customerSession.customerId;
        }
    }

    // Get customer-specific storage key
    getStorageKey(baseKey) {
        return this.customerId ? `${baseKey}-${this.customerId}` : baseKey;
    }

    // Load saved designs from localStorage
    loadSavedDesigns() {
        const storageKey = this.getStorageKey('abayas-saved-designs');
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            this.savedDesigns = JSON.parse(saved);
            console.log(`Loaded designs for customer ${this.customerId}:`, this.savedDesigns);
        } else {
            this.savedDesigns = {};
        }
        this.updateDesignsCount();
    }

    // Update designs count - Support multiple designs per part
    updateDesignsCount() {
        let totalDesigns = 0;
        Object.keys(this.savedDesigns).forEach(partType => {
            const designs = this.savedDesigns[partType];
            if (Array.isArray(designs)) {
                totalDesigns += designs.length;
            } else if (designs) {
                // Legacy support for old single design format
                totalDesigns += 1;
            }
        });
        
        const countElement = document.getElementById('designs-count');
        if (countElement) {
            countElement.textContent = totalDesigns;
        }
    }

    // Save design to localStorage - Support multiple designs per part
    saveDesign(partType, designData) {
        // Ensure we have customer ID
        if (!this.customerId && window.customerSession) {
            this.customerId = window.customerSession.customerId;
        }
        
        // Check if this part type already has designs
        if (!this.savedDesigns[partType]) {
            this.savedDesigns[partType] = [];
        }
        
        // Add unique ID to this design
        const designWithId = {
            ...designData,
            id: this.generateDesignId(),
            partType: partType,
            customerId: this.customerId,
            createdAt: new Date().toISOString()
        };
        
        // Add the new design to the array
        this.savedDesigns[partType].push(designWithId);
        
        // Save to localStorage
        const storageKey = this.getStorageKey('abayas-saved-designs');
        localStorage.setItem(storageKey, JSON.stringify(this.savedDesigns));
        this.updateDesignsCount();
        
        console.log(`Saved design for ${partType} for customer ${this.customerId}. Total designs for this part: ${this.savedDesigns[partType].length}`);
        
        if (window.cartManager) {
            const designCount = this.savedDesigns[partType].length;
            window.cartManager.showNotification(`تم حفظ تصميم ${this.getPartName(partType)} (${designCount})`, 'success');
        }
    }

    // Generate unique design ID
    generateDesignId() {
        return 'design_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Get part name in Arabic
    getPartName(partType) {
        const names = {
            'main-body': 'الجسم الرئيسي',
            'scarf': 'الوشاح',
            'hat': 'القبعة',
            'sleeves': 'الأكمام'
        };
        return names[partType] || partType;
    }

    // Open order summary modal
    openOrderSummary() {
        const modal = document.getElementById('order-summary-modal');
        const content = document.getElementById('order-summary-content');
        
        content.innerHTML = this.generateOrderSummaryContent();
        modal.classList.remove('hidden');
    }

    // Close order summary modal
    closeOrderSummary() {
        const modal = document.getElementById('order-summary-modal');
        modal.classList.add('hidden');
    }

    // Generate order summary content - Support multiple designs per part
    generateOrderSummaryContent() {
        const parts = ['main-body', 'scarf', 'hat', 'sleeves'];
        let hasAnyDesign = false;
        
        let html = `
            <div class="space-y-6">
                <div class="text-center mb-8">
                    <h3 class="text-3xl font-bold text-gray-800 mb-4">ملخص طلبك المخصص</h3>
                    <p class="text-gray-600">مراجعة كاملة لجميع أجزاء العباية المصممة</p>
                    <div class="mt-4 flex justify-center gap-4">
                        <div class="bg-purple-100 px-4 py-2 rounded-lg">
                            <span class="text-purple-800 font-semibold">عدد التصاميم: ${this.getTotalDesignsCount()}</span>
                        </div>
                        <div class="bg-green-100 px-4 py-2 rounded-lg">
                            <span class="text-green-800 font-semibold">السعر الإجمالي: ${this.calculateTotalPrice()} ريال</span>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-6">
        `;
        
        parts.forEach(partType => {
            const designs = this.savedDesigns[partType];
            if (designs && (Array.isArray(designs) ? designs.length > 0 : designs)) {
                hasAnyDesign = true;
                html += this.generatePartSection(partType, designs);
            }
        });
        
        html += `</div>`;
        
        if (!hasAnyDesign) {
            html += `
                <div class="text-center py-12">
                    <div class="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8">
                        <i class="fas fa-info-circle text-yellow-600 text-4xl mb-4"></i>
                        <p class="text-yellow-800 text-lg">لم يتم تصميم أي جزء بعد</p>
                        <p class="text-yellow-600 mt-2">قم بتصميم الأجزاء أولاً ثم عد هنا</p>
                    </div>
                </div>
            `;
        } else {
            html += `
                <div class="mt-8 p-6 bg-purple-50 rounded-xl">
                    <div class="flex justify-between items-center mb-4">
                        <h4 class="text-xl font-bold text-gray-800">السعر الإجمالي</h4>
                        <span class="text-2xl font-bold text-purple-600">${this.calculateTotalPrice()} ريال</span>
                    </div>
                    
                    <div class="flex gap-4">
                        <button onclick="orderSummary.clearAllDesigns()" class="border-2 border-red-300 text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition">
                            <i class="fas fa-trash ml-2"></i>
                            مسح الكل
                        </button>
                        <button onclick="orderSummary.sendToDesigner()" class="btn-primary text-white px-8 py-3 rounded-lg font-semibold flex-1">
                            <i class="fas fa-paper-plane ml-2"></i>
                            إرسال للمصمم
                        </button>
                    </div>
                </div>
            `;
        }
        
        html += `</div>`;
        return html;
    }

    // Generate section for a part with multiple designs
    generatePartSection(partType, designs) {
        const partName = this.getPartName(partType);
        const partIcons = {
            'main-body': 'fa-tshirt',
            'scarf': 'fa-scroll',
            'hat': 'fa-hat-wizard',
            'sleeves': 'fa-mitten'
        };

        let html = `
            <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center">
                        <div class="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center ml-4">
                            <i class="fas ${partIcons[partType]} text-purple-600 text-xl"></i>
                        </div>
                        <div>
                            <h4 class="text-xl font-bold text-gray-800">${partName}</h4>
                            <p class="text-sm text-gray-600">${Array.isArray(designs) ? designs.length + ' تصميم' : 'تصميم واحد'}</p>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-4">
        `;

        if (Array.isArray(designs)) {
            // Multiple designs for this part
            designs.forEach((design, index) => {
                html += this.generateDesignCard(partType, design, index + 1);
            });
        } else {
            // Single design (legacy support)
            html += this.generateDesignCard(partType, designs, 1);
        }

        html += `
                </div>
                
                <div class="mt-4 pt-4 border-t">
                    <button onclick="orderSummary.editDesign('${partType}')" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                        <i class="fas fa-plus ml-2"></i>
                        إضافة تصميم جديد
                    </button>
                </div>
            </div>
        `;

        return html;
    }

    // Generate individual design card
    generateDesignCard(partType, design, designNumber) {
        return `
            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div class="flex justify-between items-start mb-3">
                    <div class="flex items-center">
                        <span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-semibold">
                            تصميم ${designNumber}
                        </span>
                        ${design.createdAt ? `
                            <span class="text-xs text-gray-500 mr-2">
                                <i class="fas fa-clock ml-1"></i>
                                ${new Date(design.createdAt).toLocaleString('ar-SA', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                })}
                            </span>
                        ` : ''}
                    </div>
                    <button onclick="orderSummary.deleteDesign('${partType}', '${design.id || ''}')" class="text-red-500 hover:text-red-700 transition">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                
                <div class="space-y-2">
                    ${design.styles ? `
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600 text-sm">النمط:</span>
                            <span class="font-semibold text-sm">${design.styles.name || 'غير محدد'}</span>
                        </div>
                    ` : ''}
                    
                    ${design.shape ? `
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600 text-sm">الشكل:</span>
                            <span class="font-semibold text-sm">${design.shape.name || 'غير محدد'}</span>
                        </div>
                    ` : ''}
                    
                    ${design.fabrics ? `
                        <div class="flex justify-between items-center">
                            <span class="text-gray-600 text-sm">القماش:</span>
                            <span class="font-semibold text-sm">${design.fabrics.name || 'غير محدد'}</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="mt-3 pt-3 border-t flex justify-between items-center">
                    <span class="text-purple-600 font-bold">${design.basePrice || 0} ريال</span>
                    <button onclick="orderSummary.editSpecificDesign('${partType}', '${design.id || ''}')" class="text-blue-600 hover:text-blue-700 text-sm">
                        <i class="fas fa-edit ml-1"></i>
                        تعديل
                    </button>
                </div>
            </div>
        `;
    }

    // Get total designs count across all parts
    getTotalDesignsCount() {
        let total = 0;
        Object.keys(this.savedDesigns).forEach(partType => {
            const designs = this.savedDesigns[partType];
            if (Array.isArray(designs)) {
                total += designs.length;
            } else if (designs) {
                total += 1;
            }
        });
        return total;
    }

    // Calculate total price - Support multiple designs per part
    calculateTotalPrice() {
        let total = 0;
        Object.keys(this.savedDesigns).forEach(partType => {
            const designs = this.savedDesigns[partType];
            if (Array.isArray(designs)) {
                designs.forEach(design => {
                    if (design.basePrice) {
                        total += design.basePrice;
                    }
                });
            } else if (designs && designs.basePrice) {
                total += designs.basePrice;
            }
        });
        return total.toLocaleString('ar-SA');
    }

    // Edit specific design
    editDesign(partType) {
        this.closeOrderSummary();
        
        if (window.designer) {
            window.designer.openDesigner(partType);
        }
    }

    // Edit specific design by ID
    editSpecificDesign(partType, designId) {
        this.closeOrderSummary();
        
        if (window.designer) {
            window.designer.openDesigner(partType);
        }
    }

    // Delete specific design - Support multiple designs per part
    deleteDesign(partType, designId = null) {
        if (confirm(`هل أنت متأكد من حذف تصميم ${this.getPartName(partType)}؟`)) {
            if (designId && Array.isArray(this.savedDesigns[partType])) {
                // Delete specific design by ID
                this.savedDesigns[partType] = this.savedDesigns[partType].filter(design => design.id !== designId);
                
                // If no designs left for this part, remove the part key
                if (this.savedDesigns[partType].length === 0) {
                    delete this.savedDesigns[partType];
                }
            } else {
                // Legacy support - delete entire part
                delete this.savedDesigns[partType];
            }
            
            const storageKey = this.getStorageKey('abayas-saved-designs');
            localStorage.setItem(storageKey, JSON.stringify(this.savedDesigns));
            this.updateDesignsCount();
            
            // Refresh the modal if it's open
            const modal = document.getElementById('order-summary-modal');
            if (modal && !modal.classList.contains('hidden')) {
                const content = document.getElementById('order-summary-content');
                content.innerHTML = this.generateOrderSummaryContent();
            }
            
            if (window.cartManager) {
                window.cartManager.showNotification(`تم حذف تصميم ${this.getPartName(partType)}`, 'info');
            }
        }
    }

    // Clear all designs
    clearAllDesigns() {
        if (confirm('هل أنت متأكد من مسح جميع التصاميم؟')) {
            this.savedDesigns = {};
            const storageKey = this.getStorageKey('abayas-saved-designs');
            localStorage.setItem(storageKey, JSON.stringify(this.savedDesigns));
            this.updateDesignsCount();
            
            // Close modal if open
            this.closeOrderSummary();
            
            if (window.cartManager) {
                window.cartManager.showNotification('تم مسح جميع التصاميم', 'info');
            }
        }
    }

    // Send to designer
    sendToDesigner() {
        const orderData = {
            designs: this.savedDesigns,
            customerId: this.customerId,
            totalPrice: this.calculateTotalPrice(),
            timestamp: new Date().toISOString(),
            customerInfo: {
                name: 'عميل',
                phone: '05xxxxxxxx',
                email: 'customer@example.com'
            }
        };

        // Save order to localStorage
        const ordersKey = this.getStorageKey('abayas-orders');
        const orders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
        orders.push(orderData);
        localStorage.setItem(ordersKey, JSON.stringify(orders));

        // Clear designs after sending
        this.savedDesigns = {};
        const storageKey = this.getStorageKey('abayas-saved-designs');
        localStorage.setItem(storageKey, JSON.stringify(this.savedDesigns));
        
        this.updateDesignsCount();
        this.closeOrderSummary();
        
        if (window.cartManager) {
            window.cartManager.showNotification('تم إرسال طلبك للمصمم بنجاح! سنتواصل معك قريباً.', 'success');
        }
    }

    // Open order summary as full page
    openOrderSummaryPage() {
        // Open in same window instead of new tab
        const newWindow = window.open('', '_self');
        
        // Create full page content
        const pageContent = `
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>ملخص الطلب - متجر العبايات الراقية</title>
                <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
                <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
                <link rel="stylesheet" href="styles.css">
            </head>
            <body class="bg-gray-50">
                <!-- Navigation Header -->
                <header class="bg-white shadow-lg sticky top-0 z-50 border-b-2 border-purple-100">
                    <nav class="container mx-auto px-4 py-4">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center space-x-reverse space-x-4">
                                <button onclick="history.back()" class="text-gray-600 hover:text-purple-600 transition">
                                    <i class="fas fa-arrow-right text-xl"></i>
                                </button>
                                <div class="bg-purple-600 p-3 rounded-full">
                                    <i class="fas fa-clipboard-list text-white text-xl"></i>
                                </div>
                                <div>
                                    <h1 class="text-2xl font-bold text-gray-800">ملخص الطلب المخصص</h1>
                                    <p class="text-sm text-gray-600">مراجعة جميع التصاميم المحفوظة</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-reverse space-x-4">
                                <button onclick="window.location.href='index.html'" class="border-2 border-purple-600 text-purple-600 px-4 py-2 rounded-lg hover:bg-purple-50 transition">
                                    <i class="fas fa-home ml-2"></i>
                                    الرئيسية
                                </button>
                                <button onclick="clearAllDesigns()" class="border-2 border-red-300 text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition">
                                    <i class="fas fa-trash ml-2"></i>
                                    مسح الكل
                                </button>
                            </div>
                        </div>
                    </nav>
                </header>

                <!-- Main Content -->
                <main class="container mx-auto px-4 py-8">
                    <div id="order-summary-page-content">
                        ${this.generateOrderSummaryContent()}
                    </div>
                </main>

                <!-- Footer -->
                <footer class="bg-gray-800 text-white py-8 mt-16">
                    <div class="container mx-auto px-4 text-center">
                        <p>&copy; 2024 متجر العبايات الراقية. جميع الحقوق محفوظة</p>
                    </div>
                </footer>

                <script>
                    // Pass current customer's designs to the page
                    const currentCustomerId = '${this.customerId}';
                    const currentDesigns = ${JSON.stringify(this.savedDesigns)};
                    
                    // Load designs from localStorage
                    function loadDesignsFromStorage() {
                        try {
                            const storageKey = 'abayas-saved-designs-' + currentCustomerId;
                            const saved = localStorage.getItem(storageKey);
                            if (saved) {
                                return JSON.parse(saved);
                            }
                        } catch (error) {
                            console.error('Error loading designs:', error);
                        }
                        return currentDesigns;
                    }
                    
                    // Initialize with current designs
                    let savedDesigns = loadDesignsFromStorage();
                    
                    // Update designs count
                    function updateDesignsCount() {
                        let totalDesigns = 0;
                        Object.keys(savedDesigns).forEach(partType => {
                            const designs = savedDesigns[partType];
                            if (Array.isArray(designs)) {
                                totalDesigns += designs.length;
                            } else if (designs) {
                                totalDesigns += 1;
                            }
                        });
                        
                        const countElement = document.getElementById('designs-count');
                        if (countElement) {
                            countElement.textContent = totalDesigns;
                        }
                    }
                    
                    // Get part name in Arabic
                    function getPartName(partType) {
                        const names = {
                            'main-body': 'الجسم الرئيسي',
                            'scarf': 'الوشاح',
                            'hat': 'القبعة',
                            'sleeves': 'الأكمام'
                        };
                        return names[partType] || partType;
                    }
                    
                    // Calculate total price
                    function calculateTotalPrice() {
                        let total = 0;
                        Object.keys(savedDesigns).forEach(partType => {
                            const designs = savedDesigns[partType];
                            if (Array.isArray(designs)) {
                                designs.forEach(design => {
                                    if (design.basePrice) {
                                        total += design.basePrice;
                                    }
                                });
                            } else if (designs && designs.basePrice) {
                                total += designs.basePrice;
                            }
                        });
                        return total.toLocaleString('ar-SA');
                    }
                    
                    // Delete specific design
                    function deleteDesign(partType, designId = null) {
                        if (confirm(\`هل أنت متأكد من حذف تصميم \${getPartName(partType)}؟\`)) {
                            if (designId && Array.isArray(savedDesigns[partType])) {
                                // Delete specific design by ID
                                savedDesigns[partType] = savedDesigns[partType].filter(design => design.id !== designId);
                                
                                // If no designs left for this part, remove the part key
                                if (savedDesigns[partType].length === 0) {
                                    delete savedDesigns[partType];
                                }
                            } else {
                                // Legacy support - delete entire part
                                delete savedDesigns[partType];
                            }
                            
                            // Update localStorage
                            const storageKey = 'abayas-saved-designs-' + currentCustomerId;
                            localStorage.setItem(storageKey, JSON.stringify(savedDesigns));
                            
                            updateDesignsCount();
                            refreshOrderSummary();
                            
                            // Show notification
                            showNotification(\`تم حذف تصميم \${getPartName(partType)}\`, 'info');
                        }
                    }
                    
                    // Clear all designs
                    function clearAllDesigns() {
                        if (confirm('هل أنت متأكد من مسح جميع التصاميم؟')) {
                            savedDesigns = {};
                            
                            // Update localStorage
                            const storageKey = 'abayas-saved-designs-' + currentCustomerId;
                            localStorage.setItem(storageKey, JSON.stringify(savedDesigns));
                            
                            updateDesignsCount();
                            refreshOrderSummary();
                            
                            // Show notification
                            showNotification('تم مسح جميع التصاميم', 'info');
                        }
                    }
                    
                    // Show notification
                    function showNotification(message, type = 'success') {
                        const notification = document.createElement('div');
                        const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
                        notification.className = \`fixed top-4 right-4 \${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 font-semibold\`;
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
                    
                    // Refresh order summary content
                    function refreshOrderSummary() {
                        const content = document.getElementById('order-summary-page-content');
                        if (content) {
                            content.innerHTML = generateOrderSummaryContent();
                        }
                    }
                    
                    // Generate order summary content (simplified version)
                    function generateOrderSummaryContent() {
                        const parts = ['main-body', 'scarf', 'hat', 'sleeves'];
                        let hasAnyDesign = false;
                        
                        let html = \`
                            <div class="space-y-6">
                                <div class="text-center mb-8">
                                    <h3 class="text-3xl font-bold text-gray-800 mb-4">ملخص طلبك المخصص</h3>
                                    <p class="text-gray-600">مراجعة كاملة لجميع أجزاء العباية المصممة</p>
                                    <div class="mt-4 flex justify-center gap-4">
                                        <div class="bg-purple-100 px-4 py-2 rounded-lg">
                                            <span class="text-purple-800 font-semibold">عدد التصاميم: \${getTotalDesignsCount()}</span>
                                        </div>
                                        <div class="bg-green-100 px-4 py-2 rounded-lg">
                                            <span class="text-green-800 font-semibold">السعر الإجمالي: \${calculateTotalPrice()} ريال</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="space-y-6">
                        \`;
                        
                        parts.forEach(partType => {
                            const designs = savedDesigns[partType];
                            if (designs && (Array.isArray(designs) ? designs.length > 0 : designs)) {
                                hasAnyDesign = true;
                                html += generatePartSection(partType, designs);
                            }
                        });
                        
                        html += \`</div>\`;
                        
                        if (!hasAnyDesign) {
                            html += \`
                                <div class="text-center py-12">
                                    <div class="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-8">
                                        <i class="fas fa-info-circle text-yellow-600 text-4xl mb-4"></i>
                                        <p class="text-yellow-800 text-lg">لم يتم تصميم أي جزء بعد</p>
                                        <p class="text-yellow-600 mt-2">قم بتصميم الأجزاء أولاً ثم عد هنا</p>
                                    </div>
                                </div>
                            \`;
                        } else {
                            html += \`
                                <div class="mt-8 p-6 bg-purple-50 rounded-xl">
                                    <div class="flex justify-between items-center mb-4">
                                        <h4 class="text-xl font-bold text-gray-800">السعر الإجمالي</h4>
                                        <span class="text-2xl font-bold text-purple-600">\${calculateTotalPrice()} ريال</span>
                                    </div>
                                    
                                    <div class="flex gap-4">
                                        <button onclick="clearAllDesigns()" class="border-2 border-red-300 text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-red-50 transition">
                                            <i class="fas fa-trash ml-2"></i>
                                            مسح الكل
                                        </button>
                                        <button onclick="sendToDesigner()" class="btn-primary text-white px-8 py-3 rounded-lg font-semibold flex-1">
                                            <i class="fas fa-paper-plane ml-2"></i>
                                            إرسال للمصمم
                                        </button>
                                    </div>
                                </div>
                            \`;
                        }
                        
                        html += \`</div>\`;
                        return html;
                    }
                    
                    // Generate section for a part with multiple designs
                    function generatePartSection(partType, designs) {
                        const partName = getPartName(partType);
                        const partIcons = {
                            'main-body': 'fa-tshirt',
                            'scarf': 'fa-scroll',
                            'hat': 'fa-hat-wizard',
                            'sleeves': 'fa-mitten'
                        };

                        let html = \`
                            <div class="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
                                <div class="flex items-center justify-between mb-4">
                                    <div class="flex items-center">
                                        <div class="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center ml-4">
                                            <i class="fas \${partIcons[partType]} text-purple-600 text-xl"></i>
                                        </div>
                                        <div>
                                            <h4 class="text-xl font-bold text-gray-800">\${partName}</h4>
                                            <p class="text-sm text-gray-600">\${Array.isArray(designs) ? designs.length + ' تصميم' : 'تصميم واحد'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="space-y-4">
                        \`;

                        if (Array.isArray(designs)) {
                            // Multiple designs for this part
                            designs.forEach((design, index) => {
                                html += generateDesignCard(partType, design, index + 1);
                            });
                        } else {
                            // Single design (legacy support)
                            html += generateDesignCard(partType, designs, 1);
                        }

                        html += \`
                                </div>
                                
                                <div class="mt-4 pt-4 border-t">
                                    <button onclick="window.location.href='index.html'" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition">
                                        <i class="fas fa-plus ml-2"></i>
                                        إضافة تصميم جديد
                                    </button>
                                </div>
                            </div>
                        \`;

                        return html;
                    }
                    
                    // Generate individual design card
                    function generateDesignCard(partType, design, designNumber) {
                        return \`
                            <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                <div class="flex justify-between items-start mb-3">
                                    <div class="flex items-center">
                                        <span class="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full font-semibold">
                                            تصميم \${designNumber}
                                        </span>
                                        \${design.createdAt ? \`
                                            <span class="text-xs text-gray-500 mr-2">
                                                <i class="fas fa-clock ml-1"></i>
                                                \${new Date(design.createdAt).toLocaleString('ar-SA', { 
                                                    hour: '2-digit', 
                                                    minute: '2-digit' 
                                                })}
                                            </span>
                                        \` : ''}
                                    </div>
                                    <button onclick="deleteDesign('\${partType}', '\${design.id || ''}')" class="text-red-500 hover:text-red-700 transition">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                                
                                <div class="space-y-2">
                                    \${design.styles ? \`
                                        <div class="flex justify-between items-center">
                                            <span class="text-gray-600 text-sm">النمط:</span>
                                            <span class="font-semibold text-sm">\${design.styles.name || 'غير محدد'}</span>
                                        </div>
                                    \` : ''}
                                    
                                    \${design.shape ? \`
                                        <div class="flex justify-between items-center">
                                            <span class="text-gray-600 text-sm">الشكل:</span>
                                            <span class="font-semibold text-sm">\${design.shape.name || 'غير محدد'}</span>
                                        </div>
                                    \` : ''}
                                    
                                    \${design.fabrics ? \`
                                        <div class="flex justify-between items-center">
                                            <span class="text-gray-600 text-sm">القماش:</span>
                                            <span class="font-semibold text-sm">\${design.fabrics.name || 'غير محدد'}</span>
                                        </div>
                                    \` : ''}
                                </div>
                                
                                <div class="mt-3 pt-3 border-t flex justify-between items-center">
                                    <span class="text-purple-600 font-bold">\${design.basePrice || 0} ريال</span>
                                    <button onclick="window.location.href='index.html'" class="text-blue-600 hover:text-blue-700 text-sm">
                                        <i class="fas fa-edit ml-1"></i>
                                        تعديل
                                    </button>
                                </div>
                            </div>
                        \`;
                    }
                    
                    // Get total designs count across all parts
                    function getTotalDesignsCount() {
                        let total = 0;
                        Object.keys(savedDesigns).forEach(partType => {
                            const designs = savedDesigns[partType];
                            if (Array.isArray(designs)) {
                                total += designs.length;
                            } else if (designs) {
                                total += 1;
                            }
                        });
                        return total;
                    }
                    
                    // Send to designer function
                    function sendToDesigner() {
                        const orderData = {
                            designs: savedDesigns,
                            customerId: currentCustomerId,
                            totalPrice: calculateTotalPrice(),
                            timestamp: new Date().toISOString(),
                            customerInfo: {
                                name: 'عميل',
                                phone: '05xxxxxxxx',
                                email: 'customer@example.com'
                            }
                        };

                        // Save order to localStorage
                        const ordersKey = 'abayas-orders-' + currentCustomerId;
                        const orders = JSON.parse(localStorage.getItem(ordersKey) || '[]');
                        orders.push(orderData);
                        localStorage.setItem(ordersKey, JSON.stringify(orders));

                        // Clear designs after sending
                        savedDesigns = {};
                        const storageKey = 'abayas-saved-designs-' + currentCustomerId;
                        localStorage.setItem(storageKey, JSON.stringify(savedDesigns));
                        
                        updateDesignsCount();
                        refreshOrderSummary();
                        
                        showNotification('تم إرسال طلبك للمصمم بنجاح! سنتواصل معك قريباً.', 'success');
                    }
                    
                    // Initialize on page load
                    document.addEventListener('DOMContentLoaded', () => {
                        updateDesignsCount();
                        refreshOrderSummary();
                    });
                </script>
            </body>
            </html>
        `;
        
        // Write content to same window
        newWindow.document.write(pageContent);
        newWindow.document.close();
    }
}

// Initialize order summary globally
let orderSummary;
document.addEventListener('DOMContentLoaded', () => {
    orderSummary = new OrderSummary();
    window.orderSummary = orderSummary;
});
