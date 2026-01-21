import React from "react";
import Collapse from "@mui/material/Collapse";
import { useState } from "react";
import { TiArrowSortedDown, TiArrowSortedUp } from "react-icons/ti";
import { timeSince } from "@/utils/service";

const ReportsTable = ({ row }) => {

  const props = { data: row?.original };
  const [open, setOpen] = useState(false);

  const handleClick = () => {
    setOpen(!open);

  };
  console.log(props)
  return (
    <div className="mt-2">
      <p className="text-[#07A404] text-base	font-bold">{timeSince(props?.data?.createdAt)}</p>
      {props.data && <div className={`${props.data.userType === 'USER' ? 'bg-red-200' : 'bg-yellow-200'} md:px-3 p-2 rounded-xl border-t-8 border-2 border-custom-blue`}>
        <div onClick={handleClick} className=" w-full">
          <div className="rounded-[30px]  relative w-full">
            <div className="flex flex-row	items-center w-full">

              <div className="grid md:grid-cols-5 grid-cols-1 w-full">
                <div className="col-span-3 flex items-center">
                  <p className="text-custom-darkBlack text-[19px] font-normal">
                    {props.data.issue}
                  </p>
                </div>
                <div className=" items-center">
                  <p className=" text-green-700 text-sm font-normal">
                    Reported By: #{props?.data?.user?.userID}
                  </p>
                  <p className="text-green-700 text-sm font-normal">
                    {props?.data?.user?.fullName}
                  </p>
                  <p className="text-green-700 text-sm font-normal">
                    {props?.data?.user?.phone}
                  </p>
                </div>
                <div className="  items-center">
                  <p className="text-red-700 text-sm font-normal">
                    Reported User: #{props?.data?.userType === 'USER' ? props?.data?.connection?.travellerid?.userID : props?.data?.connection?.packagerid?.userID}
                  </p>
                  <p className="text-red-700 text-sm font-normal">
                    {props?.data?.userType === 'USER' ? props?.data?.connection?.travellerid?.fullName : props?.data?.connection?.packagerid?.fullName}
                  </p>
                  <p className="text-red-700 text-sm font-normal">
                    {props?.data?.userType === 'USER' ? props?.data?.connection?.travellerid?.phone : props?.data?.connection?.packagerid?.phone}
                  </p>
                </div>
              </div>
              <div className="ml-5">
                {open ? (
                  <TiArrowSortedUp className="text-custom-blue text-xl" />
                ) : (
                  <TiArrowSortedDown className="text-custom-blue text-xl" />
                )}
              </div>
            </div>
          </div>
        </div>
        <Collapse in={open} timeout="auto" unmountOnExit>
          <div className="flex justify-start items-center">
            <img className="bg-custom-blue h-10 w-10 rounded-full" src={props?.data?.connection?.packagePlan?.item_image} />
            <p className="text-custom-darkBlack text-base font-normal pl-5">{props?.data?.connection?.packagePlan?.name}</p>
          </div>
        </Collapse>
      </div>}
    </div>
  );
};

export default ReportsTable;
