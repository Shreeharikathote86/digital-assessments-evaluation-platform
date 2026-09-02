import React, { useState } from "react";
import Heading from "../../components/Heading";
import EditAdmin from "./Admin/EditAdmin";
import AddAdmin from "./Admin/AddAdmin";

const Admin = () => {
  const [selected, setSelected] = useState("add");

  return (
    <div className="w-full mx-auto mt-6 md:mt-8 lg:mt-10 flex justify-center items-start flex-col mb-6 md:mb-8 lg:mb-10 px-4 md:px-6 lg:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full gap-4 sm:gap-0">
        <Heading title="Admin Management" />
        <div className="flex space-x-2">
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selected === "add"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setSelected("add")}
          >
            Add Admin
          </button>
          <button
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selected === "edit"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setSelected("edit")}
          >
            Edit Admin
          </button>
        </div>
      </div>
      <div className="w-full mt-6 bg-white rounded-lg shadow-sm p-6">
        {selected === "add" && <AddAdmin />}
        {selected === "edit" && <EditAdmin />}
      </div>
    </div>
  );
};

export default Admin;
