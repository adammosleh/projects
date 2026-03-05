// Navigation Helper - Single Tab Navigation System
class NavigationHelper {
    constructor() {
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    // Initialize navigation helper
    init() {
        this.setupBackButton();
        this.setupNavigationHistory();
        console.log('Navigation Helper initialized - Single Tab Mode');
    }

    // Get current page name
    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop() || 'index.html';
        return page.replace('.html', '');
    }

    // Setup smart back button
    setupBackButton() {
        // Add back button to pages that need it
        const pagesWithBackButton = ['designer-dashboard', 'designer-auth', 'test-designer-access'];
        
        if (pagesWithBackButton.includes(this.currentPage)) {
            this.addBackButton();
        }
    }

    // Add back button to page
    addBackButton() {
        const header = document.querySelector('header nav .flex.justify-between.items-center');
        if (header && !document.getElementById('smart-back-btn')) {
            const backBtn = document.createElement('button');
            backBtn.id = 'smart-back-btn';
            backBtn.className = 'text-gray-600 hover:text-purple-600 transition ml-4';
            backBtn.innerHTML = '<i class="fas fa-arrow-right text-xl"></i>';
            backBtn.onclick = () => this.smartGoBack();
            
            // Insert at the beginning of the header
            header.insertBefore(backBtn, header.firstChild);
        }
    }

    // Smart go back functionality
    smartGoBack() {
        // Check if there's history to go back to
        if (window.history.length > 1) {
            window.history.back();
        } else {
            // No history, go to main page
            window.location.href = 'index.html';
        }
    }

    // Setup navigation history tracking
    setupNavigationHistory() {
        // Track page navigation
        this.saveNavigationState();
        
        // Listen for navigation changes
        window.addEventListener('beforeunload', () => {
            this.saveNavigationState();
        });
    }

    // Save navigation state
    saveNavigationState() {
        const navState = {
            currentPage: this.currentPage,
            timestamp: new Date().toISOString(),
            referrer: document.referrer
        };
        
        sessionStorage.setItem('nav_state', JSON.stringify(navState));
    }

    // Navigate to page with single tab behavior
    navigateTo(page, params = {}) {
        let url = page;
        
        // Add parameters if provided
        if (Object.keys(params).length > 0) {
            const searchParams = new URLSearchParams(params);
            url += '?' + searchParams.toString();
        }
        
        // Navigate in same tab
        window.location.href = url;
    }

    // Open page in modal (for quick views)
    openInModal(pageUrl, title = 'معاينة') {
        // Remove existing modal
        const existingModal = document.getElementById('page-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'page-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        modal.innerHTML = `
            <div class="bg-white rounded-xl w-full max-w-4xl max-h-screen overflow-hidden m-4">
                <div class="bg-purple-600 text-white p-4 flex justify-between items-center">
                    <h3 class="text-xl font-bold">${title}</h3>
                    <button onclick="this.closest('#page-modal').remove()" class="text-white hover:text-gray-200">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                </div>
                <div class="p-4 overflow-y-auto" style="max-height: calc(100vh - 200px);">
                    <iframe src="${pageUrl}" class="w-full h-full border-0" frameborder="0"></iframe>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    // Show navigation confirmation for unsaved changes
    confirmNavigation(message = 'هل أنت متأكد من مغادرة هذه الصفحة؟ قد تفقد التغييرات غير المحفوظة.') {
        return confirm(message);
    }

    // Get navigation breadcrumbs
    getBreadcrumbs() {
        const breadcrumbs = [];
        
        // Always start with home
        breadcrumbs.push({ name: 'الرئيسية', url: 'index.html' });
        
        // Add current page based on type
        switch (this.currentPage) {
            case 'designer-auth':
                breadcrumbs.push({ name: 'تسجيل دخول المصمم', url: 'designer-auth.html' });
                break;
            case 'designer-dashboard':
                breadcrumbs.push({ name: 'لوحة المصمم', url: 'designer-dashboard.html' });
                break;
            case 'test-designer-access':
                breadcrumbs.push({ name: 'اختبار الوصول', url: 'test-designer-access.html' });
                break;
        }
        
        return breadcrumbs;
    }

    // Display breadcrumbs in page
    displayBreadcrumbs() {
        const breadcrumbs = this.getBreadcrumbs();
        const breadcrumbContainer = document.getElementById('breadcrumbs');
        
        if (breadcrumbContainer && breadcrumbs.length > 1) {
            breadcrumbContainer.innerHTML = `
                <nav class="flex items-center space-x-reverse space-x-2 text-sm">
                    ${breadcrumbs.map((crumb, index) => `
                        <span class="flex items-center">
                            ${index > 0 ? '<i class="fas fa-chevron-left text-gray-400 mx-2"></i>' : ''}
                            ${index === breadcrumbs.length - 1 
                                ? `<span class="text-purple-600 font-semibold">${crumb.name}</span>`
                                : `<a href="${crumb.url}" class="text-gray-600 hover:text-purple-600 transition">${crumb.name}</a>`
                            }
                        </span>
                    `).join('')}
                </nav>
            `;
        }
    }

    // Setup page transitions
    setupPageTransitions() {
        // Add transition class to body
        document.body.classList.add('page-transition');
        
        // Add CSS for transitions
        if (!document.getElementById('transition-styles')) {
            const style = document.createElement('style');
            style.id = 'transition-styles';
            style.textContent = `
                .page-transition {
                    transition: opacity 0.3s ease-in-out;
                }
                
                .page-transition.fade-out {
                    opacity: 0;
                }
                
                .page-transition.fade-in {
                    opacity: 1;
                }
                
                /* Smooth scroll behavior */
                html {
                    scroll-behavior: smooth;
                }
                
                /* Loading state */
                .loading-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(255, 255, 255, 0.9);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                }
                
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 4px solid #f3f3f3;
                    border-top: 4px solid #8b5cf6;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Show loading overlay
    showLoading() {
        const overlay = document.createElement('div');
        overlay.id = 'loading-overlay';
        overlay.className = 'loading-overlay';
        overlay.innerHTML = '<div class="loading-spinner"></div>';
        document.body.appendChild(overlay);
    }

    // Hide loading overlay
    hideLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }

    // Navigate with loading effect
    navigateWithLoading(pageUrl) {
        this.showLoading();
        
        // Add fade out effect
        document.body.classList.add('fade-out');
        
        setTimeout(() => {
            window.location.href = pageUrl;
        }, 300);
    }
}

// Initialize navigation helper globally
let navHelper;
document.addEventListener('DOMContentLoaded', () => {
    navHelper = new NavigationHelper();
    window.navHelper = navHelper;
    
    // Display breadcrumbs if container exists
    setTimeout(() => {
        navHelper.displayBreadcrumbs();
    }, 100);
});

// Export for use in other files
window.NavigationHelper = NavigationHelper;
