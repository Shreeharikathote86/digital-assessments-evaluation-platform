import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { FiLogIn } from "react-icons/fi";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { baseApiURL } from "../baseUrl";
const Login = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("Student");
  const { register, handleSubmit } = useForm();
  const onSubmit = (data) => {
    if (data.loginid !== "" && data.password !== "") {
      const headers = {
        "Content-Type": "application/json",
      };
      axios
        .post(`${baseApiURL()}/${selected.toLowerCase()}/auth/login`, data, {
          headers: headers,
        })
        .then((response) => {
          navigate(`/${selected.toLowerCase()}`, {
            state: { type: selected, loginid: response.data.loginid },
          });
        })
        .catch((error) => {
          toast.dismiss();
          console.error(error);
          toast.error(error.response.data.message);
        });
    } else {
    }
  };
  return (
    <div className="bg-white h-[100vh] w-full flex justify-between items-center relative overflow-hidden">
      <div className="w-[60%] h-[100vh] hidden md:flex flex-col justify-center items-center" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 50%, #06b6d4 100%)' }}>
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">GradeHub</h1>
          <p className="text-xl text-white/80 max-w-md px-6">Empowering education through seamless management and organization</p>
          <div className="mt-10 flex justify-center">
            <div className="h-1 w-20 bg-white/50 rounded-full"></div>
          </div>
          <div className="mt-10">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-lg max-w-md mx-auto">
              <p className="text-white italic">"Streamlining academic workflows for students, faculty, and administrators."</p>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full md:w-[40%] flex justify-center items-start flex-col p-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-blue-600">GradeHub</h1>
          <p className="text-gray-600 mt-2">Your complete education management solution</p>
        </div>
        <p className="text-2xl md:text-3xl font-semibold pb-2 border-b-2 border-green-500">
          {selected && selected} Login
        </p>
        <form
          className="flex justify-center items-start flex-col w-full mt-10"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col w-full md:w-[70%]">
            <label className="mb-1" htmlFor="eno">
              {selected && selected} Login ID
            </label>
            <input
              type="number"
              id="eno"
              required
              className="bg-white outline-none border-2 border-gray-400 py-2 px-4 rounded-md w-full focus:border-blue-500"
              {...register("loginid")}
            />
          </div>
          <div className="flex flex-col w-full md:w-[70%] mt-3">
            <label className="mb-1" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              required
              className="bg-white outline-none border-2 border-gray-400 py-2 px-4 rounded-md w-full focus:border-blue-500"
              {...register("password")}
            />
          </div>
          <button className="bg-blue-500 mt-5 text-white px-6 py-2 text-xl rounded-md hover:bg-blue-700 ease-linear duration-300 hover:ease-linear hover:duration-300 hover:transition-all transition-all flex justify-center items-center relative z-10">
            Login
            <span className="ml-2">
              <FiLogIn />
            </span>
          </button>
        </form>
      </div>
      
      {/* Decorative blue ball - only visible on mobile/small screens, positioned to not overlap with login button */}
      <div className="absolute bottom-0 right-0 md:hidden z-0">
        <div className="w-60 h-60 rounded-full bg-blue-600/50 transform translate-x-1/3 translate-y-1/3"></div>
      </div>
      
      <div className="absolute top-4 right-4">
        <button
          className={`text-blue-500 mr-6 text-base font-semibold hover:text-blue-700 ease-linear duration-300 hover:ease-linear hover:duration-300 hover:transition-all transition-all ${
            selected === "Student" && "border-b-2 border-green-500"
          }`}
          onClick={() => setSelected("Student")}
        >
          Student
        </button>
        <button
          className={`text-blue-500 mr-6 text-base font-semibold hover:text-blue-700 ease-linear duration-300 hover:ease-linear hover:duration-300 hover:transition-all transition-all ${
            selected === "Faculty" && "border-b-2 border-green-500"
          }`}
          onClick={() => setSelected("Faculty")}
        >
          Faculty
        </button>
        <button
          className={`text-blue-500 mr-6 text-base font-semibold hover:text-blue-700 ease-linear duration-300 hover:ease-linear hover:duration-300 hover:transition-all transition-all ${
            selected === "Admin" && "border-b-2 border-green-500"
          }`}
          onClick={() => setSelected("Admin")}
        >
          Admin
        </button>
      </div>
      <Toaster position="bottom-center" />
    </div>
  );
};

export default Login;
