// Advanced Authentication System
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.userTypes = {
            DESIGNER: 'designer',
            ADMIN: 'admin', 
            CUSTOMER: 'customer'
        };
        
        this.init();
    }

    // Initialize authentication system
    init() {
        this.checkExistingAuth();
        this.setupAuthUI();
        this.updateUIBasedOnAuth();
        this.requireAuthOnLoad();
    }

    // Require authentication on page load
    requireAuthOnLoad() {
        // Check if user is already authenticated
        if (!this.currentUser) {
            // Show auth modal immediately if no user is logged in
            setTimeout(() => {
                this.showAuthModal();
            }, 500);
            
            // Prevent interaction with page elements except auth modal
            const allElements = document.querySelectorAll('body > *:not(#auth-modal):not(#register-modal)');
            allElements.forEach(element => {
                element.style.pointerEvents = 'none';
                element.style.opacity = '0.5';
            });
            
            // Only allow interaction with auth modal
            setTimeout(() => {
                const authModal = document.getElementById('auth-modal');
                const registerModal = document.getElementById('register-modal');
                if (authModal) {
                    authModal.style.pointerEvents = 'auto';
                    authModal.style.opacity = '1';
                }
                if (registerModal) {
                    registerModal.style.pointerEvents = 'auto';
                    registerModal.style.opacity = '1';
                }
            }, 600);
        }
    }

    // Check if user is already authenticated
    checkExistingAuth() {
        const storedUser = sessionStorage.getItem('current_user') || localStorage.getItem('current_user');
        if (storedUser) {
            this.currentUser = JSON.parse(storedUser);
            console.log('Found existing user:', this.currentUser);
        }
    }

    // Setup authentication UI elements
    setupAuthUI() {
        // Setup login button
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.onclick = () => this.showAuthModal();
        }

        // Setup logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = () => this.logout();
        }

        // Update UI based on current auth state
        this.updateUIBasedOnAuth();
    }

    // Show authentication modal
    showAuthModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('auth-modal');
        if (existingModal) {
            existingModal.remove();
        }

        const modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl max-w-md w-full p-8 relative">
                <!-- Removed close button to force authentication -->
                
                <div class="text-center mb-8">
                    <div class="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-user-circle text-purple-600 text-3xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">تسجيل الدخول</h3>
                    <p class="text-red-600 text-sm font-medium">يجب تسجيل الدخول للوصول إلى الموقع</p>
                </div>
                
                <form id="login-form" class="space-y-6">
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">البريد الإلكتروني</label>
                        <input type="email" id="login-email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500" placeholder="example@email.com">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">كلمة المرور</label>
                        <input type="password" id="login-password" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500" placeholder="••••••••">
                    </div>
                    
                    <div class="flex items-center">
                        <input type="checkbox" id="remember-me" class="ml-2">
                        <label for="remember-me" class="text-gray-700 text-sm">تذكرني</label>
                    </div>
                    
                    <button type="submit" class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition">
                        <i class="fas fa-sign-in-alt ml-2"></i>
                        تسجيل الدخول
                    </button>
                    
                    <div class="text-center">
                        <p class="text-gray-600">
                            ليس لديك حساب؟ 
                            <button type="button" onclick="authSystem.showRegisterModal()" class="text-purple-600 hover:underline font-semibold">
                                إنشاء حساب جديد
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
        
        // Prevent closing modal with ESC key
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                this.showNotification('يجب تسجيل الدخول للوصول إلى الموقع', 'error');
            }
        });
        
        // Prevent closing modal by clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                e.preventDefault();
                e.stopPropagation();
                this.showNotification('يجب تسجيل الدخول للوصول إلى الموقع', 'error');
            }
        });
    }

    // Show registration modal for customers
    showRegisterModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('register-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Close login modal first
        this.closeAuthModal();
        
        // Create registration modal
        const modal = document.createElement('div');
        modal.id = 'register-modal';
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl max-w-md w-full p-8 relative">
                <!-- Removed close button to force authentication -->
                
                <div class="text-center mb-8">
                    <div class="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-user-plus text-green-600 text-3xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-2">إنشاء حساب جديد</h3>
                    <p class="text-red-600 text-sm font-medium">يجب إنشاء حساب للوصول إلى الموقع</p>
                </div>
                
                <form id="register-form" class="space-y-4">
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">الاسم الكامل</label>
                        <input type="text" id="register-name" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500" placeholder="أدخل اسمك الكامل">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">البريد الإلكتروني</label>
                        <input type="email" id="register-email" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500" placeholder="example@email.com">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">رقم الهاتف</label>
                        <input type="tel" id="register-phone" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500" placeholder="05xxxxxxxx">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">كلمة المرور</label>
                        <input type="password" id="register-password" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500" placeholder="••••••••">
                    </div>
                    
                    <div>
                        <label class="block text-gray-700 font-medium mb-2">تأكيد كلمة المرور</label>
                        <input type="password" id="register-confirm-password" required class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500" placeholder="••••••••">
                    </div>
                    
                    <button type="submit" class="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition">
                        <i class="fas fa-user-plus ml-2"></i>
                        إنشاء حساب
                    </button>
                    
                    <div class="text-center">
                        <p class="text-gray-600">
                            لديك حساب بالفعل؟ 
                            <button type="button" onclick="authSystem.closeRegisterModal(); authSystem.showAuthModal();" class="text-green-600 hover:underline font-semibold">
                                تسجيل الدخول
                            </button>
                        </p>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Handle form submission
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });
        
        // Prevent closing modal with ESC key
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopPropagation();
                this.showNotification('يجب إنشاء حساب للوصول إلى الموقع', 'error');
            }
        });
        
        // Prevent closing modal by clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                e.preventDefault();
                e.stopPropagation();
                this.showNotification('يجب إنشاء حساب للوصول إلى الموقع', 'error');
            }
        });
    }

    // Close registration modal
    closeRegisterModal() {
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.remove();
        }
    }

    // Handle registration
    handleRegister() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const phone = document.getElementById('register-phone').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        // Validate passwords match
        if (password !== confirmPassword) {
            alert('كلمات المرور غير متطابقة');
            return;
        }

        // Check if email already exists
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        if (customers.find(c => c.email === email)) {
            alert('البريد الإلكتروني مستخدم بالفعل');
            return;
        }

        // Create new customer
        const newCustomer = {
            id: Date.now().toString(),
            fullName: name,
            email: email,
            phone: phone,
            password: password,
            type: 'customer',
            createdAt: new Date().toISOString()
        };

        // Save customer
        customers.push(newCustomer);
        localStorage.setItem('customers', JSON.stringify(customers));

        // Auto login after registration
        this.currentUser = {
            email: newCustomer.email,
            fullName: newCustomer.fullName,
            type: 'customer',
            id: newCustomer.id
        };

        // Save session
        sessionStorage.setItem('current_user', JSON.stringify(this.currentUser));

        // Re-enable page interaction after successful registration
        const allElements = document.querySelectorAll('body > *');
        allElements.forEach(element => {
            element.style.pointerEvents = 'auto';
            element.style.opacity = '1';
        });

        // Close modal and update UI
        this.closeRegisterModal();
        this.updateUIBasedOnAuth();

        // Show success message
        this.showNotification('تم إنشاء حسابك بنجاح!', 'success');
    }

    // Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transform transition-all duration-300 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
        } text-white`;
        notification.textContent = message;
        notification.style.transform = 'translateX(400px)';
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Handle login
    handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        // Check customers first
        const customers = JSON.parse(localStorage.getItem('customers') || '[]');
        const customer = customers.find(c => c.email === email && c.password === password);
        
        if (customer) {
            this.currentUser = {
                email: customer.email,
                fullName: customer.fullName,
                type: 'customer',
                phone: customer.phone,
                city: customer.city
            };
            
            this.saveAuth(rememberMe);
            this.closeAuthModal();
            this.updateUIBasedOnAuth();
            this.showNotification('مرحباً بك ' + customer.fullName + '!', 'success');
            return;
        }

        // Check designers
        const designers = JSON.parse(localStorage.getItem('designers') || '[]');
        const designer = designers.find(d => d.email === email && d.password === password);
        
        if (designer) {
            this.currentUser = {
                email: designer.email,
                fullName: designer.fullName,
                type: 'designer',
                phone: designer.phone
            };
            
            this.saveAuth(rememberMe);
            this.closeAuthModal();
            this.updateUIBasedOnAuth();
            this.showNotification('مرحباً بك ' + designer.fullName + '!', 'success');
            return;
        }

        // Check admins
        if (email === 'admin@al-sahm.com' && password === 'admin123') {
            this.currentUser = {
                email: email,
                fullName: 'مدير النظام',
                type: 'admin'
            };
            
            this.saveAuth(rememberMe);
            this.closeAuthModal();
            this.updateUIBasedOnAuth();
            this.showNotification('مرحباً بك مدير النظام!', 'success');
            return;
        }

        this.showNotification('البريد الإلكتروني أو كلمة المرور غير صحيحة', 'error');
    }

    // Save authentication state
    saveAuth(rememberMe) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('current_user', JSON.stringify(this.currentUser));
        
        // Re-enable page interaction after successful login
        const allElements = document.querySelectorAll('body > *');
        allElements.forEach(element => {
            element.style.pointerEvents = 'auto';
            element.style.opacity = '1';
        });
    }

    // Close authentication modal
    closeAuthModal() {
        const modal = document.getElementById('auth-modal');
        if (modal) {
            modal.remove();
        }
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Logout
    logout() {
        this.currentUser = null;
        localStorage.removeItem('current_user');
        sessionStorage.removeItem('current_user');
        this.updateUIBasedOnAuth();
        
        // Show notification
        this.showNotification('تم تسجيل الخروج بنجاح', 'success');
        
        // Force login modal immediately
        setTimeout(() => {
            this.showAuthModal();
        }, 1000);
        
        // If on protected pages, redirect to home
        const currentPage = window.location.pathname;
        if (currentPage.includes('issued-invoices.html') || 
            currentPage.includes('full-design-invoice.html') || 
            currentPage.includes('logo-invoice.html')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
    }

    // Update UI based on authentication
    updateUIBasedOnAuth() {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        
        // Handle new login/logout buttons
        if (loginBtn && logoutBtn) {
            if (this.currentUser) {
                loginBtn.classList.add('hidden');
                logoutBtn.classList.remove('hidden');
            } else {
                loginBtn.classList.remove('hidden');
                logoutBtn.classList.add('hidden');
            }
        }
    }
}

// Initialize auth system
let authSystem;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    authSystem = new AuthSystem();
});
