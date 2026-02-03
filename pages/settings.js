import React, { useState, useRef, useEffect } from "react";
import { MdOutlineFileUpload } from "react-icons/md";
import { useRouter } from "next/router";
import { IoCloseCircleOutline } from "react-icons/io5";
import { Api, ApiFormData } from "@/services/service";
import isAuth from "@/components/isAuth";
import Compressor from "compressorjs";
import { LiaEdit } from "react-icons/lia";
import { MdDelete } from "react-icons/md";
import PasswordManager from "@/pages/passwordmanager";

function Settings(props) {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const f = useRef(null);
  const [carouselImg, setCarouselImg] = useState([]);
  const [singleImg, setSingleImg] = useState("");
  const [product_id, setproduct_id] = useState("");
  const [settingsId, setSettingsId] = useState("");
  const [productlist, setproductlist] = useState([]);
  const [inputValue, setInputValue] = useState("");

  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    getsetting();
  }, []);

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const fileSizeInMb = file.size / (1024 * 1024);
    if (fileSizeInMb > 1) {
      props.toaster({
        type: "error",
        message: "Too large file. Please upload a smaller image",
      });
      return;
    } else {
      new Compressor(file, {
        quality: 0.6,
        success: (compressedResult) => {
          console.log(compressedResult);
          const data = new FormData();
          data.append("file", compressedResult);
          props.loader(true);
          ApiFormData("post", "user/fileupload", data, router).then(
            (res) => {
              props.loader(false);
              console.log("res================>", res);
              if (res.status) {
                setSingleImg(res.data.file);
                props.toaster({ type: "success", message: res.data.message });
              }
            },
            (err) => {
              props.loader(false);
              console.log(err);
              props.toaster({ type: "error", message: err?.message });
            }
          );
        },
      });
    }

    const reader = new FileReader();
  };

  const submit = (e) => {
    e.preventDefault();
    console.log(carouselImg);
    props.loader(true);
    let data = {
      carousel: carouselImg,
    };
    if (settingsId) {
      data.id = settingsId;
    }
    console.log(data);
    props.loader(true);
    Api(
      "post",
      `${settingsId ? `updatesetting` : `createsetting`}`,
      data,
      router
    ).then(
      (res) => {
        console.log("res================>", res);
        props.loader(false);

        if (res?.success) {
          setSubmitted(false);
          props.toaster({ type: "success", message: res?.message });
        } else {
          props.loader(false);
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

  const searchproduct = async (text) => {
    // props.loader(true);
    Api("get", `productSearch?key=${text}`, "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        if (res?.status) {
          setproductlist(res?.data);
          setIsOpen(true);
        } else {
          props.loader(false);
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const getsetting = async () => {
    props.loader(true);
    Api("get", "getsetting", "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        if (res?.success) {
          if (res?.setting.length > 0) {
            setSettingsId(res?.setting[0]._id);
            setCarouselImg(res?.setting[0].carousel);
          }
        } else {
          props.loader(false);
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const closeIcon = (item) => {
    const d = carouselImg.filter((f) => f.image !== item.image);
    setCarouselImg(d);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [localShippingCost, setLocalShippingCost] = useState("");
  const [minlocalShippingCost, setMinLocalShippingCost] = useState("");
  const [shipmentCost, setShipmentCost] = useState("");
  const [minshipmentCost, setMinShipmentCost] = useState("");
  const [minServiesCost, setMinServiesCost] = useState("");
  const [serviesCost, setServiesCost] = useState("");
  const [currentLocalCost, setCurrentLocalCost] = useState(0);
  const [mincurrentLocalCost, setMinCurrentLocalCost] = useState(0);
  const [currentShipmentCost, setCurrentShipmentCost] = useState(0);
  const [mincurrentShipmentCost, setMinCurrentShipmentCost] = useState(0);
  const [isEditingLocal, setIsEditingLocal] = useState(false);
  const [isEditingShipment, setIsEditingShipment] = useState(false);
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [currentShipmentCostMessage, setCurrentShipmentCostMessage] =
    useState("");
  const [shipmentCostMessage, setShipmentCostMessage] = useState("");
  const [currentMinServicesCost, setCurrentMinServicesCost] = useState("");
  const [currentServicesCost, setCurrentServicesCost] = useState("");
  const [isServices, setIsServices] = useState("");
  const [shippingCostsExist, setShippingCostsExist] = useState(false);

  useEffect(() => {
    getShippingCosts();
  }, []);

  const getShippingCosts = async () => {
    props.loader(true);
    try {
      const res = await Api("get", "getShippingCost", null, router);
      props.loader(false);

      if (res.shippingCosts && res.shippingCosts.length > 0) {
        const costs = res.shippingCosts[0];
        setCurrentLocalCost(costs.ShippingCostforLocal || 0);
        setCurrentShipmentCost(costs.ShipmentCostForShipment || 0);
        setCurrentShipmentCostMessage(costs.shipmentCostMessage || "");
        setMinCurrentLocalCost(costs.minShippingCostforLocal || 0);
        setMinCurrentShipmentCost(costs.minShipmentCostForShipment || 0);
        setCurrentServicesCost(costs?.serviesCost || 0);
        setCurrentMinServicesCost(costs?.minServiesCost || 0);
        setShippingCostsExist(true);
      } else {
        setShippingCostsExist(false);
      }
    } catch (err) {
      props.loader(false);
      // If error is "No shipping costs found", it's not really an error for our logic
      if (err?.message === "No shipping costs found") {
        setShippingCostsExist(false);
      } else {
        props.toaster({
          type: "error",
          message: err?.message || "Failed to fetch shipping costs",
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    props.loader(true);

    try {
      const payload = {
        localCost:
          localShippingCost !== ""
            ? parseFloat(localShippingCost)
            : currentLocalCost,
        minShippingCostforLocal:
          minlocalShippingCost !== ""
            ? parseFloat(minlocalShippingCost)
            : mincurrentLocalCost,
        shipmentCost:
          shipmentCost !== "" ? parseFloat(shipmentCost) : currentShipmentCost,
        minShipmentCostForShipment:
          minshipmentCost !== ""
            ? parseFloat(minshipmentCost)
            : mincurrentShipmentCost,
        shipmentCostMessage:
          shipmentCostMessage !== ""
            ? shipmentCostMessage
            : currentShipmentCostMessage,
        serviesCost:
          serviesCost !== "" ? parseFloat(serviesCost) : currentServicesCost,
        minServiesCost:
          minServiesCost !== ""
            ? parseFloat(minServiesCost)
            : currentMinServicesCost,
      };

      const method = shippingCostsExist ? "updateShippingCost" : "addShippingCost";
      
      const res = await Api("post", method, payload, router);

      props.loader(false);
      props.toaster({
        type: "success",
        message: `Shipping Costs ${
          shippingCostsExist ? "Updated" : "Added"
        } Successfully`,
      });

      getShippingCosts();
      setIsEditingLocal(false);
      setIsEditingShipment(false);
      setIsEditingMessage(false);
      setLocalShippingCost("");
      setShipmentCost("");
      setMinLocalShippingCost("");
      setMinShipmentCost("");
      setShipmentCostMessage("");
      setServiesCost("");
      setMinServiesCost("");
      getShippingCosts();
    } catch (err) {
      props.loader(false);
      props.toaster({
        type: "error",
        message: err?.message || "Operation failed",
      });
    }
  };

  const [pincodeInput, setPincodeInput] = useState("");
  const [pincodes, setPincodes] = useState([]);

  const getAllPincodes = () => {
    props.loader(true);
    Api("get", "getPinCode", null, router)
      .then((res) => {
        props.loader(false);
        if (res?.error) {
          props.toaster({ type: "error", message: res?.error });
        } else {
          setPincodes(res.pincodes || []); // Make sure it's an array
        }
      })
      .catch((err) => {
        props.loader(false);
        props.toaster({
          type: "error",
          message: err?.message || "Failed to fetch pincodes",
        });
      });
  };

  useEffect(() => {
    getAllPincodes();
  }, []);

  const handleSubmit2 = (e) => {
    e.preventDefault();
    const pinArray = pincodeInput
      .split(",")
      .map((pin) => pin.trim())
      .filter((pin) => pin); // Remove empty strings

    const data = { pincodes: pinArray }; // Send array of pincodes

    props.loader(true);
    Api("post", "addPinCode", data, router)
      .then((res) => {
        props.loader(false);
        if (res?.error) {
          props.toaster({ type: "error", message: res?.error });
        } else {
          props.toaster({
            type: "success",
            message: "Pincodes added successfully",
          });
          setPincodeInput("");
          getAllPincodes();
        }
      })
      .catch((err) => {
        props.loader(false);
        props.toaster({
          type: "error",
          message: err?.message || "Failed to add pincodes",
        });
      });
  };

  const handleDelete = (id) => {
    props.loader(true);
    Api("delete", `deletePinCode/${id}`) // ✅ Corrected template literal
      .then((res) => {
        props.loader(false);
        if (res?.error) {
          props.toaster({ type: "error", message: res?.error }); // ✅ Use res.error, not err
        } else {
          props.toaster({
            type: "success",
            message: "Pincode deleted successfully",
          });
          getAllPincodes(); // Refresh the list
        }
      })
      .catch((err) => {
        props.loader(false);
        props.toaster({
          type: "error",
          message: err?.message || "Failed to delete pincode",
        });
      });
  };

  return (
    <>
      <section className="w-full bg-gray-50 md:p-8 p-4 h-[90vh] overflow-y-scroll  scrollbar-hide overflow-scroll pb-32">
        <div className="mb-8">
          <h2 className="text-gray-800 font-bold md:text-3xl text-2xl mb-4 flex items-center">
            <span className="w-1 h-8 bg-[#F38529] rounded mr-3"></span>
            Banner Management
          </h2>

          <section className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <form className="w-full" onSubmit={submit}>
              <div className="space-y-6">
                <div className="relative w-full">
                  <label className="text-gray-700 text-lg font-medium mb-2 block">
                    Banner Images
                  </label>
                  <div className="border border-gray-300 hover:border-[#F38529] transition-colors rounded-lg p-3 w-full bg-white flex justify-start items-center">
                    <input
                      className="outline-none bg-transparent w-full text-gray-700"
                      type="text"
                      placeholder="Enter image URL"
                      value={singleImg}
                      onChange={(text) => {
                        setSingleImg(text.target.value);
                      }}
                    />
                    <div
                      className="ml-2 cursor-pointer bg-gray-100 hover:bg-gray-200 p-2 rounded-md transition-colors"
                      onClick={() => {
                        f.current.click();
                      }}
                    >
                      <MdOutlineFileUpload className="text-gray-700 h-6 w-6" />
                    </div>
                    <input
                      type="file"
                      ref={f}
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>
                  {submitted && carouselImg.carousel_image === "" && (
                    <p className="text-red-600 mt-1 text-sm">
                      Banner image is required
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-end gap-4">
                  <p className="text-gray-800 text-[14px] md:text-[16px]">
                    {" "}
                    Please upload the banner in width:Height - 1.1 Aspect
                    ratio . This ensures it looks great on both mobile and
                    website views. like if Height 400px then width 400px
                  </p>
                  <button
                    type="button"
                    className="text-white bg-[#F38529] hover:bg-[#e47a1f] transition-colors rounded-lg text-md py-2.5 px-6 font-medium shadow-sm"
                    onClick={() => {
                      if (singleImg === "") {
                        props.toaster({
                          type: "error",
                          message: "Banner Images is required",
                        });
                        return;
                      }
                      setCarouselImg([...carouselImg, { image: singleImg }]);
                      setSingleImg("");
                      setInputValue("");
                    }}
                  >
                    Add Image
                  </button>
                </div>

                <div className="flex flex-wrap gap-4 mt-4">
                  {carouselImg?.map((item, i) => (
                    <div key={i} className="relative group">
                      <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                        <img
                          className="max-w-full max-h-full object-contain"
                          src={item.image}
                          alt="Banner preview"
                        />
                      </div>
                      <button
                        type="button"
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-90 hover:opacity-100 transition-opacity"
                        onClick={() => {
                          closeIcon(item);
                        }}
                      >
                        <IoCloseCircleOutline className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Submit Button */}
                <div className="mt-6">
                  <button
                    type="submit"
                    className="text-white bg-[#F38529] hover:bg-[#e47a1f] transition-colors rounded-lg text-md font-medium py-2.5 px-6 shadow-sm"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </form>
          </section>
        </div>

        <div className="mb-8">
          <h2 className="text-gray-800 font-bold md:text-3xl text-2xl mb-4 flex items-center">
            <span className="w-1 h-8 bg-[#F38529] rounded mr-3"></span>
            Shipping Cost
          </h2>

          <section className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="w-full">
              <div className="space-y-6">
                <div className="md:flex md:gap-1">
                  <div className="w-full">
                    <label className="text-gray-700 text-lg font-medium mb-2 block">
                      Shipping Cost for Local Delivery
                    </label>
                    <div className="border border-gray-300 hover:border-[#F38529] transition-colors rounded-lg p-3 w-full bg-white flex justify-start items-center">
                      <input
                        className="outline-none bg-transparent w-full text-gray-700"
                        type="number"
                        placeholder="Enter shipping cost"
                        value={localShippingCost}
                        onChange={(e) => setLocalShippingCost(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="w-full">
                    <label className="text-gray-700 text-lg font-medium mb-2 block">
                      Minimum Value for Local Cost
                    </label>
                    <div className="border border-gray-300 hover:border-[#F38529] transition-colors rounded-lg p-3 w-full bg-white flex justify-start items-center">
                      <input
                        className="outline-none bg-transparent w-full text-gray-700"
                        type="number"
                        placeholder="Enter shipping cost"
                        value={minlocalShippingCost}
                        onChange={(e) =>
                          setMinLocalShippingCost(e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="md:flex md:gap-1">
                  <div className="w-full">
                    <label className="text-gray-700 text-lg font-medium mb-2 block">
                      Shipping Cost for Shipment
                    </label>
                    <div className="border border-gray-300 hover:border-[#F38529] transition-colors rounded-lg p-3 w-full bg-white flex justify-start items-center">
                      <input
                        className="outline-none bg-transparent w-full text-gray-700"
                        type="number"
                        placeholder="Enter shipping cost"
                        value={shipmentCost}
                        onChange={(e) => setShipmentCost(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="w-full">
                    <label className="text-gray-700 text-lg font-medium mb-2 block">
                      Minimum Value for Shipment Cost
                    </label>
                    <div className="border border-gray-300 hover:border-[#F38529] transition-colors rounded-lg p-3 w-full bg-white flex justify-start items-center">
                      <input
                        className="outline-none bg-transparent w-full text-gray-700"
                        type="number"
                        placeholder="Enter minimum value for shipment cost"
                        value={minshipmentCost}
                        onChange={(e) => setMinShipmentCost(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="md:flex md:gap-1">
                  <div className="w-full">
                    <label className="text-gray-700 text-lg font-medium mb-2 block">
                      Service Fee
                    </label>
                    <div className="border border-gray-300 hover:border-[#F38529] transition-colors rounded-lg p-3 w-full bg-white flex justify-start items-center">
                      <input
                        className="outline-none bg-transparent w-full text-gray-700"
                        type="number"
                        placeholder="Enter Service Fee"
                        value={serviesCost}
                        onChange={(e) => setServiesCost(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="w-full">
                    <label className="text-gray-700 text-lg font-medium mb-2 block">
                      Minimum Value for Service Fee
                    </label>
                    <div className="border border-gray-300 hover:border-[#F38529] transition-colors rounded-lg p-3 w-full bg-white flex justify-start items-center">
                      <input
                        className="outline-none bg-transparent w-full text-gray-700"
                        type="number"
                        placeholder="Enter minimum value for Servies Fee"
                        value={minServiesCost}
                        onChange={(e) => setMinServiesCost(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="w-full">
                  <label className="text-gray-700 text-lg font-medium mb-2 block">
                    Shipping Cost Message
                  </label>
                  <div className="border border-gray-300 hover:border-[#F38529] transition-colors rounded-lg p-3 w-full bg-white flex justify-start items-center">
                    <input
                      className="outline-none bg-transparent w-full text-gray-700"
                      type="text"
                      placeholder="Enter Shipping cost message"
                      value={shipmentCostMessage}
                      onChange={(e) => setShipmentCostMessage(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 flex-wrap">
                  <div className="bg-gray-50 p-4 rounded-lg md:flex md:gap-5">
                    <div>
                      <p className="text-gray-500 text-sm w-52">
                        Current Shipping Cost for Local Delivery
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-gray-800 text-xl font-semibold">
                          ${currentLocalCost}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-gray-500 text-sm w-52">
                        Current Minimum Value for Local Cost
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-gray-800 text-xl font-semibold">
                          ${mincurrentLocalCost}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="text-[#F38529] hover:text-[#e47a1f] font-medium text-sm flex items-center cursor-pointer"
                      onClick={() => {
                        setIsEditingLocal(true);
                        setLocalShippingCost(currentLocalCost.toString());
                        setMinLocalShippingCost(mincurrentLocalCost.toString());
                      }}
                    >
                      <span className="mr-2 text-xl">Edit</span>
                      <LiaEdit className="text-[#F38529] text-2xl mb-1" />
                    </button>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg md:flex md:gap-5">
                    <div>
                      <p className="text-gray-500 text-sm w-52">
                        Current Shipping Cost for Shipment
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-gray-800 text-xl font-semibold">
                          ${currentShipmentCost}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm w-52">
                        Current Minimum Value for Shipping Cost
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-gray-800 text-xl font-semibold">
                          ${mincurrentShipmentCost}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-[#F38529] hover:text-[#e47a1f] font-medium text-sm flex items-center cursor-pointer"
                      onClick={() => {
                        setIsEditingShipment(true);
                        setShipmentCost(currentShipmentCost.toString());
                        setMinShipmentCost(mincurrentShipmentCost.toString());
                      }}
                    >
                      <span className="mr-2 text-xl">Edit</span>
                      <LiaEdit className="text-[#F38529] text-2xl mb-1" />
                    </button>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg md:flex md:gap-5">
                    <div>
                      <p className="text-gray-500 text-sm w-52">
                        Current Service Fee
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-gray-800 text-xl font-semibold">
                          ${currentServicesCost}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm w-52">
                        Current Minimum Value for Service Fee
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-gray-800 text-xl font-semibold">
                          ${currentMinServicesCost}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="text-[#F38529] hover:text-[#e47a1f] font-medium text-sm flex items-center cursor-pointer"
                      onClick={() => {
                        setIsServices(true);
                        setServiesCost(currentServicesCost.toString());
                        setMinServiesCost(currentMinServicesCost.toString());
                      }}
                    >
                      <span className="mr-2 text-xl">Edit</span>
                      <LiaEdit className="text-[#F38529] text-2xl mb-1" />
                    </button>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-500 text-sm">
                      Current Shipping Cost Message
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-gray-800 text-lg font-semibold">
                        {currentShipmentCostMessage || "No message set"}
                      </p>
                      <button
                        type="button"
                        className="text-[#F38529] hover:text-[#e47a1f] font-medium text-sm flex items-center cursor-pointer"
                        onClick={() => {
                          setIsEditingMessage(true);
                          setShipmentCostMessage(
                            currentShipmentCostMessage || ""
                          );
                        }}
                      >
                        <span className="mr-2 text-xl">Edit</span>
                        <LiaEdit className="text-[#F38529] text-2xl mb-1" />
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="text-white bg-[#F38529] hover:bg-[#e47a1f] transition-colors rounded-lg text-md font-medium py-2.5 px-6 shadow-sm"
                  >
                    {shippingCostsExist ? "Update " : "Add "}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mb-8">
          <h2 className="text-gray-800 font-bold md:text-3xl text-2xl mb-4 flex items-center">
            <span className="w-1 h-8 bg-[#F38529] rounded mr-3"></span>
            Zipcode Manager
          </h2>

          <section className="p-6 bg-white rounded-lg shadow-sm border border-gray-100">
            <form className="w-full" onSubmit={handleSubmit2}>
              <div className="space-y-6">
                <div className="w-full">
                  <label className="text-gray-700 text-lg font-medium mb-2 block">
                    Zipcode
                  </label>
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="border border-gray-300 hover:border-[#F38529] transition-colors rounded-lg p-3 w-full bg-white flex justify-start items-center">
                      <input
                        className="outline-none bg-transparent w-full text-gray-700"
                        type="text"
                        value={pincodeInput}
                        onChange={(e) => setPincodeInput(e.target.value)}
                        placeholder="Enter zipcode"
                      />
                    </div>

                    <button
                      type="submit"
                      className="text-white bg-[#F38529] hover:bg-[#e47a1f] transition-colors rounded-lg text-md font-medium py-2.5 px-6 shadow-sm whitespace-nowrap"
                    >
                      Add Zipcode
                    </button>
                  </div>
                  <p className="text-[14px] text-gray-500 mt-2">
                    * You can add multiple ZIP codes separated by commas. (e.g.
                    77036, 77031, 77072). Duplicate ZIP codes will not be added{" "}
                  </p>
                </div>

                {/* Zipcode Table */}
                <div className="mt-6">
                  <h3 className="text-gray-700 text-lg font-medium mb-4">
                    Available Zip Codes For Delivery
                  </h3>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-[13px] font-medium text-gray-500 uppercase tracking-wider">
                            Zipcode
                          </th>
                          <th className="px-6 py-3 text-right text-[13px] font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pincodes.length > 0 ? (
                          pincodes.map((pincode) => (
                            <tr key={pincode._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-lg text-gray-700">
                                {pincode.pincode}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                <button
                                  onClick={() => handleDelete(pincode._id)}
                                  className="text-[#F38529] hover:text-[#F38529] font-medium flex items-center justify-end gap-1 ml-auto cursor-pointer"
                                  type="button"
                                >
                                  <span className="text-[17px] mr-3">
                                    Delete
                                  </span>
                                  <MdDelete className=" text-2xl" />
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan="2"
                              className="px-6 py-4 text-center text-[13px] text-gray-500"
                            >
                              No zipcodes found. Add one above.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </form>
          </section>
        </div>
      </section>
    </>
  );
}

export default isAuth(Settings);
