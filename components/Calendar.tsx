"use client";
import React, { useState, useEffect } from "react";
import { db } from "../lib/firebaseConfig";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import "../styles/Calendar.css";
import { useAuth } from "@clerk/nextjs";
import Loader from "./Loader";
import PopOver from "./PopOver";

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

const CurrentMonth: React.FC = () => {
  const [days, setDays] = useState<DayStatus[]>([]);
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(-1); // State to track current day index
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showHint, setShowHint] = useState(false);
  const [loading, setLoading] = useState(false);
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const [currentMonthData, setCurrentMonthData] = useState<MonthData | null>(
    null
  );
  const year = new Date().getFullYear();
  const docId = `${currentMonth}-${year}`;
  const [allData, setAllData] = useState<{ date: string; status: string }[]>(
    []
  );
  const { userId } = useAuth();

  useEffect(() => {
    setLoading(true);
    const daysInMonth = new Date(year, new Date().getMonth() + 1, 0).getDate();
    const today = new Date().getDate(); // Get today's date

    const initialDays = Array.from({ length: daysInMonth }, (_, index) => {
      return index === today - 1 ? "neutral current-day" : "neutral"; // Mark current day with a class
    });

    setDays(initialDays);
    setCurrentDayIndex(today - 1); // Set current day index

    const initializeDoc = async () => {
      const docRef = doc(db, `habits-${userId}`, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setDays(docSnap.data().days as DayStatus[]);
        const data = docSnap.data().days as DayStatus[];
        setCurrentMonthData({ id: docId, days: data });

        updateAllData(docId, data);

        setLoading(false);
      } else {
        const defaultDays: DayStatus[] = Array.from(
          { length: daysInMonth },
          () => "neutral"
        );
        await setDoc(docRef, { days: defaultDays });
        setDays(defaultDays);
        setCurrentMonthData({ id: docId, days: defaultDays });
        updateAllData(docId, defaultDays);
        setLoading(false);
      }
    };

    initializeDoc();
    const updateAllData = (id: string, days: DayStatus[]) => {
      const month = id.split("-")[0];
      const yearString = id.split("-")[1];
      const year = parseInt(yearString, 10);

      const monthIndex = new Date(`${month} 1, ${year}`).getMonth(); // Get the month index for consistent formatting

      const formattedDays = days.map((status, index) => {
        const date = new Date(year, monthIndex, index + 1)
          .toISOString()
          .split("T")[0]; // ISO format (YYYY-MM-DD)
        return { date, status: status.split(" ")[0] }; // Remove "current-day" if present
      });

      setAllData((prevData) => {
        const updatedData = [...prevData, ...formattedDays];
        return updatedData.sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );
      });
    };
  }, [currentMonth, year, docId]);

  const updateDayStatus = async (index: number, status: DayStatus) => {
    const newDays = [...days];
    newDays[index] = status;
    setDays(newDays);

    const docRef = doc(db, `habits-${userId}`, docId);
    await updateDoc(docRef, { days: newDays });
  };

  const month = new Date().getMonth(); // 0-11
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const leadingEmptyDays = Array.from({ length: firstDayOfWeek }, () => "");

  if (loading) {
    return <Loader />;
  }

  return (
    <div className=" flex flex-col items-center justify-center mt-5">
      <div className="flex justify-center gap-2">
        <PopOver
          btnTxt="?"
          title="How To Use"
          line1="👆🏽 Click or touch a day of the month to apply a rating"
          line2="📅 View past months from the overlook page"
          line3="📈 Visualize the data from the graph page"
        />
        <h1 className="text-5xl text-center">{currentMonth}</h1>
      </div>

      <div className="calendar">
        {daysOfWeek.map((day) => (
          <div key={day} className="calendar-day-header text-center">
            {day}
          </div>
        ))}
        {leadingEmptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="calendar-day empty"></div>
        ))}
        {days.map((status, index) => (
          <>
            <div
              key={index}
              className={`day cursor-pointer bg-black bg-opacity-30 ${status} ${
                index === currentDayIndex ? "current-day" : ""
              }`}
              onClick={() => {
                setSelectedIndex(index);
              }}
            >
              <span className="flex justify-center items-center">
                {index + 1}
              </span>
              {selectedIndex !== index && status !== "neutral" && (
                <p className="status">{status}</p>
              )}
            </div>
            {selectedIndex === index && (
              <div className="buttons">
                <button
                  className="btn-cancel"
                  onClick={() => setSelectedIndex(9999)}
                >
                  x
                </button>
                <p className="text-2xl mb-4">Day {index + 1}</p>
                <button
                  className="statbtn btn-success"
                  onClick={() => {
                    updateDayStatus(index, "Success");
                    setSelectedIndex(-1);
                  }}
                >
                  Success
                </button>
                <button
                  className="statbtn btn-mediocre"
                  onClick={() => {
                    updateDayStatus(index, "Mediocre");
                    setSelectedIndex(-1);
                  }}
                >
                  Mediocre
                </button>
                <button
                  className="statbtn btn-failed"
                  onClick={() => {
                    updateDayStatus(index, "Failed");
                    setSelectedIndex(-1);
                  }}
                >
                  Failure
                </button>
                <button
                  className="statbtn btn-clear"
                  onClick={() => {
                    updateDayStatus(index, "neutral");
                    setSelectedIndex(-1);
                  }}
                >
                  Clear
                </button>
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
};

export default CurrentMonth;
