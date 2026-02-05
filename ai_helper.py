from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    print("❌ Error: API Key not found. Make sure it's in your .env file!")
    exit()

client = genai.Client(api_key=API_KEY)

def fallback_categorize(expense_description):
    """
    Simple keyword-based categorization when AI is unavailable.
    """
    description_lower = expense_description.lower()
    
    # Keyword mapping for categories
    keywords = {
        'Groceries': ['grocery', 'groceries', 'supermarket', 'walmart', 'target', 'whole foods', 'trader joe'],
        'Food': ['restaurant', 'cafe', 'coffee', 'dinner', 'lunch', 'breakfast', 'food', 'pizza', 'burger','samosa'],
        'Transportation': ['uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking', 'metro', 'bus', 'train', 'subway'],
        'Utilities': ['electricity', 'water', 'gas bill', 'internet', 'wifi', 'phone bill'],
        'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'game', 'concert', 'theater'],
        'Healthcare': ['doctor', 'hospital', 'pharmacy', 'medicine', 'medical', 'dentist', 'clinic'],
        'Education': ['tuition', 'course', 'book', 'school', 'university', 'college'],
        'Bills': ['bill', 'insurance', 'rent', 'mortgage', 'subscription'],
        'Shopping': ['amazon', 'shopping', 'clothes', 'shoes', 'mall', 'store','tshirt', 'jeans', 'dress' ,'sneakers', 'jacket', 'accessories', 'electronics']
    }
    
    # Check keywords
    for category, words in keywords.items():
        for word in words:
            if word in description_lower:
                return category
    
    return 'Miscellaneous'

def categorize_expense(expense_description):
    """
    Sends the expense text to the model and retrieves the category.
    Falls back to keyword matching if API fails.
    """ 
    prompt = f"""
    You are an expert financial analyst. Categorize the following expense description into exactly one of these categories: 
    [Food, Transportation, Utilities, Entertainment, Healthcare, Education, Bills, Groceries, Shopping, Miscellaneous].
    
    Expense Description: "{expense_description}"
    
    Provide only the category name as the response.
    """

    # List of models to try in order
    models_to_try = [
        "gemini-2.5-flash-lite",
        "gemini-flash-lite-latest",
        "gemini-2.0-flash-lite",
    ]
    
    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name, 
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.2
                )
            )
            category = response.text.strip()
            print(f"✅ AI categorized using {model_name}")
            return category
        except Exception as e:
            error_str = str(e)
            # If quota exhausted, try next model
            if "RESOURCE_EXHAUSTED" in error_str or "429" in error_str:
                print(f"⚠️  {model_name} quota exhausted, trying next model...")
                continue
            # If model not found, try next model
            elif "NOT_FOUND" in error_str or "404" in error_str:
                print(f"⚠️  {model_name} not available, trying next model...")
                continue
            else:
                print(f"Error with {model_name}: {e}")
                break
    
    # If all AI models fail, use fallback
    print("🔄 Using fallback keyword-based categorization...")
    category = fallback_categorize(expense_description)
    return category

if __name__ == "__main__":
    test_items = [
        "Paid $15 for groceries at the supermarket.",
        "Uber ride to office $12",
        "Netflix subscription $15.99",
        "Random expense test"
    ]
    
    for test_item in test_items:
        print(f"\n📝 Testing: {test_item}")
        result = categorize_expense(test_item)
        print(f"✅ Category: {result}")