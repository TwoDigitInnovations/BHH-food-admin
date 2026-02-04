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
import {
  Search,
  Filter,
  Calendar,
  Package,
  XCircle,
  Mail,
  X,
  DeleteIcon,
  Trash2,
} from "lucide-react";
import Barcode from "react-barcode";
import Invoice from "@/components/Invoice";

function Orders(props) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [user, setUser] = useContext(userContext);
  const [userRquestList, setUserRquestList] = useState([]);
  const [viewPopup, setviewPopup] = useState(false);
  const [popupData, setPopupData] = useState({});
  const [openCart, setOpenCart] = useState(false);
  const [CartItem, setCartItem] = useState(0);
  const [cartData, setCartData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [orderId, setOrderId] = useState("");
  const [Id, setId] = useState("");
  const [selctDate, setSelctDate] = useState("");
  const [pickupDate, setPickupdate] = useState("");
  const [isDateSelectedManually, setIsDateSelectedManually] = useState(false);
  const [selectedPikcupOption, setSelectedpickupOption] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [TotalItem, setTotalItem] = useState("0");
  const [note, setNote] = useState("");
  const [isEditing, setIsEditing] = useState(true); // Initially editable
  const [openModel, setOpenModel] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  });
  const [selectedDriver, setSelectedDriver] = useState("");
  const [fortrackingOrderId, setFortrackingOrderId] = useState(null);
  const [trackingNo, setTrackingNo] = useState("");
  const [trackingLink, setTrackingLink] = useState("");
  const [readyOrders, setReadyOrders] = useState([]); // list of ready order IDs
  const [driverList, setDriverList] = useState([]);
  const [currentOrderId, setCurrentorderId] = useState("");

  const handlePageChange = (page) => {
    setCurrentPage(page);
    localStorage.setItem("currentPage", page);
    // getOrderBySeller(selctDate, selectedPikcupOption, page, orderId);
  };

  useEffect(() => {
    const savedPage = localStorage.getItem("currentPage");
    if (savedPage) {
      setCurrentPage(Number(savedPage));
    }
  }, []);

  const BRAND_COLOR = "#F38529";

  const closeDrawer = async () => {
    setOpenCart(false);
    setCartData({});
  };

  useEffect(() => {
    const dateToSend = isDateSelectedManually ? selctDate : null;

    getOrderBySeller(
      dateToSend,
      pickupDate,
      selectedPikcupOption,
      currentPage,
      orderId,
      20
    );
  }, [selctDate, selectedPikcupOption, currentPage, orderId, pickupDate]);

  const resetFilters = () => {
    setSelctDate("");
    setSelectedpickupOption("All");
    setOrderId("");
    setPickupdate("");
    getOrderBySeller(
      null,
      pickupDate,
      selectedPikcupOption,
      currentPage,
      orderId
    );
  };

  useEffect(() => {
    getOrderBySeller(
      null,
      pickupDate,
      selectedPikcupOption,
      currentPage,
      orderId
    );
  }, [currentPage]);

  useEffect(() => {
    getDriverList();
  }, []);

  const getDriverList = () => {
    props.loader(true);
    Api("get", "getVerifiedDriverList", "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        setDriverList(res.data);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const getOrderBySeller = async (
    selctDate,
    pickupDate,
    selectedPikcupOption,
    page = 1,
    orderId,
    limit = 20
  ) => {
    const data = {};

    if (selctDate) {
      data.curentDate = moment(new Date(selctDate)).format();
    }

    if (selectedPikcupOption) {
      data.PickupOption = selectedPikcupOption;
    }

    if (orderId) {
      data.orderId = orderId;
    }

    if (pickupDate) {
      data.pickupDate = pickupDate;
    }

    props.loader(true);

    Api(
      "post",
      `NewgetOrderBySeller?page=${page}&limit=${limit}`,
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

  const handleSubmit = () => {
    const data = {
      SecretCode: String(otp).trim(), // Evensure it's always a string
      id: Id,
      status: "Completed",
    };

    console.log(data);
    props.loader(true);
    Api("post", "verifyOrderStatusWithCode", data, router)
      .then((res) => {
        props.loader(false);

        if (res?.error) {
          props.toaster({ type: "error", message: res.error });
        } else {
          props.toaster({ type: "success", message: "Verified Successfully" });
          getOrderBySeller(
            null,
            pickupDate,
            selectedPikcupOption,
            currentPage,
            null
          );
          setOtp("");
          setShowModal(false);
        }
      })
      .catch((err) => {
        props.loader(false);
        console.log(err);
        props.toaster({
          type: "error",
          message: err?.message || "Verification failed",
        });
      });
  };

  const orderready = (id) => {
    Swal.fire({
      text: "Are you sure? Do you want to send the order ready notification?",
      showCancelButton: true,
      confirmButtonColor: "#F38529",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, send it!",
      width: "350px",
    }).then((result) => {
      if (result.isConfirmed) {
        const data = { id };
        console.log(data);
        props.loader(true);

        Api("post", "orderreadyNotification", data, router)
          .then((res) => {
            props.loader(false);
            if (!readyOrders.includes(id)) {
              setReadyOrders([...readyOrders, id]);
            }
            if (res?.error) {
              props.toaster({ type: "error", message: res.error });
            } else {
              props.toaster({
                type: "success",
                message: "Notification sent successfully",
              });
              // getOrderBySeller(
              //   null,
              //   pickupDate,
              //   selectedPikcupOption,
              //   currentPage,
              //   null
              // );
            }
          })
          .catch((err) => {
            props.loader(false);
            console.log(err);
            props.toaster({ type: "error", message: err?.message || "Error" });
          });
      }
    });
  };

  const handleCancelOrder = (id) => {
    if (typeof reason === "undefined" || reason.trim() === "") {
      props.toaster({
        type: "error",
        message: "Please Write a Reason to Cancal order",
      });
      return;
    }
    const data = {
      id,
      reason,
    };
    console.log(data);
    props.loader(true);
    Api("post", "cancalOrderfromAdmin", data, router)
      .then((res) => {
        props.loader(false);
        props.toaster({ type: "success", message: "order cancal Sucessfully" });
        getOrderBySeller(
          null,
          pickupDate,
          selectedPikcupOption,
          currentPage,
          orderId
        );
        setOpenCart(false);
        setOpenModel(false);
        setReason("");
      })
      .catch((err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message || "Error" });
      });
  };

  const handleSwitchToShipment = (id) => {
    setOpenCart(false);
    Swal.fire({
      text: "Are you sure? This will switch the order to Shipment Delivery.",
      showCancelButton: true,
      confirmButtonColor: "#F38529",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, switch it",
      width: "350px",
    }).then((result) => {
      if (result.isConfirmed) {
        const data = { id };

        console.log(data);
        props.loader(true);
        Api("post", "switchToShipment", data, router)
          .then((res) => {
            props.loader(false);
            setOpenCart(false);
            props.toaster({
              type: "success",
              message: "Order switched to Shipment Delivery",
            });
            getOrderBySeller(
              null,
              pickupDate,
              selectedPikcupOption,
              currentPage,
              null // ❌ cancel हुए order का id मत भेजो
            );
          })
          .catch((err) => {
            props.loader(false);
            console.log(err);
            props.toaster({ type: "error", message: err?.message || "Error" });
          });
      }
    });
  };

  const AddNote = (id) => {
    // Check if note is undefined or empty
    if (typeof note === "undefined" || note.trim() === "") {
      props.toaster({ type: "error", message: "Please enter a note" });
      return; // Exit the function if note is invalid
    }

    const data = {
      id,
      note: note,
    };

    console.log(data);
    props.loader(true);

    Api("post", "AddNote", data, router)
      .then((res) => {
        props.loader(false);
        props.toaster({
          type: "success",
          message: "Document Added Successfully",
        });
        setIsEditing(!isEditing);
        getOrderBySeller(
          null,
          pickupDate,
          selectedPikcupOption,
          currentPage,
          null // ❌ cancel हुए order का id मत भेजो
        );

        // console.log(res.data)
        setNote(res.data.note);
      })
      .catch((err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message || "Error" });
      });
  };

  const ReturnOrder = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to Confirm Return this order?",
      showCancelButton: true,
      confirmButtonText: "Yes, Confirm it!",
      cancelButtonText: "No, keep it",
      confirmButtonColor: "#F38529",
      cancelButtonColor: "#F38529",
    }).then((result) => {
      if (result.isConfirmed) {
        const data = { id };
        props.loader(true);
        Api("post", "ReturnConform", data, router)
          .then((res) => {
            props.loader(false);
            if (res.status) {
              props.toaster({ type: "success", message: res.message });
              getOrderBySeller(
                null,
                pickupDate,
                selectedPikcupOption,
                currentPage,
                null // ❌ cancel हुए order का id मत भेजो
              );
            } else {
              props.toaster({
                type: "error",
                message: res.message || "Failed to cancel order",
              });
            }
          })
          .catch((err) => {
            props.loader(false);
            console.log(err);
            props.toaster({
              type: "error",
              message: err?.message || "Something went wrong",
            });
          });
      }
    });
  };

  const sendTrackingInfo = () => {
    const data = {
      id: fortrackingOrderId._id,
      trackingNo: trackingNo,
      trackingLink: trackingLink,
    };
    console.log(data);
    props.loader(true);
    Api("post", "updateTrackingInfo", data, router)
      .then((res) => {
        props.loader(false);
        if (res?.error) {
          props.toaster({ type: "error", message: res.error });
        } else {
          props.toaster({
            type: "success",
            message: "Tracking info updated successfully",
          });
          setIsOpen(false);
          getOrderBySeller(
            null,
            pickupDate,
            selectedPikcupOption,
            currentPage,
            null
          );
        }
      })
      .catch((err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message || "Error" });
      });
  };

  const orderConfirm = (id) => {
    setOpenCart(false);
    Swal.fire({
      text: "Are you sure? Do you want to mark this order as completed?",
      showCancelButton: true,
      confirmButtonColor: "#F38529",
      cancelButtonColor: "#F38529",
      confirmButtonText: "Yes, confirm it!",
      width: "350px",
    }).then((result) => {
      if (result.isConfirmed) {
        setOpenCart(false);
        const data = {
          id: id,
          status: "Completed",
        };
        console.log(data);
        props.loader(true);
        Api("post", "changeorderstatus", data, router)
          .then((res) => {
            props.loader(false);
            if (res?.error) {
              props.toaster({ type: "error", message: res.error });
            } else {
              props.toaster({
                type: "success",
                message: "Order status updated successfully",
              });
              setIsOpen(false);
              getOrderBySeller(
                null,
                pickupDate,
                selectedPikcupOption,
                currentPage,
                null // ❌ cancel हुए order का id मत भेजो
              );
            }
          })
          .catch((err) => {
            props.loader(false);
            console.log(err);
            props.toaster({ type: "error", message: err?.message || "Error" });
          });
      }
    });
  };

  const SubmitAssign = (driverId, orderId) => {
    setOpenCart(false);

    const data = {
      driverId: driverId,
      orderId: orderId,
    };

    console.log(data);
    props.loader(true);

    Api("post", "assignDriver", data, router)
      .then((res) => {
        props.loader(false);

        if (res?.error) {
          props.toaster({ type: "error", message: res.error });
        } else {
          props.toaster({
            type: "success",
            message: "Order assigned to driver successfully",
          });
          setOpenAssign(false);
          getOrderBySeller(
            null,
            pickupDate,
            selectedPikcupOption,
            currentPage,
            null // ❌ cancel हुए order का id मत भेजो
          );
        }
      })
      .catch((err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message || "Error" });
      });
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

  const orderPreparing = (id) => {
    // setOpenCart(false);
    Swal.fire({
      text: "Are you sure? Do you want to start preparing the order?",
      showCancelButton: true,
      confirmButtonColor: "#F38529",
      cancelButtonColor: "#F38529",
      confirmButtonText: "Yes, confirm it!",
      width: "350px",
    }).then((result) => {
      if (result.isConfirmed) {
        setOpenCart(false);
        const data = {
          id: id,
          status: "Preparing",
        };
        console.log(data);
        props.loader(true);
        Api("post", "changeorderstatus", data, router)
          .then((res) => {
            props.loader(false);
            if (res?.error) {
              props.toaster({ type: "error", message: res.error });
            } else {
              props.toaster({
                type: "success",
                message: "Order is Getting Ready Soon",
              });

              getOrderBySeller();
            }
          })
          .catch((err) => {
            props.loader(false);
            console.log(err);
            props.toaster({ type: "error", message: err?.message || "Error" });
          });
      }
    });
  };

  const deleteOrder = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This order will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#EF4444",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, delete it",
    }).then((result) => {
      if (result.isConfirmed) {
        props.loader(true);

        Api("post", `delete-order/${id}`, null, router)
          .then(() => {
            props.loader(false);
            props.toaster({
              type: "success",
              message: "Order deleted successfully",
            });

            getOrderBySeller(
              null,
              pickupDate,
              selectedPikcupOption,
              currentPage,
              null
            );
          })
          .catch((err) => {
            props.loader(false);
            props.toaster({
              type: "error",
              message: err?.message || "Failed to delete order",
            });
          });
      }
    });
  };

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

  function date({ value, row }) {
    // Use createdAt if available, otherwise use orderDate
    const order = row?.original;
    if (order?.createdAt) {
      const date = new Date(order.createdAt);
      return (
        <div>
          <p className="text-black text-base font-normal text-center">
            {date.toLocaleDateString('en-US', {
              timeZone: 'America/Chicago', // Always use Houston time
              month: '2-digit',
              day: '2-digit', 
              year: 'numeric'
            })}
          </p>
        </div>
      );
    }
    
    // Fallback to orderDate
    return (
      <div>
        <p className="text-black text-base font-normal text-center">{value || '-'}</p>
      </div>
    );
  }

  function time({ value, row }) {
    // Use createdAt if available, otherwise use orderTime
    const order = row?.original;
    if (order?.createdAt) {
      const date = new Date(order.createdAt);
      return (
        <div>
          <p className="text-black text-base font-normal text-center">
            {date.toLocaleTimeString('en-US', {
              timeZone: 'America/Chicago', // Always use Houston time
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </p>
        </div>
      );
    }
    
    // Fallback to orderTime
    return (
      <div>
        <p className="text-black text-base font-normal text-center">{value || '-'}</p>
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
            setNote(row.original.note);
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

  const OrderReady = ({ row }) => {
    const order = row.original;
    const shouldShowButton =
      order.isDriveUp === true || order.isOrderPickup === true;
    const isCompleted = order.status === "Completed";
    const isCancelOrder = order.status === "Cancel";

    const inProcess = order.status === "Preparing";

    return (
      <div className="p-4 flex items-center justify-center">
        {isCancelOrder ? (
          <button className="px-4 py-1.5 bg-red-500 text-white text-[15px] cursor-not-allowed font-normal rounded-[8px]">
            Order Cancelled
          </button>
        ) : (
          <>
            {shouldShowButton && (
              <>
                {isCompleted ? (
                  <button className="px-4 py-1.5 bg-green-500 text-white text-[15px] cursor-pointer font-normal rounded-[8px]">
                    Order Delivered
                  </button>
                ) : (
                  <>
                    {!inProcess ? (
                      <button
                        className="px-4 py-1.5 bg-[#F38529] text-white text-[15px] cursor-pointer font-normal rounded-[8px]"
                        onClick={() => orderPreparing(order._id)}
                      >
                        In-Process
                      </button>
                    ) : (
                      <div className="flex flex-col items-center">
                        <button
                          className={`px-4 py-1.5  text-[15px]  font-normal rounded-[8px] transition duration-300 
                          ${order.isReady
                              ? "bg-orange-400 cursor-not-allowed text-white"
                              : "bg-[#00000020] hover:underline text-black cursor-pointer"
                            }`}
                          onClick={() =>
                            !order.isReady && orderready(order._id)
                          }
                          disabled={order.isReady}
                        >
                          {order.isReady
                            ? "Order is ready & email sent"
                            : "Order Ready"}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {(order.isShipmentDelivery || order.isLocalDelivery) && (
              <>
                {order.status === "Return Requested" && (
                  <button
                    className="px-4 py-1.5 bg-[#00000020] text-black text-[15px] cursor-pointer font-normal rounded-[8px] hover:underline"
                    onClick={() => ReturnOrder(order._id)}
                  >
                    Return Confirm
                  </button>
                )}

                {order.status === "Return" && (
                  <button className="px-4 py-1.5 bg-green-500 text-white text-[15px] cursor-pointer font-normal rounded-[8px]">
                    Return Successfully
                  </button>
                )}

                {/* ✅ Only show shipping-related tracking buttons when not in a return state */}
                {order.status !== "Return Requested" &&
                  order.status !== "Return" &&
                  (order.status === "Completed" ? (
                    <button className="px-4 py-1.5 bg-green-600 text-white text-[15px] cursor-pointer font-normal rounded-[8px]">
                      Order Delivered
                    </button>
                  ) : order.trackingNo && order.trackingLink ? (
                    <button className="px-4 py-1.5 bg-[#F38529] text-white text-[15px] cursor-pointer font-normal rounded-[8px]">
                      Order Shipped
                    </button>
                  ) : (
                    order.isShipmentDelivery && (
                      <button
                        className="px-4 py-1.5 bg-[#00000020] text-black text-[15px] cursor-pointer font-normal rounded-[8px] hover:underline"
                        onClick={() => {
                          setIsOpen(true);
                          setFortrackingOrderId(order);
                        }}
                      >
                        Add Tracking Info
                      </button>
                    )
                  ))}
              </>
            )}

            {order.isLocalDelivery && (
              <div>
                {order.status === "Pending" ? (
                  <button
                    onClick={() => {
                      setOpenAssign(true);
                      setCurrentorderId(order?._id);
                    }}
                    className="bg-amber-600 px-4 py-2 text-white rounded"
                  >
                    Assign Order
                  </button>
                ) : order.status === "Driverassigned" ? (
                  <span className="text-white px-4 py-2 rounded-lg font-bold bg-amber-600">
                    Driver Assigned
                  </span>
                ) : order.status === "Shipped" ? (
                  <span className="text-white px-4 py-2 rounded-lg font-bold bg-amber-600">
                    order Shipped
                  </span>
                ) : null}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const Action = ({ row }) => {
    const order = row.original;
    return (
      <div
        onClick={() => deleteOrder(order._id)}
        className="mr-4 flex bg-orange-500 items-center px-4 py-2 rounded-md gap-2 text-white cursor-pointer hover:text-red-600"
      >
        <Trash2 size={18} />
        <span className="text-sm">Delete Order</span>
      </div>
    );
  };

  const [isLoading, setIsLoading] = useState(false);

  function order_platform({ value }) {
    return (
      <div>
        <p className="text-black text-base font-normal text-center uppercase">
          {value}
        </p>
      </div>
    );
  }

  const columns = useMemo(
    () => [
      {
        Header: "Action",
        // accessor: "view",
        Cell: Action,
      },
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
        Header: "Details",
        // accessor: "view",
        Cell: info,
      },
      {
        Header: "Delivery-Status",
        // accessor: "view",
        Cell: OrderReady,
      },

    ],
    []
  );
  const employeeColumns = useMemo(
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
        Header: "Details",
        // accessor: "view",
        Cell: info,
      },
      {
        Header: "Delivery-Status",
        // accessor: "view",
        Cell: OrderReady,
      },

    ],
    []
  );

  const formatDate = (date) => {
    if (!date || isNaN(new Date(date))) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <section className="w-full h-full bg-transparent pt-5 md:px-4 pb-8 ">
      <div className="flex items-center justify-between">
        <p className="text-black font-bold  md:text-[32px] text-2xl px-4">
          <span
            className={`inline-block w-2 h-8 bg-[#F38529]  mr-3 rounded `}
          ></span>
          Orders
        </p>
        <h1
          className="md:mt-0 mt-4 text-2xl font-bold text-gray-900 mb-0 cursor-pointer pr-4"
          onClick={resetFilters}
        >
          Refresh
        </h1>
      </div>
      {openAssign && <div> </div>}
      <section
        className="px-5 pt-5 md:pb-32 bg-white h-full rounded-[12px] 
            overflow-y-scroll   scrollbar-hide overflow-scroll pb-28 md:mt-5 mt-5"
      >
        <div className="bg-white shadow-sm border border-gray-300 rounded-lg p-4 w-full">
          <div className="flex items-center mb-4">
            <Filter
              className="h-5 w-5 text-orange-500 mr-2"
              style={{ color: BRAND_COLOR }}
            />
            <h3 className="font-semibold text-gray-800">Filter Orders</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Order ID Search */}
            <div className="relative">
              <label className="block text-[16px] font-medium text-gray-700 mb-1">
                Order ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Search by order ID"
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:border-opacity-50 text-black"
                  style={{
                    borderColor: orderId ? BRAND_COLOR : undefined,
                    "--tw-ring-color": BRAND_COLOR,
                  }}
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-[#F38529]" />
                {orderId && (
                  <button
                    onClick={() => setOrderId("")}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    <XCircle className="h-4 w-4 text-[#F38529]" />
                  </button>
                )}
              </div>
            </div>

            {/* Date Filter */}
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-1">
                Date
              </label>
              <div className="relative">
                <input
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:border-opacity-50 text-black"
                  style={{
                    "--tw-ring-color": BRAND_COLOR,
                  }}
                  type="date"
                  value={formatDate(selctDate)}
                  onChange={(e) => {
                    const selected = new Date(e.target.value);
                    setSelctDate(selected);
                    setIsDateSelectedManually(true);
                  }}
                />
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-[#F38529]" />
              </div>
            </div>

            {/* Pickup Option */}
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-1">
                Pickup Option
              </label>
              <div className="relative">
                <select
                  value={selectedPikcupOption}
                  onChange={(e) => setSelectedpickupOption(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:border-opacity-50 text-black appearance-none"
                  style={{
                    "--tw-ring-color": BRAND_COLOR,
                  }}
                >
                  <option value="All">All</option>
                  <option value="InStorePickup">In Store Pickup</option>
                  <option value="CurbsidePickup">Curbside Pickup</option>
                  <option value="NextdayDelivery">Local Delivery</option>
                  <option value="Shipment">Shipment</option>
                  <option value="Cancel">Cancelled order</option>
                </select>
                <Package className="absolute left-3 top-3 h-4 w-4 text-[#F38529]" />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 mt-4">
            <div>
              <label className="block text-[16px] font-medium text-gray-700 mb-1">
                Pickup Date
              </label>
              <div className="relative">
                <input
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:border-opacity-50 text-black"
                  style={{
                    "--tw-ring-color": BRAND_COLOR,
                  }}
                  type="date"
                  value={formatDate(pickupDate)}
                  onChange={(e) => {
                    const selected = new Date(e.target.value);
                    setPickupdate(selected);
                    setIsDateSelectedManually(true);
                  }}
                />
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-[#F38529]" />
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4 space-x-3">
            <button
              onClick={resetFilters}
              className="px-4 py-2.5 border cursor-pointer border-gray-300 rounded-md text-white"
              style={{
                backgroundColor: BRAND_COLOR,
                "--tw-ring-color": BRAND_COLOR,
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg flex flex-col">
              <h2 className="text-xl font-semibold mb-6 text-gray-800">
                Tracking Info
              </h2>

              <label
                htmlFor="trackingNo"
                className="mb-1 font-medium text-gray-700"
              >
                Tracking No
              </label>
              <input
                type="text"
                id="trackingNo"
                value={trackingNo}
                onChange={(e) => setTrackingNo(e.target.value)}
                placeholder="Enter tracking number"
                required
                className="mb-5 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              />

              <label
                htmlFor="trackingLink"
                className="mb-1 font-medium text-gray-700"
              >
                Company Name
              </label>
              <input
                type="url"
                id="trackingLink"
                value={trackingLink}
                onChange={(e) => setTrackingLink(e.target.value)}
                placeholder="Company Name"
                required
                className="mb-6 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-black"
              />

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-md bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={() => sendTrackingInfo()}
                  className="px-4 py-2 rounded-md bg-[#F38529] text-white hover:bg-[#F38529] transition cursor-pointer"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

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
                  <Invoice order={cartData} />

                  <IoCloseCircleOutline
                    className="text-[#F38529] w-6 h-6 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={closeDrawer}
                  />
                </div>
              </div>

              {/* Order Status Banner */}
              {cartData?.status === "Cancel" && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-red-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-red-700 font-medium">
                        Order has been cancelled
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Items */}
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
                          {Number(item?.total) > 0
                            ? Number(item?.total || 0)?.toFixed(2)
                            : (
                              Number(item?.price) * Number(item?.qty) || 0
                            ).toFixed(2)}
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
              <div className="flex justify-center my-4">
                {" "}
                <Barcode value={cartData?.orderId} />
              </div>
              {/* Delivery Information */}
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

                  {/* Local Delivery */}
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

                      {cartData?.status === "Shipped" && (
                        <div className="flex mt-3 justify-center items-center w-full bg-[#F38529] rounded-lg">
                          <button
                            className="text-white mx-2 py-2
                                                "
                            onClick={() => orderConfirm(cartData._id)}
                          >
                            Confirm Order Delivered
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Verification Button */}
                {cartData?.status !== "Cancel" &&
                  cartData?.status !== "Completed" && (
                    <div className="flex justify-end mt-2 mb-4">
                      {cartData?.SecretCode &&
                        (cartData?.isDriveUp || cartData?.isOrderPickup) && (
                          <button
                            className="bg-[#F38529] px-6 py-2 rounded-lg text-white font-medium shadow-sm hover:bg-[#e07a25] transition-colors"
                            onClick={() => {
                              setShowModal(true);
                              setOpenCart(false);
                              setId(cartData._id);
                            }}
                          >
                            Verify Order
                          </button>
                        )}

                      {cartData?.status !== "Completed" && (
                        <button
                          className="bg-[#F38529] ml-2 px-6 py-2 rounded-lg text-white font-medium shadow-sm  transition-colors"
                          onClick={() => setOpenModel(true)}
                        >
                          Cancel Order
                        </button>
                      )}

                      {/* Switch to Shipment Button only for LocalDelivery */}
                      {cartData?.isLocalDelivery && (
                        <button
                          className="w-48 ml-2 bg-[#F38529] px-6 py-2 rounded-lg text-white font-medium shadow-sm  transition-colors"
                          onClick={() => handleSwitchToShipment(cartData._id)}
                        >
                          Switch to Shipment
                        </button>
                      )}
                    </div>
                  )}

                {cartData?.status === "pending" ||
                  cartData?.status === "Completed"}

                {/* Order Status */}
                {cartData?.status === "Completed" && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700 font-medium">
                          Order has been delivered successfully
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {cartData?.status === "Return" && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-green-500"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-700 font-medium">
                          Order has been Return successfully
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="w-full ">
                  <label
                    htmlFor="note"
                    className="block text-[16px] font-medium text-gray-700 mb-1"
                  >
                    Add a Note (e.g. Document details)
                  </label>
                  <textarea
                    id="note"
                    rows="6"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Enter your note here..."
                    className={`w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 ${!isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                  />
                  <div className="mt-2 flex justify-end">
                    {isEditing ? (
                      <button
                        onClick={() => {
                          AddNote(cartData._id);
                        }}
                        className="px-4 py-2 bg-[#F38529] text-white rounded-md "
                      >
                        Add Note
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                        }}
                        className="px-4 py-2 bg-[#F38529] text-white rounded-md hover:bg-[#F38529]"
                      >
                        Edit Note
                      </button>
                    )}
                  </div>
                </div>

                {openModel && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                      <div className="flex justify-between items-center p-4 border-b border-gray-100">
                        <h3 className="text-lg font-medium text-gray-800">
                          Reason for Order Cancellation
                        </h3>
                        <button
                          onClick={() => setOpenModel(false)}
                          className="text-gray-400 hover:text-gray-500"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div className="mb-4 p-4">
                        <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                            {`${cartData.user.username?.charAt(0).toUpperCase() ||
                              ""
                              }${cartData.user.lastname?.charAt(0).toUpperCase() ||
                              ""
                              }`}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {cartData.user.username}{" "}
                              {cartData.user.lastname || ""}
                            </p>
                            <p className="text-sm text-gray-500">
                              {cartData.user.email}
                            </p>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-500 text-[16px] ps-4">
                        {" "}
                        Order ID: {cartData.orderId}{" "}
                      </p>
                      <div className="mb-4 p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Your Reason
                        </label>
                        <textarea
                          rows="6"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          placeholder="Type your Reason here..."
                          className="w-full p-3 border border-gray-200 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none resize-none"
                        />
                      </div>

                      <div className="flex justify-end gap-3 mt-6 p-4">
                        <button
                          type="button"
                          onClick={() => setOpenModel(false)}
                          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          Cancel
                        </button>
                        <button
                          // type="submit"
                          className="px-4 py-2 bg-[#F38529] text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 cursor-pointer"
                          onClick={() => handleCancelOrder(cartData._id)}
                        >
                          <Mail size={16} />
                          <span>Order Cancel</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {cartData?.status === "Completed" &&
                  cartData?.isLocalDelivery &&
                  cartData?.proofOfDelivery?.length > 0 && (
                    <div className="mt-4">
                      <p className="font-semibold mb-2">Proof of Delivery</p>
                      <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                        {cartData.proofOfDelivery.map((imageUrl, index) => (
                          <img
                            key={index}
                            src={imageUrl}
                            alt={`Proof ${index + 1}`}
                            className="w-full h-auto object-cover rounded shadow"
                          />
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* Total Section - Fixed at Bottom */}
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

        {showModal && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <div className="flex justify-between items-center mb-4">
                <p className=" text-black"> Serect Code to Verify order </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Enter Secret Code"
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded mb-4"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <button
                  className="w-full bg-[#F38529] cursor-pointer text-white py-2 rounded "
                  onClick={handleSubmit}
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        )}
        {openAssign && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <div className="flex justify-between items-center mb-4">
                <p className="text-black">Assign Order</p>
                <button
                  onClick={() => setOpenAssign(false)}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4">
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full px-3 py-2 border text-black border-gray-300 rounded"
                >
                  <option value="">Select Driver</option>
                  {driverList.map((driver) => (
                    <option key={driver._id} value={driver._id}>
                      {driver.username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <button
                  className="w-full bg-[#F38529] cursor-pointer text-white py-2 rounded"
                  onClick={() => SubmitAssign(selectedDriver, currentOrderId)}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}

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
                columns={user?.type === "ADMIN" ? columns : employeeColumns}
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
