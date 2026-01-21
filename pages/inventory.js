import React, { useMemo, useState, useEffect, useContext } from "react";
import Table from "@/components/table";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { Api, FileDownloadApi } from "@/services/service";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import { userContext } from "./_app";
import isAuth from "@/components/isAuth";
import { FaEye } from "react-icons/fa";
import { RxCrossCircled } from "react-icons/rx";
import { Download, Flag } from "lucide-react";

function Inventory(props) {
  const router = useRouter();
  const [productsList, setProductsList] = useState([]);
  const [user, setUser] = useContext(userContext);
  const [open, setOpen] = useState("");
  const [selectedNewSeller, setSelectedNewSeller] = useState([]);
  const [popupData, setPopupData] = useState({});
  const [viewPopup, setviewPopup] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [position, setPosition] = useState(null);

  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 4,
  });

  useEffect(() => {
    const savedPage = localStorage.getItem("currentPage");
    if (savedPage) {
      setCurrentPage(Number(savedPage));
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (user?._id) {
        getProduct(currentPage, 30, searchTerm); // ✅ limit directly pass karo
      }
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [user, currentPage, searchTerm]);

  const getProduct = async (page = 1, limit = 30, search) => {
    props.loader(true);

    let url = `getProduct?page=${page}&limit=${limit}`;

    if (search && search.trim() !== "") {
      url += `&search=${encodeURIComponent(search)}`;
    }

    Api("get", url, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res.data);

        setProductsList(res.data);

        const selectednewIds = res.data.map((f) => {
          if (f.sponsered && f._id) return f._id;
        });
        setSelectedNewSeller(selectednewIds);
        setPagination(res?.pagination);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    localStorage.setItem("currentPage", page); // localStorage में save करो
  };

  const deleteProduct = (_id) => {
    Swal.fire({
      text: "Are you sure? You want to delete this Product?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#F38529",
      confirmButtonColor: "#F38529",
      confirmButtonText: "Delete",
      width: "360px",
    }).then(function (result) {
      if (result.isConfirmed) {
        const data = {
          _id,
        };

        Api("post", `deleteProduct/${_id}`, data, router).then(
          (res) => {
            console.log("res================>", res.data?.meaasge);
            props.loader(false);

            if (res?.status) {
              getProduct();
              props.toaster({ type: "success", message: res.data?.meaasge });
            } else {
              console.log(res?.data?.message);
              props.toaster({ type: "error", message: res?.data?.meaasge });
            }
          },
          (err) => {
            props.loader(false);
            console.log(err);
            props.toaster({ type: "error", message: err?.data?.meaasge });
            props.toaster({ type: "error", message: err?.meaasge });
          }
        );
      } else if (result.isDenied) {
      }
    });
  };

  const handleSubmit = (id) => {
    const data = {
      productId: id,
      position: position,
    };

    Api("post", `SetProductPosition`, data, router).then(
      (res) => {
        props.loader(false);
        if (res?.status) {
          getProduct();
          setOpen(false);
          props.toaster({ type: "success", message: res?.message });
        } else {
          console.log("res.data", res?.data?.message);
          props.toaster({
            type: "error",
            message: res?.message,
          });
          setPosition("")
        }
      },
      (err) => {
        props.loader(false);
        setOpen(false);
        console.log(err.message);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const image = ({ value, row }) => {
    return (
      <div className="flex items-center justify-center">
        {row.original &&
          row.original.varients &&
          row.original.varients.length > 0 && (
            <img
              className="md:h-[86px] md:w-[86px] w-28 h-20 rounded-[10px] object-cover"
              src={row.original.varients[0].image[0]}
            />
          )}
      </div>
    );
  };

  const DownloadExcelFile = async () => {
    try {
      props.loader(true);
      const blob = await FileDownloadApi("get", "downloadProductsExcel");
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "products.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      props.toaster("Product Details Excel File Downloaded");
      props.loader(false);
    } catch (error) {
      console.error(error);
      alert("Failed to download Excel file");
    }
  };

  const productName = ({ value }) => {
    return (
      <div className="p-2 flex flex-col items-center justify-center">
        <p className="text-black text-base font-normal ">
          {value?.slice(0, 25) + "..."}
        </p>
      </div>
    );
  };

  const category = ({ row, value }) => {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <p className="text-black text-base font-normal">{value}</p>
      </div>
    );
  };

  const price = ({ value, row }) => {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <p className="text-black text-base font-normal">
          ${row?.original?.price_slot[0]?.our_price}
        </p>
      </div>
    );
  };

  const Quantity = ({ value, row }) => {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <p className="text-black text-base font-normal">
          {row?.original?.Quantity}
        </p>
      </div>
    );
  };

  const Soldpieces = ({ value }) => {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <p className="text-black text-base font-normal">{value}</p>
      </div>
    );
  };

  const Position = ({ value, row }) => {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        {value ? (
          <>
            <p className="text-black text-base font-normal mb-2">
              {value}
            </p>

            <button
              className="px-3 py-2 rounded-md cursor-pointer text-base font-normal bg-[#F38529] text-white"
              onClick={() => {
                setOpen(true);
                setPopupData(row.original);
                setPosition(row.original?.position)
              }}
            >
              Update Position
            </button>
          </>
        ) : (

          <p
            className="px-3 py-2 rounded-md cursor-pointer text-base font-normal bg-[#F38529] text-white"
            onClick={() => {
              setOpen(true);
              setPopupData(row.original);
            }}
          >
            Set Position
          </p>
        )}
      </div>
    );
  };


  const actionHandler2 = ({ value, row }) => {
    return (
      <div className="bg-custom-offWhiteColor flex items-center  justify-evenly  border border-custom-offWhite rounded-[10px] mr-[10px]">
        <div
          className="py-[10px] w-[50%] px-4 items-center flex justify-center cursor-pointer"
          onClick={() => {
            router.push(`add-product?id=${row.original._id}`);
          }}
        >
          <FiEdit className="text-[22px]  " />
        </div>
        <div className="py-[10px] border-l-[1px] px-4 border-custom-offWhite w-[50%] items-center flex justify-center">
          <RiDeleteBinLine
            className="text-[red] text-[24px] cursor-pointer"
            onClick={() => deleteProduct(row.original._id)}
          />
        </div>
        <div className="py-[10px] border-l-[1px] px-4 border-black w-[50%] items-center flex justify-center">
          <FaEye
            className={`text-[24px] cursor-pointer ${row.original.status === "suspended"
              ? "text-red-500"
              : "text-black"
              }`}
            onClick={() => {
              setPopupData(row.original);
              setviewPopup(true);
            }}
          />
        </div>
      </div>
    );
  };



  const columns1 = useMemo(
    () => [
      {
        Header: "Image",
        accessor: "username",
        Cell: image,
      },
      {
        Header: "Product Name",
        accessor: "name",
        Cell: productName,
      },
      {
        Header: "Category",
        accessor: "categoryName",
        Cell: category,
      },
      {
        Header: "Price",
        accessor: "price",
        Cell: price,
      },
      {
        Header: "Quantity",
        accessor: "Quantity",
        Cell: Quantity,
      },
      {
        Header: "Sold Pieces",
        accessor: "sold_pieces",
        Cell: Soldpieces,
      },
      {
        Header: "Position",
        accessor: "position",
        Cell: Position,
      },

      {
        Header: "ACTION",
        Cell: actionHandler2,
      },
    ],
    [selectedNewSeller]
  );

  const suspendProduct = async (productId) => {
    try {
      props.loader(true);

      Api("post", `toggleProductStatus/${productId}`, null, router).then(
        (res) => {
          console.log("res================>", res.data);
          props.loader(false);

          if (res?.status) {
            props.toaster({
              type: "success",
              message: res?.data?.message,
            });
            setviewPopup(false);
            getProduct();
          } else {
            console.log(res?.data?.message);
            props.toaster({ type: "error", message: res?.data?.message });
          }
        }
      );
    } catch (error) {
      props.loader(false);
      console.error("Error suspending product:", error);
      props.toaster({
        type: "error",
        message: "An error occurred while suspending the product.",
      });
    }
  };

  return (
    <div className=" w-full h-full bg-transparent md:pt-5 pt-5 pb-5 pl-5 pr-5">
      {viewPopup && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/30 flex justify-center items-center z-50">
          <div className="relative w-[300px] md:w-[360px] h-auto  bg-white rounded-[15px] m-auto">
            <div
              className="absolute top-2 right-2 p-1 rounded-full  text-black w-8 h-8 cursor-pointer"
              onClick={() => setviewPopup(!viewPopup)}
            >
              <RxCrossCircled className="h-full w-full font-semibold " />
            </div>

            <div className="px-5 py-10">
              <div className=" w-full flex gap-2 pb-5">
                <img
                  src={popupData?.varients[0].image[0]}
                  className="h-[76px] w-[76px] rounded-[10px]"
                />
                <div className="col-span-2 w-full flex flex-col justify-start items-start">
                  <p className="text-base font-bold text-black">
                    {popupData?.name}
                  </p>
                </div>
              </div>

              <div className="flex flex-row justify-start items-start pt-5 gap-5">
                <button
                  className={`text-white text-lg font-bold w-full h-[50px] rounded-[12px] ${popupData?.status === "verified"
                    ? "bg-[#F38529]"
                    : "bg-green-600"
                    }`}
                  onClick={() => suspendProduct(popupData?._id)}
                >
                  {popupData?.status === "verified" ? "Suspend" : "Verify"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="h-full">
        <div className="flex justify-between items-center">
          <p className="text-black flex items-center font-bold md:text-[32px] text-2xl md:ms-5 ms-0">
            <span
              className={`inline-block w-2 h-8 bg-[#F38529]  mr-3 rounded `}
            ></span>
            Inventory
          </p>
          <button
            className="text-white text-md font-semibold bg-[#F38529] cursor-pointer px-4 rounded-md py-2"
            onClick={DownloadExcelFile}
          >
            {" "}
            Download Excel File
          </button>
        </div>

        <div className="bg-white pt-5 md:pb-32 rounded-[12px] h-full overflow-y-scroll  scrollbar-hide overflow-scroll pb-28 md:mt-5 mt-5">
          <div className="">
            <div className="flex md:flex-row flex-col md:justify-between md:items-end gap-3">
              <input
                className="bg-gray-100 text-black border border-gray-100 outline-none h-[40px] md:w-[435px] w-full px-5 rounded-[10px] text-custom-darkBlack font-normal text-base"
                type="text"
                placeholder="Search Products"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />

              <button
                className="text-white bg-[#F38529] px-5 py-2.5 rounded cursor-pointer"
                onClick={() => router.push("/add-product")}
              >
                Add Product
              </button>
            </div>

            <Table
              columns={columns1}
              data={productsList}
              pagination={pagination}
              onPageChange={handlePageChange}
              currentPage={currentPage}
              itemsPerPage={pagination.itemsPerPage}
            />
          </div>

          {open && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white w-full max-w-md p-6 rounded-xl shadow-2xl">
                {/* Header */}
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Set Product Position for Home Page Display
                  </h3>

                  <button
                    onClick={() => {
                      setOpen(false);
                      setPopupData(null);
                      setPosition("")
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors text-2xl leading-none"
                  >
                    ✕
                  </button>
                </div>

                {/* Image */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <img
                    src={popupData.varients[0].image[0]}
                    alt={popupData.name}
                    className="w-full h-48 object-contain"
                  />
                </div>

                {/* Name */}
                <p className="text-lg font-medium text-gray-800 mb-4">
                  {popupData.name}
                </p>

                {/* Position Input */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position Number
                  </label>
                  <input
                    type="number"
                    value={position ?? ""}
                    onChange={(e) =>
                      setPosition(
                        e.target.value === "" ? null : Number(e.target.value)
                      )
                    }
                    className="w-full border border-gray-300 text-gray-800 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-[#F38529] focus:border-transparent"
                    placeholder="Enter position number"
                    min="1"
                  />
                </div>

                {/* Submit Button */}
                <button
                  onClick={() => handleSubmit(popupData._id)}
                  className="w-full bg-[#F38529] text-white py-3 rounded-lg font-medium hover:bg-[#E67419] transition-colors shadow-md"
                >
                  Save Position
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default isAuth(Inventory);
