import React, { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Api } from "@/services/service";
import {
  ArrowUpRight,
  ArrowDownRight,
  Users,
  BarChart2,
  HelpCircle,
} from "lucide-react";

// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   PointElement,
//   LineElement,
// } from "chart.js";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import isAuth from "@/components/isAuth";
import { userContext } from "./_app";
import { BiCategory } from "react-icons/bi";
import axios from "axios";

const PRIMARY_COLOR = "#F38529";
const PRIMARY_COLOR_LIGHT = "#FEE8D7";

function Home(props) {
  const router = useRouter();
  const [user, setUser] = useContext(userContext);
  const [GetInTouchData, setGetInTouchData] = useState([]);
  const [AllUsers, setAllUsers] = useState([]);
  const [productList, setProductList] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [timeRange, setTimeRange] = useState("monthly"); // Only 'monthly' for now
  const [salesData, setSalesData] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());


  const [topSellingProducts, setTopSellingProducts] = useState([
    {
      name: "",
      sole: "",
      remaining: "",
    },
  ]);
  const [AllData, setAllData] = useState([]);

  useEffect(() => {
    TopSoldProduct();
    dashboarddetails();
    getLowStockProduct();
  }, []);

  const dashboarddetails = async () => {
    props.loader(true);

    Api("get", "dashboarddetails", "", router).then(
      (res) => {
        console.log("res================>", res);
        props.loader(false);
        if (res?.status) {
          setAllData(res?.data);
        } else {
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.data?.message });
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  useEffect(() => {
    const getMonthlySales = async () => {
      props.loader(true);
      Api("get", `getMonthlySales?year=${selectedYear}`, "", router).then(
        (res) => {
          console.log("res================>", res);
          props.loader(false);
          if (res?.status) {
            setSalesData(res?.data);
          } else {
            console.log(res?.data?.message);
            props.toaster({ type: "error", message: res?.data?.message });
          }
        },
        (err) => {
          props.loader(false);
          console.log(err);
          props.toaster({ type: "error", message: err?.data?.message });
          props.toaster({ type: "error", message: err?.message });
        }
      );
    };
    getMonthlySales();
  }, [selectedYear]);

  const TopSoldProduct = (page = 1, limit = 8) => {
    props.loader(true);
    Api(
      "get",
      `getTopSoldProduct?page=${page}&limit=${limit}`,
      null,
      router
    ).then(
      (res) => {
        props.loader(false);
        if (res.data && Array.isArray(res.data)) {
          setProductList(res.data);

          const mappedData = res.data.map((product) => ({
            name: product.name || "",
            sold: product.sold_pieces || "",
            remaining: product.Quantity || "",
          }));

          setTopSellingProducts(mappedData);
        } else {
          console.error("Unexpected response format:", res);
          props.toaster({
            type: "error",
            message: "Unexpected response format",
          });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const getLowStockProduct = (page = 1, limit = 6) => {
    props.loader(true);
    Api(
      "get",
      `getLowStockProduct?page=${page}&limit=${limit}`,
      null,
      router
    ).then(
      (res) => {
        props.loader(false);
        if (res.data && Array.isArray(res.data)) {
          setLowStock(res.data);
        } else {
          console.error("Unexpected response format:", res);
          props.toaster({
            type: "error",
            message: "Unexpected response format",
          });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  return (
    <section className="w-full h-full bg-gray-50 md:p-6 p-4">
      <div className="h-full overflow-y-scroll scrollbar-hide overflow-scroll pb-28">
        {/* Dashboard Header */}
        <div className="flex justify-between items-center mb-6 mt-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center">
              <span
                className={`inline-block w-2 h-8 bg-[${PRIMARY_COLOR}] mr-3 rounded mb-2`}
              ></span>
              Dashboard
            </h1>
            <p className="text-gray-500 mt-1">
              Welcome back! Here's your overview
            </p>
          </div>
          <div className="bg-white shadow-sm rounded-lg p-2">
            <div
              className={`bg-[${PRIMARY_COLOR}] text-white text-sm font-medium px-4 py-2 rounded-md`}
            >
              Today
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-4 grid-cols-2 gap-5 mb-8">
          {/* Total Users Card */}
          <StatsCard
            title="Total Users"
            value={AllData?.totalUsers || "89"}
            icon={<Users className={`text-[${PRIMARY_COLOR}]`} size={32} />}
          // change={{
          //   value: "9.5%",
          //   type: "increase",
          //   text: "Up from yesterday",
          // }}
          />

          {/* Total Profit Card */}
          <StatsCard
            title="Total Categories"
            value={AllData?.totalCategories || "89"}
            icon={
              <BiCategory className={`text-[${PRIMARY_COLOR}]`} size={32} />
            }
          // change={{
          //   value: "1.3%",
          //   type: "increase",
          //   text: "Up from past week",
          // }}
          />

          {/* Total Transactions Card */}
          <StatsCard
            title="Total Transactions"
            value={"$" + AllData?.totalTransactionAmount || "$89000"}
            icon={<BarChart2 className={`text-[${PRIMARY_COLOR}]`} size={32} />}
          // change={{
          //   value: "4.3%",
          //   type: "decrease",
          //   text: "Down from yesterday",
          // }}
          />

          {/* Queries Card */}
          <StatsCard
            title="Queries"
            value={AllData?.totalFeedbacks || "89"}
            icon={
              <HelpCircle className={`text-[${PRIMARY_COLOR}]`} size={32} />
            }
          // change={{
          //   value: "1.3%",
          //   type: "decrease",
          //   text: "Down from yesterday",
          // }}
          />
        </div>

        <div className="mt-5 flex w-full gap-4 md:flex-row flex-col">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden md:w-2/3 w-full">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-lg text-gray-800">
                Performance Overview
              </h2>
              <div className="flex items-center gap-4">
                <select
                  className="bg-gray-100 px-2 py-1 rounded text-sm text-black"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  {[2025, 2026, 2027, 2028, 2029, 2030].map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setTimeRange("monthly")}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${timeRange === "monthly"
                    ? "bg-orange-100 text-orange-500"
                    : "bg-gray-100 text-gray-500"
                    }`}
                >
                  Monthly
                </button>
              </div>
            </div>

            <div className="p-4 h-[400px]">
              <h3 className="text-md font-semibold mb-6 text-gray-700">
                Total Sales ({selectedYear})
              </h3>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart
                  data={salesData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    formatter={(value) => [`$${value}`, "Sales"]}
                    contentStyle={{
                      backgroundColor: "#fff",
                      color: "#F38529",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#F38529" }}
                  />

                  <Legend fill="#F38529" />
                  <Bar dataKey="monthly" fill="#F38529" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Second Chart Container */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden md:w-1/3 w-full">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-bold text-lg text-gray-800">
                Top Selling Products
              </h2>
            </div>
            <div className="py-4 h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topSellingProducts}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="name" fill="#1F2937" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      color: "#F38529",
                      borderRadius: "8px",
                    }}
                    labelStyle={{ color: "#F38529" }}
                  />
                  <Legend fill="#1F2937" />
                  <Bar dataKey="sold" fill="#F38529" radius={[4, 4, 0, 0]} />
                  <Bar
                    dataKey="remaining"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-5 flex w-full gap-4 md:flex-row flex-col">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden md:w-2/3 w-full">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-lg text-gray-800">
                Top Selling Products
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-white">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sold Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remaining Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {productList.map((product, key) => (
                    <tr key={key}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product?.name.slice(0, 20) + "..."}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product?.sold_pieces}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product?.Quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${product?.price_slot[0]?.our_price}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden w-full md:w-1/3">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-lg text-gray-800">
                Low Quantity Stock
              </h2>
            </div>

            <div className="p-4 space-y-4">
              {lowStock.map((product, key) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={product?.varients[0].image[0]}
                      alt={product?.name}
                      className="w-14 h-14 object-contain"
                    />
                    <div>
                      <p className="text-sm text-gray-800">
                        {product?.name?.length > 20
                          ? product.name.slice(0, 20) + "..."
                          : product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Remaining Quantity: {product?.Quantity} Packet
                      </p>
                    </div>
                  </div>
                  <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full font-semibold">
                    Low
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const StatsCard = ({ title, value, icon, change }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md border-b-4 border-[#F38529]">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex flex-col justify-start">
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <p className="text-gray-800 text-2xl md:text-3xl font-bold mt-2">
              {value}
            </p>
          </div>
          <div className={`p-3 bg-[${PRIMARY_COLOR_LIGHT}] rounded-lg`}>
            {icon}
          </div>
        </div>

        {change && (
          <div className="mt-4 flex items-center">
            {change.type === "increase" ? (
              <ArrowUpRight size={18} className="text-green-500" />
            ) : (
              <ArrowDownRight size={18} className="text-red-500" />
            )}
            <p className="text-sm ml-1">
              <span
                className={
                  change.type === "increase"
                    ? "text-green-500 font-medium"
                    : "text-red-500 font-medium"
                }
              >
                {change.value}
              </span>
              <span className="text-gray-500 ml-1">{change.text}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default isAuth(Home);
