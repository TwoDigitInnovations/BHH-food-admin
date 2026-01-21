import { Api, ApiFormData } from "@/services/service";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { FiEdit } from "react-icons/fi";
import { IoCloseCircleOutline } from "react-icons/io5";
import Swal from "sweetalert2";
import { MdOutlineFileUpload } from "react-icons/md";
import isAuth from "@/components/isAuth";
import Compressor from "compressorjs";

function Categories(props) {
  const router = useRouter();
  const [data, setData] = useState({
    name: "",
    image: "",
    metatitle: "",
    metadescription: "",
  });
  const categoryRef = useRef();
  const [loadTypeData, setloadTypeData] = useState([]);
  const [productPopup, setProductPopup] = useState(false);
  const [deleteid, setdeleteid] = useState(null);
  const [editid, seteditid] = useState("");
  const f = useRef(null);

  const [searchTerm, setSearchTerm] = useState("");

  const scrollToCategory = () => {
    categoryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const filteredCategories = loadTypeData.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    getalltrucktype();
  }, []);

  const getalltrucktype = async () => {
    props.loader(true);
    Api("get", "getCategory", "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================> form data :: ", res);
        setloadTypeData(res.data);
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

    if (!data.name || !data.image || !data.metatitle || !data.metadescription) {
      props.toaster({
        type: "error",
        message: "please fill required details.",
      });
      return;
    }

    let method = "post";
    let url = "createCategory";

    if (editid) {
      data.id = data._id;
      url = `updateCategory`;
      method = "post";
    }

    Api(method, url, data, router).then(
      (res) => {
        props.toaster({ type: "sucess", message: "Sucessfully Added" });
        setData({
          name: "",
          image: "",
          metadescription: "",
          metatitle: "",
        });
        getalltrucktype();
        seteditid("");
      },
      (err) => {
        console.log(err);
        props.loader(false);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const deleteCategory = (_id) => {
    Swal.fire({
      text: "Are you sure? You want to proceed with the deletion?",
      icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#F38529",
      confirmButtonColor: "#F38529",
      confirmButtonText: "Delete",
      width: "350px",
    }).then(function (result) {
      console.log(result);
      if (result.isConfirmed) {
        const data = {
          _id,
        };

        props.loader(true);
        Api("post", `deleteCategory/${_id}`, data, router).then(
          (res) => {
            console.log("res================>", res.data?.meaasge);
            props.loader(false);
            getalltrucktype();
            setProductPopup(false);
            setdeleteid(null);
            props.toaster({
              type: "sucess",
              message:
                res?.data?.meaasge ||
                res?.meaasge ||
                "Category deleetd Sucessfull",
            });
          },
          (err) => {
            props.loader(false);
            console.log(err);
            props.toaster({
              type: "error",
              message: err?.data?.meaasge || err?.meaasge,
            });
          }
        );
      } else if (result.isDenied) {
        // setFullUserDetail({})
      }
    });
  };

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
                setData((prevData) => ({
                  ...prevData,
                  image: res.data.file,
                }));
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

  return (
    <section className=" w-full h-full md:pt-5 pt-5 pb-5 pl-5 pr-5">
      <p className=" font-bold text-black md:text-[32px] text-2xl">
        <span
          className={`inline-block w-2 h-8 bg-[#F38529]  mr-3 rounded `}
        ></span>
        Add Categories
      </p>

      <section className="h-full overflow-y-scroll  scrollbar-hide overflow-scroll md:mt-0 mt-5 md:pb-32 pb-28">
        {/* md:mt-9 */}
        <form
          className="bg-white border md:my-10 border-gray-200 rounded-[10px] p-5 "
          onSubmit={submit}
          ref={categoryRef}
        >
          <div className="md:flex flex-col justify-center items-center pt-5">
            <div className="flex flex-col justify-start items-start md:w-auto w-full">
              <p className="text-black text-sm font-semibold pb-2">
                Add Categories
              </p>
              <input
                className="bg-gray-100 border border-custom-offWhite outline-none md:h-[50px] h-[40px] md:w-[500px] w-full rounded-[5px] px-5 text-sm font-normal text-black"
                type="text"
                placeholder="Name of Category"
                value={data.name}
                onChange={(e) => {
                  setData({ ...data, name: e.target.value });
                }}
                required
              />
            </div>
            <div className="mt-5 relative">
              <div className="flex flex-col justify-start items-start">
                <p className="text-black text-sm font-semibold pb-2">
                  Upload image
                </p>
                <div className="bg-gray-100 border border-custom-offWhite md:h-[50px] h-[40px] md:w-[500px] w-full rounded-[5px] px-5 text-sm font-normal text-black flex justify-start items-center">
                  <input
                    type="text"
                    readOnly
                    className="bg-custom-lightGrayInputBg outline-none md:w-[90%] w-[85%]"
                    value={data?.image}
                    onChange={(e) => {
                      setData({ ...data, image: e.target.value });
                    }}
                    required
                  />
                </div>
              </div>

              <div className="absolute top-[36px] md:right-[10px]  right-[10px]">
                <MdOutlineFileUpload
                  className="text-black h-8 w-8 cursor-pointer"
                  onClick={() => {
                    f.current.click();
                  }}
                />
                <input
                  type="file"
                  ref={f}
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>
            </div>
            <div className="flex flex-col justify-start items-start md:w-auto w-full mt-4">
              <p className="text-black text-sm font-semibold pb-2">
                Meta Title
              </p>
              <input
                className="bg-gray-100 border border-custom-offWhite outline-none md:h-[50px] h-[40px] md:w-[500px] w-full rounded-[5px] px-5 text-sm font-normal text-black"
                type="text"
                placeholder="Meta Title (character length: 55–65)"
                value={data.metatitle}
                onChange={(e) => {
                  setData({ ...data, metatitle: e.target.value });
                }}
                required
              />
            </div>
            <div className="flex flex-col justify-start items-start md:w-auto w-full mt-4">
              <p className="text-black text-sm font-semibold pb-2">
                Meta Description
              </p>
              <textarea
                className="bg-gray-100 border border-custom-offWhite outline-none md:w-[500px] w-full rounded-[5px] px-5 py-2 text-sm font-normal text-black"
                rows={4}
                placeholder="Meta Description (character length: 155–170)"
                value={data.metadescription}
                onChange={(e) => {
                  setData({ ...data, metadescription: e.target.value });
                }}
                required
              ></textarea>
            </div>
          </div>

          <div className="flex justify-center items-center pt-5 pb-3">
            <button
              className="md:h-[45px] h-[40px] md:w-[274px] w-full bg-[#F38529] rounded-[10px] md:text-lg text-base text-white cursor-pointer font-semibold"
              type="submit"
            >
              {editid ? "Update Now" : "Add Now"}
            </button>
          </div>
        </form>

        {/* Form code end here */}

        <div className="bg-white border border-custom-lightsGrayColor rounded-[10px] p-5 ">
          <input
            className="bg-gray-100 text-black border border-gray-100 outline-none h-[40px] md:w-[435px] w-full px-5 rounded-[10px] text-custom-darkBlack font-normal text-base"
            type="text"
            placeholder="Search Categories"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredCategories.map((item, i) => (
          <div
            key={i}
            className="bg-white border border-gray-100 rounded-[10px] p-5 mt-5"
          >
            <div className="flex justify-between items-center w-full">
              <div className="flex justify-start items-center">
                <p className="text-base text-black font-semibold pl-5">
                  {item?.name}
                </p>
              </div>
              <div className="flex justify-center items-center">
                <FiEdit
                  className="md:h-[30px] h-[20px] md:w-[30px] w-[20px] text-[#F38529] mr-[20px] cursor-pointer"
                  onClick={() => {
                    seteditid(item._id);
                    setData(item);
                    console.log("vbn", item);
                    scrollToCategory();
                  }}
                />
                <IoCloseCircleOutline
                  className="md:h-[30px] h-[20px] md:w-[30px] w-[20px] text-[#F38529] cursor-pointer"
                  onClick={() => deleteCategory(item?._id)}
                />
              </div>
            </div>
          </div>
        ))}
      </section>
    </section>
  );
}

export default isAuth(Categories);
