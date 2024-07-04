import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface ProgressChartProps {
  data: { date: string; status: string }[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({ data }) => {
  const statusCounts = data.reduce(
    (acc, entry) => {
      switch (entry.status) {
        case "Success":
          acc.success += 1;
          break;
        case "Mediocre":
          acc.mediocre += 1;
          break;
        case "Failed":
          acc.failed += 1;
          break;
        default:
          break;
      }
      return acc;
    },
    { success: 0, mediocre: 0, failed: 0 }
  );

  const formattedData = {
    labels: ["Success", "Mediocre", "Failed"],
    datasets: [
      {
        label: "Habit Progress",
        data: [
          statusCounts.success,
          statusCounts.mediocre,
          statusCounts.failed,
        ],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)", // Success
          "rgba(255, 205, 86, 0.6)", // Mediocre
          "rgba(255, 99, 132, 0.6)", // Failed
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)", // Success
          "rgba(255, 205, 86, 1)", // Mediocre
          "rgba(255, 99, 132, 1)", // Failed
        ],
        borderWidth: 1,
      },
    ],
  };

  return <Doughnut data={formattedData} />;
};

export default ProgressChart;
