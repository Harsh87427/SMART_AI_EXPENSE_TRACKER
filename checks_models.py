from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    print("❌ Error: API Key not found.")
    exit()

client = genai.Client(api_key=API_KEY)

print("🔍 Searching for available models...")
try:
    # This lists every model your key can actually touch
    for model in client.models.list():
        name = model.name
        # We only care about models that can 'generateContent'
        if "generateContent" in (model.supported_actions or []):
            print(f"✅ Available: {name}")
except Exception as e:
    print(f"❌ Error listing models: {e}")