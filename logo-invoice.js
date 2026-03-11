// Logo Invoice System
class LogoInvoiceSystem {
    constructor() {
        this.invoiceNumber = this.generateInvoiceNumber();
        this.currentInvoice = {
            number: this.invoiceNumber,
            date: new Date().toISOString(),
            type: 'logo',
            customer: {},
            fabric: {},
            pricing: {},
            delivery: {},
            orderType: '',
            notes: '',
            total: 0,
            savedAt: ''
        };
        this.isPrinting = false;
        
        this.init();
    }

    // Initialize the invoice system
    init() {
        console.log('Starting logo invoice system initialization...');
        
        try {
            this.setupEventListeners();
            this.updateInvoiceDisplay();
            this.loadSavedInvoices();
            console.log('✅ Logo invoice system initialized successfully!');
        } catch (error) {
            console.error('❌ Error initializing logo invoice system:', error);
        }
    }

    // Generate unique invoice number
    generateInvoiceNumber() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000);
        return `LOGO-${year}${month}${day}-${random}`;
    }

    // Setup event listeners
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Note: Save button is handled by onclick in HTML
        
        // Print button
        const printBtn = document.getElementById('print-invoice-btn');
        if (printBtn) {
            printBtn.addEventListener('click', () => this.printInvoice());
        }

        // Clear button
        const clearBtn = document.getElementById('clear-invoice-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearInvoice());
        }

        // Form inputs
        this.setupFormListeners();
    }

    // Setup form listeners
    setupFormListeners() {
        // Customer info
        const customerName = document.getElementById('customer-name');
        const customerPhone = document.getElementById('customer-phone');
        
        if (customerName) {
            customerName.addEventListener('input', () => this.updateInvoiceDisplay());
        }
        if (customerPhone) {
            customerPhone.addEventListener('input', () => this.updateInvoiceDisplay());
        }

        // Logo info
        const logoType = document.getElementById('logo-type');
        const logoColors = document.getElementById('logo-colors');
        const logoDimensions = document.getElementById('logo-dimensions');
        
        if (logoType) {
            logoType.addEventListener('change', () => this.updateInvoiceDisplay());
        }
        if (logoColors) {
            logoColors.addEventListener('input', () => this.updateInvoiceDisplay());
        }
        if (logoDimensions) {
            logoDimensions.addEventListener('input', () => this.updateInvoiceDisplay());
        }

        // Pricing
        const price = document.getElementById('price');
        const paid = document.getElementById('paid');
        
        if (price) {
            price.addEventListener('input', () => this.calculateRemaining());
        }
        if (paid) {
            paid.addEventListener('input', () => this.calculateRemaining());
        }

        // Delivery info
        const deliveryMethod = document.getElementById('delivery-method');
        const deliveryAddress = document.getElementById('delivery-address');
        const deliveryTime = document.getElementById('delivery-time');
        
        if (deliveryMethod) {
            deliveryMethod.addEventListener('change', () => this.updateInvoiceDisplay());
        }
        if (deliveryAddress) {
            deliveryAddress.addEventListener('input', () => this.updateInvoiceDisplay());
        }
        if (deliveryTime) {
            deliveryTime.addEventListener('change', () => this.updateInvoiceDisplay());
        }

        // Additional info
        const notes = document.getElementById('notes');
        const status = document.getElementById('invoice-status');
        
        if (notes) {
            notes.addEventListener('input', () => this.updateInvoiceDisplay());
        }
        if (status) {
            status.addEventListener('change', () => this.updateInvoiceDisplay());
        }
    }

    // Calculate remaining amount
    calculateRemaining() {
        const priceInput = document.getElementById('price');
        const paidInput = document.getElementById('paid');
        const remainingInput = document.getElementById('remaining');
        
        if (priceInput && paidInput && remainingInput) {
            const price = parseFloat(priceInput.value) || 0;
            const paid = parseFloat(paidInput.value) || 0;
            const remaining = price - paid;
            
            remainingInput.value = remaining >= 0 ? remaining.toFixed(2) : '0.00';
        }
    }

    // Update invoice display
    updateInvoiceDisplay() {
        console.log('Updating invoice display...');
        
        const customerName = document.getElementById('customer-name')?.value || '';
        const invoiceNumber = document.getElementById('invoice-number');
        
        if (invoiceNumber) {
            invoiceNumber.textContent = this.currentInvoice.number;
        }
        
        // Update other display elements as needed
        console.log('Invoice display updated');
    }

    // Save invoice
    saveInvoice() {
        console.log('Saving invoice...');
        
        try {
            // Collect form data
            const formData = this.collectFormData();
            
            // Validate
            if (!this.validateFormData(formData)) {
                this.showNotification('يرجى ملء جميع الحقول المطلوبة', 'error');
                return;
            }
            
            // Save to localStorage
            this.saveToLocalStorage(formData);
            
            // Show success message
            this.showNotification('تم حفظ الفاتورة بنجاح', 'success');
            
            console.log('✅ Invoice saved successfully!');
            
            // Redirect to issued invoices page after successful save
            setTimeout(() => {
                window.location.href = 'issued-invoices.html';
            }, 2000);
            
        } catch (error) {
            console.error('❌ Error saving invoice:', error);
            this.showNotification('حدث خطأ أثناء حفظ الفاتورة', 'error');
        }
    }

    // Collect form data
    collectFormData() {
        return {
            number: this.currentInvoice.number,
            date: new Date().toISOString(),
            type: 'logo', // <-- إضافة نوع الفاتورة
            customerName: document.getElementById('customer-name')?.value || '',
            customerPhone: document.getElementById('customer-phone')?.value || '',
            fabric: document.getElementById('fabric')?.value || '',
            side1: document.getElementById('side1')?.value || '',
            side2: document.getElementById('side2')?.value || '',
            back: document.getElementById('back')?.value || '',
            embroideryColor: document.getElementById('embroidery-color')?.value || '',
            fontType: document.getElementById('font-type')?.value || '',
            price: document.getElementById('price')?.value || '0',
            paid: document.getElementById('paid')?.value || '0',
            remaining: document.getElementById('remaining')?.value || '0',
            deliveryDate: document.getElementById('delivery-date')?.value || '',
            deliveryDay: document.getElementById('delivery-day')?.value || '',
            notes: document.getElementById('notes')?.value || '',
            status: document.getElementById('invoice-status')?.value || 'pending'
        };
    }

    // Validate form data
    validateFormData(data) {
        // Only validate customer fields as required
        if (data.customerName.trim() === '') {
            this.showNotification('يرجى إدخال اسم العميل', 'error');
            document.getElementById('name-error').classList.remove('hidden');
            return false;
        }
        
        if (data.customerPhone.trim() === '') {
            this.showNotification('يرجى إدخال رقم الهاتف', 'error');
            document.getElementById('phone-error').classList.remove('hidden');
            return false;
        }
        
        // Hide error messages if validation passes
        document.getElementById('name-error').classList.add('hidden');
        document.getElementById('phone-error').classList.add('hidden');
        
        return true;
    }

    // Save to localStorage
    saveToLocalStorage(data) {
        // Save to both issued-invoices and logo-invoices for proper counting
        const issuedInvoices = JSON.parse(localStorage.getItem('issued-invoices') || '[]');
        issuedInvoices.push(data);
        localStorage.setItem('issued-invoices', JSON.stringify(issuedInvoices));
        
        // Also save to logo-invoices for statistics
        const logoInvoices = JSON.parse(localStorage.getItem('logo-invoices') || '[]');
        logoInvoices.push(data);
        localStorage.setItem('logo-invoices', JSON.stringify(logoInvoices));
    }

    // Print invoice
    printInvoice() {
        if (this.isPrinting) {
            console.log('Already printing...');
            return;
        }
        
        this.isPrinting = true;
        console.log('Printing invoice...');
        
        // Create printable content with logo
        const printContent = this.createPrintableInvoice();
        
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
            this.isPrinting = false;
        }, 1000);
    }

    // Create printable invoice
    createPrintableInvoice() {
        const data = this.collectFormData();
        const customerName = data.customerName || 'غير محدد';
        const customerPhone = data.customerPhone || 'غير محدد';
        const customerAddress = data.customerAddress || 'غير محدد';
        
        return `
            <!DOCTYPE html>
            <html dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>فاتورة رقم ${data.number}</title>
                <style>
                    body { font-family: Arial, sans-serif; direction: rtl; margin: 0; padding: 20px; }
                    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
                    .invoice-info { margin-bottom: 20px; }
                    .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                    .customer-info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
                    .logo { width: 120px; height: 120px; object-fit: contain; margin-bottom: 20px; display: block; margin-left: auto; margin-right: auto; }
                    @media print { body { padding: 10px; } }
                </style>
            </head>
            <body>
                <div class="header">
                    <img src="images/logo.webp" alt="السهم" class="logo">
                    <h1>فاتورة تصميم الشعار</h1>
                    <h2 class="title">رقم: ${data.number}</h2>
                    <p>التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
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
                
                <div class="invoice-info">
                    <h3>تفاصيل الفاتورة</h3>
                    <div class="info-row">
                        <span>القماش:</span>
                        <span>${data.fabric || 'غير محدد'}</span>
                    </div>
                    <div class="info-row">
                        <span>الجهة الأولى:</span>
                        <span>${data.side1 || 'غير محدد'}</span>
                    </div>
                    <div class="info-row">
                        <span>الجهة الثانية:</span>
                        <span>${data.side2 || 'غير محدد'}</span>
                    </div>
                    <div class="info-row">
                        <span>الخلف:</span>
                        <span>${data.back || 'غير محدد'}</span>
                    </div>
                    <div class="info-row">
                        <span>لون التطريز:</span>
                        <span>${data.embroideryColor || 'غير محدد'}</span>
                    </div>
                    <div class="info-row">
                        <span>نوع الخط:</span>
                        <span>${data.fontType || 'غير محدد'}</span>
                    </div>
                    <div class="info-row">
                        <span>السعر:</span>
                        <span>${data.price || '0'} ريال</span>
                    </div>
                    <div class="info-row">
                        <span>المدفوع:</span>
                        <span>${data.paid || '0'} ريال</span>
                    </div>
                    <div class="info-row">
                        <span>الباقي:</span>
                        <span>${data.remaining || '0'} ريال</span>
                    </div>
                    ${data.notes ? `
                    <div class="info-row">
                        <span>ملاحظات:</span>
                        <span>${data.notes}</span>
                    </div>
                    ` : ''}
                </div>
            </body>
            </html>
        `;
    }

    // Clear invoice
    clearInvoice() {
        if (confirm('هل أنت متأكد من مسح الفاتورة الحالية؟')) {
            this.currentInvoice = {
                number: this.generateInvoiceNumber(),
                date: new Date().toISOString(),
                type: 'logo',
                customer: {},
                fabric: {},
                pricing: {},
                delivery: {},
                orderType: '',
                notes: '',
                total: 0,
                savedAt: ''
            };
            
            // Clear form
            const form = document.getElementById('invoice-form');
            if (form) {
                form.reset();
            }
            
            this.updateInvoiceDisplay();
            this.showNotification('تم مسح الفاتورة', 'info');
        }
    }

    // Load saved invoices
    loadSavedInvoices() {
        try {
            const invoices = JSON.parse(localStorage.getItem('logo-invoices') || '[]');
            console.log(`Loaded ${invoices.length} saved invoices`);
        } catch (error) {
            console.error('Error loading saved invoices:', error);
        }
    }

    // Show notification
    showNotification(message, type = 'info') {
        console.log('Showing notification:', message, type);
        
        try {
            // Create notification element
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
                type === 'success' ? 'bg-green-500' : 
                type === 'error' ? 'bg-red-500' : 'bg-blue-500'
            } text-white`;
            notification.innerHTML = `
                <div class="flex items-center">
                    <i class="fas ${
                        type === 'success' ? 'fa-check-circle' : 
                        type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'
                    } ml-2"></i>
                    <span>${message}</span>
                </div>
            `;
            
            // Add to page
            document.body.appendChild(notification);
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
            
            console.log('✅ Notification displayed successfully');
        } catch (error) {
            console.error('❌ Error showing notification:', error);
            // Fallback to alert
            alert(message);
        }
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the logo invoice page
    if (window.location.pathname.endsWith('logo-invoice.html')) {
        console.log('Logo invoice page loaded');
        
        try {
            window.logoInvoiceSystem = new LogoInvoiceSystem();
            console.log('✅ Logo invoice system initialized successfully!');
        } catch (error) {
            console.error('❌ Error initializing logo invoice system:', error);
        }
    }
});

// Global functions for button onclick
window.handleFabricTypeChange = function() {
    console.log('Fabric type changed');
};

window.handleFabricSideChange = function() {
    console.log('Fabric side changed');
};

// Global save function for button onclick
window.saveLogoInvoice = function() {
    console.log('Save button clicked!');
    if (window.logoInvoiceSystem) {
        window.logoInvoiceSystem.saveInvoice();
    } else {
        console.error('❌ Logo invoice system not available!');
    }
};

// Global print function for button onclick
window.printLogoInvoice = function() {
    console.log('Print button clicked!');
    if (window.logoInvoiceSystem) {
        window.logoInvoiceSystem.printInvoice();
    } else {
        console.error('❌ Logo invoice system not available!');
    }
};
