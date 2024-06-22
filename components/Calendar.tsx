// components/CurrentMonth.tsx
"use client";
import React, { useState, useEffect } from "react";
import { db } from "../lib/firebaseConfig";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import "../styles/Calendar.css";

type DayStatus =
  | "neutral"
  | "neutral current-day"
  | "Success"
  | "Mediocre"
  | "Failed";

const CurrentMonth: React.FC = () => {
  const [days, setDays] = useState<DayStatus[]>([]);
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(-1); // State to track current day index
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const year = new Date().getFullYear();
  const docId = `${currentMonth}-${year}`;

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
      const docRef = doc(db, "habits", docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setDays(docSnap.data().days as DayStatus[]);
        setLoading(false);
      } else {
        const defaultDays: DayStatus[] = Array.from(
          { length: daysInMonth },
          () => "neutral current-day"
        );
        await setDoc(docRef, { days: defaultDays });
        setDays(defaultDays);
        setLoading(false);
      }
    };

    initializeDoc();
  }, [currentMonth, year, docId]);

  const updateDayStatus = async (index: number, status: DayStatus) => {
    const newDays = [...days];
    newDays[index] = status;
    setDays(newDays);

    const docRef = doc(db, "habits", docId);
    await updateDoc(docRef, { days: newDays });
  };

  if (loading) {
    return <p>...</p>;
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-5xl text-center">{currentMonth}</h1>
      <div className="calendar">
        {days.map((status, index) => (
          <div
            key={index}
            className={`day ${status} ${
              index === currentDayIndex ? "current-day" : ""
            }`}
          >
            {status !== "neutral" && (
              <button
                className="btn-clear"
                onClick={() => updateDayStatus(index, "neutral")}
              >
                -
              </button>
            )}
            <span className="flex justify-center items-center">
              {index + 1}
            </span>
            {selectedIndex !== index && status === "neutral" ? (
              <button
                className="btn-rate"
                onClick={() => {
                  setSelectedIndex(index);
                }}
              >
                Rate
              </button>
            ) : selectedIndex === index && status === "neutral" ? (
              <>
                <div className="buttons">
                  <button
                    className="btn-cancel"
                    onClick={() => setSelectedIndex(-1)}
                  >
                    x
                  </button>
                  <p className="text-2xl mb-4">Day {index + 1}</p>
                  <button
                    className="btn btn-success"
                    onClick={() => updateDayStatus(index, "Success")}
                  >
                    Success
                  </button>
                  <button
                    className="btn btn-mediocre"
                    onClick={() => updateDayStatus(index, "Mediocre")}
                  >
                    Mediocre
                  </button>
                  <button
                    className="btn btn-failed"
                    onClick={() => updateDayStatus(index, "Failed")}
                  >
                    Failure
                  </button>
                </div>
              </>
            ) : (
              <p className="status">{status}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentMonth;
