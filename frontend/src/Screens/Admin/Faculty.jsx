import React, { useState } from "react";
import Heading from "../../components/Heading";
import EditFaculty from "./Faculty/EditFaculty";
import AddFaculty from "./Faculty/AddFaculty";

const Faculty = () => {
  const [selected, setSelected] = useState("add");

  return (
    <div className="w-full mx-auto mt-6 md:mt-8 lg:mt-10 flex justify-center items-start flex-col mb-6 md:mb-8 lg:mb-10 px-4 md:px-6 lg:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 sm:gap-0">
        <Heading title="Faculty Details" />
        <div className="flex justify-start sm:justify-end items-center w-full mt-4 sm:mt-0">
          <button
            className={`${
              selected === "add" && "border-b-2 "
            }border-blue-500 px-3 md:px-4 py-2 text-black rounded-sm mr-4 md:mr-6 text-sm md:text-base`}
            onClick={() => setSelected("add")}
          >
            Add Faculty
          </button>
          <button
            className={`${
              selected === "edit" && "border-b-2 "
            }border-blue-500 px-3 md:px-4 py-2 text-black rounded-sm text-sm md:text-base`}
            onClick={() => setSelected("edit")}
          >
            Edit Faculty
          </button>
        </div>
      </div>
      <div className="w-full mt-6">
        {selected === "add" && <AddFaculty />}
        {selected === "edit" && <EditFaculty />}
      </div>
    </div>
  );
};

export default Faculty;