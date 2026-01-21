import React from "react";
import Collapse from "@mui/material/Collapse";
import { useState } from "react";
import { GrStar } from "react-icons/gr";

const ReportsTable = ({ row }) => {

  const props = { data: row?.original };
  const [open, setOpen] = useState(false);
  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <div className="mt-2 ">
      <div className="flex justify-between">
        <div>
          <p className="text-[#07A404] text-base	font-bold">4 Hours Ago</p>
        </div>
        <div className="flex">
          <GrStar className="text-[#D9D9D9] h-8 w-8" />
          <GrStar className="text-[#D9D9D9] h-8 w-8" />
          <GrStar className="text-[#D9D9D9] h-8 w-8" />
          <GrStar className="text-[#D9D9D9] h-8 w-8" />
          <GrStar className="text-[#D9D9D9] h-8 w-8" />
        </div>
      </div>

      <div className="bg-white md:px-3 p-2 rounded-xl border-t-8 border-2 border-custom-blue">
        <div onClick={handleClick} className=" w-full">
          <div className="rounded-[30px]  relative w-full">
            <div className="flex flex-row	items-center w-full">
              <div className="w-full">
                <div className="flex items-center">
                  <p className="text-custom-darkBlack text-[19px] font-normal py-3">
                    Lorem ipsum dolor sit amet consectetur. Nunc eget aliquam sagittis adipiscing diam dictum ut molestie.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Collapse in={open} timeout="auto" unmountOnExit>
        </Collapse>
      </div>
    </div>
  );
};

export default ReportsTable;
