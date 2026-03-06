// Issued Invoices Management System
class IssuedInvoicesSystem {
    constructor() {
        this.invoices = [];
        this.currentFilter = 'all';
        this.currentTypeFilter = 'all';
        this.init();
    }

    // Initialize system
    init() {
        try {
            // Check if user is authenticated
            if (!this.isAuthenticated()) {
                this.showAuthRequiredMessage();
                return;
            }
            
            // Add logout listener to force redirect
            this.setupLogoutListener();
            
            this.loadInvoices();
            this.setupEventListeners();
            this.updateStatistics();
            this.renderInvoices();
        } catch (error) {
            console.error('Error initializing issued invoices system:', error);
        }
    }

    // Setup logout listener
    setupLogoutListener() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                // Force redirect to home page
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 500);
            });
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        const currentUser = sessionStorage.getItem('current_user') || localStorage.getItem('current_user');
        return currentUser !== null;
    }

    // Show authentication required message
    showAuthRequiredMessage() {
        const message = document.createElement('div');
        message.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        message.innerHTML = `
            <div class="bg-white rounded-2xl max-w-md w-full p-8 text-center">
                <div class="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-lock text-red-600 text-3xl"></i>
                </div>
                <h3 class="text-2xl font-bold text-gray-800 mb-4">مطلوب تسجيل الدخول</h3>
                <p class="text-gray-600 mb-6">يجب عليك تسجيل الدخول أو إنشاء حساب جديد للوصول إلى صفحة الفواتير</p>
                <div class="space-y-3">
                    <button onclick="window.location.href='index.html'" class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                        <i class="fas fa-sign-in-alt ml-2"></i>
                        تسجيل الدخول
                    </button>
                    <button onclick="window.location.href='index.html'" class="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
                        <i class="fas fa-user-plus ml-2"></i>
                        إنشاء حساب جديد
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(message);
        
        // Hide table and other elements
        const tableContainer = document.querySelector('.bg-white.rounded-xl.shadow-lg.overflow-hidden');
        if (tableContainer) {
            tableContainer.style.display = 'none';
        }
        
        const filterContainer = document.querySelector('.bg-white.rounded-xl.shadow-lg.p-6');
        if (filterContainer) {
            filterContainer.style.display = 'none';
        }
    }

    // Load invoices from localStorage
    loadInvoices() {
        try {
            // Load only from issued-invoices to avoid duplication
            const issuedInvoices = JSON.parse(localStorage.getItem('issued-invoices') || '[]');
            
            // Normalize invoice structure to ensure customerName exists
            this.invoices = issuedInvoices.map(inv => ({
                ...inv, 
                type: inv.type || 'issued', // استخدام النوع الأصلي إذا موجود
                customerName: inv.customerName || inv.customer?.name || 'N/A',
                customerPhone: inv.customerPhone || inv.customer?.phone || 'N/A',
                customerAddress: inv.customerAddress || inv.customer?.address || 'N/A'
            }));
            
            // Sort by date (newest first)
            this.invoices.sort((a, b) => new Date(b.date) - new Date(a.date));
        } catch (error) {
            console.error('Error loading invoices:', error);
            this.invoices = [];
        }
    }

    // Update statistics
    updateStatistics() {
        try {
            // Count invoices by type - check all loaded invoices
            const logoInvoices = this.invoices.filter(inv => inv.type === 'logo').length;
            const fullDesignInvoices = this.invoices.filter(inv => inv.type === 'full-design').length;
            const totalInvoices = this.invoices.length;
            
            // Also count from localStorage for old invoices that might not have proper type
            const issuedInvoices = JSON.parse(localStorage.getItem('issued-invoices') || '[]');
            const oldFullDesignInvoices = issuedInvoices.filter(inv => 
                !inv.type && (
                    (inv.number && inv.number.toString().includes('FD')) ||
                    (inv.number && inv.number.toString().includes('Full')) ||
                    (inv.customer && inv.designType === 'full-design') ||
                    (inv.orderType && inv.orderType.includes('full'))
                )
            ).length;
            
            // Combine old and new full design invoices
            const totalFullDesignInvoices = fullDesignInvoices + oldFullDesignInvoices;
            
            // Calculate total revenue
            const totalRevenue = this.invoices.reduce((sum, inv) => {
                return sum + (parseFloat(inv.price) || 0);
            }, 0);
            
            // Update DOM elements
            const totalInvoicesElement = document.getElementById('total-invoices');
            const logoInvoicesElement = document.getElementById('logo-invoices');
            const fullDesignInvoicesElement = document.getElementById('full-design-invoices');
            const totalRevenueElement = document.getElementById('total-revenue');
            
            if (totalInvoicesElement) {
                totalInvoicesElement.textContent = totalInvoices;
            }
            
            if (logoInvoicesElement) {
                logoInvoicesElement.textContent = logoInvoices;
            }
            
            if (fullDesignInvoicesElement) {
                fullDesignInvoicesElement.textContent = totalFullDesignInvoices;
            }
            
            if (totalRevenueElement) {
                totalRevenueElement.textContent = `${totalRevenue.toFixed(2)} ريال`;
            }
        } catch (error) {
            console.error('Error updating statistics:', error);
        }
    }

    // Setup event listeners
    setupEventListeners() {
        // Search input
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.searchInvoices(e.target.value));
        }

        // Type filter
        const typeFilter = document.getElementById('type-filter');
        if (typeFilter) {
            typeFilter.addEventListener('change', (e) => this.filterByType(e.target.value));
        }

        // Date filters
        const dateFrom = document.getElementById('date-from');
        const dateTo = document.getElementById('date-to');
        
        if (dateFrom) {
            dateFrom.addEventListener('change', () => this.applyDateFilters());
        }
        
        if (dateTo) {
            dateTo.addEventListener('change', () => this.applyDateFilters());
        }

        // Export button
        const exportBtn = document.getElementById('export-invoices');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportInvoices());
        }
    }

    // Filter by type
    filterByType(type) {
        this.currentTypeFilter = type;
        this.renderInvoices();
    }

    // Apply date filters
    applyDateFilters() {
        this.renderInvoices();
    }

    // Search invoices
    searchInvoices(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            this.renderInvoices();
            return;
        }
        
        searchTerm = searchTerm.toLowerCase().trim();
        
        // Search only by customer name
        const filtered = this.invoices.filter(invoice => 
            invoice.customerName && invoice.customerName.toLowerCase().includes(searchTerm)
        );
        
        this.renderFilteredInvoices(filtered);
    }

    // Render filtered invoices
    renderFilteredInvoices(filteredInvoices) {
        const tbody = document.getElementById('invoices-table-body');
        const noInvoices = document.getElementById('no-invoices');
        
        if (!tbody) return;
        
        if (filteredInvoices.length === 0) {
            tbody.innerHTML = '';
            if (noInvoices) noInvoices.classList.remove('hidden');
            return;
        }
        
        if (noInvoices) noInvoices.classList.add('hidden');
        
        tbody.innerHTML = filteredInvoices.map((invoice, index) => this.createInvoiceRow(invoice, index + 1)).join('');
    }

    // Render invoices
    renderInvoices() {
        const tbody = document.getElementById('invoices-table-body');
        const noInvoices = document.getElementById('no-invoices');
        
        if (!tbody) return;

        const filteredInvoices = this.getFilteredInvoices();
        
        if (filteredInvoices.length === 0) {
            tbody.innerHTML = '';
            if (noInvoices) noInvoices.classList.remove('hidden');
            return;
        }
        
        if (noInvoices) noInvoices.classList.add('hidden');
        
        tbody.innerHTML = filteredInvoices.map((invoice, index) => this.createInvoiceRow(invoice, index + 1)).join('');
    }

    // Create invoice row HTML
    createInvoiceRow(invoice, index) {
        const date = new Date(invoice.date);
        const formattedDate = date.toLocaleDateString('ar-SA');
        const typeLabel = invoice.type === 'logo' ? 'شعار' : 'تصميم كامل';
        const typeColor = invoice.type === 'logo' ? 'purple' : 'pink';
        const statusColor = this.getStatusColor(invoice.status);
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${index}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.number || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${formattedDate}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.customerName || 'N/A'}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full bg-${typeColor}-100 text-${typeColor}-800">
                        ${typeLabel}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.price || '0'} ريال</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.paid || '0'} ريال</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${invoice.remaining || '0'} ريال</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs rounded-full ${statusColor}">
                        ${this.getStatusText(invoice.status)}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <button onclick="viewInvoice('${invoice.number}')" class="text-blue-600 hover:text-blue-900 ml-2">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="printInvoice('${invoice.number}')" class="text-green-600 hover:text-green-900 ml-2">
                        <i class="fas fa-print"></i>
                    </button>
                    <button onclick="deleteInvoice('${invoice.number}')" class="text-red-600 hover:text-red-900 ml-2">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    // Get status color
    getStatusColor(status) {
        const colors = {
            'pending': 'bg-yellow-100 text-yellow-800',
            'processing': 'bg-blue-100 text-blue-800',
            'completed': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800',
            'مدفوعة': 'bg-green-100 text-green-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    }

    // Get status text
    getStatusText(status) {
        const texts = {
            'pending': 'قيد الانتظار',
            'processing': 'قيد المعالجة',
            'completed': 'مكتملة',
            'cancelled': 'ملغاة',
            'مدفوعة': 'مدفوعة'
        };
        return texts[status] || 'غير محدد';
    }

    // Get filtered invoices
    getFilteredInvoices() {
        let filtered = [...this.invoices];
        
        // Filter by type
        if (this.currentTypeFilter && this.currentTypeFilter !== 'all') {
            filtered = filtered.filter(invoice => invoice.type === this.currentTypeFilter);
        }
        
        // Filter by date range
        const dateFrom = document.getElementById('date-from')?.value;
        const dateTo = document.getElementById('date-to')?.value;
        
        if (dateFrom) {
            filtered = filtered.filter(invoice => {
                const invoiceDate = new Date(invoice.date).toISOString().split('T')[0];
                return invoiceDate >= dateFrom;
            });
        }
        
        if (dateTo) {
            filtered = filtered.filter(invoice => {
                const invoiceDate = new Date(invoice.date).toISOString().split('T')[0];
                return invoiceDate <= dateTo;
            });
        }
        
        return filtered;
    }

    // Show invoice details
    showInvoiceDetails(invoiceNumber) {
        // Check if user is authenticated
        if (!this.isAuthenticated()) {
            this.showAuthRequiredMessage();
            return;
        }
        
        const invoice = this.invoices.find(inv => inv.number === invoiceNumber);
        if (!invoice) {
            console.error('Invoice not found:', invoiceNumber);
            return;
        }

        // Create modal dynamically
        const modal = document.createElement('div');
        modal.id = 'invoiceModal';
        modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 hidden';
        
        // Ensure customer data exists
        const customerName = invoice.customer?.name || invoice.customerName || 'غير محدد';
        const customerPhone = invoice.customer?.phone || invoice.customerPhone || 'غير محدد';
        const customerAddress = invoice.customer?.address || invoice.customerAddress || 'غير محدد';
        
        modal.innerHTML = `
            <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-lg bg-white">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-xl font-bold text-gray-800">تفاصيل الفاتورة</h3>
                    <button onclick="closeInvoiceModal()" class="text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                
                <div class="space-y-4">
                    <!-- Invoice Header -->
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-gray-500">رقم الفاتورة</p>
                                <p class="font-semibold">${invoice.number || 'N/A'}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">التاريخ</p>
                                <p class="font-semibold">${new Date(invoice.date).toLocaleDateString('ar-SA')}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">الحالة</p>
                                <p class="font-semibold">${invoice.status || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Customer Information -->
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <h4 class="font-semibold mb-2 text-blue-800">معلومات العميل</h4>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <p class="text-sm text-gray-500">اسم العميل</p>
                                <p class="font-semibold">${customerName}</p>
                            </div>
                            <div>
                                <p class="text-sm text-gray-500">رقم الهاتف</p>
                                <p class="font-semibold">${customerPhone}</p>
                            </div>
                            <div class="col-span-2">
                                <p class="text-sm text-gray-500">العنوان</p>
                                <p class="font-semibold">${customerAddress}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Invoice Items -->
                    <div class="mt-6">
                        <h4 class="font-semibold mb-4">تفاصيل الفاتورة</h4>
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <p class="text-sm text-gray-500">النوع</p>
                                    <p class="font-semibold">${invoice.type === 'logo' ? 'شعار' : 'تصميم كامل'}</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">الإجمالي</p>
                                    <p class="font-semibold">${invoice.price || '0'} ريال</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">المدفوع</p>
                                    <p class="font-semibold">${invoice.paid || '0'} ريال</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">الباقي</p>
                                    <p class="font-semibold">${invoice.remaining || '0'} ريال</p>
                                </div>
                            </div>
                            ${invoice.notes ? `
                            <div class="mt-4">
                                <p class="text-sm text-gray-500">ملاحظات</p>
                                <p class="font-semibold">${invoice.notes}</p>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="mt-6 flex justify-end space-x-reverse space-x-4">
                        <button onclick="closeInvoiceModal()" class="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition">
                            إغلاق
                        </button>
                        <button onclick="printInvoice('${invoice.number}')" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
                            <i class="fas fa-print ml-2"></i>
                            طباعة
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    // Print invoice
    printInvoice(invoiceNumber) {
        // Check if user is authenticated
        if (!this.isAuthenticated()) {
            this.showAuthRequiredMessage();
            return;
        }
        
        try {
            // Find invoice
            const invoice = this.invoices.find(inv => inv.number === invoiceNumber);
            
            if (!invoice) {
                alert('الفاتورة غير موجودة');
                return;
            }
            
            // Create printable content
            const printContent = this.createPrintableInvoice(invoice);
            
            // Create a new document for printing
            const printFrame = document.createElement('iframe');
            printFrame.style.position = 'absolute';
            printFrame.style.top = '-9999px';
            printFrame.style.left = '-9999px';
            printFrame.style.width = '0px';
            printFrame.style.height = '0px';
            printFrame.style.border = 'none';
            
            document.body.appendChild(printFrame);
            
            const printDoc = printFrame.contentDocument || printFrame.contentWindow.document;
            printDoc.open();
            printDoc.write(printContent);
            printDoc.close();
            
            // Print frame
            printFrame.contentWindow.print();
            
            // Remove frame after printing
            setTimeout(() => {
                document.body.removeChild(printFrame);
            }, 1000);
            
        } catch (error) {
            console.error('Error printing invoice:', error);
            alert('حدث خطأ أثناء طباعة الفاتورة');
        }
    }

    // Create printable invoice
    createPrintableInvoice(invoice) {
        const customerName = invoice.customer?.name || invoice.customerName || 'غير محدد';
        const customerPhone = invoice.customer?.phone || invoice.customerPhone || 'غير محدد';
        const customerAddress = invoice.customer?.address || invoice.customerAddress || 'غير محدد';
        
        return `
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>فاتورة رقم ${invoice.number}</title>
                <style>
                    body { font-family: Arial, sans-serif; direction: rtl; margin: 0; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                    .invoice-info { margin-bottom: 20px; }
                    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                    .customer-info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                    @media print { body { padding: 10px; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>فاتورة</h1>
                    <h2 class="title">رقم: ${invoice.number}</h2>
                    <h2>رقم: ${invoice.number}</h2>
                    <p>التاريخ: ${new Date(invoice.date).toLocaleDateString('ar-SA')}</p>
                </div>
                
                <div class="customer-info">
                    <h3>معلومات العميل</h3>
                    <div class="info-row">
                        <span>الاسم:</span>
                        <span>${customerName}</span>
                    </div>
                    <div class="info-row">
                        <span>الهاتف:</span>
                        <span>${customerPhone}</span>
                    </div>
                    <div class="info-row">
                        <span>العنوان:</span>
                        <span>${customerAddress}</span>
                    </div>
                </div>
                
                <div class="info">
                    <h3>تفاصيل الفاتورة</h3>
                    <div class="info-row">
                        <span>النوع:</span>
                        <span>${invoice.type === 'logo' ? 'شعار' : 'تصميم كامل'}</span>
                    </div>
                    <div class="info-row">
                        <span>الإجمالي:</span>
                        <span>${invoice.price || '0'} ريال</span>
                    </div>
                    <div class="info-row">
                        <span>المدفوع:</span>
                        <span>${invoice.paid || '0'} ريال</span>
                    </div>
                    <div class="info-row">
                        <span>الباقي:</span>
                        <span>${invoice.remaining || '0'} ريال</span>
                    </div>
                    <div class="info-row">
                        <span>الحالة:</span>
                        <span>${this.getStatusText(invoice.status)}</span>
                    </div>
                </div>
                
                ${invoice.notes ? `
                <div class="info">
                    <h3>ملاحظات</h3>
                    <p>${invoice.notes}</p>
                </div>
                ` : ''}
            </body>
            </html>
        `;
    }

    // Delete invoice
    deleteInvoice(invoiceNumber) {
        // Check if user is authenticated
        if (!this.isAuthenticated()) {
            this.showAuthRequiredMessage();
            return;
        }
        
        if (!confirm('هل أنت متأكد من حذف هذه الفاتورة؟')) {
            return;
        }
        
        try {
            // Remove from all storage locations
            const storageKeys = ['logo-invoices', 'full-design-invoices', 'issued-invoices'];
            
            storageKeys.forEach(key => {
                const invoices = JSON.parse(localStorage.getItem(key) || '[]');
                const filtered = invoices.filter(inv => inv.number !== invoiceNumber);
                localStorage.setItem(key, JSON.stringify(filtered));
            });
            
            // Reload invoices
            this.loadInvoices();
            this.updateStatistics();
            this.renderInvoices();
            
            this.showNotification('تم حذف الفاتورة بنجاح', 'success');
            
        } catch (error) {
            console.error('Error deleting invoice:', error);
            this.showNotification('حدث خطأ أثناء حذف الفاتورة', 'error');
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
        } text-white`;
        notification.textContent = message;
        notification.style.transform = 'translateX(400px)';
        
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Export invoices
    exportInvoices() {
        // Check if user is authenticated
        if (!this.isAuthenticated()) {
            this.showAuthRequiredMessage();
            return;
        }
        
        try {
            const filteredInvoices = this.getFilteredInvoices();
            
            if (filteredInvoices.length === 0) {
                this.showNotification('لا توجد فواتير للتصدير', 'error');
                return;
            }
            
            // Create CSV content
            const headers = ['رقم الفاتورة', 'التاريخ', 'اسم العميل', 'الهاتف', 'النوع', 'الإجمالي', 'المدفوع', 'الباقي', 'الحالة'];
            const rows = filteredInvoices.map(invoice => [
                invoice.number || 'N/A',
                new Date(invoice.date).toLocaleDateString('ar-SA'),
                invoice.customerName || 'N/A',
                invoice.customerPhone || 'N/A',
                invoice.type === 'logo' ? 'شعار' : 'تصميم كامل',
                invoice.price || '0',
                invoice.paid || '0',
                invoice.remaining || '0',
                this.getStatusText(invoice.status)
            ]);
            
            const csvContent = [headers, ...rows]
                .map(row => row.map(cell => `"${cell}"`).join(','))
                .join('\n');
            
            // Create download link
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `فواتير_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
        } catch (error) {
            console.error('Error exporting invoices:', error);
            alert('حدث خطأ أثناء تصدير الفواتير');
        }
    }

    // Clear filters
    clearFilters() {
        this.currentTypeFilter = 'all';
        
        // Clear filter inputs
        const searchInput = document.getElementById('search-input');
        const typeFilter = document.getElementById('type-filter');
        const dateFrom = document.getElementById('date-from');
        const dateTo = document.getElementById('date-to');
        
        if (searchInput) searchInput.value = '';
        if (typeFilter) typeFilter.value = 'all';
        if (dateFrom) dateFrom.value = '';
        if (dateTo) dateTo.value = '';
        
        this.renderInvoices();
    }
}

// Global functions
window.viewInvoice = function(invoiceNumber) {
    if (window.issuedInvoicesSystem) {
        window.issuedInvoicesSystem.showInvoiceDetails(invoiceNumber);
    }
};

window.printInvoice = function(invoiceNumber) {
    if (window.issuedInvoicesSystem) {
        window.issuedInvoicesSystem.printInvoice(invoiceNumber);
    }
};

window.deleteInvoice = function(invoiceNumber) {
    if (window.issuedInvoicesSystem) {
        window.issuedInvoicesSystem.deleteInvoice(invoiceNumber);
    }
};

window.exportInvoices = function() {
    if (window.issuedInvoicesSystem) {
        window.issuedInvoicesSystem.exportInvoices();
    }
};

window.clearFilters = function() {
    if (window.issuedInvoicesSystem) {
        window.issuedInvoicesSystem.clearFilters();
    }
};

window.closeInvoiceModal = function() {
    const modal = document.getElementById('invoiceModal');
    if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        // Remove modal from DOM after animation
        setTimeout(() => {
            if (modal && modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the issued invoices page
    if (window.location.pathname.endsWith('issued-invoices.html')) {
        console.log('Issued invoices page loaded');
        
        try {
            window.issuedInvoicesSystem = new IssuedInvoicesSystem();
            console.log('✅ Issued invoices system initialized successfully!');
        } catch (error) {
            console.error('❌ Error initializing issued invoices system:', error);
        }
    } else {
        console.log('Not on issued invoices page, skipping initialization');
    }
});
