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

interface Workout {
  id: string;
  name: string;
  reps: number;
}

const WorkoutsPage: React.FC = () => {
  const [workoutName, setWorkoutName] = useState("");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const querySnapshot = await getDocs(collection(db, "workouts"));
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
    const docRef = await addDoc(collection(db, "workouts"), {
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
      await updateDoc(doc(db, "workouts", id), { reps: newReps });
      setWorkouts(
        workouts.map((workout) =>
          workout.id === id ? { ...workout, reps: newReps } : workout
        )
      );
    }
  };

  const deleteWorkout = async (id: string) => {
    await deleteDoc(doc(db, "workouts", id));
    setWorkouts(workouts.filter((workout) => workout.id !== id));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="workouts-page">
      <h1>Workouts</h1>
      <div className="add-workout">
        <input
          type="text"
          value={workoutName}
          onChange={(e) => setWorkoutName(e.target.value)}
          placeholder="Workout Name"
        />
        <button onClick={addWorkout}>Add Workout</button>
      </div>
      <div className="workouts-list">
        {workouts.map((workout) => (
          <div key={workout.id} className="workout-item">
            <span>{workout.name}</span>
            <span>Reps: {workout.reps}</span>
            <div className="workout-buttons">
              <button onClick={() => updateReps(workout.id, 1)}>Add Rep</button>
              <button onClick={() => updateReps(workout.id, -1)}>
                Remove Rep
              </button>
              <button onClick={() => deleteWorkout(workout.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutsPage;
