
import requests
import json

class TelegramAPI:
    def __init__(self, bot_token):
        self.bot_token = bot_token
        self.base_url = f"https://api.telegram.org/bot{bot_token}"
    
    def send_message(self, chat_id, text, parse_mode='HTML'):
        try:
            url = f"{self.base_url}/sendMessage"
            data = {
                'chat_id': chat_id,
                'text': text,
                'parse_mode': parse_mode
            }
            response = requests.post(url, data=data, timeout=10)
            return response.status_code == 200
        except Exception as e:
            print(f"Failed to send message: {e}")
            return False
    
    def add_balance(self, admin_id, user_id, amount):
        try:
            message = f"/addbalance {user_id} {amount}"
            return self.send_message(admin_id, message)
        except Exception as e:
            print(f"Failed to add balance: {e}")
            return False
