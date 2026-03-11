// Full Design Invoice System
class FullDesignInvoiceSystem {
    constructor() {
        this.invoiceNumber = this.generateInvoiceNumber();
        this.currentInvoice = {
            number: this.invoiceNumber,
            date: new Date().toISOString(),
            customer: {},
            components: {
                body: { type: '', size: '', color: '', price: 0, details: '' },
                scarf: { type: '', color: '', size: '', price: 0, details: '' },
                hat: { type: '', color: '', shape: '', price: 0, details: '' },
                sleeves: { type: '', color: '', length: '', price: 0, details: '' }
            },
            total: 0,
            notes: ''
        };
        
        this.init();
    }

    // Initialize invoice system
    init() {
        // Check if user is authenticated
        if (!this.isAuthenticated()) {
            this.showAuthRequiredMessage();
            return;
        }
        
        // Add logout listener to force redirect
        this.setupLogoutListener();
        
        this.setupEventListeners();
        this.updateInvoiceDisplay();
        this.setupPricingCalculation();
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
                <p class="text-gray-600 mb-6">يجب عليك تسجيل الدخول أو إنشاء حساب جديد للوصول إلى صفحة إنشاء الفواتير</p>
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
        
        // Hide form and other elements
        const formContainer = document.querySelector('.container.mx-auto');
        if (formContainer) {
            formContainer.style.display = 'none';
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

    // Setup pricing calculation
    setupPricingCalculation() {
        // Add input event listeners to component price fields
        const componentFields = ['body-price', 'scarf-price', 'hat-price', 'sleeves-price'];
        componentFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                element.addEventListener('input', () => {
                    this.calculateTotalFromComponents();
                });
            }
        });

        // Add input event listener to total price field
        const totalPriceElement = document.getElementById('total-price');
        if (totalPriceElement) {
            totalPriceElement.addEventListener('input', () => {
                this.calculateRemainingAmount();
            });
        }

