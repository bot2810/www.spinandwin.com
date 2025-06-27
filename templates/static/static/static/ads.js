// Ad Manager - Single declaration
let AdManager = null;

// Initialize only once
if (!AdManager) {
    AdManager = class {
        constructor() {
            this.adViewed = false;
            this.init();
        }

        init() {
            this.setupAdClicks();
            this.preventAutoClick();
        }

        setupAdClicks() {
            const ads = document.querySelectorAll('.ad-banner, .ad-sidebar');
            ads.forEach(ad => {
                ad.addEventListener('click', (e) => {
                    this.handleAdClick(e);
                });
            });
        }

        handleAdClick(event) {
            event.preventDefault();

            if (this.adViewed) {
                this.showMessage('You have already viewed an ad for this spin!');
                return;
            }

            this.showAdModal();
        }

        showAdModal() {
            // Remove existing modal if any
            const existingModal = document.querySelector('.ad-modal');
            if (existingModal) {
                existingModal.remove();
            }

            const modal = document.createElement('div');
            modal.className = 'ad-modal';
            modal.innerHTML = `
                <div class="ad-modal-content">
                    <div class="ad-header">
                        <h3>🎯 Advertisement</h3>
                        <span class="ad-timer" id="adTimer">5</span>
                    </div>
                    <div class="ad-body">
                        <div class="fake-video">
                            <h2>🎮 Play Premium Games!</h2>
                            <p>Join thousands of players earning daily rewards!</p>
                            <div class="ad-features">
                                <div>💰 Higher Payouts</div>
                                <div>🎯 More Spins</div>
                                <div>🏆 Exclusive Rewards</div>
                            </div>
                        </div>
                    </div>
                    <div class="ad-footer">
                        <button id="closeAdBtn" class="close-ad-btn" disabled>
                            Close Ad (<span id="closeTimer">5</span>s)
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            this.startAdTimer(modal);
        }

        startAdTimer(modal) {
            let timeLeft = 5;
            const timer = modal.querySelector('#adTimer');
            const closeBtn = modal.querySelector('#closeAdBtn');
            const closeTimer = modal.querySelector('#closeTimer');

            const countdown = setInterval(() => {
                timeLeft--;
                timer.textContent = timeLeft;
                closeTimer.textContent = timeLeft;

                if (timeLeft <= 0) {
                    clearInterval(countdown);
                    closeBtn.disabled = false;
                    closeBtn.innerHTML = 'Close Ad ✓';
                    closeBtn.onclick = () => {
                        this.closeAdModal(modal);
                    };
                }
            }, 1000);
        }

        closeAdModal(modal) {
            modal.remove();
            this.adViewed = true;
            hasViewedAd = true;
            this.showMessage('✅ Ad viewed successfully! You can now spin.');

            // Enable spin button
            const spinButton = document.getElementById('spinBtn');
            if (spinButton) {
                spinButton.disabled = false;
                spinButton.style.opacity = '1';
                spinButton.style.cursor = 'pointer';
            }
        }

        showMessage(text) {
            // Remove existing messages
            const existingMessages = document.querySelectorAll('.ad-message');
            existingMessages.forEach(msg => msg.remove());

            const message = document.createElement('div');
            message.className = 'ad-message';
            message.textContent = text;
            message.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #4CAF50;
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 10000;
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            `;

            document.body.appendChild(message);

            setTimeout(() => {
                message.remove();
            }, 3000);
        }

        preventAutoClick() {
            let mouseEvents = 0;
            document.addEventListener('mousemove', () => mouseEvents++);

            setTimeout(() => {
                if (mouseEvents < 5) {
                    console.log('Suspicious: Low mouse activity detected');
                }
            }, 10000);
        }

        resetAdStatus() {
            this.adViewed = false;
            hasViewedAd = false;
        }
    };
}

// Initialize Ad Manager when page loads
document.addEventListener('DOMContentLoaded', function() {
    if (!window.adManager) {
        window.adManager = new AdManager();
    }
});

// CSS for ad modal - only add if not exists
if (!document.querySelector('#adModalStyles')) {
    const adStyles = `
    .ad-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    }

    .ad-modal-content {
        background: white;
        padding: 0;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }

    .ad-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .ad-timer {
        background: rgba(255,255,255,0.2);
        padding: 5px 10px;
        border-radius: 15px;
        font-weight: bold;
    }

    .ad-body {
        padding: 20px;
        text-align: center;
    }

    .fake-video {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
        padding: 30px 20px;
        border-radius: 10px;
        color: #333;
    }

    .ad-features {
        display: flex;
        justify-content: space-around;
        margin-top: 20px;
        flex-wrap: wrap;
        gap: 10px;
    }

    .ad-features > div {
        background: rgba(255,255,255,0.8);
        padding: 8px 12px;
        border-radius: 20px;
        font-size: 14px;
        font-weight: bold;
    }

    .ad-footer {
        padding: 15px 20px;
        border-top: 1px solid #eee;
        text-align: center;
    }

    .close-ad-btn {
        background: #4CAF50;
        color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 25px;
        font-size: 16px;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .close-ad-btn:disabled {
        background: #ccc;
        cursor: not-allowed;
    }

    .close-ad-btn:not(:disabled):hover {
        background: #45a049;
        transform: translateY(-2px);
    }

    @media (max-width: 600px) {
        .ad-modal-content {
            width: 95%;
            margin: 10px;
        }

        .ad-features {
            flex-direction: column;
            align-items: center;
        }
    }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'adModalStyles';
    styleSheet.textContent = adStyles;
    document.head.appendChild(styleSheet);
}
