// Main Application Module
class App {
    constructor() {
        this.init();
    }

    // Initialize application
    init() {
        console.log('Initializing application...');
        this.setupEventListeners();
        this.setupInvoiceButtons();
        this.updateDashboardStats();
    }

    // Setup event listeners
    setupEventListeners() {
        // Install button
        const installBtn = document.getElementById('install-btn');
        if (installBtn) {
            installBtn.addEventListener('click', () => {
                console.log('Install button clicked');
            });
        }
    }

    // Setup invoice buttons
    setupInvoiceButtons() {
        console.log('Setting up invoice buttons...');
        
        // Logo Invoice Button
        const logoInvoiceBtn = document.getElementById('logo-invoice-btn');
        console.log('Logo invoice button element:', logoInvoiceBtn);
        
        if (logoInvoiceBtn) {
            console.log('Adding click listener to logo invoice button');
            logoInvoiceBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Logo invoice button clicked!');
                window.location.href = 'logo-invoice.html';
            });
        } else {
            console.error('Logo invoice button not found!');
        }
        
        // Full Design Invoice Button
        const fullDesignInvoiceBtn = document.getElementById('full-design-invoice-btn');
        console.log('Full design invoice button element:', fullDesignInvoiceBtn);
        
        if (fullDesignInvoiceBtn) {
            console.log('Adding click listener to full design invoice button');
            fullDesignInvoiceBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Full design invoice button clicked!');
                window.location.href = 'full-design-invoice.html';
            });
        } else {
            console.error('Full design invoice button not found!');
        }
    }

    // Update dashboard statistics
    updateDashboardStats() {
        try {
            // Get all invoices from localStorage
            const issuedInvoices = JSON.parse(localStorage.getItem('issued-invoices') || '[]');
            const logoInvoices = JSON.parse(localStorage.getItem('logo-invoices') || '[]');
            const fullDesignInvoices = JSON.parse(localStorage.getItem('full-design-invoices') || '[]');
            
            // Combine all invoices
            const allInvoices = [...issuedInvoices, ...logoInvoices, ...fullDesignInvoices];
            
            // Get current date
            const today = new Date();
            const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            
            // Get week start (Sunday)
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            weekStart.setHours(0, 0, 0, 0);
            
            // Calculate statistics
            const todayInvoices = allInvoices.filter(invoice => {
                const invoiceDate = new Date(invoice.date);
                return invoiceDate >= todayStart && invoiceDate < todayEnd;
            });
            
            const weekInvoices = allInvoices.filter(invoice => {
                const invoiceDate = new Date(invoice.date);
                return invoiceDate >= weekStart;
            });
            
            // Update DOM elements
            const todayElement = document.getElementById('today-invoices');
            const weekElement = document.getElementById('week-invoices');
            const totalElement = document.getElementById('total-invoices');
            
            if (todayElement) {
                todayElement.textContent = todayInvoices.length;
            }
            
            if (weekElement) {
                weekElement.textContent = weekInvoices.length;
            }
            
            if (totalElement) {
                totalElement.textContent = allInvoices.length;
            }
            
        } catch (error) {
            console.error('Error updating dashboard stats:', error);
        }
    }

    // Scroll to section
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    }
}

// Global utility functions
window.scrollToAbayaParts = () => {
    if (window.app) {
        window.app.scrollToSection('abaya-parts');
    }
};

window.showQuickOrder = () => {
    console.log('Show quick order clicked');
    // Will be implemented later
};

// Invoice System Functions
window.openLogoInvoice = function() {
    console.log('Opening Logo Invoice...');
    window.location.href = 'logo-invoice.html';
};

window.openFullDesignInvoice = function() {
    console.log('Opening Full Design Invoice...');
    window.location.href = 'full-design-invoice.html';
};

// Initialize App when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize app if we're on the main page
    if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
        console.log('DOM loaded, initializing app...');
        window.app = new App();
        console.log('App initialized successfully!');
    } else {
        console.log('Not on main page, skipping app initialization');
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = App;
}
