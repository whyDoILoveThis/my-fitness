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

type DayStatus =
  | "neutral"
  | "neutral current-day"
  | "successful"
  | "mediocre"
  | "failed";

interface MonthData {
  id: string;
  days: DayStatus[];
}

const AllMonths: React.FC = () => {
  const [currentMonthData, setCurrentMonthData] = useState<MonthData | null>(
    null
  );
  const [pastMonths, setPastMonths] = useState<MonthData[]>([]);
  const [days, setDays] = useState<DayStatus[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(-1); // State to track current day index
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const year = new Date().getFullYear();
  const docId = `${currentMonth}-${year}`;

  useEffect(() => {
    const daysInMonth = new Date(year, new Date().getMonth() + 1, 0).getDate();
    const today = new Date().getDate(); // Get today's date

    const initialDays = Array.from({ length: daysInMonth }, (_, index) => {
      return index === today - 1 ? "neutral current-day" : "neutral"; // Mark current day with a class
    });

    setDays(initialDays);
    setCurrentDayIndex(today - 1); // Set current day index

    const fetchCurrentMonth = async () => {
      const docRef = doc(db, "habits", docId);
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

    const fetchPastMonths = async () => {
      const querySnapshot = await getDocs(collection(db, "pastHabits"));
      const monthsData: MonthData[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data().days as DayStatus[];
        monthsData.push({ id: doc.id, days: data });
      });
      setPastMonths(monthsData);
    };

    fetchCurrentMonth();
    fetchPastMonths();
  }, [docId, year]);

  const updateDayStatus = async (index: number, status: DayStatus) => {
    if (!currentMonthData) return;

    const newDays = [...currentMonthData.days];
    newDays[index] = status;
    setCurrentMonthData({ ...currentMonthData, days: newDays });

    const docRef = doc(db, "habits", docId);
    await updateDoc(docRef, { days: newDays });
  };

  return (
    <div className="all-months ml-2 text-base">
      {currentMonthData && (
        <div className="month-card">
          <h3>{currentMonthData.id}</h3>
          <div className="calendar">
            {currentMonthData.days.map((status, index) => (
              <div key={index} className={`day small ${status}`}>
                <span>{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="past-months-grid">
        {pastMonths.map((month) => (
          <div key={month.id} className="month-card">
            <h3 className="text-center">{month.id}</h3>
            <div className="calendar">
              {month.days.map((status, index) => (
                <div key={index} className={`day small ${status}`}>
                  <span>{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllMonths;
