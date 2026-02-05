import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

// Register the Chart.js parts we need
ChartJS.register(ArcElement, Tooltip, Legend);

const ExpenseChart = ({ expenses }) => {
  // 1. Calculate totals per category
  const categoryTotals = expenses.reduce((acc, curr) => {
    const cat = curr.category || 'Miscellaneous';
    acc[cat] = (acc[cat] || 0) + curr.amount;
    return acc;
  }, {});

  // 2. Prepare data for the chart
  const data = {
    labels: Object.keys(categoryTotals),
    datasets: [
      {
        data: Object.values(categoryTotals),
        backgroundColor: [
          '#FF6384', // Red
          '#36A2EB', // Blue
          '#FFCE56', // Yellow
          '#4BC0C0', // Teal
          '#9966FF', // Purple
          '#FF9F40', // Orange
          '#C9CBCF', // Grey
          '#2ecc71', // Green
        ],
        borderWidth: 0, // Clean look (no borders)
        hoverOffset: 10, // Expands when you hover
      },
    ],
  };

  const options = {
    plugins: {
      legend: { 
        position: 'bottom',
        labels: { color: '#cbd5e1', padding: 20, font: { size: 12 } } 
      }
    },
    cutout: '70%', // Makes it a doughnut (hollow center)
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <div style={{ height: '300px', position: 'relative' }}>
      {expenses.length > 0 ? (
        <Doughnut data={data} options={options} />
      ) : (
        <div style={{ 
          height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
          color: '#64748b', border: '2px dashed #334155', borderRadius: '1rem' 
        }}>
          <p>Add an expense to see the chart</p>
        </div>
      )}
    </div>
  );
};

export default ExpenseChart;