import React from "react";
import { ScaleLoader } from "react-spinners";

const Loader = () => {
  return (
    <div className="flex min-h-[50vh] justify-center items-center">
      <ScaleLoader color="#68686845" />
    </div>
  );
};

export default Loader;
