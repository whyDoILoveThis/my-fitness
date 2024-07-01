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
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const year = new Date().getFullYear();
  const docId = `${currentMonth}-${year}`;
  const { userId } = useAuth();

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

    const fetchPastMonths = async () => {
      const querySnapshot = await getDocs(
        collection(db, `habits-${userId}`)
      );
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

    const docRef = doc(db, `habits-${userId}`, docId);
    await updateDoc(docRef, { days: newDays });
  };

  const renderCalendar = (monthData: MonthData) => {
    const firstDayOfWeek = new Date(year, new Date().getMonth(), 1).getDay();
    const leadingEmptyDays = Array.from({ length: firstDayOfWeek }, () => "");

    return (
      <div className="month-card">
        <h3 className="text-center">{monthData.id}</h3>
        <div className="calendar">
          {daysOfWeek.map((day) => (
            <div key={day} className="text-center">
              {day}
            </div>
          ))}
          {leadingEmptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="calendar-day empty"></div>
          ))}
          {monthData.days.map((status, index) => (
            <div key={index} className={`day small ${status}`}>
              <span>{index + 1}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="all-months ml-2 text-base">
      {currentMonthData && renderCalendar(currentMonthData)}
      <div className="past-months-grid">
        {pastMonths.map((month) => (
          <React.Fragment key={month.id}>
            {renderCalendar(month)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default AllMonths;
