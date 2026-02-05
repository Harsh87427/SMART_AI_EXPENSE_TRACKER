from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_helper import categorize_expense, client 
from db_helper import add_expense, get_all_expenses, setup_database, delete_expense


app = Flask(__name__)
CORS(app) 

setup_database()

@app.route('/expenses', methods=['GET'])
def fetch_expenses():
    """ Endpoint: Get all expenses """
    expenses = get_all_expenses()
    return jsonify(expenses)

@app.route('/add-expense', methods=['POST'])
def add_new_expense():
    """ Endpoint: Add a new expense """
    data = request.json
    
    if not data:
        return jsonify({"error": "No data provided"}), 400

    amount = data.get('amount')
    description = data.get('description')
    date = data.get('date')

    if not amount or not description:
        return jsonify({"error": "Missing amount or description"}), 400

    # 1. Ask AI for the Category
    print(f"🤖 AI Analyzing: {description}...")
    try:
        category = categorize_expense(description)
        print(f"✅ AI Decided: {category}")
    except Exception as e:
        print(f"⚠️ AI Failed: {e}")
        category = "Miscellaneous"

    # 2. Save to Database
    success = add_expense(amount, category, description, date)
    
    if success:
        return jsonify({"message": "Expense Added!", "category": category}), 201
    else:
        return jsonify({"error": "Failed to save to database"}), 500

@app.route('/chat', methods=['POST'])
def chat_with_ai():
    data = request.json
    user_message = data.get('message')
    
    # 1. Get Context (Recent Expenses)
    expenses = get_all_expenses()
    expenses_summary = "\n".join([f"- {e['description']}: {e['amount']} ({e['category']})" for e in expenses[:15]])
    
    # 2. Ask AI Helper
    ai_reply = get_chat_response(user_message, expenses_summary)
    
    return jsonify({"reply": ai_reply})

@app.route('/delete/<int:id>', methods=['DELETE'])
def delete_expense_endpoint(id):
    success = delete_expense(id)
    if success:
        return jsonify({"message": "Deleted successfully"}), 200
    else:
        return jsonify({"error": "Failed to delete"}), 500

if __name__ == '__main__':
    print("🚀 Server running on http://127.0.0.1:5000")
    app.run(debug=True)


def get_chat_response(user_message, context):
    """
    Generates a chat response using the fallback model list.
    """
    system_instruction = f"""
    You are a friendly financial advisor. 
    Here is the user's recent spending history:
    {context}
    
    Answer the user's question based on this data. Be concise, encouraging, and helpful.
    """

    # Same fallback list as before
    models_to_try = [
        "gemini-2.0-flash-lite",
        "gemini-2.0-flash",
        "gemini-1.5-flash",
    ]
    
    for model_name in models_to_try:
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=f"{system_instruction}\n\nUser: {user_message}",
                config=types.GenerateContentConfig(temperature=0.7)
            )
            print(f"✅ Chat generated using {model_name}")
            return response.text
        except Exception as e:
            print(f"⚠️ {model_name} failed for chat: {e}")
            continue
            
    return "I am currently unable to connect to my AI brain. Please try again later."


