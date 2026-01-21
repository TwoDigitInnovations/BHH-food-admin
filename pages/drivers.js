import React, { useMemo, useState, useEffect } from "react";
import Table, { indexID } from "@/components/table";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import moment from "moment";
import Dialog from "@mui/material/Dialog";
import { IoCloseCircleOutline } from "react-icons/io5";
import Avatar from "@mui/material/Avatar";
import { Swiper, SwiperSlide, useSwiper } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import { Navigation } from "swiper/modules";
import isAuth from "@/components/isAuth";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // required CSS

function Driver(props) {
  const router = useRouter();
  const [driverData, setDriverData] = useState([]);
  const [viewPopup, setviewPopup] = useState(false);
  const [popupData, setPopupData] = useState({});
  const [driverDocuments, setDriverDocuments] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  });

  const handleClose = () => {
    setviewPopup(false);
  };

  useEffect(() => {
    getDriverList(currentPage);
  }, [popupData, currentPage]);

  const getDriverList = async (page = 1, limit =10) => {
    props.loader(true);
    Api("get", `getDriverList?page=${page}&limit=${limit}`, "", router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        setDriverData(res?.data?.drivers || []);
        setPagination({
          totalPages: res?.data?.pagination?.totalPages || 1,
          currentPage: res?.data?.pagination?.currentPage || 1,
          itemsPerPage: res?.data?.pagination?.itemsPerPage || 10,
        });
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const updateStatus = async (id, status) => {
    props.loader(true);
    setviewPopup(false);
    Api("post", "updateStatus", { id, status }, router).then(
      (res) => {
        props.loader(false);
        console.log("res================>", res);
        props.toaster({
          type: "success",
          message: `Driver ${status} successfully`,
        });
        getDriverList(currentPage);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const images = Object.entries(driverDocuments || {}).filter(
    ([, value]) => !!value
  );

  function indexID({ value }) {
    return (
      <div>
        <p className="text-custom-black text-base font-normal text-center">
          {value}
        </p>
      </div>
    );
  }

  function name({ value }) {
    return (
      <div>
        <p className="text-custom-black text-base font-normal text-center">
          {value}
        </p>
      </div>
    );
  }

  function email({ value }) {
    return (
      <div>
        <p className="text-custom-black text-base font-normal text-center">
          {value}
        </p>
      </div>
    );
  }

  function date({ value }) {
    return (
      <div>
        <p className="text-custom-black text-base font-normal text-center">
          {moment(value).format("DD MMM YYYY")}
        </p>
      </div>
    );
  }

  function mobile({ value }) {
    return (
      <div>
        <p className="text-custom-black text-base font-normal text-center">
          {value}
        </p>
      </div>
    );
  }

  function status({ value }) {
    return (
      <div>
        <p
          className={`text-custom-black text-base font-normal text-center
                     ${value == "Verified" ? "text-green-500" : ""}
                     ${value == "Suspended" ? "text-red-500" : ""}
                     ${value == "Pending" ? "text-yellow-500" : ""}
                     `}
        >
          {value}
        </p>
      </div>
    );
  }

  const info = ({ value, row }) => {
    // console.log(row.original)
    return (
      <div className="flex items-center justify-center">
        <button
          className="h-[38px] w-[93px] bg-[#FE3E0020] text-custom-red text-base	font-normal rounded-[8px]"
          onClick={() => {
            setviewPopup(true);
            setPopupData(row.original);
            setDriverData([
              {
                img: row.original?.store?.identity,
              },
              {
                img: row.original?.store?.kbis,
              },
            ]);
            setDriverDocuments({
              number_plate_image: row.original?.number_plate_image,
              dl_image: row.original?.dl_image,
              national_id: row.original?.national_id,
              background_check_document:
                row.original?.background_check_document,
            });
          }}
        >
          See
        </button>
      </div>
    );
  };

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "_id",
        // accessor: "indexNo",
        Cell: indexID,
      },
      {
        Header: "NAME",
        accessor: "username",
        Cell: name,
      },
      {
        Header: "E-mail",
        accessor: "email",
        Cell: email,
      },
      {
        Header: "DATE",
        accessor: "createdAt",
        Cell: date,
      },
      {
        Header: "Mobile",
        accessor: "number",
        Cell: mobile,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: status,
      },
      {
        Header: "Info",
        // accessor: "view",
        Cell: info,
      },
    ],
    []
  );

  return (
    <section className=" w-full h-full pt-4 ">
      <p className="text-black font-bold md:text-[32px] text-2xl md:ms-5 ms-5">
        <span
          className={`inline-block w-2 h-8 bg-[#F38529]  mr-3 rounded `}
        ></span>
        Driver List
      </p>

      <section className="px-5 pt-1 md:pb-32 pb-28 bg-white h-full rounded-[12px] overflow-auto mt-3">
        {viewPopup && (
          <Dialog open={viewPopup} onClose={handleClose} fullScreen>
            <div className="p-5  bg-white relative overflow-hidden">
              <IoCloseCircleOutline
                className="text-black h-8 w-8 cursor-pointer absolute right-2 top-2"
                onClick={handleClose}
              />
              <div className="md:flex justify-between border-b-2 border-b-gray-300 py-2">
                <div className="">
                  <div className="md:flex flex-row justify-start items-start">
                    <Avatar
                      // alt={singleData.username}
                      // src={singleData.profile}
                      sx={{ width: 60, height: 60 }}
                    />
                    <div className="flex flex-col justify-start items-start md:pl-5">
                      <p className="text-base font-bold text-custom-black md:pt-0 pt-1">
                        {popupData?.username}
                      </p>
                      <p className="text-base font-medium text-custom-newBlack pt-1">
                        {popupData?.email}
                      </p>
                      <p className="text-sm font-medium text-custom-black pt-1">
                        {popupData?.number}
                      </p>
                      <p className="text-sm font-medium text-custom-black pt-1">
                        {popupData?.address}
                      </p>
                    </div>
                  </div>
                </div>

                {/* <div className="col-span-6 flex md:justify-center justify-start items-center min-w-[400px] md:border-l-2 md:border-l-gray-300 ">
                  <div className="grid grid-cols-4 gap-x-4 w-full justify-between items-center md:pl-5">
                    <div className="col-span-2 flex gap-2 justify-start items-center w-full">
                      <p className="text-sm font-semibold text-gray-600">
                        Total Delivered Items:
                      </p>
                      <p className="text-sm font-normal text-custom-black">
                        {popupData?.stats?.totalOrders}
                      </p>
                    </div>
                    <div className="col-span-2 flex gap-2 justify-start items-center w-full">
                      <p className="text-sm font-semibold text-gray-600">
                        Total Tips:
                      </p>
                      <p className="text-sm font-normal text-custom-black">
                        {popupData?.stats?.totalTips}
                      </p>
                    </div>
                    <div className="col-span-2 flex gap-2 justify-start items-center w-full">
                      <p className="text-sm font-semibold text-gray-600">
                        Total Earnings:
                      </p>
                      <p className="text-sm font-normal text-custom-black">
                        {popupData?.stats?.totalEarnings}
                      </p>
                    </div>
                    <div className="col-span-2 flex gap-2 justify-start items-center w-full">
                      <p className="text-sm font-semibold text-gray-600">
                        Wallet Balance:
                      </p>
                      <p className="text-sm font-normal text-custom-black">
                        {popupData?.wallet?.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div> */}

                <div className="flex md:justify-center justify-start items-center min-w-[500px] md:border-l-2 md:border-l-gray-300 ">
                  <div className="flex flex-col justify-start items-start md:pl-5 w-[50%]">
                    <div className="flex flex-col justify-between items-start w-full md:pt-0 pt-2">
                      <p className="text-sm text-custom-black font-bold">
                        Number Plate :{" "}
                        <span className="text-custom-darkGrayColor font-medium">
                          {popupData?.number_plate_no || "N/A"}
                        </span>
                      </p>
                      <p className="text-sm text-custom-black font-bold">
                        National Id No :{" "}
                        <span className="text-custom-darkGrayColor font-medium">
                          {popupData?.national_id_no || "N/A"}
                        </span>
                      </p>
                      <p className="text-sm text-custom-black font-bold">
                        Driving Licence No :{" "}
                        <span className="text-custom-darkGrayColor font-medium">
                          {popupData?.dl_number || "N/A"}
                        </span>
                      </p>
                      <p className="text-sm text-custom-black font-bold">
                        Address Support Letter :{" "}
                        <span className="text-custom-darkGrayColor font-medium">
                          {popupData?.address_support_letter || "N/A"}
                        </span>
                      </p>
                    </div>
                    <div className="flex justify-between items-center w-full pt-2"></div>
                  </div>
                </div>
              </div>
              <p className="text-custom-black text-base font-bold pt-2">
                Uploaded Document
              </p>

              <div className="w-full flex justify-center mt-5">
                <div className="w-[90%] md:w-[700px]">
                  <Carousel
                    showArrows
                    showThumbs={false}
                    infiniteLoop
                    useKeyboardArrows
                    autoPlay={false}
                    className="driver-carousel "
                  >
                    {images?.length === 0 ? (
                      <div className="text-center text-gray-500 flex justify-center items-center mt-4 min-h-[400px]">
                        No documents uploaded
                      </div>
                    ) : (
                      images?.map(([key, value], index) => (
                        <div key={index}>
                          <img
                            src={value}
                            alt={key}
                            className="object-cover md:h-[500px] h-[400px] w-full rounded-md"
                          />
                          <p className="legend text-white text-sm font-semibold p-2 rounded-md mt-2">
                            {key.replace(/_/g, " ")}
                          </p>
                        </div>
                      ))
                    )}
                  </Carousel>
                </div>
              </div>

              <div className="md:h-12">
                <div className="flex  mt-5  justify-center  gap-5">
                  {popupData?.status != "Verified" && (
                    <button
                      className="text-white text-lg font-bold w-[274px] h-[50px] rounded-[12px] bg-[#F38529]"
                      onClick={() => {
                        updateStatus(popupData?._id, "Verified");
                      }}
                    >
                      Verify
                    </button>
                  )}
                  {popupData?.status != "Suspended" && (
                    <button
                      className="text-white cursor-pointer text-lg font-bold w-[274px] h-[50px] rounded-[12px] bg-[#F38529]"
                      onClick={() => {
                        updateStatus(popupData?._id, "Suspended");
                      }}
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            </div>
          </Dialog>
        )}

        <div className="">
          <Table
            columns={columns}
            data={driverData}
            pagination={pagination}
            onPageChange={(page) => setCurrentPage(page)}
            currentPage={currentPage}
            itemsPerPage={pagination?.itemsPerPage}
            setPagination={setPagination}
          />
        </div>
      </section>
    </section>
  );
}

export default isAuth(Driver);
