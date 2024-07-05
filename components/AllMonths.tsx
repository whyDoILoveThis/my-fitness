"use client";
import React, { useState, useEffect } from "react";
import { db } from "../lib/firebaseConfig";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import "../styles/Calendar.css"; // Import global CSS
import { useAuth } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import RenderCalender from "./RenderCalender";

type DayStatus =
  | "neutral"
  | "neutral current-day"
  | "Success"
  | "Mediocre"
  | "Failed";

interface MonthData {
  id: string;
  days: DayStatus[];
}

// Define the type for a goal
interface Goal {
  text: string;
  status: "neutral" | "Success" | "Failed";
}

const AllMonths: React.FC = () => {
  const [currentMonthData, setCurrentMonthData] = useState<MonthData | null>(
    null
  );
  const [pastMonths, setPastMonths] = useState<MonthData[]>([]);
  const [days, setDays] = useState<DayStatus[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(-1); // State to track current day index
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const year = new Date().getFullYear();
  const docId = `${currentMonth}-${year}`;
  const { userId } = useAuth();
  const [showGoals, setShowGoals] = useState(false);

  useEffect(() => {
    const daysInMonth = new Date(year, new Date().getMonth() + 1, 0).getDate();
    const today = new Date().getDate(); // Get today's date

    const initialDays = Array.from({ length: daysInMonth }, (_, index) => {
      return index === today - 1 ? "neutral current-day" : "neutral"; // Mark current day with a class
    });

    setDays(initialDays);
    setCurrentDayIndex(today - 1); // Set current day index

    const fetchCurrentMonth = async () => {
      const docRef = doc(db, `habits-${userId}`, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data().days as DayStatus[];
        setCurrentMonthData({ id: docId, days: data });
      } else {
        const defaultDays: DayStatus[] = Array.from(
          { length: daysInMonth },
          () => "neutral"
        );
        await setDoc(docRef, { days: defaultDays });
        setCurrentMonthData({ id: docId, days: defaultDays });
      }
    };

    const fetchMonths = async () => {
      const querySnapshot = await getDocs(collection(db, `habits-${userId}`));
      const monthsData: MonthData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data().days as DayStatus[];
        monthsData.push({ id: doc.id, days: data });
      });
      setPastMonths(monthsData);
    };
    fetchCurrentMonth();
    fetchMonths();
  }, [docId, year]);

  const updateCurrentDayStatus = async (index: number, status: DayStatus) => {
    if (!currentMonthData) {
      console.log("err no currentmonthdata");
      return;
    }

    const newDays = [...currentMonthData.days];
    newDays[index] = status;
    setCurrentMonthData({ ...currentMonthData, days: newDays });

    const docRef = doc(db, `habits-${userId}`, docId);
    await updateDoc(docRef, { days: newDays });
  };

  const updatePastDayStatus = async (
    data: MonthData,
    index: number,
    status: DayStatus
  ) => {
    if (!data) {
      console.log("err no currentmonthdata");
      return;
    }

    const newDays = [...data.days];
    newDays[index] = status;
    setCurrentMonthData({ ...data, days: newDays });

    const docRef = doc(db, `habits-${userId}`, data.id);
    await updateDoc(docRef, { days: newDays });
  };

  return (
    <>
      <div className="flex gap-2 mb-6">
        <button
          className="link"
          onClick={() => {
            setShowGoals(false);
          }}
        >
          Habits
        </button>
        <button
          className="link"
          onClick={() => {
            setShowGoals(true);
          }}
        >
          Goals
        </button>
      </div>
      <h2 className="font-semibold text-3xl">
        {showGoals ? "Goals" : "Habits"}
      </h2>

      <div className="all-months ml-2 text-base">
        {currentMonthData && (
          <RenderCalender
            monthData={currentMonthData}
            docId={docId}
            currentDayIndex={currentDayIndex}
            selectedIndex={selectedIndex}
            setSelectedIndex={setSelectedIndex}
            updateCurrentDayStatus={updateCurrentDayStatus}
            updatePastDayStatus={updatePastDayStatus}
            showGoals={showGoals}
          />
        )}
        <div className="past-months-grid">
          {pastMonths.map((month) => (
            <React.Fragment key={month.id}>
              {docId !== month.id && (
                <RenderCalender
                  monthData={month}
                  docId={docId}
                  currentDayIndex={currentDayIndex}
                  selectedIndex={selectedIndex}
                  setSelectedIndex={setSelectedIndex}
                  updateCurrentDayStatus={updateCurrentDayStatus}
                  updatePastDayStatus={updatePastDayStatus}
                  showGoals={showGoals}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};

export default AllMonths;
