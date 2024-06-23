import AllMonths from "@/components/AllMonths";
import Link from "next/link";
import React from "react";

const page = () => {
  return (
    <div className="mt-4">
      <h1 className="text-4xl text-center mb-4">📅 Monthly Overlook</h1>
      <Link className="link" href="/">
        Calendar
      </Link>
      <Link className=" link link-active" href="/overlook">
        Overlook
      </Link>
      <Link className="link" href="/graph">
        Graph
      </Link>
      <div className="flex flex-col items-center">
        <AllMonths />
      </div>
    </div>
  );
};

export default page;
