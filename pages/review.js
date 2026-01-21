import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  Calendar,
  Filter,
  X,
  Eye,
  Star,
  StarHalf,
  User,
  Clock,
  Package,
  Delete,
  Image as ImageIcon,
  ZoomIn,
} from "lucide-react";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import Swal from "sweetalert2";

function Queries(props) {
  const [queries, setQueries] = useState([]);
  const [viewPopup, setViewPopup] = useState(false);
  const [popupData, setPopupData] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [sampleReviews, setSampleReviews] = useState([]);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const router = useRouter();

  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  });

  const primaryColor = "#F38529";

  const getAllQuries = async (page = 1, limit = 10) => {
    const data = {};

    props.loader(true);
    Api("post", `getReview?page=${page}&limit=${limit}`, data, router).then(
      (res) => {
        props.loader(false);
        console.log(res);
        setSampleReviews(res.data);
        setPagination({
          totalPages: 1,
          currentPage: 1,
          itemsPerPage: 10,
        });
        if (res?.status) {
        } else {
          console.log(res?.data?.message);
          props.toaster({ type: "error", message: res?.data?.message });
        }
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.data?.message });
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  useEffect(() => {
    getAllQuries();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    if (diffInHours < 48) return "1 day ago";
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  const handleViewDetails = (review) => {
    setPopupData(review);
    setViewPopup(true);
  };

  const handleSearch = () => {
    console.log("Search triggered with date:", selectedDate);
  };

  const handleReset = () => {
    setSelectedDate("");
    getAllQuries();
  };

  const handleImageView = (imageSrc) => {
    setCurrentImage(imageSrc);
    setImageViewerOpen(true);
  };

  const ReviewCard = ({ review }) => (
    <div className="w-full h-auto bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="md:p-4 p-2 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex md:flex-row flex-col gap-4 justify-between items-start mb-2">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center shadow-md">
              <User size={24} className="text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                {review.posted_by?.username} {review.posted_by?.lastname || ""}
              </h3>
              <div className="text-sm text-gray-500 flex items-center">
                <Clock size={14} className="mr-1" />
                {formatDate(review?.updatedAt)}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-white px-3 py-2 md:rounded-full rounded-2xl shadow-sm ">
            {/* <Package size={16} className="text-orange-500" /> */}
            <span className="text-xs text-gray-600 font-medium">
              {review?.product?.name}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-4">
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
            {review?.description}
          </p>
        </div>

        {/* Images Section */}
        {review?.images && review?.images?.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <ImageIcon size={16} className="text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                Review Images ({review?.images?.length})
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {review.images.map((image, index) => (
                <div
                  key={index}
                  className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer group border-2 border-gray-200 hover:border-orange-300 transition-all duration-200"
                  onClick={() => handleImageView(image)}
                >
                  <img
                    src={image}
                    alt={`Review image ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <ZoomIn
                      size={16}
                      className="text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    />
                  </div>
                </div>
              ))}
              {/* {review.images.length > 3 && (
                <div className="w-20 h-20 rounded-lg border-2 border-gray-300 border-dashed flex items-center justify-center cursor-pointer hover:border-orange-400 transition-colors">
                  <span className="text-xs text-gray-500 font-medium">
                    +{review.images.length - 3}
                  </span>
                </div>
              )} */}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => handleViewDetails(review)}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-white rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-102"
            style={{ backgroundColor: primaryColor }}
          >
            <Eye size={16} />
            <span>View Details</span>
          </button>
          <button
            onClick={() => deleteProduct(review._id)}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-white bg-red-500 rounded-lg transition-all duration-200 hover:bg-red-600 hover:shadow-md transform hover:scale-103"
          >
            <Delete size={16} />
            <span>Delete</span>
          </button>
        </div>
      </div>
    </div>
  );

  const deleteProduct = (_id) => {
    Swal.fire({
      title: "",
      text: "Are you sure? You want to delete this Review?",
      showCancelButton: true,
      cancelButtonColor: "#F38529",
      confirmButtonColor: "#F38529",
      confirmButtonText: "Delete",
      width: "350px",
    }).then(function (result) {
      if (result.isConfirmed) {
        const data = {
          _id,
        };
        props.loader(true);
        Api("delete", `deleteReview/${_id}`, data, router).then(
          (res) => {
            console.log("res================>", res.data?.meaasge);
            props.loader(false);
            props.toaster({
              type: "success",
              message: "Review deleted successfully",
            });
            if (res?.status) {
              getAllQuries();
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

  return (
    <section className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 p-6 overflow-y-scroll scrollbar-hide overflow-scroll pb-28">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-gray-900 font-bold text-3xl bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text ">
          Customer Reviews
        </h1>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-lg flex items-center justify-center mr-3">
              <Filter size={18} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Search & Filter
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date Filter */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200 text-gray-700"
                />
                <Calendar
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-end space-x-3">
              <button
                onClick={handleSearch}
                className="flex items-center justify-center px-6 py-3 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                style={{ backgroundColor: primaryColor }}
              >
                <Search size={18} className="mr-2" />
                Search
              </button>

              <button
                onClick={handleReset}
                className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 hover:shadow-md transform hover:scale-105"
              >
                <X size={18} className="mr-2" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Grid */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 md:p-6 p-3">
        {isLoading ? (
          <div className="flex justify-center items-center p-20">
            <div className="relative">
              <div
                className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4"
                style={{ borderColor: primaryColor }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-orange-100 rounded-full"></div>
              </div>
            </div>
          </div>
        ) : sampleReviews.length === 0 ? (
          <div className="flex flex-col justify-center items-center p-20 text-center">
            <div className="w-32 h-32 mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-full flex items-center justify-center shadow-lg">
              <Package size={48} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No reviews found
            </h3>
            <p className="text-gray-500 max-w-md">
              Try adjusting your filters or search terms to find customer
              reviews
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 md:gap-6 gap-3">
            {sampleReviews.map((review) => (
              <ReviewCard key={review._id} review={review} />
            ))}
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      {imageViewerOpen && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setImageViewerOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full transition-all duration-200 z-10"
            >
              <X size={24} className="text-orange-600" />
            </button>
            <img
              src={currentImage}
              alt="Review image"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}

      {/* View Details Popup */}
      {viewPopup && (
        <div className="fixed inset-0 bg-black/80 bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-full overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  Review Details
                </h2>
                <button
                  onClick={() => setViewPopup(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <User size={20} className="mr-2 text-blue-600" />
                    Customer Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Name:</span>{" "}
                      {popupData.posted_by?.username}{" "}
                      {popupData.posted_by?.lastname || ""}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Email:</span>{" "}
                      {popupData.posted_by?.email}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Phone:</span>{" "}
                      {popupData.posted_by?.number}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Review Date:</span>{" "}
                      {new Date(popupData.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {popupData.updatedAt !== popupData.createdAt && (
                    <p className="text-sm text-gray-600 mt-2">
                      <span className="font-medium">Last Updated:</span>{" "}
                      {new Date(popupData.updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Product Info */}
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-100">
                  <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                    <Package size={20} className="mr-2 text-orange-600" />
                    Product Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Product Name:</span>{" "}
                      {popupData.product?.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Category:</span>{" "}
                      {popupData.product?.categoryName}
                    </p>
                    {popupData.product?.price_slot?.[0]?.other_price && (
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Price:</span>{" "}
                        {popupData.product.price_slot[0].other_price}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Offer Price:</span>{" "}
                      {popupData.product?.price_slot?.[0]?.our_price}
                    </p>
                  </div>
                </div>

                {/* Review Content */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Review Content
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {popupData?.description}
                  </p>
                </div>

                {/* Review Images */}
                {popupData.images && popupData.images.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                      <ImageIcon size={20} className="mr-2 text-gray-600" />
                      Review Images ({popupData.images.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {popupData.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden cursor-pointer group border-2 border-gray-200 hover:border-orange-300 transition-all duration-200"
                          onClick={() => {
                            setViewPopup(false);
                            handleImageView(image);
                          }}
                        >
                          <img
                            src={image}
                            alt={`Review image ${index + 1}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                          <div className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                            <ZoomIn
                              size={20}
                              className="text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setViewPopup(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 hover:shadow-md transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Queries;
