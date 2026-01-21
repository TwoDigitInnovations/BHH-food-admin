import React, { useContext, useRef, useState, useEffect } from "react";
import { MultiSelect } from "react-multi-select-component";
import { IoAddSharp, IoCloseCircleOutline } from "react-icons/io5";
import { IoIosClose } from "react-icons/io";
import { userContext } from "./_app";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";
import { Api, ApiFormData } from "@/services/service";
import { useRouter } from "next/router";
import { produce } from "immer";
import isAuth from "@/components/isAuth";
import Compressor from "compressorjs";
import dynamic from "next/dynamic";
import Barcode from "react-barcode";

import * as XLSX from "xlsx";

const size = [
  {
    label: "XXS",
    value: "XXS",
    total: 0,
    sell: 0,
  },
  {
    label: "XS",
    value: "XS",
    total: 0,
    sell: 0,
  },
  {
    label: "S",
    value: "S",
    total: 0,
    sell: 0,
  },
  {
    label: "M",
    value: "M",
    total: 0,
    sell: 0,
  },
  {
    label: "L",
    value: "L",
    total: 0,
    sell: 0,
  },
  {
    label: "XL",
    value: "XL",
    total: 0,
    sell: 0,
  },
  {
    label: "XXL",
    value: "XXL",
    total: 0,
    sell: 0,
  },
  {
    label: "3xl",
    value: "3xl",
    total: 0,
    sell: 0,
  },
  {
    label: "4xl",
    value: "4xl",
    total: 0,
    sell: 0,
  },
  {
    label: "5xl",
    value: "5xl",
    total: 0,
    sell: 0,
  },
  {
    label: "For adult",
    value: "For adult",
    total: 0,
    sell: 0,
  },
];

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

