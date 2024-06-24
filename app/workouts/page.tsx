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
} from "firebase/firestore";
import "../../styles/Calendar.css";
import "../../styles/Workouts.css";
import Nav from "@/components/Nav";
import { useAuth } from "@clerk/nextjs";

interface Workout {
  id: string;
  name: string;
  reps: number;
}

const WorkoutsPage: React.FC = () => {
  const [workoutName, setWorkoutName] = useState("");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);
  const { userId } = useAuth();

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
  }, []);

  const addWorkout = async () => {
    if (workoutName.trim() === "") return;
    const docRef = await addDoc(collection(db, `workouts-${userId}`), {
      name: workoutName,
      reps: 0,
    });

    setWorkouts([...workouts, { id: docRef.id, name: workoutName, reps: 0 }]);
    setWorkoutName("");
  };

  const updateReps = async (id: string, delta: number) => {
    const workout = workouts.find((workout) => workout.id === id);
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
  };

  const deleteWorkout = async (id: string) => {
    await deleteDoc(doc(db, `workouts-${userId}`, id));
    setWorkouts(workouts.filter((workout) => workout.id !== id));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="my-4 text-4xl text-center">💪🏽 Workouts</h1>
      <div className="flex items-center justify-center gap-2 mb-6">
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
        {workouts && (
          <div className="flex gap-[75px] ml-14">
            <p>Name</p> <p>Reps done</p>
          </div>
        )}
        {workouts.map((workout) => (
          <div
            key={workout.id}
            className="flex justify-evenly items-center gap-4 p-4 border border-white border-opacity-30 rounded-2xl mb-4"
          >
            <span>
              <b>{workout.name}</b>
            </span>
            <div className="w-[1px] h-6 bg-white bg-opacity-25"></div>
            <span>{workout.reps}</span>
            <div className="w-[1px] h-6 bg-white bg-opacity-25"></div>

            <div className="workout-buttons">
              <div className="border border-white border-opacity-25 rounded-2xl flex gap-4 p-3 py-0 mr-2">
                <button onClick={() => updateReps(workout.id, 1)}>+</button>
                <div className="w-[1px] h-full bg-white bg-opacity-25"></div>
                <button onClick={() => updateReps(workout.id, -1)}>-</button>
              </div>
              <button
                className="btn-failed border border-red-400 p-2 py-0 rounded-full"
                onClick={() => deleteWorkout(workout.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutsPage;
