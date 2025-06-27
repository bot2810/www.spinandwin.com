
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
import requests
import json
from typing import Optional

class TelegramAPI:
    def __init__(self, bot_token: str):
        self.bot_token = bot_token
        self.base_url = f"https://api.telegram.org/bot{bot_token}"
    
    def send_message(self, chat_id: str, text: str, parse_mode: str = "HTML") -> bool:
        """Send a message to a Telegram chat"""
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
            print(f"Failed to send telegram message: {e}")
            return False
    
    def get_chat_member(self, chat_id: str, user_id: str) -> Optional[dict]:
        """Get information about a chat member"""
        try:
            url = f"{self.base_url}/getChatMember"
            data = {
                'chat_id': chat_id,
                'user_id': user_id
            }
            response = requests.post(url, data=data, timeout=10)
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"Failed to get chat member: {e}")
            return None
    
    def send_photo(self, chat_id: str, photo_url: str, caption: str = "") -> bool:
        """Send a photo to a Telegram chat"""
        try:
            url = f"{self.base_url}/sendPhoto"
            data = {
                'chat_id': chat_id,
                'photo': photo_url,
                'caption': caption,
                'parse_mode': 'HTML'
            }
            response = requests.post(url, data=data, timeout=10)
            return response.status_code == 200
        except Exception as e:
            print(f"Failed to send photo: {e}")
            return False
    
    def answer_callback_query(self, callback_query_id: str, text: str = "", show_alert: bool = False) -> bool:
        """Answer a callback query"""
        try:
            url = f"{self.base_url}/answerCallbackQuery"
            data = {
                'callback_query_id': callback_query_id,
                'text': text,
                'show_alert': show_alert
            }
            response = requests.post(url, data=data, timeout=10)
            return response.status_code == 200
        except Exception as e:
            print(f"Failed to answer callback query: {e}")
            return False
    
    def set_webhook(self, webhook_url: str) -> bool:
        """Set webhook for the bot"""
        try:
            url = f"{self.base_url}/setWebhook"
            data = {'url': webhook_url}
            response = requests.post(url, data=data, timeout=10)
            return response.status_code == 200
        except Exception as e:
            print(f"Failed to set webhook: {e}")
            return False
    
    def delete_webhook(self) -> bool:
        """Delete webhook for the bot"""
        try:
            url = f"{self.base_url}/deleteWebhook"
            response = requests.post(url, timeout=10)
            return response.status_code == 200
        except Exception as e:
            print(f"Failed to delete webhook: {e}")
            return False
