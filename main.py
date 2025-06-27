from flask import Flask, render_template, request, jsonify, session
import random
import time
import requests
import json
from datetime import datetime, date
import os

app = Flask(__name__)
app.secret_key = 'spin-and-win-secret-key-2024'

# Configuration - Replace with your actual values
MAIN_BOT_TOKEN = "8192387709:AAHsLkrIcE4JO7Xk6grpraDKSUxVzWM_2HE"
VIEW_BOT_TOKEN = "7547894309:AAH3zIzu5YfRDzcYBiFvzWAfW8FUTPum3g4" 
ADMIN_ID = "7929115529"

# In-memory storage (replace with database for production)
user_data = {}

def get_today():
    return date.today().isoformat()

def init_user(user_id):
    today = get_today()
    if user_id not in user_data:
        user_data[user_id] = {
            'spins_today': 0,
            'daily_earnings': 0.0,
            'total_earnings': 0.0,
            'scratch_used': False,
            'last_date': today,
            'created_at': datetime.now().isoformat()
        }

    # Reset daily data if new day
    if user_data[user_id]['last_date'] != today:
        user_data[user_id]['spins_today'] = 0
        user_data[user_id]['daily_earnings'] = 0.0
        user_data[user_id]['scratch_used'] = False
        user_data[user_id]['last_date'] = today

def send_telegram_message(bot_token, chat_id, message):
    try:
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = {
            'chat_id': chat_id,
            'text': message,
            'parse_mode': 'HTML'
        }
        response = requests.post(url, data=data, timeout=10)
        return response.status_code == 200
    except Exception as e:
        print(f"Failed to send telegram message: {e}")
        return False

def notify_admin(message):
    if ADMIN_ID and VIEW_BOT_TOKEN:
        send_telegram_message(VIEW_BOT_TOKEN, ADMIN_ID, message)

def add_balance_to_bot(user_id, amount):
    try:
        # Send addbalance command to main bot
        url = f"https://api.telegram.org/bot{MAIN_BOT_TOKEN}/sendMessage"
        message = f"/addbalance {user_id} {amount}"
        data = {
            'chat_id': ADMIN_ID,
            'text': message
        }
        response = requests.post(url, data=data, timeout=10)
        return response.status_code == 200
    except Exception as e:
        print(f"Failed to add balance: {e}")
        return False

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user_id = data.get('user_id', '').strip()

    if not user_id or not user_id.isdigit() or len(user_id) < 5:
        return jsonify({'success': False, 'message': 'Invalid Telegram User ID'})

    session['user_id'] = user_id
    init_user(user_id)

    # Notify admin about user entry
    notify_admin(f"🚪 User {user_id} entered the site")
    notify_admin(f"🆕 User {user_id} started using the game")

    return jsonify({'success': True})

@app.route('/game-data')
def game_data():
    if 'user_id' not in session:
        return jsonify({'error': 'Not logged in'})

    user_id = session['user_id']
    init_user(user_id)
    data = user_data[user_id]

    return jsonify({
        'user_id': user_id,
        'spins_today': data['spins_today'],
        'daily_earnings': data['daily_earnings'],
        'total_earnings': data['total_earnings'],
        'scratch_used': data['scratch_used'],
        'spins_remaining': 15 - data['spins_today']
    })

@app.route('/spin', methods=['POST'])
def spin():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not logged in'})

    data = request.get_json()
    ad_viewed = data.get('ad_viewed', False)

    if not ad_viewed:
        return jsonify({'success': False, 'message': 'Please view the ad first!'})

    user_id = session['user_id']
    init_user(user_id)
    user = user_data[user_id]

    if user['spins_today'] >= 15:
        return jsonify({'success': False, 'message': 'Daily spin limit reached!'})

    # Generate reward
    rewards = [0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40, 0.50, 0.80, 1.00]
    visual_reward = random.choice(rewards)

    # Calculate actual earning to reach ₹2.50 total
    target_total = 2.50
    spins_left = 15 - user['spins_today']
    remaining_amount = target_total - user['daily_earnings']

    if spins_left == 1:
        actual_reward = max(0.10, remaining_amount)
    else:
        actual_reward = min(visual_reward, remaining_amount / spins_left * random.uniform(0.8, 1.5))

    actual_reward = round(actual_reward, 2)

    # Update user data
    user['spins_today'] += 1
    user['daily_earnings'] += actual_reward
    user['total_earnings'] += actual_reward

    # Determine spin result (emoji zones)
    zones = ['😘', '🥰', '🥳']
    winning_zone = random.choice(zones)

    result = {
        'success': True,
        'visual_reward': visual_reward,
        'actual_reward': actual_reward,
        'winning_zone': winning_zone,
        'spins_remaining': 15 - user['spins_today'],
        'daily_earnings': user['daily_earnings'],
        'show_scratch': user['spins_today'] == 15 and not user['scratch_used']
    }

    # Don't notify admin for every spin - only on entry and scratch

    return jsonify(result)

@app.route('/scratch', methods=['POST'])
def scratch():
    if 'user_id' not in session:
        return jsonify({'success': False, 'message': 'Not logged in'})

    user_id = session['user_id']
    init_user(user_id)
    user = user_data[user_id]

    if user['spins_today'] < 15:
        return jsonify({'success': False, 'message': 'Complete 15 spins first!'})

    if user['scratch_used']:
        return jsonify({'success': False, 'message': 'Scratch card already used today!'})

    # Show fixed ₹2.50 in scratch card (same as daily earnings)
    scratch_reward = 2.50

    # Update user data
    user['scratch_used'] = True
    # Don't add extra money, just show the same ₹2.50

    # Send money to main bot AFTER scratch
    add_balance_to_bot(user_id, 2.50)

    # Notify admin about scratch
    notify_admin(f"🎫 User {user_id} used scratch card\n💰 Revealed: ₹{scratch_reward}")
    
    # Notify admin about money sent to main bot
    notify_admin(f"💸 Sent ₹2.50 to user {user_id} after scratch card")

    return jsonify({
        'success': True,
        'reward': scratch_reward,
        'total_earnings': user['total_earnings']
    })

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