        // Add input event listener to paid amount field
        const paidElement = document.getElementById('paid-amount');
        if (paidElement) {
            paidElement.addEventListener('input', () => {
                this.calculateRemainingAmount();
            });
        }
    }

    // Calculate total from component prices
    calculateTotalFromComponents() {
        const bodyPrice = parseFloat(document.getElementById('body-price')?.value || 0);
        const scarfPrice = parseFloat(document.getElementById('scarf-price')?.value || 0);
        const hatPrice = parseFloat(document.getElementById('hat-price')?.value || 0);
        const sleevesPrice = parseFloat(document.getElementById('sleeves-price')?.value || 0);
        
        const total = bodyPrice + scarfPrice + hatPrice + sleevesPrice;
        
        // Update component totals
        document.getElementById('body-total').textContent = `${total.toFixed(2)} ريال`;
        document.getElementById('scarf-total').textContent = `${scarfPrice.toFixed(2)} ريال`;
        document.getElementById('hat-total').textContent = `${hatPrice.toFixed(2)} ريال`;
        document.getElementById('sleeves-total').textContent = `${sleevesPrice.toFixed(2)} ريال`;
        
        // Update summary
        document.getElementById('subtotal').textContent = `${total.toFixed(2)} ريال`;
        document.getElementById('grand-total').textContent = `${total.toFixed(2)} ريال`;
        
        // Update total price input
        const totalPriceInput = document.getElementById('total-price');
        if (totalPriceInput) {
            totalPriceInput.value = total.toFixed(2);
        }
        
        // Calculate remaining
        this.calculateRemainingAmount();
    }

    // Calculate remaining amount
    calculateRemainingAmount() {
        const totalPrice = parseFloat(document.getElementById('total-price')?.value || 0);
        const paidAmount = parseFloat(document.getElementById('paid-amount')?.value || 0);
        const remaining = totalPrice - paidAmount;
        
        const remainingInput = document.getElementById('remaining-amount');
        if (remainingInput) {
            remainingInput.value = remaining.toFixed(2);
        }
    }

    // Generate invoice number
    generateInvoiceNumber() {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `FD-${year}${month}${day}-${random}`;
    }

    // Setup event listeners
    setupEventListeners() {
        // Price inputs change
        const priceInputs = ['body-price', 'scarf-price', 'hat-price', 'sleeves-price'];
        priceInputs.forEach(id => {
            document.getElementById(id)?.addEventListener('input', () => this.calculateTotalFromComponents());
        });
        
        // Pricing section inputs change
        document.getElementById('total-price')?.addEventListener('input', () => this.calculateRemainingAmount());
        document.getElementById('paid-amount')?.addEventListener('input', () => this.calculateRemainingAmount());
    }

    // Update invoice display
    updateInvoiceDisplay() {
        document.getElementById('invoice-number').textContent = this.invoiceNumber;
        document.getElementById('invoice-date').textContent = this.formatDate(new Date());
    }

    // Format date
    formatDate(date) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('ar-SA', options);
    }

    // Calculate total
    calculateTotal() {
        const bodyPrice = parseFloat(document.getElementById('body-price')?.value || 0);
        const scarfPrice = parseFloat(document.getElementById('scarf-price')?.value || 0);
        const hatPrice = parseFloat(document.getElementById('hat-price')?.value || 0);
        const sleevesPrice = parseFloat(document.getElementById('sleeves-price')?.value || 0);
        
        const total = bodyPrice + scarfPrice + hatPrice + sleevesPrice;
        
        // Update component totals
        document.getElementById('body-total').textContent = `${bodyPrice.toFixed(2)} ريال`;
        document.getElementById('scarf-total').textContent = `${scarfPrice.toFixed(2)} ريال`;
        document.getElementById('hat-total').textContent = `${hatPrice.toFixed(2)} ريال`;
        document.getElementById('sleeves-total').textContent = `${sleevesPrice.toFixed(2)} ريال`;
        
        // Update summary
        document.getElementById('subtotal').textContent = `${total.toFixed(2)} ريال`;
        document.getElementById('grand-total').textContent = `${total.toFixed(2)} ريال`;
        
        // Update total price input
        const totalPriceInput = document.getElementById('total-price');
        if (totalPriceInput) {
            totalPriceInput.value = total.toFixed(2);
            // Calculate remaining after updating total
            this.calculateRemainingAmount();
        }
    }

    // Save invoice
    saveInvoice() {
        try {
            console.log('Starting save invoice process...');
            
            // Validate customer data
            const customerName = document.getElementById('customer-name')?.value?.trim();
            const customerPhone = document.getElementById('customer-phone')?.value?.trim();
            const customerAddress = document.getElementById('customer-address')?.value?.trim();
            
            // Check if required fields are empty
            if (!customerName || !customerPhone || !customerAddress) {
                this.showNotification('يرجى إكمال جميع بيانات العميل قبل حفظ الفاتورة', 'error');
                return;
            }
            
            // Collect prices
            const bodyPrice = parseFloat(document.getElementById('body-price')?.value || 0);
            const scarfPrice = parseFloat(document.getElementById('scarf-price')?.value || 0);
            const hatPrice = parseFloat(document.getElementById('hat-price')?.value || 0);
            const sleevesPrice = parseFloat(document.getElementById('sleeves-price')?.value || 0);
            
            // Calculate total from components (not from display field)
            const totalPrice = bodyPrice + scarfPrice + hatPrice + sleevesPrice;
            
            // Also get total from display field to ensure consistency
            const displayTotal = parseFloat(document.getElementById('total-price')?.value || 0);
            const finalTotal = Math.max(totalPrice, displayTotal); // Use the higher value
            
            // Collect paid and remaining amounts from display fields
            const paidAmount = parseFloat(document.getElementById('paid-amount')?.value || 0);
            const remainingAmount = parseFloat(document.getElementById('remaining-amount')?.value || 0);
            
            // Validate customer data only
            if (!customerName || !customerPhone || !customerAddress) {
                this.showNotification('يرجى إكمال جميع بيانات العميل قبل حفظ الفاتورة', 'error');
                return;
            }
            
            // Validate that total is not zero
            if (finalTotal <= 0) {
                this.showNotification('يرجى إدخال أسعار المكونات قبل حفظ الفاتورة', 'error');
                return;
            }
            
            // Create invoice object
            const newInvoice = {
                number: this.currentInvoice.number,
                date: this.currentInvoice.date,
                customer: {
                    name: customerName,
                    phone: customerPhone,
                    address: customerAddress
                },
                components: {
                    body: {
                        type: document.getElementById('body-type')?.value || '',
                        size: document.getElementById('body-size')?.value || '',
                        color: document.getElementById('body-color')?.value || '',
                        price: bodyPrice,
                        details: document.getElementById('body-details')?.value || ''
                    },
                    scarf: {
                        type: document.getElementById('scarf-type')?.value || '',
                        color: document.getElementById('scarf-color')?.value || '',
                        size: document.getElementById('scarf-size')?.value || '',
                        price: scarfPrice,
                        details: document.getElementById('scarf-details')?.value || ''
                    },
                    hat: {
                        type: document.getElementById('hat-type')?.value || '',
                        color: document.getElementById('hat-color')?.value || '',
                        shape: document.getElementById('hat-shape')?.value || '',
                        price: hatPrice,
                        details: document.getElementById('hat-details')?.value || ''
                    },
                    sleeves: {
                        type: document.getElementById('sleeves-type')?.value || '',
                        color: document.getElementById('sleeves-color')?.value || '',
                        length: document.getElementById('sleeves-length')?.value || '',
                        price: sleevesPrice,
                        details: document.getElementById('sleeves-details')?.value || ''
                    }
                },
                total: finalTotal,
                price: finalTotal,
                paid: paidAmount,
                remaining: remainingAmount,
                status: remainingAmount > 0 ? 'غير مدفوعة' : 'مدفوعة',
                type: 'full-design',
                savedAt: new Date().toISOString(),
                notes: document.getElementById('invoice-notes')?.value || ''
            };
            
            // Save to both issued-invoices and full-design-invoices for proper counting
            const issuedInvoices = JSON.parse(localStorage.getItem('issued-invoices') || '[]');
            issuedInvoices.push(newInvoice);
            localStorage.setItem('issued-invoices', JSON.stringify(issuedInvoices));
            
            // Also save to full-design-invoices for statistics
            const fullDesignInvoices = JSON.parse(localStorage.getItem('full-design-invoices') || '[]');
            fullDesignInvoices.push(newInvoice);
            localStorage.setItem('full-design-invoices', JSON.stringify(fullDesignInvoices));
            
            // Show success message
            this.showNotification('تم حفظ الفاتورة بنجاح! سيتم تحويلك إلى صفحة الفواتير.', 'success');
            
            // Redirect to issued invoices page
            setTimeout(() => {
                window.location.href = 'issued-invoices.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error saving invoice:', error);
            this.showNotification('حدث خطأ أثناء حفظ الفاتورة: ' + error.message, 'error');
        }
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
        const customerName = data.customer?.name || data.customerName || 'غير محدد';
        const customerPhone = data.customer?.phone || data.customerPhone || 'غير محدد';
        const customerAddress = data.customer?.address || data.customerAddress || 'غير محدد';
        
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
                    <h1>فاتورة التصميم الكامل</h1>
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
        
        // Remove after 2 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 2000);
    }
}

