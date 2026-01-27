import Link from "next/link";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { MdDashboard } from "react-icons/md";
import { ImCross } from "react-icons/im";
import { userContext } from "@/pages/_app";
import { BiSolidCategory } from "react-icons/bi";
import { AiFillProduct } from "react-icons/ai";
import { FaCircleQuestion } from "react-icons/fa6";
import { FaShoppingBag } from "react-icons/fa";
import { FaUserTie } from "react-icons/fa";
import { PiSignOutFill } from "react-icons/pi";
import { MdRateReview } from "react-icons/md";
import { MdCategory } from "react-icons/md";
import { BiSolidOffer } from "react-icons/bi";
import { IoMdSettings } from "react-icons/io";
import { RiCoupon3Fill } from "react-icons/ri";
import { MdManageAccounts } from "react-icons/md";
import { FaFileImage } from "react-icons/fa";
import { MdOutlineContentPasteOff } from "react-icons/md";
import { MdInventory2 } from "react-icons/md";
import { RiEBike2Fill } from "react-icons/ri";
import { TbPasswordFingerprint } from "react-icons/tb";
import { MdVerifiedUser } from "react-icons/md";
import Swal from "sweetalert2";

const SidePannel = ({ setOpenTab, openTab }) => {
  const [user, setUser] = useContext(userContext);
  const router = useRouter();

  const logOut = () => {
    setUser({});
    localStorage.removeItem("userDetail");
    localStorage.removeItem("token");
    router.push("/login");
  };

  const menuItems = [
    {
      href: "/",
      title: "Dashbord",
      img: <MdDashboard className="text-3xl" />,
      access: ["ADMIN"],
    },
    {
      href: "/inventory",
      title: "Inventory",
      img: <MdInventory2 className="text-3xl" />,
      access: ["ADMIN", "EMPLOYEE"],
    },

    {
      href: "/queries",
      title: "Queries",
      img: <FaCircleQuestion className="text-3xl" />,
      access: ["ADMIN", "EMPLOYEE"],
    },
    {
      href: "/orders",
      title: "Orders",
      img: <FaShoppingBag className="text-3xl" />,
      access: ["ADMIN", "EMPLOYEE"],
    },
    {
      href: "/PendingOrders",
      title: "PendingOrders",
      img: <FaShoppingBag className="text-3xl" />,
      access: ["ADMIN", "EMPLOYEE"],
    },


    {
      href: "/employees",
      title: "Employee",
      img: <FaUserTie className="text-3xl" />,
      access: ["ADMIN"],
    },
    {
      href: "/drivers",
      title: "Driver",
      img: <RiEBike2Fill className="text-3xl" />,
      access: ["ADMIN"],
    },
    {
      href: "/document-verification",
      title: "Document Verification",
      img: <MdVerifiedUser className="text-3xl" />,
      access: ["ADMIN"],
    },
    {
      href: "/categories",
      title: "Categories",
      img: <MdCategory className="text-3xl" />,
      access: ["ADMIN"],
    },
    {
      href: "/SaleProduct",
      title: "Sale",
      img: <BiSolidOffer className="text-3xl" />,
      access: ["ADMIN"],
    },

    {
      href: "/Coupan",
      title: "Coupon",
      img: <RiCoupon3Fill className="text-3xl" />,
      access: ["ADMIN"],
    },
    {
      href: "/review",
      title: "Reviews",
      img: <MdRateReview className="text-3xl" />,
      access: ["ADMIN"],
    },
    {
      href: "/Notification",
      title: "Customer Management",
      img: <MdManageAccounts className="text-3xl" />,
      access: ["ADMIN"],
    },
    {
      href: "/ContentManagement",
      title: "Our Content",
      img: <MdOutlineContentPasteOff className="text-3xl" />,
      access: ["ADMIN"],
    },
    {
      href: "/TeamMemberSetting",
      title: "Member Image",
      img: <FaFileImage className="text-3xl" />,
      access: ["ADMIN"],
    },
    {
      href: "/passwordmanager",
      title: "Password Manager",
      img: <TbPasswordFingerprint className="text-3xl" />,
      access: ["ADMIN", "EMPLOYEE"],
    },
    {
      href: "/settings",
      title: "Settings",
      img: <IoMdSettings className="text-3xl" />,
      access: ["ADMIN"],
    },
  ];
  const imageOnError = (event) => {
    event.currentTarget.src = "/userprofile.png";
    // event.currentTarget.className = "error";
  };

  return (
    <>
      <div className="xl:w-[280px] fixed top-0 left-0 z-20  md:w-[250px] sm:w-[200px] hidden sm:grid grid-rows-5  overflow-hidden">
        <div className="">
          <div className="bg-[#fff0dc] py-5 overflow-y-scroll h-screen  scrollbar-hide">
            <div
              className="bg-[#fff0dc] pt-5 pb-5 row-span-1 flex items-center justify-center cursor-pointer mx-5 rounded"
              onClick={() => router.push("/")}
            >
              {/* w-full pb-7*/}
              <img
                src="/newwlogo.png"
                alt=""
                className="w-[300px] h-[78px] object-contain"
              />
            </div>

            <div className="flex flex-col justify-between row-span-4  w-full">
              <ul className="w-full flex flex-col text-left mt-5">
                {/* mt-10  */}
                {menuItems.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className={`${item?.access?.includes(user?.type) ? "flex" : "hidden"
                      }  items-center mx-10 cursor-pointer group hover:bg-black hover:text-white m-1 ${router.pathname === item.href
                        ? "bg-black text-white rounded-[8px]"
                        : "text-black"
                      }`}
                  >
                    <div className=" py-3 font-semibold flex items-center gap-4">
                      <div className={`w-6 ml-4 ${router.pathname === item.href ? "text-white" : "text-black group-hover:text-white"}`}>{item?.img}</div>
                      {item?.title}
                    </div>
                  </Link>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`w-full absolute top-0 left-0 z-40 sm:hidden flex flex-col h-screen max-h-screen overflow-hidden  bg-[#F38529] ${openTab ? "scale-x-100" : "scale-x-0"
          } transition-all duration-300 origin-left`}
      >
        <div className=" row-span-1  w-full text-white  relative ">
          <ImCross
            className="absolute text-white top-4 right-4 z-40 text-2xl"
            onClick={() => setOpenTab(!openTab)}
          />
          <div className="flex flex-col justify-items-start gap-3 w-full  p-3">
            <div className="p-1 rounded overflow-hidden">
              <img
                src="/newwlogo.png"
                alt=""
                className="w-[310px] h-[75px] object-contain"
              />
            </div>
            <div className="flex ms-2 justify-between">
              <div className="flex">
                <div className="w-12 h-12 rounded-full overflow-hidden border-white border">
                  <img
                    src={user?.profile || "/office-man.png"}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={imageOnError}
                  />
                </div>
                <p className="mt-3 ms-3 text-lg text-white font-bold">
                  {user?.username}
                </p>
              </div>
              <div>
                {user?.token ? (
                  <div
                    className="flex gap-2 mt-3 items-center cursor-pointer"
                    onClick={() => {
                      Swal.fire({
                        text: "Are you sure you want to logout?",
                        showCancelButton: true,
                        confirmButtonText: "Yes",
                        cancelButtonText: "No",
                        confirmButtonColor: "#FEC200",
                        customClass: {
                          confirmButton: "px-12 rounded-xl",
                          title: "text-[20px] text-black",
                          actions: "swal2-actions-no-hover",
                          popup: "rounded-[15px] shadow-custom-green",
                        },
                        buttonsStyling: true,
                        reverseButtons: true,
                        width: "320px",
                      }).then(function (result) {
                        if (result.isConfirmed) {
                          logOut();
                        }
                      });
                    }}
                  >
                    <div className="text-white text-center flex justify-center items-center">
                      <p className="font-bold">Sign Out</p>
                    </div>
                    <div className=" rounded-full ">
                      <PiSignOutFill className="text-3xl text-white" />
                    </div>
                  </div>
                ) : (
                  <Link href={"/login"}>
                    <div className="p-3 mt-3 items-center font-bold">
                      <p>LogIn</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center items-start row-span-2 h-full  w-full">
          <ul className="w-full h-full flex flex-col text-left justify-start items-center border-t-2 border-white">
            {menuItems.map((item, i) => (
              <li
                key={i}
                className={`${item?.access?.includes(user?.type) ? "flex" : "hidden"
                  } w-full items-center cursor-pointer group hover:bg-black hover:text-white border-b-2 border-white ${router.pathname === item.href ? "bg-black text-white" : "text-black"}`}
              >
                <div
                  className=" py-2 pl-6 font-semibold flex items-center gap-4 "
                  onClick={() => setOpenTab(!openTab)}
                >
                  <div className={`w-6 ${router.pathname === item.href ? "text-white" : "text-black group-hover:text-white"}`}>{item?.img}</div>
                  <Link href={item.href}>{item?.title}</Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default SidePannel;
