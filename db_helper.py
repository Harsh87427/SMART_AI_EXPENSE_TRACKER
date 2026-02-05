import mysql.connector
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
DB_HOST = os.getenv("DB_HOST")
DB_PORT = int(os.getenv("DB_PORT", 21344))
DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME")

def get_db_connection():
    try:
        connection = mysql.connector.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            ssl_disabled=False 
        )
        return connection
    except mysql.connector.Error as err:
        print(f"Error: {err}")
        return None

def add_expense(amount, category, description, date):
    """Saves a new Expense to the database."""
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        query = "INSERT INTO expenses (amount, category, description, date) VALUES (%s, %s, %s, %s)"
        try:
            cursor.execute(query, (amount, category, description, date))
            conn.commit()
            print("✅ Expense added successfully.")
            return True
        except mysql.connector.Error as err:
            print(f"❌ Failed to insert: {err}")
            return False
        finally:
            cursor.close()
            conn.close()
    return False

def get_all_expenses():
    """ Fetches all the expenses from the database. """
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM expenses ORDER BY date DESC")
        expenses = cursor.fetchall()
        cursor.close()
        conn.close()
        return expenses
    return []

def delete_expense(expense_id):
    """ Deletes an expense by ID """
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        try:
            # We use a parameterized query for security
            cursor.execute("DELETE FROM expenses WHERE id = %s", (expense_id,))
            conn.commit()
            return True
        except mysql.connector.Error as err:
            print(f"❌ Failed to delete: {err}")
            return False
        finally:
            cursor.close()
            conn.close()
    return False

def setup_database():
    print("Setting up the database...")
    conn = get_db_connection()
    if conn:
        cursor = conn.cursor()
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS expenses(
            id int AUTO_INCREMENT PRIMARY KEY,
            description VARCHAR(255) NOT NULL,
            amount FLOAT NOT NULL,
            category VARCHAR(100),
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        print("✅ Database setup complete.")
        conn.close()
    else:
        print("❌ Failed to connect to the database.")

if __name__ == "__main__":
    setup_database()