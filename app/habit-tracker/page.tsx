// pages/index.js
"use client";
import Head from "next/head";
import Calendar from "../../components/Calendar";
import AddGoals from "@/components/AddGoals";
import ItsInput from "@/components/ItsInput";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebaseConfig";
import { useUser } from "@clerk/nextjs";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Home() {
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [doneModifyingGoals, setDoneModifyingGoals] = useState(false);
  const [value, setValue] = useState("");
  const currentMonth = new Date().toLocaleString("default", { month: "long" });
  const [currentMonthGoals, setCurrentMonthGoals] = useState([""]);
  const year = new Date().getFullYear();
  const docId = `${currentMonth}-${year}`;
  const { user } = useUser();
  const userId = user?.id;
  const [tryDeleteGoal, setTryDeleteGoal] = useState<boolean[]>([]);

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
        const existingGoals = docSnap.data().goalsa || [];
        await setDoc(docRef, { goals: [...existingGoals, value] });
      } else {
        await setDoc(docRef, { goals: [value] });
      }
    }
  }

  const deleteGoalData = async (goalToDelete: string) => {
    const docRef = doc(db, `goals-${userId}-${docId}`, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const existingGoals = docSnap.data().goals || [];
      const updatedGoals = existingGoals.filter(
        (goal: string) => goal !== goalToDelete
      );

      await setDoc(docRef, { goals: updatedGoals });
      setCurrentMonthGoals(updatedGoals);
    }
  };

  useEffect(() => {
    async function readGoalData() {
      try {
        console.log("💨fetching", doneModifyingGoals);

        const docRef = doc(db, `goals-${userId}-${docId}`, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("Goal data:", data);

          setCurrentMonthGoals(data?.goals ?? []);
        } else {
          console.log("No such document!");
          setCurrentMonthGoals([]);
        }
      } catch (error) {
        console.error("Error reading goal data:", error);
        setCurrentMonthGoals([]);
      }
    }

    if (userId) {
      readGoalData();
    }
  }, [userId, docId, !doneModifyingGoals]);

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
      <article className=" mb-10 flex gap-4 flex-col items-center justify-center border border-white border-opacity-20 bg-black bg-opacity-30 p-2 rounded-xl">
        <h2 className=" font-extrabold text-xl">Goals for this month </h2>
        <div className="flex flex-col gap-3">
          {currentMonthGoals.map((data, index) => (
            <div>
              <div className="p-2 border border-white border-opacity-20 rounded-2xl bg-white bg-opacity-5">
                <p key={index}>{data}</p>
                <button
                  onClick={() => handleTryDeleteGoal(true, index)}
                  className="btn btn-failed"
                >
                  delete
                </button>
              </div>
              {tryDeleteGoal[index] && (
                <article className="bg-popover flex flex-col gap-6 items-center justify-center">
                  <div className="border rounded-xl bg-black bg-opacity-25 p-4 pr-14">
                    <span className=" text-red-300 font-bold">DELETING</span>{" "}
                    <p>{data}</p>
                  </div>
                  <h2 className=" text-xl text-blue-100">
                    This action is NOT reversable!!
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
                        deleteGoalData(data);
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
