// components/ProgressChart.tsx
import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface ProgressChartProps {
  data: { date: string; status: string }[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  const formattedData = {
    labels: data.map((entry) => entry.date),
    datasets: [
      {
        label: "Habit Progress",
        data: data.map((entry) => {
          switch (entry.status) {
            case "Success":
              return 3;
            case "Mediocre":
              return 2;
            case "Failed":
              return 1;
            default:
              return 0;
          }
        }),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
      },
    ],
  };

  return <Line data={formattedData} />;
};

export default ProgressChart;
