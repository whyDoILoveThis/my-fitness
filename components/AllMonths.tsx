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
  | "Success"
  | "Mediocre"
  | "Failed";

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
  const [selectedIndex, setSelectedIndex] = useState(-1);
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

  const renderCalendar = (monthData: MonthData) => {
    const [month, year] = monthData.id.split("-");
    const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
    const firstDayOfWeek = new Date(parseInt(year), monthIndex, 1).getDay();
    const leadingEmptyDays = Array.from({ length: firstDayOfWeek }, () => "");

    console.log(currentMonth);

    return (
      <div className="month-card">
        <h3 className="text-center">{monthData.id}</h3>
        <div className="calendar">
          {leadingEmptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="calendar-day empty"></div>
          ))}
          {monthData.days.map((status, index) => {
            const isCurrentMonth = docId === monthData.id && true;
            console.log(isCurrentMonth);

            return (
              <>
                <div
                  key={index}
                  className={`day small cursor-pointer ${status} ${
                    index === currentDayIndex && docId === monthData.id
                      ? "current-day"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedIndex(index);
                  }}
                >
                  <span className="flex justify-center items-center">
                    {index + 1}
                  </span>
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
                      className="btn btn-success"
                      onClick={() => {
                        isCurrentMonth
                          ? updateCurrentDayStatus(index, "Success")
                          : updatePastDayStatus(monthData, index, "Success");
                        setSelectedIndex(-1);
                      }}
                    >
                      Success
                    </button>
                    <button
                      className="btn btn-mediocre"
                      onClick={() => {
                        isCurrentMonth
                          ? updateCurrentDayStatus(index, "Mediocre")
                          : updatePastDayStatus(monthData, index, "Mediocre");
                        setSelectedIndex(-1);
                      }}
                    >
                      Mediocre
                    </button>
                    <button
                      className="btn btn-failed"
                      onClick={() => {
                        isCurrentMonth
                          ? updateCurrentDayStatus(index, "Failed")
                          : updatePastDayStatus(monthData, index, "Failed");
                        setSelectedIndex(-1);
                      }}
                    >
                      Failure
                    </button>
                    <button
                      className="btn btn-clear"
                      onClick={() => {
                        isCurrentMonth
                          ? updateCurrentDayStatus(index, "neutral")
                          : updatePastDayStatus(monthData, index, "neutral");
                        setSelectedIndex(-1);
                      }}
                    >
                      Clear
                    </button>
                  </div>
                )}
              </>
            );
          })}
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
            {docId !== month.id && renderCalendar(month)}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default AllMonths;
