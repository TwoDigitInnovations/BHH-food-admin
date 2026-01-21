"use client";

import React, { useMemo, useEffect, useContext } from "react";
import { useState } from "react";
import Table from "@/components/table";
import isAuth from "@/components/isAuth";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import moment from "moment";
import { Drawer } from "@mui/material";
import { IoCloseCircleOutline } from "react-icons/io5";
import { userContext } from "./_app";
import Swal from "sweetalert2";
import Barcode from "react-barcode";
import { Package } from "lucide-react";

function Orders(props) {
  const router = useRouter();
  const [user, setUser] = useContext(userContext);
  const [userRquestList, setUserRquestList] = useState([]);
  const [openCart, setOpenCart] = useState(false);
  const [cartData, setCartData] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [TotalItem, setTotalItem] = useState("0");
  const [note, setNote] = useState("");
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  });

  const handlePageChange = (page) => {
    setCurrentPage(page);
    localStorage.setItem("currentPage", page);
  };

  useEffect(() => {
    const savedPage = localStorage.getItem("currentPage");
    if (savedPage) {
      setCurrentPage(Number(savedPage));
    }
  }, []);

  const closeDrawer = async () => {
    setOpenCart(false);
    setCartData({});
  };

  useEffect(() => {
    getOrderBySeller(currentPage, 20);
  }, [currentPage]);

  const getOrderBySeller = async (page = 1, limit = 20) => {
    const data = {
      date: date, // 🟩 backend ko date milega
    };

    props.loader(true);

    Api(
      "get",
      `FailedOrder?page=${page}&limit=${limit}`,
      data,
      router
    ).then(
      (res) => {
        props.loader(false);
        setUserRquestList(res?.data);
        setPagination(res?.pagination);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const updatePaymentSatusBySeller = async (paymentStatus, orderId) => {
    const data = {
      paymentStatus,
      orderId
    };

    props.loader(true);

    Api(
      "post",
      `updatePaymentSatusBySeller`,
      data,
      router
    ).then(
      (res) => {
        props.loader(false);
        getOrderBySeller(currentPage, 20)
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  function convertISODateToFormattedString(isoDateString) {
    if (!isoDateString) return "";

    const date = new Date(isoDateString);

    if (isNaN(date)) {
      return "Invalid Date";
    }

    const day = date.getDate(); // local timezone
    const monthIndex = date.getMonth(); // local timezone
    const year = date.getFullYear(); // local timezone

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return `${day} ${monthNames[monthIndex]} ${year}`;
  }

  function name({ row }) {
    const name =
      `${row.original.user?.username || ""} ${row.original.user?.lastname || ""
        }`.trim() || "N/A";

    return (
      <div>
        <p className="text-black text-[15px] font-normal text-center">{name}</p>
      </div>
    );
  }

  function Status({ value }) {
    const statusColors = {
      Pending: "text-yellow-500",
      Completed: "text-green-600",
      Return: "text-blue-500",
      Cancel: "text-red-500",
      "Return Requested": "text-purple-500",
    };

    const textColor = statusColors[value] || "text-gray-500"; // fallback color

    return (
      <div>
        <p className={`${textColor} text-[15px] font-semibold text-center`}>
          {value}
        </p>
      </div>
    );
  }

  function PaymentStatus({ value, row }) {
    console.log(row)
    const statusColors = {
      Pending: "border-yellow-500",
      Succeeded: "border-green-600",
      Failed: "border-red-500",
    };

    const textColor = statusColors[value] || "text-gray-500"; // fallback color

    return (
      <div className=" relative">
        {/* <p className={`${textColor} text-[15px] font-semibold text-center`}>
          {value || "Pending"}
        </p> */}
        <select
          value={value}
          onChange={(e) => updatePaymentSatusBySeller(e.target.value, row.original.orderId,)}
          className={`pl-10 pr-4 py-2 w-full border ${textColor} rounded-md focus:ring-2 focus:border-opacity-50 text-black appearance-none`}
        // style={{`}
        //   "--tw-ring-color": BRAND_COLOR,
        // }}
        >
          <option className="text-yellow-500" value="Pending">Pending</option>
          <option className="text-green-600" value="Succeeded">Succeeded</option>
          <option className="text-red-500" value="Failed">Failed</option>
        </select>
        <Package className="absolute left-3 top-3 h-4 w-4 text-[#F38529]" />
      </div>
    );
  }

  function date({ value }) {
    return (
      <div>
        <p className="text-black text-base font-normal text-center">{value}</p>
      </div>
    );
  }

  function order_platform({ value }) {
    return (
      <div>
        <p className="text-black text-base font-normal text-center uppercase">{value}</p>
      </div>
    );
  }

  function time({ value }) {
    return (
      <div>
        <p className="text-black text-base font-normal text-center">{value}</p>
      </div>
    );
  }

  function mobile({ value }) {
    return (
      <div>
        <p className="text-black text-[15px] font-normal text-center">
          {value}
        </p>
      </div>
    );
  }

  const info = ({ value, row }) => {
    const totalQty = row?.original?.productDetail?.reduce(
      (sum, item) => sum + (item.qty || 0),
      0
    );

    return (
      <div className=" p-4  flex items-center  justify-center">
        <button
          className="h-[38px] w-[93px] bg-[#00000020] text-black text-[15px] cursor-pointer font-normal rounded-[8px]"
          onClick={() => {
            setOpenCart(true);
            setCartData(row.original);
            setTotalItem(totalQty);
            console.log(row.original.user?.email);
            console.log("", row.original);
          }}
        >
          See
        </button>
      </div>
    );
  };
  const OrderMethod = ({ row }) => {
    return (
      <div>
        <p className="text-black text-[15px] font-normal text-center">
          {row?.original?.isOrderPickup
            ? "In Store Pickup"
            : row?.original?.isLocalDelivery
              ? " Local Delivery"
              : row?.original?.isDriveUp
                ? "Curbside Pickup"
                : row?.original?.isShipmentDelivery
                  ? "Shipment"
                  : "Not specified"}
        </p>
      </div>
    );
  };

  const OrderID = ({ row }) => {
    return (
      <div>
        <p className="text-black text-[15px] font-normal text-center">
          {row.original.orderId}
        </p>
      </div>
    );
  };

  const [isLoading, setIsLoading] = useState(false);

  const columns = useMemo(
    () => [
      {
        Header: "Date",
        accessor: "orderDate",
        Cell: date,
      },
      {
        Header: "Time",
        accessor: "orderTime",
        Cell: time,
      },
      {
        Header: "Order #",
        Cell: OrderID,
      },
      {
        Header: "Method",
        Cell: OrderMethod,
      },
      {
        Header: "NAME",
        // accessor: "user.username",
        Cell: name,
      },
      {
        Header: "Mobile",
        accessor: "user.number",
        Cell: mobile,
      },

      {
        Header: "Order Status",
        accessor: "status",
        Cell: Status,
      },
      {
        Header: "Platform",
        accessor: "order_platform",
        Cell: order_platform,
      },

      {
        Header: "Payment-Status",
        accessor: "paymentStatus",
        Cell: PaymentStatus,
      },
      {
        Header: "Details",
        // accessor: "view",
        Cell: info,
      },
    ],
    []
  );


  return (
    <section className="w-full h-full bg-transparent pt-5 md:px-4 pb-8">
      <div className="">
        <p className="text-black  flex font-bold  md:text-[32px] text-2xl px-4">
          <span
            className={`inline-block w-2 h-8 bg-[#F38529]  mr-3 rounded `}
          ></span>
          Pending/Failed Orders
        </p>
        <p className="text-black text-md ps-9"> Payment Not Sucessfully Done</p>
      </div>
      <section
        className="px-5 md:pb-32 bg-white h-full rounded-[12px] 
            overflow-y-scroll  scrollbar-hide overflow-scroll pb-28  "
      >
        <Drawer
          className="custom-drawer"
          open={openCart}
          onClose={closeDrawer}
          anchor={"right"}
        >
          <div className="md:w-[43vw] w-[380px] relative">
            <div className="w-full h-full overflow-y-scroll scrollbar-hide overflow-scroll md:pb-44 pb-32">
              {/* Header */}
              <div className="sticky top-0 bg-white z-10 px-5 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <h2 className="text-[#F38529] text-xl font-semibold">
                    Order Details
                  </h2>
                </div>
                <div className="flex gap-5">
                  <IoCloseCircleOutline
                    className="text-[#F38529] w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={closeDrawer}
                  />
                </div>
              </div>

              <div className="px-5 pt-4">
                <h3 className="text-gray-800 font-medium mb-3">Order Items</h3>
                {cartData?.productDetail?.map((item, i) => (
                  <div
                    key={i}
                    className="border-b border-gray-100 py-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
                    onClick={() => {
                      router.push(
                        `/orders-details/${cartData?._id}?product_id=${item?._id}`
                      );
                    }}
                  >
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-gray-50 rounded-lg p-2">
                        <img
                          className="w-[60px] h-[60px] object-contain"
                          src={item?.image[0]}
                          alt={item?.product?.name}
                        />
                      </div>

                      <div className="ml-4 flex-grow">
                        <p className="text-gray-800 font-medium">
                          {item?.product?.name}
                        </p>
                        <div className="flex flex-wrap mt-1">
                          <div className="flex items-center mt-1">
                            <span className="text-gray-500 text-xs mr-1">
                              Qty:
                            </span>
                            <span className="text-gray-800">{item?.qty}</span>
                          </div>
                        </div>
                      </div>

                      <div className="ml-auto">
                        <p className="text-[#F38529] font-semibold">
                          $
                          {(Number(item?.total || item?.price) || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {item?.BarCode && (
                      <div className="mt-2">
                        <h3 className="text-[17px] text-gray-700 font-medium mb-2">
                          Generated Barcode:
                        </h3>
                        <div className="bg-gray-100 p-2 rounded-md inline-block relative justify-center">
                          <Barcode value={item?.BarCode} />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="px-5 pt-6">
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h3 className="text-gray-800 font-medium mb-3 pb-2 border-b border-gray-200">
                    Delivery Information
                  </h3>

                  <div className="flex justify-between items-center py-2">
                    <p className="text-gray-600">Delivery Type:</p>
                    <p className="text-gray-800 font-medium">
                      {cartData?.isOrderPickup
                        ? "In Store Pickup"
                        : cartData?.isLocalDelivery
                          ? "Next Day Delivery"
                          : cartData?.isDriveUp
                            ? "Curbside Pickup"
                            : cartData?.isShipmentDelivery
                              ? "Shipment"
                              : "Not specified"}
                    </p>
                  </div>

                  {cartData?.isOrderPickup && (
                    <div className="flex justify-between items-center py-2">
                      <p className="text-gray-600">Pickup Date:</p>
                      <p className="text-gray-800">
                        {convertISODateToFormattedString(
                          cartData?.dateOfDelivery
                        ) || "No Date"}
                      </p>
                    </div>
                  )}

                  {(cartData?.isLocalDelivery ||
                    cartData.isShipmentDelivery) && (
                      <>
                        {cartData?.Local_address?.ApartmentNo && (
                          <div className="flex justify-between items-center py-2">
                            <p className="text-gray-600">Apartment No:</p>
                            <p className="text-gray-800">
                              {cartData?.Local_address?.ApartmentNo}
                            </p>
                          </div>
                        )}
                        {cartData?.Local_address?.BusinessAddress && (
                          <div className="flex justify-between items-center py-2">
                            <p className="text-gray-600">Business Address:</p>
                            <p className="text-gray-800">
                              {cartData?.Local_address?.BusinessAddress}
                            </p>
                          </div>
                        )}

                        {cartData?.Local_address?.SecurityGateCode && (
                          <div className="flex justify-between items-center py-2">
                            <p className="text-gray-600">Security Gate Code:</p>
                            <p className="text-gray-800">
                              {cartData?.Local_address?.SecurityGateCode}
                            </p>
                          </div>
                        )}
                      </>
                    )}

                  {cartData?.isLocalDelivery && (
                    <>
                      <div className="flex justify-between items-center py-2">
                        <p className="text-gray-600">Delivery Date:</p>
                        <p className="text-gray-800">
                          {convertISODateToFormattedString(
                            cartData?.dateOfDelivery
                          )}
                        </p>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <p className="text-gray-600">Zipcode:</p>
                        <p className="text-gray-800">
                          {cartData?.Local_address?.zipcode}
                        </p>
                      </div>
                      <div className="py-2">
                        <p className="text-gray-600">Delivery Address:</p>
                        <p className="text-gray-800 mt-1">
                          {cartData?.Local_address?.address}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Drive Up */}
                  {cartData?.isDriveUp && (
                    <>
                      <div className="flex justify-between items-center py-2">
                        <p className="text-gray-600">Pickup Date:</p>
                        <p className="text-gray-800">
                          {convertISODateToFormattedString(
                            cartData?.dateOfDelivery
                          )}
                        </p>
                      </div>
                      {cartData?.parkingNo && (
                        <div className="flex justify-between items-center py-2">
                          <p className="text-gray-600">Parking Spot:</p>
                          <p className="text-gray-800">
                            {cartData?.parkingNo || "Not specified"}
                          </p>
                        </div>
                      )}
                      {cartData?.carBrand && (
                        <div className="flex justify-between items-center py-2">
                          <p className="text-gray-600">Car Brand:</p>
                          <p className="text-gray-800">
                            {cartData?.carBrand || "Not specified"}
                          </p>
                        </div>
                      )}
                      {cartData?.carColor && (
                        <div className="flex justify-between items-center py-2">
                          <p className="text-gray-600">Car Color:</p>
                          <p className="text-gray-800">
                            {cartData?.carColor || "Not specified"}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {/* Shipment Delivery */}
                  {cartData?.isShipmentDelivery && (
                    <>
                      <div className="py-2">
                        <p className="text-gray-600">Delivery Address:</p>
                        <p className="text-gray-800 mt-1">
                          {cartData?.Local_address?.address}
                        </p>
                      </div>
                      {cartData?.trackingLink && (
                        <div className="py-2">
                          <p className="text-gray-600">Shipping Company:</p>
                          <p className="text-gray-800">
                            {cartData?.trackingLink || "Not specified"}
                          </p>
                        </div>
                      )}

                      {cartData?.trackingNo && (
                        <div className="py-2">
                          <p className="text-gray-600">Tracking Number:</p>
                          <p className="text-gray-800">
                            {cartData?.trackingNo || "Not specified"}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="fixed bottom-0  right-0 bg-white px-2 py-2 border-t border-gray-200 md:w-[44vw] w-[380px] flex md:gap-5 gap-2">
              <p className="bg-[#F38529] w-full py-4 px-1 rounded-lg text-white text-lg font-bold flex justify-center items-center">
                Total Amout: ${cartData?.total}
              </p>
              <p className="bg-[#F38529] w-full py-4 rounded-lg text-white text-lg font-bold flex justify-center items-center">
                Total Items: {TotalItem}
              </p>
            </div>
          </div>
        </Drawer>

        <div className="bg-white  rounded-xl   border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex justify-center items-center p-20">
              <div
                className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
                style={{ borderColor: primaryColor }}
              ></div>
            </div>
          ) : userRquestList.length === 0 ? (
            <div className="flex flex-col justify-center items-center p-20 text-center">
              <img
                src="/empty-box.png"
                alt="No data"
                className="w-32 h-32 mb-4 opacity-60"
              />
              <h3 className="text-xl font-medium text-gray-700 mb-1">
                No Orders found
              </h3>
              <p className="text-gray-500">
                Try adjusting your filters or search OrderId
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={userRquestList}
                pagination={pagination}
                onPageChange={handlePageChange}
                currentPage={currentPage}
                itemsPerPage={pagination.itemsPerPage}
              />
            </div>
          )}
        </div>
      </section>
    </section>
  );
}

export default isAuth(Orders);
