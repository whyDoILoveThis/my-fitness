import AllMonths from "@/components/AllMonths";
import Nav from "@/components/Nav";
import React from "react";

const page = () => {
  return (
    <div className="mt-4">
      <h1 className="text-4xl text-center mb-4">📅 Monthly Overlook</h1>
      <div className="flex flex-col items-center">
        <AllMonths />
      </div>
    </div>
  );
};

export default page;
