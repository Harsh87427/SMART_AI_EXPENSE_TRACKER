import { useState, useEffect } from "react";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast"; 
import { Wallet, TrendingUp, PlusCircle, CreditCard, DollarSign, Trash2, Mic } from "lucide-react";
import ExpenseChart from "./components/ExpenseChart";
import "./App.css";

const API_URL = "http://127.0.0.1:5000";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [budget, setBudget] = useState(50000); // Default budget
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return toast.error("Browser does not support voice");
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // Indian English
    recognition.start();

    toast.loading("Listening...", { duration: 2000 });

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setDescription(transcript); // Auto-fill the description
      toast.success("Heard: " + transcript);
    };

    recognition.onerror = () => toast.error("Voice error");
  };


  const fetchExpenses = async () => {
    try {
      const response = await axios.get(`${API_URL}/expenses`);
      setExpenses(response.data);
    } catch (error) {
      toast.error("Server connection failed");
    }
  };
  const handleDelete = async (id) => {
    // Optimistic UI: Remove it from screen immediately
    const oldExpenses = expenses;
    setExpenses(expenses.filter(e => e.id !== id));
    toast.success("Transaction deleted");

    try {
      await axios.delete(`${API_URL}/delete/${id}`);
      fetchExpenses(); // Refresh to be sure
    } catch (error) {
      setExpenses(oldExpenses); // Rollback if server fails
      toast.error("Failed to delete");
    }
  };

  // Calculate Stats
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remaining = budget - totalSpent;

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!description || !amount) return toast.error("Please fill in fields");

    setIsLoading(true);
    // Show a "Thinking" toast while AI works
    const toastId = toast.loading("AI is categorizing...");

    try {
      const response = await axios.post(`${API_URL}/add-expense`, {
        description,
        amount: parseFloat(amount),
        date: new Date().toISOString().split("T")[0],
      });

      // Update the toast to Success
      toast.success(`Categorized as: ${response.data.category}`, { id: toastId });
      
      // Update UI
      setDescription("");
      setAmount("");
      fetchExpenses(); 
    } catch (error) {
      toast.error("Failed to add expense", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      {/* The Toast Notification Container */}
      <Toaster position="top-center" toastOptions={{ style: { background: '#334155', color: '#fff' } }}/>
      
      <header className="header">
        <h1><TrendingUp className="icon" /> AI Finance Dashboard</h1>
        <p className="subtitle">Real-time Analytics & AI Classification</p>
      </header>

      {/* TOP ROW: Financial Stats Cards */}
      <div className="stats-grid">
        {/* Card 1: Budget */}
        <div className="stat-card budget">
          <div className="card-header">
            <Wallet size={20} className="card-icon"/>
            <h3>Total Budget</h3>
          </div>
          <div className="input-wrapper">
            <span>₹</span>
            <input 
              type="number" 
              value={budget} 
              onChange={(e) => setBudget(parseFloat(e.target.value))} 
            />
          </div>
        </div>

        {/* Card 2: Spent */}
        <div className="stat-card spent">
          <div className="card-header">
            <CreditCard size={20} className="card-icon"/>
            <h3>Total Spent</h3>
          </div>
          <p className="stat-value">₹{totalSpent.toLocaleString('en-IN')}</p>
        </div>

        {/* Card 3: Balance */}
        <div className="stat-card balance">
           <div className="card-header">
            <DollarSign size={20} className="card-icon"/>
            <h3>Remaining</h3>
          </div>
          <p className="stat-value" style={{ color: remaining < 0 ? '#ef4444' : '#10b981' }}>
            ₹{remaining.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      <div className="main-grid">
        {/* LEFT COLUMN: Input Form & Recent List */}
        <div className="left-col">
          {/* 1. Add Expense Form */}
          <div className="card form-card">
            <h2>Add Transaction</h2>
            <form onSubmit={handleAddExpense}>
              <input
                className="modern-input"
                placeholder="Description (e.g., KFC Bucket, Uber to Mall)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <div style={{ position: 'relative' }}>
   
    <button 
        type="button"
        onClick={startListening}
        style={{ 
            position: 'absolute', right: '10px', top: '12px', 
            background: 'transparent', border: 'none', color: '#3b82f6', cursor: 'pointer' 
        }}
    >
        <Mic size={20} />
    </button>
</div>
              <div className="amount-row">
                <div className="currency-input">
                    <span>₹</span>
                    <input
                    className="modern-input amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    />
                </div>
                <button type="submit" disabled={isLoading} className="add-btn">
                  {isLoading ? "..." : <PlusCircle size={20} />} Add
                </button>
              </div>
            </form>
          </div>

          {/* 2. Recent Transactions List */}
          <div className="card list-card">
            <h2>Recent Activity</h2>
            {expenses.length === 0 ? (
                <div className="empty-state">No transactions yet.</div>
            ) : (
                <div className="expense-scroll">
                {expenses.map((e, i) => (
                    <div key={i} className="transaction-item">
    <div className="left-side">
        <div className={`category-dot ${e.category?.toLowerCase() || 'misc'}`}></div>
        <div className="details">
            <span className="desc">{e.description}</span>
            <span className="cat-badge">{e.category}</span>
        </div>
    </div>
    <div className="right-side" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span className="amount">-₹{e.amount}</span>
        <button 
            onClick={() => handleDelete(e.id)}
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: 5 }}
            className="delete-btn"
        >
            <Trash2 size={16} />
        </button>
    </div>
</div>
                ))}
                </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: The Visuals */}
        <div className="right-col">
          <div className="card chart-card">
            <h2>Spending Breakdown</h2>
            <ExpenseChart expenses={expenses} />
          </div>
        </div>
      </div>

      {/* The AI Chatbot Lives Here */}
    </div>
  );
}

export default App;