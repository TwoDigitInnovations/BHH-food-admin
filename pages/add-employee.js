import React, { useContext, useState, useEffect } from "react";
import { userContext } from "./_app";
import { CiUser, CiMail, CiLock, CiPhone } from "react-icons/ci";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import isAuth from "@/components/isAuth";

function AddEmployee({ loader, toaster }) {
  const router = useRouter();
  const [user] = useContext(userContext);
  const [errors, setErrors] = useState({});
  
  const [employeeData, setEmployeeData] = useState({
    username: "",
    email: "",
    password: "",
    number: "",
  });

  useEffect(() => {
    if (router?.query?.id) getEmployeeById();
  }, [router.query.id]);

  const getEmployeeById = async () => {
    loader(true);
    try {
      const res = await Api("get", `getEmployeeById/${router.query.id}`, "", router);
      if (res?.status) {
        setEmployeeData(res.data);
      }
    } catch (err) {
      toaster({ type: "error", message: err?.message });
    } finally {
      loader(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    const { username, email, password, number } = employeeData;

    if (!username.trim()) newErrors.username = "Username is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = "Email is invalid";
    }
    if (!router.query.id && !password) {
      newErrors.password = "Password is required";
    } else if (password && password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (!number) newErrors.number = "Phone number is required";
    else if (number.length < 10) newErrors.number = "Phone number must be 10 digits";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      ...employeeData,
      userid: user?._id,
      type: "EMPLOYEE"
    };

    if (router.query.id) {
      data.id = router.query.id;
      if (!data.password) delete data.password;
    }

    loader(true);
    try {
      const endpoint = router.query.id ? "updateEmployee" : "createEmployee";
      const res = await Api("post", endpoint, data, router);
      
      if (res.status) {
        toaster({ type: "success", message: res.data?.message });
        setEmployeeData({ username: "", email: "", password: "", number: "" });
        router.push(router.query.id ? "/employees" : "/employees");
      }
    } catch (err) {
      toaster({ type: "error", message: err?.message });
    } finally {
      loader(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData(prev => ({
      ...prev,
      [name]: name === "number" ? value.replace(/\D/g, "") : value
    }));
  };

  return (
    <section className="w-full bg-gray-50 md:p-8 p-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center mb-6">
          <div className="w-2 h-10 bg-[#F38529] rounded mr-4"></div>
          <h1 className="text-gray-800 font-bold md:text-3xl text-2xl">
            {router.query.id ? "Update Employee" : "Add Employee"}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="md:p-8 p-5">
            <form onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                {/* Username Field */}
                <div className="space-y-1">
                  <label className="block text-gray-700 font-medium">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <CiUser className="text-[#F38529] text-xl" />
                    </div>
                    <input
                      name="username"
                      className="bg-white w-full h-12 pl-12 pr-4 border border-gray-300 rounded-lg text-gray-800 outline-none focus:border-[#F38529] focus:ring-2 focus:ring-[#F38529]/20"
                      type="text"
                      placeholder="Enter username"
                      value={employeeData.username}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
                </div>

                {/* Email Field */}
                <div className="space-y-1">
                  <label className="block text-gray-700 font-medium">Email</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <CiMail className="text-[#F38529] text-xl" />
                    </div>
                    <input
                      name="email"
                      className="bg-white text-gray-800  w-full h-12 pl-12 pr-4 border border-gray-300 rounded-lg outline-none focus:border-[#F38529] focus:ring-2 focus:ring-[#F38529]/20"
                      type="email"
                      placeholder="Enter email"
                      value={employeeData.email}
                      onChange={handleChange}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
                </div>

                {/* Password Field - Conditionally rendered */}
                {!router.query.id && (
                  <div className="space-y-1">
                    <label className="block text-gray-700 font-medium">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <CiLock className="text-[#F38529] text-xl" />
                      </div>
                      <input
                        name="password"
                        className="bg-white text-gray-800  w-full h-12 pl-12 pr-4 border border-gray-300 rounded-lg outline-none focus:border-[#F38529] focus:ring-2 focus:ring-[#F38529]/20"
                        type="password"
                        placeholder="Create password"
                        value={employeeData.password}
                        onChange={handleChange}
                      />
                    </div>
                    {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
                  </div>
                )}

                {/* Phone Number Field */}
                <div className="space-y-1">
                  <label className="block text-gray-700 font-medium">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                      <CiPhone className="text-[#F38529] text-xl" />
                    </div>
                    <input
                      name="number"
                      className="bg-white w-full h-12 pl-12 pr-4 border border-gray-300 rounded-lg outline-none text-gray-800  focus:border-[#F38529] focus:ring-2 focus:ring-[#F38529]/20"
                      type="tel"
                      placeholder="Enter phone number"
                      value={employeeData.number}
                      onChange={handleChange}
                      maxLength="10"
                    />
                  </div>
                  {errors.number && <p className="text-red-500 text-sm">{errors.number}</p>}
                </div>
              </div>

              <div className="mt-12 flex flex-col md:flex-row justify-end gap-4">
                <button
                  type="button"
                  className="w-full md:w-auto px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
                  onClick={() => router.back()}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full md:w-auto px-8 py-3 bg-[#F38529] text-white font-medium rounded-lg hover:bg-[#e07016] flex items-center gap-2"
                >
                  {router.query.id ? "Update" : "Add"} Employee
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default isAuth(AddEmployee);