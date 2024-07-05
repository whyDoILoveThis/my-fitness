// pages/workouts.tsx

"use client";
import React, { useState, useEffect } from "react";
import { db } from "../../lib/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import "../../styles/Calendar.css";
import "../../styles/Workouts.css";
import { useAuth } from "@clerk/nextjs";
import Loader from "@/components/Loader";

interface Workout {
  id: string;
  name: string;
  reps: number;
}

interface SavedWorkout {
  id: string;
  date: Date;
  workouts: Workout[];
}

const WorkoutsPage: React.FC = () => {
  const [workoutName, setWorkoutName] = useState("");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const [workoutsLoading, setWorkoutsLoading] = useState(false);
  const { userId } = useAuth();
  const [saving, setSaving] = useState(false);
  const [tryDeleteWorkout, setTryDeleteWorkout] = useState<boolean[]>([]);
  const [tryDeleteWorkoutList, setTryDeleteWorkoutList] = useState<boolean[]>(
    []
  );
  const [showEditWorkouts, setShowEditWorkouts] = useState(false);

  function handleTryDeleteWorkout(value: boolean, index: number) {
    if (workouts !== null) {
      let outs: boolean[] = [];
      workouts.map(() => {
        outs.push(false);
        outs[index] = value;
        setTryDeleteWorkout([...outs]);
      });
    }
  }

  function handleTryDeleteWorkoutList(value: boolean, index: number) {
    if (savedWorkouts !== null) {
      let outs: boolean[] = [];
      savedWorkouts.map(() => {
        outs.push(false);
        outs[index] = value;
        setTryDeleteWorkoutList([...outs]);
      });
    }
  }

  useEffect(() => {
    const fetchWorkouts = async () => {
      const querySnapshot = await getDocs(collection(db, `workouts-${userId}`));
      const workoutsData: Workout[] = [];
      querySnapshot.forEach((doc) => {
        workoutsData.push({ id: doc.id, ...doc.data() } as Workout);
      });
      setWorkouts(workoutsData);
      setLoading(false);
    };

    fetchWorkouts();
    fetchSavedWorkouts();
  }, [db, userId, saving]);

  const fetchSavedWorkouts = async () => {
    const q = query(
      collection(db, `saved-workouts-${userId}`),
      orderBy("date", "desc")
    );
    const querySnapshot = await getDocs(q);
    const savedWorkoutsData: SavedWorkout[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      savedWorkoutsData.push({
        id: doc.id,
        date: data.date.toDate(), // Converting Firestore timestamp to JS Date
        workouts: data.workouts,
      });
    });
    setSavedWorkouts(savedWorkoutsData);
  };

  const addWorkout = async () => {
    if (workoutName.trim() === "") return;
    const docRef = await addDoc(collection(db, `workouts-${userId}`), {
      name: workoutName,
      reps: 0,
    });

    setWorkouts([...workouts, { id: docRef.id, name: workoutName, reps: 0 }]);
    setWorkoutName("");
  };

  const saveWorkouts = async () => {
    setWorkoutsLoading(true);
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

    const q = query(
      collection(db, `saved-workouts-${userId}`),
      where("date", ">=", startOfDay),
      where("date", "<=", endOfDay)
    );
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // Update the existing document for today
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        date: new Date(),
        workouts: workouts.map((workout) => ({
          name: workout.name,
          reps: workout.reps,
        })),
      });
      setWorkoutsLoading(false);
    } else {
      // Create a new document
      await addDoc(collection(db, `saved-workouts-${userId}`), {
        date: new Date(),
        workouts: workouts.map((workout) => ({
          name: workout.name,
          reps: workout.reps,
        })),
      });
      setWorkoutsLoading(false);
    }
    fetchSavedWorkouts();
    setWorkoutsLoading(false);
  };

  const updateReps = async (id: string, name: string, delta: number) => {
    const workout = workouts.find((workout) => workout.id === id);
    if (name === "Pushups" || name === "pushups") {
      if (workout) {
        const newReps = workout.reps + delta * 5;
        if (newReps < 0) return;
        await updateDoc(doc(db, `workouts-${userId}`, id), { reps: newReps });
        setWorkouts(
          workouts.map((workout) =>
            workout.id === id ? { ...workout, reps: newReps } : workout
          )
        );
      }
    } else if (name === "Laps" || name === "laps") {
      if (workout) {
        const newReps = workout.reps + delta;
        if (newReps < 0) return;
        await updateDoc(doc(db, `workouts-${userId}`, id), { reps: newReps });
        setWorkouts(
          workouts.map((workout) =>
            workout.id === id ? { ...workout, reps: newReps } : workout
          )
        );
      }
    } else if (workout) {
      const newReps = workout.reps + delta;
      if (newReps < 0) return;
      await updateDoc(doc(db, `workouts-${userId}`, id), { reps: newReps });
      setWorkouts(
        workouts.map((workout) =>
          workout.id === id ? { ...workout, reps: newReps } : workout
        )
      );
    }
  };

  const deleteWorkout = async (id: string) => {
    await deleteDoc(doc(db, `workouts-${userId}`, id));
    setWorkouts(workouts.filter((workout) => workout.id !== id));
  };

  const handleDeleteWorkout = async (savedWorkoutId: string, index: number) => {
    console.log("deleting");

    setLoading(true);

    savedWorkouts.map((saved) => {
      if (saved.id === savedWorkoutId) {
        const docRef = doc(db, `saved-workouts-${userId}`, saved.id);
        deleteDoc(docRef);
      }
    });
    setSaving(!saving);
  };

  if (loading) {
    return <Loader />;
  } else
    return (
      <div>
        <h1 className="my-4 text-4xl text-center">💪🏽 Workouts</h1>
        {workouts.length === 0 && (
          <p className="mb-4 text-sm text-center">Let's add some workouts!😁</p>
        )}
        <div className="flex relative items-center justify-center gap-2 mb-6">
          <input
            className=" bg-white  bg-opacity-5 rounded-full p-2 pl-4 "
            type="text"
            value={workoutName}
            onChange={(e) => setWorkoutName(e.target.value)}
            placeholder="Workout Name..."
          />
          <button
            className="border rounded-full p-1 px-4 text-nowrap"
            onClick={addWorkout}
          >
            Add
          </button>
        </div>
        <div className="workouts-list">
          {workouts.length > 0 && (
            <div className="flex gap-[75px] ml-14">
              <p>Name</p> <p>Reps done</p>
            </div>
          )}
          {workouts.map((workout, index) => (
            <div
              key={workout.id}
              className="flex justify-evenly items-center gap-4 p-4 border border-white border-opacity-30 bg-black bg-opacity-30 rounded-2xl mb-4"
            >
              <span>
                <b>{workout.name}</b>
              </span>
              <div className="w-[1px] h-6 bg-white bg-opacity-25"></div>
              <span>{workout.reps}</span>
              <div className="w-[1px] h-6 bg-white bg-opacity-25"></div>

              <div className="workout-buttons">
                <div className="border border-white border-opacity-25 rounded-2xl flex mr-2">
                  <button
                    className="w-[40px]"
                    onClick={() => updateReps(workout.id, workout.name, 1)}
                  >
                    +
                  </button>
                  <div className="w-[1px] h-full bg-white bg-opacity-25"></div>
                  <button
                    className="w-[40px]"
                    onClick={() => updateReps(workout.id, workout.name, -1)}
                  >
                    -
                  </button>
                </div>
                {showEditWorkouts && (
                  <button
                    className="btn btn-failed"
                    onClick={() => handleTryDeleteWorkout(true, index)}
                  >
                    Delete
                  </button>
                )}
                {tryDeleteWorkout[index] && (
                  <article className="bg-popover flex flex-col gap-6 items-center justify-center">
                    <p>
                      <span className=" text-red-300">DELETING:</span>{" "}
                      {workout.name} - {workout.reps}
                    </p>
                    <h2 className=" text-xl text-blue-100">
                      This action is NOT reversable!!
                    </h2>
                    <div className="flex gap-6">
                      <button
                        onClick={() => {
                          handleTryDeleteWorkout(false, index);
                        }}
                        className="btn btn-failed w-fit"
                      >
                        NO!
                      </button>
                      <button
                        onClick={() => {
                          deleteWorkout(workout.id);
                          handleTryDeleteWorkout(false, index);
                        }}
                        className="btn btn-success w-fit"
                      >
                        Goodbye!
                      </button>
                    </div>
                  </article>
                )}
              </div>
            </div>
          ))}
        </div>
        {workouts.length > 0 && (
          <div className="flex items-center gap-4 mb-4">
            <button className="link btn-success" onClick={saveWorkouts}>
              Save Workouts
            </button>
            <button
              className="link h-fit"
              onClick={() => {
                setShowEditWorkouts(!showEditWorkouts);
              }}
            >
              {!showEditWorkouts ? "Edit" : "Cancel"}
            </button>
          </div>
        )}

        {saveWorkouts.length > 0 && (
          <h2 className="text-2xl text-center">📁 Saved Workouts</h2>
        )}
        {workoutsLoading ? (
          <Loader />
        ) : (
          <ul>
            {savedWorkouts.map((saved, index) => (
              <li
                className="bg-black bg-opacity-30 border border-white border-opacity-25 p-4 mb-4 rounded-2xl"
                key={saved.id}
              >
                {showEditWorkouts && (
                  <button
                    className="ml-4 btn btn-failed"
                    onClick={() => {
                      handleTryDeleteWorkoutList(true, index);
                    }}
                  >
                    Delete
                  </button>
                )}
                {tryDeleteWorkoutList[index] && (
                  <article className="bg-popover flex flex-col gap-6 items-center justify-center">
                    <div className="border rounded-xl bg-black bg-opacity-25 p-4 pr-14">
                      <span className=" text-red-300 font-bold">DELETING</span>{" "}
                      <ul>
                        <p className=" text-xl">
                          {saved.date.toLocaleDateString()}
                        </p>
                        {saved.workouts.map((workout, index) => (
                          <li key={index}>
                            <b>{workout.name}</b> - {workout.reps}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <h2 className=" text-xl text-blue-100">
                      This action is NOT reversable!!
                    </h2>
                    <div className="flex gap-6">
                      <button
                        onClick={() => {
                          handleTryDeleteWorkoutList(false, index);
                        }}
                        className="btn btn-failed w-fit"
                      >
                        NO!
                      </button>
                      <button
                        onClick={() => {
                          handleDeleteWorkout(saved.id, index);
                          handleTryDeleteWorkoutList(false, index);
                        }}
                        className="btn btn-success w-fit"
                      >
                        Goodbye!
                      </button>
                    </div>
                  </article>
                )}
                <p className="text-2xl text-center mb-4">
                  {" "}
                  {saved.date.toLocaleDateString()}
                </p>
                <ul>
                  {saved.workouts.map((workout, index) => (
                    <li key={index}>
                      <b>{workout.name}</b> - {workout.reps}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
};

export default WorkoutsPage;