function AddProduct(props) {
  const router = useRouter();
  const f = useRef(null);

  const unitData = [
    { name: "Lb", value: "lb" },
    { name: "Litre", value: "litre" },
    { name: "Each", value: "each" },
    { name: "Piece", value: "piece" },
    { name: "Pack", value: "pack" },
    { name: "Case", value: "case" },
    { name: "Bag", value: "bag" },
  ];

  //   const handleChange = (e) => {
  //   const value = e.target.value;
  //   const array = value
  //     .split(/,|\n/)      // split by comma or newline
  //     .map((item) => item.trim())
  //     .filter((item) => item !== "");
  //   setAddProductsData({
  //     ...addProductsData,
  //     relatedName: array,
  //   });
  // };

  const [addProductsData, setAddProductsData] = useState({
    name: "",
    vietnamiesName: "",
    slug: "",
    category: [],
    relatedName: [],
    disclaimer: "",
    origin: "",
    ReturnPolicy: "",
    metadescription: "",
    metatitle: "",
    imageAltName: "",
    Warning: "",
    Quantity: "",
    Allergens: "",
    unit: "",
    other_price: "",
    our_price: "",
    selflife: "",
    expirydate: "",
    manufacturername: "",
    manufactureradd: "",
    short_description: "",
    tax_code: "",
    long_description: "",
    price_slot: [
      {
        value: 0,
        price: 0,
      },
    ],
    isShipmentAvailable: "",
    isNextDayDeliveryAvailable: "",
    isInStoreAvailable: "",
    isReturnAvailable: "",
    isCurbSidePickupAvailable: "",
  });

  const [categoryData, setCategoryData] = useState([]);
  const [user, setUser] = useContext(userContext);
  const [relatedNames, setRelatedNames] = useState(""); // store as string

  const handleChange = (e) => {
    setRelatedNames(e.target.value);
  };

  const [varients, setvarients] = useState([
    {
      color: "",
      image: [],
      BarCode: "",
      selected: [],
    },
  ]);

  const [singleImg, setSingleImg] = useState("");
  const [uploadedData, setUploadedData] = useState([]);
  const [file, setFile] = useState(null);

  useEffect(() => {
    getCategory();
  }, []);

  useEffect(() => {
    if (router?.query?.id) {
      getProductById();
    }
  }, []);


  console.log("dfghjkl", addProductsData)

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0]; // Format as YYYY-MM-DD
  };

  const getProductById = async (id) => {
    props.loader(true);
    Api("get", `getProductById/${router?.query?.id}`, "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        if (res?.status) {
          setAddProductsData({
            name: res?.data?.name,
            slug: res?.data?.slug,
            vietnamiesName: res?.data?.vietnamiesName,
            disclaimer: res?.data?.disclaimer,
            metatitle: res?.data?.metatitle,
            imageAltName: res?.data?.imageAltName,
            metadescription: res?.data?.metadescription,
            category: res?.data?.category?._id || "",
            Warning: res?.data?.Warning,
            categoryName: res?.data?.category?.name || "",
            ReturnPolicy: res?.data?.ReturnPolicy,
            short_description: res?.data?.short_description,
            long_description: res?.data?.long_description,
            Allergens: res?.data?.Allergens,
            Quantity: res?.data?.Quantity,
            price_slot: res?.data?.price_slot,
            ...res.data,
            attributes: res?.data?.attributes,
            tax_code: res?.data?.tax_code,
            manufactureradd: res?.data?.manufactureradd,
            manufacturername: res?.data?.manufacturername,
            expirydate: formatDate(res?.data?.expirydate),
            other_price: res?.data?.other_price,
            our_price: res?.data?.our_price,
            unit: res?.data?.price_slot[0]?.unit,
            isShipmentAvailable: res?.data?.isShipmentAvailable,
            isReturnAvailable: res?.data?.isReturnAvailable,
            isNextDayDeliveryAvailable: res?.data?.isNextDayDeliveryAvailable,
            isInStoreAvailable: res?.data?.isInStoreAvailable,
            isCurbSidePickupAvailable: res?.data?.isCurbSidePickupAvailable,
          });
          setRelatedNames(res?.data?.relatedName?.join(", "));
          setvarients(res?.data?.varients);
          setBarcodeValue(res?.data?.BarCode);
          setInputValue(res?.data?.BarCode);
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const getCategory = async () => {
    props.loader(true);
    Api("get", "getCategory", "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        res.data.forEach((element, i) => {
          element.value = element._id;
          element.label = element.name;

          if (res.data.length === i + 1) {
            setCategoryData(res?.data);
            console.log("categorydata ::", res?.data);
          }
        });
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  console.log("rel", relatedNames)

  const createProduct = async (e) => {
    e.preventDefault();

    const array = relatedNames?.split(",")?.map((item) => item.trim()).filter((item) => item !== "");

    const data = {
      ...addProductsData,
      userid: user?._id,
      BarCode: inputValue,
      relatedName: array,
      varients,
    };

    props.loader(true);
    Api("post", "createProduct", data, router).then(
      (res) => {
        props.loader(false);
        console.log("res================> careate Product :: ", res);
        if (res.status) {
          setAddProductsData({
            name: "",
            category: [],
            unit: "",
            our_price: "",
            other_price: "",
            tax_code: "",
            origin: "",
            selflife: "",
            expirydate: "",
            manufacturername: "",
            manufactureradd: "",
            short_description: "",
            long_description: "",
            price_slot: [
              {
                value: 0,
                price: 0,
              },
            ],
          });
          setvarients([
            {
              color: "",
              image: [],
              BarCode: "",
              selected: [],
            },
          ]);
          router.push("/inventory");
          props.toaster({ type: "success", message: res.data?.message });
        } else {
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

  const updateProduct = async (e) => {
    e.preventDefault();

    const array = relatedNames?.split(",")?.map((item) => item.trim()).filter((item) => item !== "");

    const data = {
      ...addProductsData,
      userid: user?._id,
      varients,
      BarCode: inputValue,
      relatedName: array,
      id: router?.query?.id,
    };

    console.log(data);
    console.log(addProductsData);

    props.loader(true);
    Api("post", "updateProduct", data, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        if (res.status) {
          setAddProductsData({
            name: "",
            category: [],
            unit: "",
            our_price: "",
            other_price: "",
            tax_code: "",
            origin: "",
            selflife: "",
            expirydate: "",
            manufacturername: "",
            manufactureradd: "",
            short_description: "",
            // gender: "",
            long_description: "",
            price_slot: [
              {
                value: 0,
                price: 0,
              },
            ],
          });
          setvarients([
            {
              color: "",
              image: [],
              selected: [],
            },
          ]);
          router.push("/inventory");
          props.toaster({ type: "success", message: res.data?.message });
        } else {
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

  const handleImageChange = (event, i) => {
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
          console.log("daat compressResult", compressedResult);
          const data = new FormData();
          data.append("file", compressedResult);
          props.loader(true);
          ApiFormData("post", "user/fileupload", data, router).then(
            (res) => {
              props.loader(false);
              console.log("res================>", res.data.file);
              if (res.status) {
                setvarients(
                  produce((draft) => {
                    draft[i].image.push(res.data.file);
                  })
                );
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
          // compressedResult has the compressed file.
          // Use the compressed file to upload the images to your server.
          //   setCompressedFile(res)
        },
      });
    }
    const reader = new FileReader();
  };

  const closeIcon = (item, inx, imagesArr, i) => {
    const nextState = produce(imagesArr, (draftState) => {
      if (inx !== -1) {
        draftState.splice(inx, 1);
      }
    });
    setvarients(
      produce((draft) => {
        // console.log(draft)
        draft[i].image = nextState;
      })
    );
  };

  const priceSlotsCloseIcon = (item, i) => {
    console.log(item, i);
    let data = addProductsData.price_slot;
    if (i > -1) {
      data.splice(i, 1);
    }
    console.log(data);
    setAddProductsData({ ...addProductsData, price_slot: data });
  };

  const [inputValue, setInputValue] = useState("");
  const [barcodeValue, setBarcodeValue] = useState("");

  const handleGenerate = () => {
    if (inputValue.trim() !== "") {
      setBarcodeValue(inputValue);
    }
  };

  const handleSubmit = (file) => {
    // if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const binaryStr = e.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      let parsedData = XLSX.utils.sheet_to_json(sheet);

      const data = parsedData.map(f => ({
        vietnamiesName: f.Name,
        name: f.Name,
        price_slot: [{
          value: f['Price Slot Values'],
          price: 0,
          unit: f['Unit'],
          our_price: Number(f['Our Price'])
        }]
      }))
      console.log(data);
      // parsedData = parsedData
      //   .map((row) => {
      //     return {
      //       question_number: row['Question number'],
      //       name: row['Question name'].trim(),
      //       category: row.Category.trim() || "",
      //       image: row.Photo.trim() || "",
      //       type: row.Level.trim() || "",
      //       question: row.Question.trim() || "",
      //       option:
      //         [
      //           {
      //             name: 'A',
      //             ans: row['Option-A'].trim()
      //           },
      //           {
      //             name: 'B',
      //             ans: row['Option-B'].trim()
      //           },
      //           {
      //             name: 'C',
      //             ans: row['Option-C'].trim()
      //           },
      //           {
      //             name: 'D',
      //             ans: row['Option-D'].trim()
      //           }
      //         ],

      //       answer: row['Correct Answer'].trim(),

      //     };
      //   })
      //   .filter(Boolean); // Removes null entries

      // setUploadedData(parsedData);
      // setPagination((prev) => ({
      //   ...prev,
      //   totalPages: Math.ceil(parsedData.length / prev.itemsPerPage),
      // }));

      // console.log(parsedData);
    };
    reader.readAsBinaryString(file);
    // } else {
    //   console.error("No file selected");
    // }
  };


  const uploadData = async () => {
    props.loader(true);
    Api("post", "question/createmany", uploadedData, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res.data);
        if (res.status) {
          props.toaster({
            type: "success",
            message: "Item updated successfully",
          });
          setUploadedData([]);
          setFile(null);
          router.push("/quizz-list");
        } else {
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

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      handleSubmit(selectedFile)
    }
  };

  return (
    <section className="w-full h-full  bg-transparent p-5">
      {/* <form className="w-full  relative">
        <div className="relative w-full">
          <div className="border rounded-md p-2 w-full bg-custom-light flex justify-start items-center text-custom-blue font-normal">
            <label htmlFor="file-upload" className="cursor-pointer">
              Upload File:
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileUpload}
              className="ml-2"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={handleSubmit}
          className="mt-4 text-white bg-[var(--custom-blue)] rounded-md py-2 px-4"
        >
          Submit
        </button>
        <button
          type="button"
          onClick={uploadData}
          className="absolute right-2 mt-4 text-white bg-[var(--custom-blue)] rounded-md py-2 px-4"
        >
          Upload Data
        </button>
      </form> */}
      <div className="md:pt-[0px] pt-[0px] h-full overflow-scroll no-scrollbar">
        <p className="text-black font-bold md:text-[32px] text-2xl md:pb-0 pb-5">
          <span
            className={`inline-block w-2 h-8 bg-[#F38529]  mr-3 rounded `}
          ></span>
          Add Product
        </p>

        <form
          className="pb-14"
          onSubmit={router?.query?.id ? updateProduct : createProduct}
        >
          <div className=" md:pb-10 bg-transparent h-full w-full md:mt-5">
            {/* md:mt-9 pt-5*/}
            <div className="md:px-5 pb-5 bg-white h-full w-full boxShadow">
              <div className="grid md:grid-cols-2 grid-cols-1 w-full gap-5">
                <div className="md:pt-0">
                  <p className="text-black text-base font-normal pb-1">
                    Product Name
                  </p>
                  <div className="relative">
                    <input
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-newblack rounded-[10px] outline-none text-black text-base font-light"
                      type="text"
                      placeholder="English Name"
                      value={addProductsData.name}
                      required
                      onChange={(e) => {
                        setAddProductsData({
                          ...addProductsData,
                          name: e.target.value,
                        });
                      }}
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                    />
                  </div>
                </div>
                <div className="pt-0">
                  <p className="text-black text-base font-normal pb-1">
                    Vietnamies Name
                  </p>
                  <div className="relative">
                    <input
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-newblack rounded-[10px] outline-none text-black text-base font-light"
                      type="text"
                      placeholder="Vietnamies Name"
                      value={addProductsData.vietnamiesName}
                      required
                      onChange={(e) => {
                        setAddProductsData({
                          ...addProductsData,
                          vietnamiesName: e.target.value,
                        });
                      }}
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                    />
                  </div>
                </div>

                <div className="">
                  <p className="text-black text-base font-normal pb-1">
                    Category
                  </p>

                  <div className="relative px-3 w-full bg-transparent border border-newblack rounded-[10px]">
                    <select
                      value={addProductsData.category?._id}
                      onChange={(newValue) => {
                        console.log(newValue);

                        const cat = categoryData.find(
                          (f) => f._id === newValue.target.value
                        );
                        setAddProductsData({
                          ...addProductsData,
                          category: newValue.target.value,
                          categoryName: cat.name,
                          attributes: cat.attributes,
                        });
                      }}
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-8 pr-5  outline-none text-black text-base font-light"
                      placeholder="Category"
                    >
                      <option value={""} className="p-5">
                        Category
                      </option>
                      {categoryData?.map((item, i) => (
                        <option key={i} value={item._id} className="p-5">
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                    />
                  </div>
                </div>

                <div className="">
                  <p className="text-black text-base font-normal pb-1">
                    Country of Origin
                  </p>
                  <div className="relative">
                    <input
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-newblack rounded-[10px] outline-none text-black text-base font-light"
                      type="text"
                      placeholder="Country of Origin"
                      value={addProductsData.origin}
                      onChange={(e) => {
                        setAddProductsData({
                          ...addProductsData,
                          origin: e.target.value,
                        });
                      }}
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                    />
                  </div>
                </div>

                <div className="">
                  <p className="text-black text-base font-normal pb-1">Tax Code</p>
                  <div className="relative">
                    <input
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-newblack rounded-[10px] outline-none text-black text-base font-light"
                      type="text"
                      placeholder="Tax code"
                      value={addProductsData.tax_code}
                      onChange={(e) => {
                        const trimmedValue = e.target.value.trimStart();
                        setAddProductsData({
                          ...addProductsData,
                          tax_code: trimmedValue,
                        });
                      }}
                      onBlur={(e) => {
                        setAddProductsData({
                          ...addProductsData,
                          tax_code: e.target.value.trim(),
                        });
                      }}
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                    />
                  </div>
                </div>


                <div className="">
                  <p className="text-black text-base font-normal pb-1">
                    Manufacturer Name
                  </p>
                  <div className="relative">
                    <input
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-newblack rounded-[10px] outline-none text-black text-base font-light"
                      type="text"
                      placeholder="Manufacturer Name"
                      value={addProductsData.manufacturername}
                      onChange={(e) => {
                        setAddProductsData({
                          ...addProductsData,
                          manufacturername: e.target.value,
                        });
                      }}
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                    />
                  </div>
                </div>


                <div className="">
                  <p className="text-black text-base font-normal pb-1">
                    Short Description
                  </p>
                  <div className="relative">
                    <input
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-newblack rounded-[10px] outline-none text-black text-base font-light"
                      type="text"
                      placeholder="Short Description"
                      value={addProductsData.short_description}
                      onChange={(e) => {
                        setAddProductsData({
                          ...addProductsData,
                          short_description: e.target.value,
                        });
                      }}
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                    />
                  </div>
                </div>

                <div className="">
                  <p className="text-black text-base font-normal pb-1">
                    Allergens
                  </p>
                  <div className="relative">
                    <input
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-newblack rounded-[10px] outline-none text-black text-base font-light"
                      type="text"
                      placeholder="Allergens"
                      value={addProductsData.Allergens}
                      onChange={(e) => {
                        setAddProductsData({
                          ...addProductsData,
                          Allergens: e.target.value,
                        });
                      }}
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                    />
                  </div>
                </div>
                <div className="">
                  <p className="text-black text-base font-normal pb-1">
                    Quantity
                  </p>
                  <div className="relative">
                    <input
                      className="bg-transparent w-full md:h-[46px] h-[40px] pl-12 pr-5 border border-newblack rounded-[10px] outline-none text-black text-base font-light"
                      type="number"
                      min={0}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e") e.preventDefault(); // Block negative & exponent
                      }}
                      placeholder="Quantity"
                      value={addProductsData.Quantity}
                      onChange={(e) => {
                        let value = Number(e.target.value);
                        if (isNaN(value) || value < 0) value = 0;
                        setAddProductsData({
                          ...addProductsData,
                          Quantity: value,
                        });
                      }}
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                      alt="icon"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-black text-base font-medium pb-2">
                    Is Shipment Available
                  </p>

                  {/* Enable Checkbox */}
                  <div className="flex items-center space-x-3 mb-2">
                    <input
                      type="checkbox"
                      id="enableShipment"
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-0"
                      checked={addProductsData.isShipmentAvailable === true}
                      onChange={() =>
                        setAddProductsData({
                          ...addProductsData,
                          isShipmentAvailable: true,
                        })
                      }
                    />
                    <label
                      htmlFor="enableShipment"
                      className="text-black text-base"
                    >
                      Yes, shipment is available
                    </label>
                  </div>

                  {/* Disable Checkbox */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="disableShipment"
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-0"
                      checked={addProductsData.isShipmentAvailable === false}
                      onChange={() =>
                        setAddProductsData({
                          ...addProductsData,
                          isShipmentAvailable: false,
                        })
                      }
                    />
                    <label
                      htmlFor="disableShipment"
                      className="text-black text-base"
                    >
                      No, shipment is not available
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-black text-base font-medium pb-2">
                    Is Product is Available for Return / Exchange
                  </p>

                  {/* Enable Checkbox */}
                  <div className="flex items-center space-x-3 mb-2">
                    <input
                      type="checkbox"
                      id="enableReturn"
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-0"
                      checked={addProductsData.isReturnAvailable === true}
                      onChange={() =>
                        setAddProductsData({
                          ...addProductsData,
                          isReturnAvailable: true,
                        })
                      }
                    />
                    <label
                      htmlFor="enableReturn"
                      className="text-black text-base"
                    >
                      Yes, Return / Exchange is available
                    </label>
                  </div>

                  {/* Disable Checkbox */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="disableReturn"
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-0"
                      checked={addProductsData.isReturnAvailable === false}
                      onChange={() =>
                        setAddProductsData({
                          ...addProductsData,
                          isReturnAvailable: false,
                        })
                      }
                    />
                    <label
                      htmlFor="disableReturn"
                      className="text-black text-base"
                    >
                      No, Return / Exchange Not available
                    </label>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-black text-base font-medium pb-2">
                    Is Product is Available for Next Day Delivery
                  </p>

                  {/* Enable Checkbox */}
                  <div className="flex items-center space-x-3 mb-2">
                    <input
                      type="checkbox"
                      id="enableNextDayDelivery"
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-0"
                      checked={
                        addProductsData.isNextDayDeliveryAvailable === true
                      }
                      onChange={() =>
                        setAddProductsData({
                          ...addProductsData,
                          isNextDayDeliveryAvailable: true,
                        })
                      }
                    />
                    <label
                      htmlFor="enableNextDayDelivery"
                      className="text-black text-base"
                    >
                      Yes, Next Day Delivery is available
                    </label>
                  </div>

                  {/* Disable Checkbox */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="disableNextDayDelivery"
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-0"
                      checked={
                        addProductsData.isNextDayDeliveryAvailable === false
                      }
                      onChange={() =>
                        setAddProductsData({
                          ...addProductsData,
                          isNextDayDeliveryAvailable: false,
                        })
                      }
                    />
                    <label
                      htmlFor="disableNextDayDelivery"
                      className="text-black text-base"
                    >
                      No, Next Day Delivery is Not available
                    </label>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-black text-base font-medium pb-2">
                    Is Product is Available for In Store Pickup
                  </p>

                  {/* Enable Checkbox */}
                  <div className="flex items-center space-x-3 mb-2">
                    <input
                      type="checkbox"
                      id="enableInStoreAvailable"
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-0"
                      checked={addProductsData.isInStoreAvailable === true}
                      onChange={() =>
                        setAddProductsData({
                          ...addProductsData,
                          isInStoreAvailable: true,
                        })
                      }
                    />
                    <label
                      htmlFor="enableInStoreAvailable"
                      className="text-black text-base"
                    >
                      Yes, Store Pickup is available
                    </label>
                  </div>

                  {/* Disable Checkbox */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="disableInStoreAvailable"
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-0"
                      checked={addProductsData.isInStoreAvailable === false}
                      onChange={() =>
                        setAddProductsData({
                          ...addProductsData,
                          isInStoreAvailable: false,
                        })
                      }
                    />
                    <label
                      htmlFor="disableInStoreAvailable"
                      className="text-black text-base"
                    >
                      No, Store Pickup is Not available
                    </label>
                  </div>
                </div>
                <div className="mb-4">
                  <p className="text-black text-base font-medium pb-2">
                    Is Product is Available for CurbSide Pickup
                  </p>

                  {/* Enable Checkbox */}
                  <div className="flex items-center space-x-3 mb-2">
                    <input
                      type="checkbox"
                      id="enableCurbSidePickup"
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-0"
                      checked={
                        addProductsData.isCurbSidePickupAvailable === true
                      }
                      onChange={() =>
                        setAddProductsData({
                          ...addProductsData,
                          isCurbSidePickupAvailable: true,
                        })
                      }
                    />
                    <label
                      htmlFor="enableCurbSidePickup"
                      className="text-black text-base"
                    >
                      Yes, CurbSide Pickup is available
                    </label>
                  </div>

                  {/* Disable Checkbox */}
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="disableCurbSidePickup"
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-0"
                      checked={
                        addProductsData.isCurbSidePickupAvailable === false
                      }
                      onChange={() =>
                        setAddProductsData({
                          ...addProductsData,
                          isCurbSidePickupAvailable: false,
                        })
                      }
                    />
                    <label
                      htmlFor="disableCurbSidePickup"
                      className="text-black text-base"
                    >
                      No, CurbSide Pickup is Not available
                    </label>
                  </div>
                </div>
              </div>


              <div className="pt-5">
                <p className="text-black text-base font-normal pb-1">
                  Related Names (Write Related Names separated by commas like this: Name, Name, Name)
                </p>
                <div className="relative">
                  <input
                    type="text"
                    className="bg-transparent w-full pl-12 pr-5 py-2 border border-newblack rounded-[10px] outline-none text-black text-base font-light"
                    placeholder="Enter names separated by commas"
                    value={relatedNames}
                    onChange={handleChange}
                  />

                  <img
                    className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                    src="/box-add.png"
                  />
                </div>
              </div>


              <div className="pt-5">
                <p className="text-black text-base font-normal pb-1">
                  Long Description
                </p>
                <div className="relative">
                  <textarea
                    className="bg-transparent w-full pl-12 pr-5 py-2 border border-newblack rounded-[10px] outline-none text-black text-base font-light"
                    rows={4}
                    placeholder="Long Description"
                    value={addProductsData.long_description}
                    onChange={(e) =>
                      setAddProductsData({
                        ...addProductsData,
                        long_description: e.target.value,
                      })
                    }
                  />
                  <img
                    className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                    src="/box-add.png"
                  />
                </div>
              </div>
              <div className="pt-5">
                <p className="text-black text-base font-normal pb-1">Meta Title</p>
                <div className="relative">
                  <textarea
                    className="bg-transparent w-full pl-12 pr-5 py-2 border border-newblack rounded-[10px] outline-none text-black text-base font-light"
                    rows={2}
                    placeholder="Meta Title (character length: 50–65)"
                    value={addProductsData.metatitle}
                    maxLength={65} // max limit
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 65) {
                        setAddProductsData({
                          ...addProductsData,
                          metatitle: value,
                        });
                      }
                    }}
                  />
                  <img
                    className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                    src="/box-add.png"
                  />
                  {/* Counter */}
                  <p className="text-xs text-gray-500 absolute right-3 bottom-[-20px]">
                    {addProductsData?.metatitle?.length}/65
                    {addProductsData?.metatitle?.length < 50 && " (min 50 required)"}
                  </p>
                </div>
              </div>

              <div className="pt-5">
                <p className="text-black text-base font-normal pb-1">Meta Description</p>
                <div className="relative">
                  <textarea
                    className="bg-transparent w-full pl-12 pr-5 py-2 border border-newblack rounded-[10px] outline-none text-black text-base font-light"
                    rows={4}
                    placeholder="Meta Description (character length: 150–160)"
                    value={addProductsData?.metadescription}
                    maxLength={160} // max limit
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length <= 160) {
                        setAddProductsData({
                          ...addProductsData,
                          metadescription: value,
                        });
                      }
                    }}
                  />
                  <img
                    className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                    src="/box-add.png"
                  />
                  {/* Counter */}
                  <p className="text-xs text-gray-500 absolute right-3 bottom-[-20px]">
                    {addProductsData?.metadescription?.length}/160
                    {addProductsData?.metadescription?.length < 150 && " (min 150 required)"}
                  </p>
                </div>
              </div>


              <div className="w-full text-sm md:text-md rounded-2xl pt-5">
                <p className="text-black text-base font-semibold pb-1">
                  Return Policy
                </p>
                <JoditEditor
                  className="editor text-black h-[70vh] max-w-[80vh] overflow-y-auto"
                  value={addProductsData?.ReturnPolicy}
                  onChange={(newContent) =>
                    setAddProductsData({
                      ...addProductsData,
                      ReturnPolicy: newContent,
                    })
                  }
                />
              </div>
              <div className="w-full text-sm md:text-md rounded-2xl pt-5">
                <p className="text-black text-base font-semibold pb-1">
                  Warning
                </p>
                <JoditEditor
                  className="editor text-black h-[70vh] max-w-[80vh] overflow-y-auto"
                  value={addProductsData?.Warning}
                  onChange={(newContent) =>
                    setAddProductsData({
                      ...addProductsData,
                      Warning: newContent,
                    })
                  }
                />
              </div>
              <div className="w-full text-sm md:text-md rounded-2xl pt-5">
                <p className="text-black text-base font-semibold pb-1">
                  Disclaimer
                </p>
                <JoditEditor
                  className="editor text-black h-[70vh] max-w-[80vh] overflow-y-auto"
                  value={addProductsData?.disclaimer}
                  onChange={(newContent) =>
                    setAddProductsData({
                      ...addProductsData,
                      disclaimer: newContent,
                    })
                  }
                />
              </div>
              <div className="pt-5">
                <p className="text-black text-base font-normal pb-1">
                  Slug <span className="text-gray-500 text-sm">(Only text allowed, numbers and special characters are not permitted)</span>
                </p>

                <div className="relative">
                  <textarea
                    className="bg-transparent w-full pl-12 pr-5 py-2 border border-newblack rounded-[10px] outline-none text-black text-base font-light"
                    rows={2}
                    placeholder="slug"
                    value={addProductsData.slug}
                    onChange={(e) =>
                      setAddProductsData({
                        ...addProductsData,
                        slug: e.target.value,
                      })
                    }
                  />
                  <img
                    className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                    src="/box-add.png"
                  />
                </div>
              </div>
              <div className="w-full">
                <div className="pt-5">
                  <p className="text-black text-base font-normal pb-1">
                    Image Alt Name
                  </p>
                  <div className="relative">
                    <textarea
                      className="bg-transparent w-full pl-12 pr-5 py-2 border border-newblack rounded-[10px] outline-none text-black text-base font-light"
                      rows={2}
                      placeholder="image Alt Name"
                      value={addProductsData.imageAltName}
                      onChange={(e) =>
                        setAddProductsData({
                          ...addProductsData,
                          imageAltName: e.target.value,
                        })
                      }
                    />
                    <img
                      className="w-[18px] h-[18px] absolute md:top-[13px] top-[10px] left-5"
                      src="/box-add.png"
                    />
                  </div>
                </div>
                <p className="text-2xl font-medium text-black pt-5">
                  Upload Image
                </p>
                {varients.map((item, i) => (
                  <div
                    key={i}
                    className="w-full bg-transparent border border-newblack mt-5 p-5 rounded-[10px] relative"
                  >
                    {/* Upload image code start  */}
                    <div className="flex md:justify-start justify-start items-start md:items-center md:w-auto w-full pt-[25px]">
                      <div className="relative">
                        <div className="border-2 border-dashed border-newblack md:h-[38px] w-[38px] rounded-[5px] flex flex-col justify-center items-center bg-white">
                          <input
                            className="outline-none bg-light md:w-[90%] w-[85%]"
                            type="text"
                            value={singleImg}
                            onChange={(text) => {
                              setSingleImg(text.target.value);
                            }}
                          />
                        </div>

                        <div className="absolute md:top-[10px] top-[4px] md:left-[9px] left-[9px] cursor-pointer ">
                          <IoAddSharp
                            className="text-black w-[20px] h-[20px]"
                            onClick={() => {
                              f.current.click();
                            }}
                          />
                          <input
                            type="file"
                            ref={f}
                            className="hidden"
                            onChange={(event) => {
                              handleImageChange(event, i);
                            }}
                          />
                        </div>
                      </div>
                      <p className="text-black text-base font-normal ml-5">
                        Upload Photo
                      </p>
                    </div>

                    <div className="flex md:flex-row flex-wrap md:gap-5 gap-4 mt-5">
                      {item?.image?.map((ig, inx) => (
                        <div className="relative" key={inx}>
                          <img
                            className="md:w-20 w-[85px] h-20 object-contain"
                            src={ig}
                          />
                          <IoCloseCircleOutline
                            className="text-red-700 cursor-pointer h-5 w-5 absolute left-[5px] top-[10px]"
                            onClick={() => {
                              closeIcon(ig, inx, item?.image, i);
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Size input code start******** */}
                    {Array.isArray(addProductsData?.attributes) &&
                      addProductsData.attributes.map((attribute, id) => (
                        <div key={id}>
                          {attribute.name === "size" && (
                            <div className="pt-2">
                              <p className="text-black  text-base font-normal pb-1">
                                Size
                              </p>
                              <MultiSelect
                                className="w-[85%] "
                                options={size}
                                value={item.selected}
                                onChange={(selected) => {
                                  setvarients(
                                    produce((draft) => {
                                      draft[i].selected = selected;
                                    })
                                  );
                                }}
                                required
                                labelledBy="Select Sizes"
                              />
                            </div>
                          )}
                        </div>
                      ))}

                  </div>
                ))}
              </div>


              <div className="mt-8 p-6 bg-white rounded-xl border border-gray-200">
                <h2 className="md:text-2xl text-xl font-semibold text-gray-800 mb-6">
                  🔍 Barcode Generator
                </h2>
                <div className="flex w-full gap-4">
                  <input
                    type="Number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter barcode value"
                    className="px-4 py-3 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2  mb-4 text-black w-2/3"
                  />

                  <div
                    onClick={handleGenerate}
                    className=" bg-[#F38529] text-white text-center text-[14px] md:text-lg font-medium md:h-13 h-12.5 md:py-3 py-4 px-4 rounded-md transition duration-300 w-1/3 cursor-pointer"
                  >
                    Generate
                  </div>
                </div>
                {barcodeValue && (
                  <div className="mt-8">
                    <h3 className="text-lg text-gray-700 font-medium mb-4">
                      Generated Barcode:
                    </h3>
                    <div className="bg-gray-100 p-4 rounded-md inline-block relative">
                      <Barcode value={barcodeValue} className="" />

                      <IoCloseCircleOutline
                        className="text-red-700 cursor-pointer h-5 w-5 absolute left-[5px] top-[10px]"
                        onClick={() => {
                          setBarcodeValue("");
                          setInputValue("");
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Pricing field code start from here */}
              <div className="py-8 px-4">
                <h2 className="text-3xl font-semibold text-gray-800 mb-6">
                  Pricing
                </h2>

                <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                  <div className="grid md:grid-cols-4 grid-cols-1 gap-4">
                    {addProductsData?.price_slot?.map((slot, d) => (
                      <div
                        key={d}
                        className="bg-gray-50 border border-gray-200 rounded-lg p-4 transition-all hover:shadow-sm"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-lg font-medium text-gray-800">
                            Slot {d + 1}
                          </h3>
                          <button
                            className="text-gray-500 hover:text-gray-700 transition-colors"
                            onClick={() => {
                              priceSlotsCloseIcon(slot, d);
                            }}
                          >
                            <IoIosClose className="w-6 h-6" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                              Qty
                            </label>
                            <input
                              className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 text-black focus:ring-[#F38529]/30 focus:border-[#F38529] transition-colors"
                              type="text"
                              value={slot.value}
                              onChange={(e) => {
                                const input = e.target.value;

                                // Allow empty value for live typing
                                if (input === "") {
                                  slot.value = input;
                                  setAddProductsData({ ...addProductsData });
                                  return;
                                }

                                const value = Number(input);

                                if (!isNaN(value) && value >= 0) {
                                  slot.value = value;
                                  setAddProductsData({ ...addProductsData });
                                }
                              }}
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                              Unit
                            </label>
                            <select
                              className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F38529]/30 focus:border-[#F38529] transition-colors text-black"
                              name="unit"
                              value={slot.unit}
                              required
                              onChange={(e) => {
                                slot.unit = e.target.value;
                                setAddProductsData({ ...addProductsData });
                              }}
                            >
                              <option value="">Select Unit</option>
                              {unitData.map((unit) => (
                                <option key={unit.value} value={unit.value}>
                                  {unit.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                              Offer Price
                            </label>
                            <input
                              className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F38529]/30 focus:border-[#F38529] transition-colors text-black"
                              type="number"
                              value={slot.our_price}
                              onChange={(e) => {
                                const input = e.target.value;

                                if (input === "") {
                                  slot.our_price = input;
                                  setAddProductsData({ ...addProductsData });
                                  return;
                                }

                                const value = Number(input);
                                if (!isNaN(value) && value >= 0) {
                                  slot.our_price = value;
                                  setAddProductsData({ ...addProductsData });
                                }
                              }}
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-gray-700 text-sm font-medium mb-1">
                              Price
                            </label>
                            <input
                              className="w-full bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#F38529]/30 focus:border-[#F38529] transition-colors text-black"
                              type="number"
                              value={slot.other_price}
                              onKeyDown={(e) => {
                                if (e.key === "-" || e.key === "e")
                                  e.preventDefault();
                              }}
                              onChange={(e) => {
                                const input = e.target.value;

                                if (input === "") {
                                  slot.other_price = input;
                                  setAddProductsData({ ...addProductsData });
                                  return;
                                }

                                const value = Number(input);
                                if (!isNaN(value) && value >= 0) {
                                  slot.other_price = value;
                                  setAddProductsData({ ...addProductsData });
                                }
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="bg-[#F38529] text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-[#F38529]/90 transition-colors"
                      onClick={() => {
                        setAddProductsData({
                          ...addProductsData,
                          price_slot: [
                            ...addProductsData.price_slot,
                            {
                              value: 0,
                              price: 0,
                            },
                          ],
                        });
                      }}
                    >
                      Add more
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-row flex-col justify-between items-center w-full pt-20 md:gap-0 gap-5">
                <div className="relative flex justify-center items-center md:w-auto w-full"></div>
                <div className="relative flex justify-center items-center md:w-auto w-full">
                  <button
                    className="bg-[#F38529] md:pr-8 md:h-[50px] h-[40px] md:w-[188px] w-full rounded-[5px] md:text-xl text-base text-white font-normal"
                    type="submit"
                  >
                    {router?.query?.id ? "Update" : "Submit"}
                  </button>
                  <img
                    className="md:w-[8px] w-[7px] md:h-[17px] h-[15px] absolute md:top-[18px] top-[13px] md:right-8 right-4 object-contain"
                    src="/nextImg.png"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}

export default isAuth(AddProduct);
