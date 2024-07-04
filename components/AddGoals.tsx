"use client";
import React from "react";

interface Props {
  setIsAddingGoal: Function;
}

const AddGoals = ({ setIsAddingGoal }: Props) => {
  return (
    <div>
      <button
        onClick={() => {
          setIsAddingGoal(true);
        }}
        className="link btn-success mt-2"
      >
        Add Goal
      </button>
    </div>
  );
};

export default AddGoals;
