"use client";
import Head from "next/head";
import Calendar from "../../components/Calendar";
import AddGoals from "@/components/AddGoals";
import ItsInput from "@/components/ItsInput";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { useUser } from "@clerk/nextjs";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Define the type for a goal
interface Goal {
  text: string;
  status: "neutral" | "Success" | "Failed";
}

export default function Home() {
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [doneModifyingGoals, setDoneModifyingGoals] = useState(false);
  const [value, setValue] = useState("");
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const [currentMonthGoals, setCurrentMonthGoals] = useState<Goal[]>([]);
  const year = new Date().getFullYear();
  const docId = `${currentMonth}-${year}`;
  const { user } = useUser();
  const userId = user?.id;
  const [tryDeleteGoal, setTryDeleteGoal] = useState<boolean[]>([]);
  const [showEdit, setSHowEdit] = useState(false);

  function handleTryDeleteGoal(value: boolean, index: number) {
    if (currentMonthGoals !== null) {
      let outs: boolean[] = [];
      currentMonthGoals.map(() => {
        outs.push(false);
        outs[index] = value;
        setTryDeleteGoal([...outs]);
      });
    }
  }

  async function writeGoalData() {
    if (value !== "") {
      const docRef = doc(db, `goals-${userId}-${docId}`, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const existingGoals = docSnap.data().goals || [];
        await setDoc(docRef, {
          goals: [...existingGoals, { text: value, status: "neutral" }],
        });
      } else {
        await setDoc(docRef, { goals: [{ text: value, status: "neutral" }] });
      }
      setDoneModifyingGoals(!doneModifyingGoals); // Trigger re-fetch
    }
  }

  const deleteGoalData = async (goalToDelete: string) => {
    setSHowEdit(false);
    const docRef = doc(db, `goals-${userId}-${docId}`, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const existingGoals: Goal[] = docSnap.data().goals || [];
      const updatedGoals = existingGoals.filter(
        (goal: Goal) => goal.text !== goalToDelete
      );

      await setDoc(docRef, { goals: updatedGoals });
      setCurrentMonthGoals(updatedGoals);
    }
  };

  const updateGoalStatus = async (
    goalIndex: number,
    newStatus: Goal["status"]
  ) => {
    const docRef = doc(db, `goals-${userId}-${docId}`, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const existingGoals: Goal[] = docSnap.data().goals || [];
      existingGoals[goalIndex].status = newStatus;

      await setDoc(docRef, { goals: existingGoals });
      setCurrentMonthGoals(existingGoals);
    }
  };

  useEffect(() => {
    readGoalData();
  }, [userId, docId]);

  useEffect(() => {
    setTimeout(() => {
      readGoalData();
    }, 1000);
  }, [doneModifyingGoals]);

  async function readGoalData() {
    try {
      console.log("💨fetching", doneModifyingGoals);

      const docRef = doc(db, `goals-${userId}-${docId}`, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log("Goal data:", data);

        setCurrentMonthGoals(data?.goals || []);
      }
    } catch (error) {
      console.error("Error reading goal data:", error);
      setCurrentMonthGoals([]);
    }
  }

  return (
    <div className="app mt-4">
      <Head>
        <h1 className="text-4xl text-center mb-4">Habit Tracker 📅</h1>
      </Head>
      <h1 className="text-4xl text-center mb-4">Habit Tracker 📅</h1>
      <Calendar />
      <article className="mb-2">
        {!isAddingGoal && <AddGoals setIsAddingGoal={setIsAddingGoal} />}
        {isAddingGoal && (
          <div className="my-10">
            <ItsInput
              btnTxt="+"
              btnTxtSize="4"
              placeholder="Add a goal..."
              type="text"
              stateVar={isAddingGoal}
              setStateVar={setIsAddingGoal}
              setValue={setValue}
              value={value}
              value2={doneModifyingGoals}
              funct={writeGoalData}
              funct2={setDoneModifyingGoals}
            />
          </div>
        )}
      </article>
      <article className="relative mb-10 flex gap-4 flex-col items-center justify-center border border-white border-opacity-20 bg-black bg-opacity-30 p-2 rounded-xl">
        <h2 className=" font-extrabold text-xl">Goals for this month </h2>
        <button
          className="btn absolute top-2 right-2"
          onClick={() => {
            setSHowEdit(!showEdit);
          }}
        >
          {!showEdit ? "Edit" : "Cancel"}
        </button>
        <div className="flex flex-col gap-3">
          {currentMonthGoals.length > 0 &&
            currentMonthGoals.map((data, index) => (
              <div key={index}>
                <div
                  className={`${data.status}-goal p-2 border border-white border-opacity-20 rounded-2xl bg-white bg-opacity-5`}
                >
                  <div
                    className={`${
                      data.status === "Success" && "flex items-center gap-2"
                    }
                      ${data.status === "Failed" && "flex items-center gap-2"}
                    }`}
                  >
                    <p>{data.text}</p>
                    {!showEdit && (
                      <div className="flex gap-2">
                        {data.status !== "Failed" && (
                          <button
                            onClick={() =>
                              updateGoalStatus(
                                index,
                                data.status === "Success"
                                  ? "neutral"
                                  : data.status === "Failed"
                                  ? "neutral"
                                  : "Success"
                              )
                            }
                            className="border rounded-full border-green-300 btn-success px-[6px]"
                          >
                            {data.status === "Success" ? "✔" : "Success"}
                          </button>
                        )}
                        {data.status !== "Success" && (
                          <div>
                            <button
                              onClick={() =>
                                updateGoalStatus(
                                  index,
                                  data.status === "Failed"
                                    ? "neutral"
                                    : data.status === "Success"
                                    ? "neutral"
                                    : "Failed"
                                )
                              }
                              className="btn btn-failed px-2"
                            >
                              {data.status === "Failed" ? "X" : "Failed"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    {data.status !== "Failed" && showEdit && (
                      <button
                        onClick={() => handleTryDeleteGoal(true, index)}
                        className="btn btn-failed"
                      >
                        delete
                      </button>
                    )}
                  </div>
                </div>
                {tryDeleteGoal[index] && (
                  <article className="bg-popover flex flex-col gap-6 items-center justify-center">
                    <div className="border rounded-xl bg-black bg-opacity-25 p-4 pr-14">
                      <span className=" text-red-300 font-bold">DELETING</span>{" "}
                      <p>{data.text}</p>
                    </div>
                    <h2 className=" text-xl text-blue-100">
                      This action is NOT reversible!!
                    </h2>
                    <div className="flex gap-6">
                      <button
                        onClick={() => {
                          handleTryDeleteGoal(false, index);
                        }}
                        className="btn btn-failed w-fit"
                      >
                        NO!
                      </button>
                      <button
                        onClick={() => {
                          deleteGoalData(data.text);
                          handleTryDeleteGoal(false, index);
                        }}
                        className="btn btn-success w-fit"
                      >
                        Goodbye!
                      </button>
                    </div>
                  </article>
                )}
              </div>
            ))}
        </div>
      </article>
    </div>
  );
}
