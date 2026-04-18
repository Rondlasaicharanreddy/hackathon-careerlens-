window.app = {
    state: {
        user: null,          // Set by Firebase onAuthStateChanged in index.html
        userProfile: null,
        selectedCareer: null,
        careers: []
    },
    views: {},
    registerView: function(name, renderFn) {
        this.views[name] = renderFn;
    },
    navigate: function(viewName, animate=true) {
        const container = document.getElementById('app-container');
        if (animate) {
            container.classList.remove('fade-in');
            void container.offsetWidth; // trigger reflow
            container.classList.add('fade-in');
        }
        
        if (this.views[viewName]) {
            container.innerHTML = this.views[viewName]();
            // Call an optional init function on the app logic if it exists for the view
            if (this[`init_${viewName}`]) {
                setTimeout(() => this[`init_${viewName}`](), 0);
            }
            window.scrollTo(0,0);
        }
    },

    // Called by Firebase module in index.html when auth state changes
    __authReady: function(isLoggedIn) {
        // Update nav sign-in/out button if it exists
        const authBtn = document.getElementById('nav-auth-btn');
        if (authBtn) {
            if (isLoggedIn) {
                const name = window.app.state.user?.firstName || 'Account';
                authBtn.textContent = name;
                authBtn.onclick = () => window.app.logout();
            } else {
                authBtn.textContent = 'Sign In';
                authBtn.onclick = () => window.app.navigate('auth');
            }
        }
    }
};

['features', 'reviews', 'about', 'contact'].forEach(view => {
    window.app.registerView(view, () => {
        const landingHtml = window.app.views['landing']();
        setTimeout(() => {
            const el = document.getElementById(view);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        return landingHtml;
    });
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    window.app.navigate('landing');
});
