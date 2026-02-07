// Auto-refresh access token before expiry
let refreshInterval;

function startTokenRefresh() {
    // Refresh token setiap 14 menit (sebelum 15 menit expire)
    refreshInterval = setInterval(async () => {
        try {
            const response = await fetch('/refresh', {
                method: 'POST',
                credentials: 'include'
            });

            if (!response.ok) {
                clearInterval(refreshInterval);
                window.location.href = '/login';
            }
        } catch (error) {
            console.error('Token refresh failed:', error);
            clearInterval(refreshInterval);
            window.location.href = '/login';
        }
    }, 14 * 60 * 1000); // 14 minutes
}

// Start refresh interval when page loads
if (window.location.pathname.startsWith('/dashboard')) {
    startTokenRefresh();
}

// Clear interval when page unloads
window.addEventListener('beforeunload', () => {
    if (refreshInterval) {
        clearInterval(refreshInterval);
    }
});
