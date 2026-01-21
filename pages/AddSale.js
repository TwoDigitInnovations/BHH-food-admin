import React, { useState, useContext, useEffect } from "react";
import Select from "react-select";
import {
  ShoppingBag,
  Calendar,
  DollarSign,
  Plus,
  Trash2,
  Clock,
} from "lucide-react";
import isAuth from "@/components/isAuth";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import { userContext } from "./_app";

function AddSale(props) {
  const router = useRouter();
  const [user, setUser] = useContext(userContext);
  const [productsList, setProductsList] = useState([]);
  const [saleItems, setSaleItems] = useState([]);

  useEffect(() => {
    if (user?._id) {
      getProduct();
    }
  }, [user]);

  const getProduct = async () => {
    props.loader(true);

    Api("get", "getProduct", router).then(
      (res) => {
        props.loader(false);
        if (res?.data) {
          const verifiedProducts = res.data.filter(
            (product) => product?.status === "verified"
          );
          setProductsList(verifiedProducts);
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };


  const availableProducts = productsList;

  const productOptions = availableProducts.map((product) => ({
    value: product._id,
    label: `${product.name} - ${product.categoryName}`,
    product: product
  }));

  const addSaleItem = () => {
    setSaleItems([
      ...saleItems,
      {
        product: "",
        priceSlot: null,
        startDateTime: "",
        endDateTime: "",
        price: "",
        productDetails: null,
      },
    ]);
  };

  const removeSaleItem = (index) => {
    setSaleItems(saleItems.filter((_, i) => i !== index));
  };

  const updateSaleItem = (index, field, value) => {
    const updatedItems = [...saleItems];

    if (field === "product") {
      const selectedProduct = productsList.find((p) => p._id === value);
      updatedItems[index].product = value;
      updatedItems[index].productDetails = selectedProduct;
      updatedItems[index].priceSlot = null;
      updatedItems[index].price = "";
    } else if (field === "priceSlot") {
      updatedItems[index].priceSlot = value;

    } else {
      updatedItems[index][field] = value;
    }

    setSaleItems(updatedItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const invalidItems = saleItems.filter(
      (item) =>
        !item.product ||
        !item.priceSlot ||
        !item.startDateTime ||
        !item.endDateTime ||
        !item.price
    );

    if (invalidItems.length > 0) {
      props.toaster({
        type: "error",
        message: "Please fill all fields for each sale item",
      });
      return;
    }

    props.loader(true);

    try {
      const createPromises = saleItems.map((item) => {
        const formattedData = {
          startDateTime: new Date(item.startDateTime).toISOString(),
          endDateTime: new Date(item.endDateTime).toISOString(),
          price: parseFloat(item.price),
          products: [item.product],
          price_slot: item.priceSlot // Send the complete slot object
        };

        return Api("post", "createSale", formattedData, router);
      });

      await Promise.all(createPromises);

      props.loader(false);
      props.toaster({ type: "success", message: "Sales added successfully!" });
      setSaleItems([]);
      router.push("/SaleProduct");
    } catch (error) {
      props.loader(false);
      console.error(error);
      props.toaster({
        type: "error",
        message: error?.message || "An error occurred",
      });
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white p-6 rounded-lg h-full shadow-lg max-w-4xl mx-auto py-8 md:my-12 my-4 overflow-y-scroll scrollbar-hide overflow-scroll pb-44 border border-gray-100">

      <div className="mb-6 border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <span className="w-1 h-6 bg-[#F38529] rounded mr-3"></span>
          Create Flash Sales
        </h2>
        <p className="text-gray-500 text-[13px] mt-1">
          Add flash sales with individual pricing and timing for each product
        </p>
      </div>

      <form onSubmit={handleSubmit}>

        <div className="mb-6">
          <button
            type="button"
            onClick={addSaleItem}
            className="bg-[#F38529] text-white py-2 px-4 rounded-lg hover:bg-[#e07016] transition-colors font-medium flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Sale Item
          </button>
        </div>


        {saleItems.map((item, index) => (
          <div
            key={index}
            className="mb-8 p-6 border border-gray-200 rounded-lg bg-white relative"
          >

            <button
              type="button"
              onClick={() => removeSaleItem(index)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Clock className="h-5 w-5 mr-2 text-[#F38529]" />
              Sale Item #{index + 1}
            </h3>


            <div className="mb-4">
              <label className="block font-medium text-gray-700 mb-2 flex items-center">
                <ShoppingBag className="h-5 w-5 mr-2 text-[#F38529]" />
                Select Product
              </label>
              <Select
                options={productOptions}
                value={
                  productOptions.find((opt) => opt.value === item.product) ||
                  null
                }
                onChange={(selectedOption) =>
                  updateSaleItem(index, "product", selectedOption?.value || "")
                }
                className="text-gray-700"
                classNamePrefix="select"
                placeholder="Select a product..."
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: "#e5e7eb",
                    boxShadow: "none",
                    "&:hover": {
                      borderColor: "#F38529",
                    },
                    padding: "2px",
                    borderRadius: "0.5rem",
                  }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? "#F38529"
                      : state.isFocused
                        ? "rgba(243, 133, 41, 0.1)"
                        : null,
                    ":active": {
                      backgroundColor: "#F38529",
                    },
                  }),
                }}
              />
            </div>

            {/* Show selected product details and price slot selection */}
            {item.productDetails && (
              <div className="mb-4">
                <div className="p-3 bg-gray-50 rounded-lg mb-3">
                  <p className="text-sm text-gray-600">
                    <strong>Product:</strong> {item.productDetails.name} |
                    <strong> Category:</strong> {item.productDetails.categoryName}
                  </p>
                </div>

                {/* Price Slot Selection */}
                <label className="block font-medium text-gray-700 mb-2">
                  Select Price Slot
                </label>
                <select
                  value={item.priceSlot ? JSON.stringify(item.priceSlot) : ""}
                  onChange={(e) => {
                    const selectedValue = e.target.value;

                    if (!selectedValue) {
                      updateSaleItem(index, "priceSlot", null);
                      return;
                    }

                    const selectedSlot = JSON.parse(selectedValue);
                    console.log("selectedSlot", selectedSlot);

                    updateSaleItem(index, "priceSlot", selectedSlot);
                  }}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F38529]/20 focus:border-[#F38529] transition-colors"
                >
                  <option value="">Select a price slot</option>
                  {item.productDetails.price_slot?.map((slot, i) => (
                    <option key={i} value={JSON.stringify(slot)}>
                      {slot.unit} - ${slot.our_price}
                    </option>
                  ))}
                </select>

              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Start Date & Time */}
              <div>
                <label className="block font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-[#F38529]" />
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={item.startDateTime}
                  onChange={(e) =>
                    updateSaleItem(index, "startDateTime", e.target.value)
                  }
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F38529]/20 focus:border-[#F38529] transition-colors"
                />
              </div>

              {/* End Date & Time */}
              <div>
                <label className="block font-medium text-gray-700 mb-2 flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-[#F38529]" />
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={item.endDateTime}
                  min={item.startDateTime}
                  onChange={(e) => {
                    const newEnd = e.target.value;
                    if (newEnd < item.startDateTime) {
                      props.toaster?.({
                        type: "error",
                        message: "End time must be after start time.",
                      });
                      return;
                    }
                    updateSaleItem(index, "endDateTime", newEnd);
                  }}
                  className="block w-full border border-gray-300 rounded-lg shadow-sm p-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F38529]/20 focus:border-[#F38529] transition-colors"
                />
              </div>
            </div>

            {/* Sale Price */}
            <div className="mb-4">
              <label className="block font-medium text-gray-700 mb-2 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-[#F38529]" />
                Sale Price
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    updateSaleItem(index, "price", e.target.value)
                  }
                  placeholder="0.00"
                  step="0.01"
                  className="block w-full border border-gray-300 rounded-lg shadow-sm py-3 pl-8 pr-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#F38529]/20 focus:border-[#F38529] transition-colors"
                />
              </div>
            </div>
          </div>
        ))}


        {saleItems.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>
              No sale items added yet. Click "Add Sale Item" to get started.
            </p>
          </div>
        )}


        {saleItems.length > 0 && (
          <div className="relative">
            <button
              type="submit"
              className="w-full bg-[#F38529] text-white py-3 px-4 rounded-lg hover:bg-[#e07016] transition-colors font-medium flex items-center justify-center"
            >
              <span>Create Flash Sales ({saleItems.length} items)</span>
              <Plus className="h-5 w-5 ml-2" />
            </button>


            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#F38529] opacity-50 rounded-full"></div>
          </div>
        )}


        <div className="mt-8 pt-4 border-t border-gray-200 text-center">
          <p className="text-[13px] text-gray-500">
            Each product will have its own flash sale with individual pricing
            and timing
          </p>
        </div>
      </form>
    </div>
  );
}

export default isAuth(AddSale);