// Global functions
window.saveFullDesignInvoice = function() {
    if (window.fullDesignInvoiceSystem) {
        window.fullDesignInvoiceSystem.saveInvoice();
    } else {
        if (window.fullDesignInvoiceSystem && window.fullDesignInvoiceSystem.showNotification) {
            window.fullDesignInvoiceSystem.showNotification('النظام لم يتم تحميله بشكل صحيح. يرجى تحديث الصفحة.', 'error');
        } else {
            alert('النظام لم يتم تحميله بشكل صحيح. يرجى تحديث الصفحة.');
        }
    }
};

window.calculateTotal = function() {
    if (window.fullDesignInvoiceSystem) {
        window.fullDesignInvoiceSystem.calculateTotalFromComponents();
    }
};

window.calculateRemaining = function() {
    if (window.fullDesignInvoiceSystem) {
        window.fullDesignInvoiceSystem.calculateRemainingFromPaid();
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the full design invoice page
    if (window.location.pathname.endsWith('full-design-invoice.html')) {
        console.log('Full design invoice page loaded');
        
        try {
            // Simple initialization
            window.fullDesignInvoiceSystem = new FullDesignInvoiceSystem();
            console.log('✅ Full design invoice system initialized successfully!');
            
            // Initialize auth system if available
            if (typeof AuthSystem !== 'undefined') {
                window.authSystem = new AuthSystem();
            }
            
        } catch (error) {
            console.error('❌ Error during initialization:', error);
        }
    } else {
            console.log('❌ Not on full-design-invoice.html page');
        }
    }
);

window.printFullDesignInvoice = function() {
    console.log('Print button clicked!');
    if (window.fullDesignInvoiceSystem) {
        window.fullDesignInvoiceSystem.printInvoice();
    } else {
        console.error('❌ Full design invoice system not available!');
    }
};
