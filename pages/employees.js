import React, { useMemo, useState, useEffect, useContext } from "react";
import Table from "@/components/table";
import { FiEdit } from "react-icons/fi";
import { RiDeleteBinLine } from "react-icons/ri";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import { userContext } from "./_app";
import isAuth from "@/components/isAuth";
import moment from "moment";

function Employees(props) {
  const router = useRouter();
  const [productsList, setProductsList] = useState([]);
  const [user, setUser] = useContext(userContext);

  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  });

  useEffect(() => {
    if (user?._id) {
      getEmployee(currentPage);
    }
  }, [user, currentPage]);

  const getEmployee = async (page = 1, limit = 10) => {
    props.loader(true);
   
    let url = `getEmployee?page=${page}&limit=${limit}`;
   

    Api("get", url, router).then(
      (res) => {
        props.loader(false);
        setProductsList(res.data);
        setPagination(res?.pagination);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const deleteProduct = (_id) => {
    Swal.fire({
      text: "Are you sure? You want to Delete this Employee?",
      // icon: "warning",
      showCancelButton: true,
      cancelButtonColor: "#F38529",
      confirmButtonColor: "#F38529",
      confirmButtonText: "Delete",
      width:"350px"
    }).then(function (result) {
      if (result.isConfirmed) {
        const data = {
          _id,
        };

        Api("post", `deleteEmployee/${_id}`, data, router).then(
          (res) => {
            console.log("res================>", res.data?.meaasge);
            props.loader(false);
            if (res?.status) {
              getEmployee();
              props.toaster({ type: "success", message: "Emplyee Deleted Successfully" });
            } else {
              console.log(res?.data?.message);
              props.toaster({ type: "error", message: res?.data?.meaasge });
            }
          },
          (err) => {
            props.loader(false);
            console.log(err);
            props.toaster({ type: "error", message: err?.data?.meaasge ||err?.meaasge });
          }
        );
      } else if (result.isDenied) {
        // setFullUserDetail({})
      }
    });
  };

  const index = ({ value, row }) => {
    return (
      <div className="p-4 flex items-center justify-center">
        {value}
      </div>
    );
  };

  const productName = ({ value }) => {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <p className="text-black text-base font-normal">{value}</p>
      </div>
    );
  };

  const email = ({ row, value }) => {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <p className="text-black text-base font-normal">{value}</p>
      </div>
    );
  };

  const number = ({ value }) => {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <p className="text-black text-base font-normal">
          {value || "-"}
        </p>
      </div>
    );
  };

  const joiningDate = ({ value }) => {
    return (
      <div className="p-4 flex  items-center justify-center gap-2">
        {moment(value).format("DD/MM/YYYY")}
      </div>
    );
  };

  const actionHandler = ({ value, row }) => {
    return (
      <div className="bg-custom-offWhiteColor flex items-center  justify-evenly  border border-custom-offWhite rounded-[10px] mr-[10px]">
        <div
          className="py-[10px] w-[50%] items-center flex justify-center cursor-pointer"
          onClick={() => {
            router.push(`add-employee?id=${row.original._id}`);
          }}
        >
          <FiEdit className="text-[22px]  " />
        </div>
        <div className="py-[10px] border-l-[1px] border-custom-offWhite w-[50%] items-center flex justify-center">
          <RiDeleteBinLine
            className="text-[#F38529] text-[24px] cursor-pointer"
            onClick={() => deleteProduct(row.original._id)}
          />
        </div>
      </div>
    );
  };

  const columns = useMemo(
    () => [
      {
        Header: "Sr.No.",
        accessor: "indexNo",
        Cell: index,
      },
      {
        Header: "Employee Name",
        accessor: "username",
        Cell: productName,
      },
      {
        Header: "Email",
        accessor: "email",
        Cell: email,
      },
      {
        Header: "Number",
        accessor: "number",
        Cell: number,
      },
      {
        Header: "Joining Date",
        accessor: "createdAt",
        Cell: joiningDate,
      },
      {
        Header: "ACTION",
        Cell: actionHandler,
      },
    ],
    []
  );

  return (
    <div className=" w-full h-full bg-transparent md:pt-5 pt-5 pb-5 pl-5 pr-5">
      <div className="md:pt-[0px] pt-[0px] h-full">
        <p className="text-black font-bold md:text-[32px] text-2xl px-4">
           <span
            className={`inline-block w-2 h-8 bg-[#F38529]  mr-3 rounded `}
          ></span>
          Employee
        </p>
        {/* mt-3 */}
        <div className="bg-white pt-5 md:pb-32 px-5  rounded-[12px] h-full overflow-y-scroll  scrollbar-hide overflow-scroll pb-28  md:mt-5 mt-5">
          <div className="">
            <div className="flex md:flex-row flex-col md:justify-end md:items-end gap-3">
              <button
                className="text-white bg-[#F38529] px-5 py-2.5 rounded"
                onClick={() => router.push("/add-employee")}
              >
                Add Employee
              </button>
            </div>

            <Table
              columns={columns}
              data={productsList}
              pagination={pagination}
              onPageChange={(page) => setCurrentPage(page)}
              currentPage={currentPage}
              itemsPerPage={pagination.itemsPerPage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default isAuth(Employees);
