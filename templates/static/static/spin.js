
// Global variables
let gameData = null;
let isSpinning = false;
let hasViewedAd = false;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    checkLoginStatus();
});

function checkLoginStatus() {
    fetch('/game-data')
        .then(response => response.json())
        .then(data => {
            if (data.error || !data.user_id) {
                showScreen('loginScreen');
            } else {
                gameData = data;
                updateUI();
                showScreen('gameScreen');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showScreen('loginScreen');
        });
}

function login() {
    const userId = document.getElementById('userIdInput').value.trim();

    if (!userId) {
        showNotification('Please enter your Telegram User ID');
        return;
    }

    if (!userId.match(/^\d{5,}$/)) {
        showNotification('Invalid Telegram User ID format');
        return;
    }

    fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            checkLoginStatus();
        } else {
            showNotification(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Login failed. Please try again.');
    });
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function updateUI() {
    if (!gameData) return;

    document.getElementById('userId').textContent = `User: ${gameData.user_id}`;
    document.getElementById('spinsLeft').textContent = gameData.spins_remaining;
    document.getElementById('todayEarnings').textContent = `₹${gameData.daily_earnings.toFixed(2)}`;
    document.getElementById('totalEarnings').textContent = `₹${gameData.total_earnings.toFixed(2)}`;

    const spinButton = document.getElementById('spinBtn');
    if (gameData.spins_remaining <= 0) {
        spinButton.disabled = true;
        spinButton.textContent = 'Daily Limit Reached';
    } else {
        spinButton.disabled = false;
        spinButton.textContent = `🎯 SPIN & WIN! (${gameData.spins_remaining} left)`;
    }
}

function startAdAndSpin() {
    if (isSpinning) return;
    
    if (!hasViewedAd) {
        // Show ad first
        window.adManager.showAdModal();
        return;
    }

    // If ad is viewed, proceed with spin
    spin();
}

function spin() {
    if (isSpinning || !hasViewedAd) {
        if (!hasViewedAd) {
            showNotification('Please view the ad first!');
        }
        return;
    }

    isSpinning = true;
    const spinButton = document.getElementById('spinBtn');
    spinButton.disabled = true;
    spinButton.textContent = 'Spinning...';

    // Play coin sound effect
    playSound('coin');

    // Start wheel animation
    animateWheel();

    fetch('/spin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ad_viewed: hasViewedAd })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            setTimeout(() => {
                showSpinResult(data);
                gameData.spins_remaining = data.spins_remaining;
                gameData.daily_earnings = data.daily_earnings;
                gameData.total_earnings = data.total_earnings || gameData.total_earnings;

                updateUI();

                if (data.show_scratch) {
                    showScratchCard();
                }

                // Reset ad viewing status
                hasViewedAd = false;
                if (window.adManager) {
                    window.adManager.resetAdStatus();
                }

                isSpinning = false;
            }, 3000);
        } else {
            showNotification(data.message);
            isSpinning = false;
            spinButton.disabled = false;
            spinButton.textContent = '🎯 SPIN & WIN!';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Spin failed. Please try again.');
        isSpinning = false;
        spinButton.disabled = false;
        spinButton.textContent = '🎯 SPIN & WIN!';
    });
}

function animateWheel() {
    const wheel = document.getElementById('wheel');
    wheel.style.transform = 'rotate(0deg)';
    wheel.style.transition = 'transform 3s ease-out';

    setTimeout(() => {
        const finalRotation = 1440 + Math.random() * 360;
        wheel.style.transform = `rotate(${finalRotation}deg)`;
    }, 100);
}

function showSpinResult(data) {
    const resultDisplay = document.getElementById('resultDisplay');
    const resultTitle = document.getElementById('resultTitle');
    const resultAmount = document.getElementById('resultAmount');
    const resultEmoji = document.getElementById('resultEmoji');

    resultTitle.textContent = '🎉 Congratulations!';
    resultAmount.textContent = `₹${data.actual_reward.toFixed(2)}`;
    resultEmoji.textContent = data.winning_zone;

    resultDisplay.style.display = 'block';

    // Play success sound
    playSound('success');
}

function showScratchCard() {
    document.getElementById('scratchContainer').style.display = 'block';
    document.getElementById('scratchAmount').textContent = '2.50';
}

function scratchCard() {
    fetch('/scratch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.getElementById('scratchAmount').textContent = data.reward.toFixed(2);
            
            // Add scratched effect
            const scratchCard = document.getElementById('scratchCard');
            scratchCard.classList.add('scratched');

            // Play coin sound
            playSound('coin');

            gameData.total_earnings = data.total_earnings;
            updateUI();

            showNotification(`🎉 Scratched ₹${data.reward.toFixed(2)}! Money sent to your bot!`);
        } else {
            showNotification(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showNotification('Scratch failed. Please try again.');
    });
}

function logout() {
    fetch('/logout', {
        method: 'POST'
    })
    .then(() => {
        gameData = null;
        showScreen('loginScreen');
        document.getElementById('userIdInput').value = '';
    });
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        z-index: 10000;
        font-weight: bold;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        max-width: 300px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function playSound(type) {
    try {
        const audio = new Audio();
        if (type === 'coin') {
            // Create coin sound using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
        } else if (type === 'success') {
            // Create success sound
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(523, audioContext.currentTime);
            oscillator.frequency.setValueAtTime(659, audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(784, audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.4);
        }
    } catch (e) {
        console.log('Audio not supported:', e);
    }
}

// Auto-refresh game data every 30 seconds
setInterval(() => {
    if (document.getElementById('gameScreen').classList.contains('active')) {
        fetch('/game-data')
            .then(response => response.json())
            .then(data => {
                if (data.user_id) {
                    gameData = data;
                    updateUI();
                }
            })
            .catch(error => {
                console.error('Auto-refresh failed:', error);
            });
    }
}, 30000);
