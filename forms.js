// Forms Module
class FormsManager {
    constructor() {
        this.setupFormHandlers();
    }

    // Setup form handlers
    setupFormHandlers() {
        // No active forms currently - keeping structure for future use
    }

    // Validate email
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Validate phone (Saudi phone numbers)
    validatePhone(phone) {
        const phoneRegex = /^05\d{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }

    // Show form errors
    showFormErrors(errors) {
        const errorMessage = errors.join('، ');
        if (window.cartManager) {
            window.cartManager.showNotification(`خطأ: ${errorMessage}`, 'error');
        }
    }

    // Show/hide form loading state
    showFormLoading(show) {
        const submitButtons = document.querySelectorAll('button[type="submit"]');
        submitButtons.forEach(button => {
            if (show) {
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin ml-2"></i> جاري الإرسال...';
            } else {
                button.disabled = false;
                button.innerHTML = button.getAttribute('data-original-text') || 'إرسال';
            }
        });
    }

    // Handle file upload
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                if (window.cartManager) {
                    window.cartManager.showNotification('يرجى اختيار ملف صورة صالح (JPEG, PNG, GIF, WebP)', 'error');
                }
                return;
            }

            // Validate file size (max 5MB)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                if (window.cartManager) {
                    window.cartManager.showNotification('حجم الملف كبير جداً. الحد الأقصى 5 ميجابايت', 'error');
                }
                return;
            }

            if (window.cartManager) {
                window.cartManager.showNotification(`تم اختيار الملف: ${file.name}`, 'success');
            }
        }
    }
}

// Initialize Forms Manager
const formsManager = new FormsManager();

// Make formsManager globally available
window.formsManager = formsManager;

// Global functions for onclick handlers
window.handleFileUpload = (event) => formsManager.handleFileUpload(event);
