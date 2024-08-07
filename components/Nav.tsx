import Link from "next/link";
import React from "react";

const Nav = () => {
  return (
    <div className="z-50 flex gap-4 items-center justify-center">
      <Link className=" link" href="/habit-tracker">
        Calendar
      </Link>
      <Link className=" link" href="/overlook">
        Overlook
      </Link>
      <Link className="link" href="/graph">
        Graph
      </Link>
      <Link className="link" href="/workouts">
        Workouts{" "}
      </Link>
    </div>
  );
};

export default Nav;
