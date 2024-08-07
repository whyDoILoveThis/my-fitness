// pages/allMonths.tsx

"use client";
import React, { useEffect, useState } from "react";
import { db } from "../../lib/firebaseConfig"; // Adjust the path to firebaseConfig if needed
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import ProgressChart from "../../components/ProgressChart"; // Adjust the path to ProgressChart if needed
import Link from "next/link";
import Nav from "@/components/Nav";
import { useAuth } from "@clerk/nextjs";
import DoughnutChart from "@/components/DoughnutChart";

interface MonthData {
  id: string;
  days: { date: string; status: string }[];
}

type DayStatus =
  | "neutral"
  | "neutral current-day"
  | "successful"
  | "mediocre"
  | "failed";

const AllMonthsPage: React.FC = () => {
  const [monthsData, setMonthsData] = useState<MonthData[]>([]);
  const [currentMonthData, setCurrentMonthData] = useState<MonthData | null>(
    null
  );
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const year = new Date().getFullYear();
  const docId = `${currentMonth}-${year}`;
  const { userId } = useAuth();

  const [selected, setSelected] = useState(1);

  useEffect(() => {
    const fetchCurrentMonth = async () => {
      const docRef = doc(db, `habits-${userId}`, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const days = docSnap.data().days;
        const formattedDays = days.map((status: DayStatus, index: number) => ({
          date: new Date(year, new Date().getMonth(), index + 1)
            .toISOString()
            .split("T")[0],
          status: status.split(" ")[0], // Remove "current-day" if present
        }));
        setCurrentMonthData({ id: docId, days: formattedDays });
      }
    };

    const fetchMonthsData = async () => {
      const querySnapshot = await getDocs(collection(db, `habits-${userId}`));
      const monthsData: MonthData[] = [];

      querySnapshot.forEach((doc) => {
        const days = doc.data().days as DayStatus[];
        const [month, year] = doc.id.split("-");
        const monthIndex = new Date(`${month} 1, ${year}`).getMonth();

        const formattedDays = days.map((status, index) => ({
          date: new Date(parseInt(year), monthIndex, index + 1)
            .toISOString()
            .split("T")[0],
          status: status.split(" ")[0], // Remove "current-day" if present
        }));

        monthsData.push({ id: doc.id, days: formattedDays });
      });

      setMonthsData(monthsData);
    };

    fetchCurrentMonth();
    fetchMonthsData();
  }, [docId, year]);

  return (
    <div className="all-months-page">
      <h1 className="text-4xl text-center my-4">📈 Vizualization</h1>

      <div className="progress-charts">
        <div className="flex justify-center gap-2">
          <button
            className="link"
            onClick={() => {
              setSelected(1);
            }}
          >
            Line
          </button>
          <button
            className="link"
            onClick={() => {
              setSelected(2);
            }}
          >
            Doughnut
          </button>
        </div>
        {monthsData.map((month) => (
          <div
            key={month.id}
            className="progress-chart flex flex-col items-center justify-center p-6 m-4 border border-slate-600 bg-slate-400 bg-opacity-5 rounded-2xl"
          >
            <h3 className="font-extrabold text-2xl">{month.id}</h3>
            {selected === 1 ? (
              <ProgressChart data={month.days} />
            ) : (
              selected === 2 && <DoughnutChart data={month.days} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllMonthsPage;
