import { Api } from "@/services/service";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { FiEdit } from "react-icons/fi";
import { IoCloseCircleOutline } from "react-icons/io5";
import Swal from "sweetalert2";
import isAuth from "@/components/isAuth";
import { DateTime } from "luxon";
import { IoEyeSharp } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";

function Coupons(props) {
  const router = useRouter();
  const [data, setData] = useState({
    code: "",
    discountValue: "",
    discountType: "percentage",
    isActive: true,
    expiryDate: "",
    ussageType: "once",
    minimumAmount: 0,
    firstOrder: false,
  });
  const [loadCouponData, setLoadCouponData] = useState([]);
  const [editId, setEditId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState("");
  const [allUsedCoupanUser, setAllUsedCoupanUser] = useState([]);
  const filteredCoupons = loadCouponData.filter((item) =>
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    getAllCoupons();
  }, []);

  const getAllCoupons = async () => {
    props.loader(true);
    Api("get", "GetAllCoupons", "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================> form data :: ", res);
        setLoadCouponData(res.data);

      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const submit = (e) => {
    e.preventDefault();

    if (
      !data.code ||
      !data.discountValue ||
      !data.discountType ||
      !data.expiryDate ||
      !data.ussageType || !data.minimumAmount
    ) {
      props.toaster({
        type: "error",
        message: "Please fill all required details.",
      });
      return;
    }

    let method = "post";
    let url = "AddCoupon";

    if (editId) {
      data.id = data._id;
      url = `updateCoupan/${data._id}`;
      method = "post";
    }

    props.loader(true);
    Api(method, url, data, router).then(
      (res) => {
        props.loader(false);
        console.log("Post coupon", res);
        setData({
          code: "",
          discountValue: "",
          discountType: "percentage",
          isActive: true,
          expiryDate: "",
          minimumAmount: 0,
          ussageType: "once",
          firstOrder: false,
        });
        getAllCoupons();
        setEditId("");
        props.toaster({
          type: "success",
          message: editId
            ? "Coupon updated successfully"
            : "Coupon added successfully",
        });
      },
      (err) => {
        console.log(err);
        props.loader(false);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const deleteCoupon = (_id) => {
    Swal.fire({
      text: "Are you sure? You want to proceed with the deletion?",
      //   icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#F38529",
      confirmButtonText: "Delete",
      confirmButtonColor: "#F38529",
      width: "350px",
    }).then(function (result) {
      console.log(result);
      if (result.isConfirmed) {
        props.loader(true);
        Api("delete", `deleteCoupan/${_id}`, {}, router).then(
          (res) => {
            props.loader(false);
            getAllCoupons();
            props.toaster({
              type: "success",
              message: "Coupon deleted successfully",
            });
          },
          (err) => {
            props.loader(false);
            console.log(err);
            props.toaster({ type: "error", message: err?.message });
          }
        );
      }
    });
  };

  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    return DateTime.fromISO(dateString, { zone: "America/Chicago" }).toFormat(
      "yyyy-MM-dd"
    );
  };

  const todayChicago = DateTime.now()
    .setZone("America/Chicago")
    .toFormat("yyyy-MM-dd");

  return (
    <div className="w-full max-w-7xl h-full mx-auto px-6 py-8 overflow-y-scroll   scrollbar-hide overflow-scroll pb-28">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          <span
            className={`inline-block w-2 h-8 bg-[#F38529]  mr-3 rounded `}
          ></span>
          {editId ? "Edit Coupon" : "Add Coupon"}
        </h1>
        <h1 className="text-xl font-bold text-gray-900 mb-8 cursor-pointer"
          onClick={() => getAllCoupons()}
        >
          Refresh
        </h1>
      </div>
      <section className="space-y-10">
        <form
          className="bg-white shadow-lg rounded-xl border border-gray-200 p-8"
          onSubmit={submit}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">

            <div className="flex flex-col">
              <label
                htmlFor="code"
                className="text-gray-700 font-semibold mb-2"
              >
                Coupon Code
              </label>
              <input
                id="code"
                type="text"
                placeholder="Enter coupon code"
                value={data.code}
                onChange={(e) =>
                  setData({ ...data, code: e.target.value.toUpperCase() })
                }
                required
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-[#F38529] focus:border-[#F38529] outline-none transition"
              />
            </div>

            {/* Discount Value */}
            <div className="flex flex-col">
              <label
                htmlFor="discountValue"
                className="text-gray-700 font-semibold mb-2"
              >
                Discount Value
              </label>
              <input
                id="discountValue"
                type="text"
                inputMode="decimal"
                placeholder="Enter discount value"
                value={data.discountValue}
                onChange={(e) => {
                  let val = e.target.value;
                  if (/^\d{0,3}(\.\d{0,2})?$/.test(val) || val === "") {
                    setData({ ...data, discountValue: val });
                  }
                }}
                required
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-[#F38529] focus:border-[#F38529] outline-none transition"
              />
            </div>
            <div className="flex flex-col">
              <label
                htmlFor="minimumAmount"
                className="text-gray-700 font-semibold mb-2"
              >
                Minimum Amount
              </label>
              <input
                id="minimumAmount"
                type="text"
                inputMode="decimal"
                placeholder="Enter minimum amount"
                value={data.minimumAmount}
                onChange={(e) => {
                  let val = e.target.value;
                  // Allow up to 5 digits before decimal, 2 after (e.g., 99999.99)
                  if (/^\d{0,5}(\.\d{0,2})?$/.test(val) || val === "") {
                    setData({ ...data, minimumAmount: val });
                  }
                }}
                required
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-[#F38529] focus:border-[#F38529] outline-none transition"
              />
            </div>


            <div className="flex flex-col">
              <label
                htmlFor="discountType"
                className="text-gray-700 font-semibold mb-2"
              >
                Discount Type
              </label>
              <select
                id="discountType"
                value={data.discountType}
                onChange={(e) =>
                  setData({ ...data, discountType: e.target.value })
                }
                required
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-[#F38529] focus:border-[#F38529] outline-none transition"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="ussageType"
                className="text-gray-700 font-semibold mb-2"
              >
                Ussage Type
              </label>
              <select
                id="ussageType"
                value={data.ussageType}
                onChange={(e) =>
                  setData({ ...data, ussageType: e.target.value })
                }
                required
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-[#F38529] focus:border-[#F38529] outline-none transition"
              >
                <option value="once">Once</option>
                <option value="multiple">Multiple</option>
              </select>
            </div>


            <div className="flex flex-col">
              <label
                htmlFor="expiryDate"
                className="text-gray-700 font-semibold mb-2"
              >
                Expiry Date
              </label>
              <input
                id="expiryDate"
                type="date"
                value={formatDateForInput(data.expiryDate)}
                onChange={(e) =>
                  setData({ ...data, expiryDate: e.target.value })
                }
                required
                min={todayChicago}
                className="bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-sm focus:ring-2 focus:ring-[#F38529] focus:border-[#F38529] outline-none transition"
              />
            </div>


            <div className="flex items-center space-x-3 mt-4">
              <input
                id="isActiveCheckbox"
                type="checkbox"
                checked={data.isActive}
                onChange={(e) =>
                  setData({ ...data, isActive: e.target.checked })
                }
                className="h-5 w-5 accent-[#F38529]  focus:ring-[#F38529] border-gray-300 rounded cursor-pointer transition"
              />

              <label
                htmlFor="isActiveCheckbox"
                className="text-gray-700 font-semibold cursor-pointer"
              >
                Active
              </label>
            </div>
            <div className="flex items-center space-x-3 mt-4">
              <input
                id="isActiveCheckbox"
                type="checkbox"
                checked={data.firstOrder}
                onChange={(e) =>
                  setData({ ...data, firstOrder: e.target.checked })
                }
                className="h-5 w-5 accent-[#F38529]  focus:ring-[#F38529] border-gray-300 rounded cursor-pointer transition"
              />

              <label
                htmlFor="isActiveCheckbox"
                className="text-gray-700 font-semibold cursor-pointer"
              >
                Eligible for First time Order Only
              </label>
            </div>

          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              className="bg-[#F38529] hover:bg-[#d46b19] text-white font-semibold text-lg rounded-xl px-14 py-3 transition-shadow shadow-md hover:shadow-lg focus:outline-none cursor-pointer "
            >
              {editId ? "Update Now" : "Add Now"}
            </button>
          </div>
        </form>


        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-5 mt-10">
          <input
            type="text"
            placeholder="Search Coupons"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-3 text-gray-900 text-base font-semibold focus:ring-2 focus:ring-[#F38529] focus:border-[#F38529] outline-none transition"
          />
        </div>


        <div className="space-y-5 mt-8">
          {filteredCoupons.length === 0 ? (
            <div className="flex flex-col justify-center items-center p-20 text-center">
              <img
                src="/empty-box.png"
                alt="No data"
                className="w-32 h-32 mb-4 opacity-60"
              />
              <h3 className="text-xl font-medium text-gray-700 mb-1">
                No Coupon found
              </h3>
              <p className="text-gray-500">
                Try add Coupons for discount on Product
              </p>
            </div>
          ) : (
            filteredCoupons.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-gray-200 rounded-xl shadow p-5 flex justify-between items-center"
              >
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={item.isActive}
                    readOnly
                    className="h-6 w-6 accent-[#F38529] text-[#F38529] border-gray-300 rounded"
                  />
                  <div>
                    <p className="text-lg font-semibold text-gray-900">
                      {item.code}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.discountType === "percentage"
                        ? `${item.discountValue}% off`
                        : `$${item.discountValue} off`}{" "}
                      | Expires:{" "}
                      {new Date(item.expiryDate).toLocaleDateString()} | Status:{" "}
                      {item.isActive ? "Active" : "Inactive"}
                      | Ussage Type : {item.ussageType}
                      | minimum Amount : ${item.minimumAmount || 0}
                      | Eligible for First time Order : {item.firstOrder ? "Yes" : "No"}
                    </p>

                  </div>
                </div>
                <div className="flex items-center space-x-5">
                  {item.ussageType === "once" && (
                    <button
                      onClick={() => {
                        setAllUsedCoupanUser(item.userId)
                        setOpen(true)
                      }}
                      aria-label="Edit coupon"
                      className="text-[#F38529]  cursor-pointer hover:text-[#d46b19] transition"
                    >
                      <IoEyeSharp size={26} />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setEditId(item._id);
                      setData(item);
                    }}
                    aria-label="Edit coupon"
                    className="text-[#F38529]  cursor-pointer hover:text-[#d46b19] transition"
                  >
                    <FiEdit size={26} />
                  </button>
                  <button
                    onClick={() => deleteCoupon(item._id)}
                    aria-label="Delete coupon"
                    className="text-[#F38529] cursor-pointer hover:text-[#d46b19] transition"
                  >
                    <IoCloseCircleOutline size={26} />
                  </button>
                </div>
              </div>


            ))
          )}


          {open && (
            <div className="fixed inset-0 bg-black/20 bg-opacity-50 flex justify-center items-center z-50 p-4">
              <div className="bg-white rounded-xl p-4 sm:p-6 max-w-3xl w-full shadow-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-black">
                    Users Who Used This Coupon
                  </h2>
                  <RxCross2
                    className="text-black cursor-pointer text-xl"
                    onClick={() => setOpen(false)}
                  />
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200 text-sm sm:text-base">
                    <thead>
                      <tr className="bg-gray-100 text-left text-gray-700">
                        <th className="py-2 px-3 sm:px-4 border-b">Name</th>
                        <th className="py-2 px-3 sm:px-4 border-b">Email</th>
                        <th className="py-2 px-3 sm:px-4 border-b">Phone</th>
                      </tr>
                    </thead>
                    <tbody>
                      {allUsedCoupanUser.map((user, index) => (
                        <tr key={index} className="border-t text-gray-700">
                          <td className="py-2 px-3 sm:px-4 border-b">{user.username}</td>
                          <td className="py-2 px-3 sm:px-4 border-b">{user.email}</td>
                          <td className="py-2 px-3 sm:px-4 border-b">{user.number}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


        </div>
      </section>
    </div>
  );
}

export default isAuth(Coupons);
