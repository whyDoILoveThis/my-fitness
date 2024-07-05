import { db } from "@/lib/firebaseConfig";
import { useAuth } from "@clerk/nextjs";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

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

interface Props {
  monthData: MonthData;
  docId: string;
  currentDayIndex: number;
  selectedIndex: number;
  setSelectedIndex: Function;
  updateCurrentDayStatus: Function;
  updatePastDayStatus: Function;
}

const RenderCalendar = ({
  monthData,
  docId,
  currentDayIndex,
  selectedIndex,
  setSelectedIndex,
  updateCurrentDayStatus,
  updatePastDayStatus,
}: Props) => {
  const [month, year] = monthData.id.split("-");
  const monthIndex = new Date(`${month} 1, ${year}`).getMonth();
  const firstDayOfWeek = new Date(parseInt(year), monthIndex, 1).getDay();
  const leadingEmptyDays = Array.from({ length: firstDayOfWeek }, () => "");
  const [goals, setGoals] = useState([]);
  const { userId } = useAuth();
  console.log(monthData.id);

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        console.log("fetching💨");

        const docRef = doc(db, `goals-${userId}`, monthData.id);
        console.log(docRef);

        const docSnap = await getDoc(docRef);
        console.log(docSnap);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setGoals(data.goals);
          console.log(data.goals);
        }
      } catch (error) {
        console.error("Error fetching goals:", error);
      }
    };

    fetchGoals();
    console.log(goals);
  }, [userId, monthData.id]);

  console.log(goals);

  return (
    <div className="month-card">
      <h3 className="text-center">{monthData.id}</h3>
      <div>
        {goals.map((goal: Goal, index) => (
          <p key={index}>{goal.text}</p>
        ))}
      </div>
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

export default RenderCalendar;
