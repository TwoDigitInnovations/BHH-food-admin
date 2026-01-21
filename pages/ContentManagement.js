import React, { useContext, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import moment from "moment";
import { userContext } from "./_app";

const JoditEditor = dynamic(() => import("jodit-react"), { ssr: false });

function ContentManagement(props) {
  const [contentData, setContentData] = useState({
    termsAndConditions: "",
    privacy: "",
    returnPolicy: "",
    JoinTeam: "",
    HelpCenter: "",
    ProductInfo: "",
    StoreLocation: "",
    FranchiseOpportunity: "",
    id: "",
  });

  const [user] = useContext(userContext);
  const [tab, setTab] = useState("CONTENT");
  const router = useRouter();

  useEffect(() => {
    getContent();
  }, []);

  const getContent = () => {
    props.loader(true);
    Api("get", "content", router).then(
      (res) => {
        props.loader(false);
        if (res?.status && res?.data[0]) {
          const data = res.data[0];
          setContentData({
            termsAndConditions: data.termsAndConditions || "",
            privacy: data.privacy || "",
            returnPolicy: data.returnPolicy || "",
            JoinTeam: data.JoinOurDeliveryTeam || "",
            HelpCenter: data.HelpCenter || "",
            ProductInfo: data.ProductRecallInfo || "",
            FranchiseOpportunity: data.FranchiseOpportunity || "",
            StoreLocation: data.StoreLocation || "",
            id: data._id || "",
          });
        } else {
          props.toaster({
            type: "error",
            message: res?.data?.message || "Failed to fetch content",
          });
        }
      },
      (err) => {
        props.loader(false);
        props.toaster({
          type: "error",
          message: err?.data?.message || err?.message || "An error occurred",
        });
      }
    );
  };

  const updateContent = (field, apiField, confirmText) => {
    Swal.fire({
      title: "Are you sure?",
      text: confirmText,
      showCancelButton: true,
      confirmButtonColor: "#F38529",
      cancelButtonColor: "#F38529",
      confirmButtonText: "Yes, update it!",
    }).then((result) => {
      if (result.isConfirmed) {
        props.loader(true);
        const payload = {
          [apiField]: contentData[field],
          id: contentData.id,
        };

        Api("post", "content", payload, router).then(
          (res) => {
            props.loader(false);
            props.toaster({
              type: "success",
              message: res?.data?.message || "Updated successfully",
            });
          },
          (err) => {
            props.loader(false);
            props.toaster({
              type: "error",
              message:
                err?.data?.message || err?.message || "An error occurred",
            });
          }
        );
      }
    });
  };

  const handleContentChange = (field, value) => {
    setContentData((prev) => ({ ...prev, [field]: value }));
  };

  const policyConfigs = [
    {
      title: "Terms and Conditions",
      field: "termsAndConditions",
      apiField: "termsAndConditions",
      confirmText: "You want to update terms and conditions!",
    },
    {
      title: "Privacy Policy",
      field: "privacy",
      apiField: "privacy",
      confirmText: "You want to update privacy policy!",
    },
    {
      title: "Return Policy",
      field: "returnPolicy",
      apiField: "returnPolicy",
      confirmText: "You want to update return policy!",
    },
    {
      title: "Join Our Delivery Team",
      field: "JoinTeam",
      apiField: "JoinOurDeliveryTeam",
      confirmText: "You want to update Join Our Delivery Team content!",
    },
    {
      title: "Help Center",
      field: "HelpCenter",
      apiField: "HelpCenter",
      confirmText: "You want to update Help Center content!",
    },
    {
      title: "Product Recall Information",
      field: "ProductInfo",
      apiField: "ProductRecallInfo",
      confirmText: "You want to update Product Recall Information content!",
    },
    {
      title: "Store Location",
      field: "StoreLocation",
      apiField: "StoreLocation",
      confirmText: "You want to update Store Location content!",
    },
    {
      title: "Franchise Opportunity",
      field: "FranchiseOpportunity",
      apiField: "FranchiseOpportunity",
      confirmText: "You want to update Franchise Opportunity content!",
    },
  ];

  return (
    <div className="w-full mx-auto p-4 bg-gray-50 mt-6 px-8">
     
      <div className="max-h-[80vh] h-full overflow-y-scroll  scrollbar-hide overflow-scroll pb-20 ">
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="p-6 border-l-4 border-[#F38529] flex flex-col md:flex-row items-center justify-between">
            <div className="w-full text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-500 font-medium">
                {moment(new Date()).format("dddd, DD MMM YYYY")}
              </p>
              <h2 className="text-2xl md:text-3xl text-black font-bold mt-1">
                Welcome,{" "}
                <span className="text-[#F38529]">{user?.type || "Admin"}</span>
              </h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                className={`py-2 px-6 rounded-lg transition-all duration-300 font-medium ${
                  tab === "CONTENT"
                    ? "bg-[#F38529] text-white shadow-lg shadow-orange-200"
                    : "bg-white border-2 text-[#F38529] border-[#F38529] hover:bg-orange-50"
                }`}
                onClick={() => setTab("CONTENT")}
              >
                Content Management
              </button>
            </div>
          </div>
        </div>
        {policyConfigs.map((config, index) => (
          <PolicySection
            key={config.field}
            title={config.title}
            value={contentData[config.field]}
            onChange={(newContent) =>
              handleContentChange(config.field, newContent)
            }
            onSubmit={() =>
              updateContent(config.field, config.apiField, config.confirmText)
            }
            isLast={index === policyConfigs.length - 1}
          />
        ))}
      </div>
    </div>
  );
}

const PolicySection = ({
  title,
  value,
  onChange,
  onSubmit,
  isLast = false,
}) => {
  return (
    <div className={`mb-${isLast ? "20" : "8"}`}>
      <div className="bg-white rounded-t-xl shadow-md">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-xl text-black md:text-2xl font-bold flex items-center">
            <span className="inline-block w-3 h-8 bg-[#F38529] mr-3 rounded text-black"></span>
            {title}
          </h3>
        </div>

        <div className="p-4 md:p-6">
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#F38529] to-orange-400 h-2"></div>

            <div className="p-1 text-black">
              <JoditEditor
                className="editor text-black"
                rows={8}
                value={value}
                onChange={onChange}
                config={{
                  height: 400,
                  toolbarAdaptive: false,
                  buttons: [
                    "bold",
                    "italic",
                    "underline",
                    "ul",
                    "ol",
                    "font",
                    "fontsize",
                    "paragraph",
                    "link",
                    "table",
                    "image",
                    "hr",
                    "source",
                  ],
                }}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={onSubmit}
              className="flex items-center gap-2 bg-[#F38529] hover:bg-orange-600 text-white font-medium py-2 px-6 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Update
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentManagement;
