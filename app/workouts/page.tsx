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
import Nav from "@/components/Nav";
import { useAuth } from "@clerk/nextjs";
import Webcam from "@/components/Webcam";

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

    const fetchSavedWorkouts = async () => {
      const q = query(
        collection(db, `saved-workouts-${userId}`),
        orderBy("date", "asc")
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

    fetchWorkouts();
    fetchSavedWorkouts();
  }, [db, userId, savedWorkouts]);

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
    } else {
      // Create a new document
      await addDoc(collection(db, `saved-workouts-${userId}`), {
        date: new Date(),
        workouts: workouts.map((workout) => ({
          name: workout.name,
          reps: workout.reps,
        })),
      });
    }
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
            className="flex justify-evenly items-center gap-4 p-4 border border-white border-opacity-30 bg-black bg-opacity-30 rounded-2xl mb-4"
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
      <button
        className=" bg-green-500 bg-opacity-25 rounded-full p-1 px-3 mb-20 border border-green-400 text-green-300"
        onClick={saveWorkouts}
      >
        Save Workouts
      </button>
      <h2 className="text-2xl text-center">📁 Saved Workouts</h2>
      <ul>
        {savedWorkouts.map((saved) => (
          <li className='bg-black bg-opacity-30 border border-white border-opacity-25 p-4 mb-4 rounded-2xl' key={saved.id}>
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
    </div>
  );
};

export default WorkoutsPage;
