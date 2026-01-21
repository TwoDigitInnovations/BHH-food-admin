import React, { useMemo, useState, useEffect, useContext } from "react";
import Table from "@/components/table";
import { FiEye, FiCheck, FiX, FiDownload } from "react-icons/fi";
import { Api } from "@/services/service";
import { useRouter } from "next/router";
import Swal from "sweetalert2";
import { userContext } from "./_app";
import isAuth from "@/components/isAuth";
import moment from "moment";

function DocumentVerification(props) {
  const router = useRouter();
  const [usersList, setUsersList] = useState([]);
  const [user, setUser] = useContext(userContext);
  const [currentPage, setCurrentPage] = useState(1);
  const [showPendingOnly, setShowPendingOnly] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pagination, setPagination] = useState({
    totalPages: 1,
    currentPage: 1,
    itemsPerPage: 10,
  });

  useEffect(() => {
    if (user?._id) {
      if (showPendingOnly) {
        getPendingDocuments(currentPage);
      } else {
        getAllUsersWithDocuments(currentPage);
      }
    }
  }, [user, currentPage, showPendingOnly]);

  const getPendingDocuments = async (page = 1, limit = 10) => {
    props.loader(true);
    let url = `getPendingDocuments?page=${page}&limit=${limit}`;

    Api("get", url, router).then(
      (res) => {
        props.loader(false);
        setUsersList(res.data);
        setPagination(res?.pagination);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const getAllUsersWithDocuments = async (page = 1, limit = 10) => {
    props.loader(true);
    let url = `getAllUsersWithDocuments?page=${page}&limit=${limit}`;

    Api("get", url, router).then(
      (res) => {
        props.loader(false);
        setUsersList(res.data);
        setPagination(res?.pagination);
      },
      (err) => {
        props.loader(false);
        console.log(err);
        props.toaster({ type: "error", message: err?.message });
      }
    );
  };

  const verifyDocument = (userId, verified, userName) => {
    const action = verified ? "Approve" : "Reject";
    const message = verified 
      ? `Are you sure you want to approve ${userName}'s document?`
      : `Are you sure you want to reject ${userName}'s document?`;

    Swal.fire({
      text: message,
      showCancelButton: true,
      cancelButtonColor: "#6c757d",
      confirmButtonColor: verified ? "#28a745" : "#dc3545",
      confirmButtonText: action,
      width: "400px"
    }).then(function (result) {
      if (result.isConfirmed) {
        const data = {
          userId,
          verified
        };

        Api("post", "verifyDocument", data, router).then(
          (res) => {
            props.loader(false);
            if (res?.status) {
              // Refresh the current view
              if (showPendingOnly) {
                getPendingDocuments(currentPage);
              } else {
                getAllUsersWithDocuments(currentPage);
              }
              props.toaster({ 
                type: "success", 
                message: `Document ${verified ? 'approved' : 'rejected'} successfully` 
              });
              setShowModal(false); // Close modal after action
            } else {
              props.toaster({ type: "error", message: res?.message });
            }
          },
          (err) => {
            props.loader(false);
            console.log(err);
            props.toaster({ type: "error", message: err?.message });
          }
        );
      }
    });
  };

  const viewDocument = (userRow) => {
    setSelectedUser(userRow);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const downloadDocument = (documentUrl) => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    } else {
      props.toaster({ type: "error", message: "Document not available" });
    }
  };

  const index = ({ value, row }) => {
    return (
      <div className="p-4 flex items-center justify-center">
        {value}
      </div>
    );
  };

  const userName = ({ value, row }) => {
    return (
      <div className="p-4 flex flex-col items-center justify-center">
        <span className="font-medium text-gray-900">{value}</span>
        <span className="text-sm text-gray-500">{row.original.lastname}</span>
      </div>
    );
  };

  const userEmail = ({ value }) => {
    return (
      <div className="p-4 flex items-center justify-center">
        <span className="text-sm text-gray-700">{value}</span>
      </div>
    );
  };

  const userPhone = ({ value }) => {
    return (
      <div className="p-4 flex items-center justify-center">
        <span className="text-sm text-gray-700">{value}</span>
      </div>
    );
  };

  const registrationDate = ({ value }) => {
    return (
      <div className="p-4 flex items-center justify-center">
        <span className="text-sm text-gray-700">
          {moment(value).format("DD/MM/YYYY")}
        </span>
      </div>
    );
  };

  const documentStatus = ({ row }) => {
    const isVerified = row.original.documentVerified;
    return (
      <div className="p-4 flex items-center justify-center">
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          isVerified 
            ? 'bg-green-100 text-green-800' 
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isVerified ? 'Verified' : 'Pending Review'}
        </span>
      </div>
    );
  };

  const actions = ({ row }) => {
    return (
      <div className="p-4 flex items-center justify-center gap-2">
        <button
          onClick={() => viewDocument(row.original)}
          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
          title="View Document"
        >
          <FiEye size={16} />
        </button>
      </div>
    );
  };

  const columns = useMemo(
    () => [
      {
        Header: "S.No",
        accessor: "indexNo",
        Cell: index,
      },
      {
        Header: "Name",
        accessor: "username",
        Cell: userName,
      },
      {
        Header: "Email",
        accessor: "email",
        Cell: userEmail,
      },
      {
        Header: "Phone",
        accessor: "number",
        Cell: userPhone,
      },
      {
        Header: "Registration Date",
        accessor: "createdAt",
        Cell: registrationDate,
      },
      {
        Header: "Status",
        accessor: "documentVerified",
        Cell: documentStatus,
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: actions,
      },
    ],
    []
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Document Verification
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Review and verify user submitted documents
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPendingOnly(true)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      showPendingOnly 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Pending Only
                  </button>
                  <button
                    onClick={() => setShowPendingOnly(false)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      !showPendingOnly 
                        ? 'bg-orange-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    All Users
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  Total: {pagination.totalItems || 0} users {showPendingOnly ? 'pending verification' : 'with documents'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-6">
            {usersList.length > 0 ? (
              <>
                <Table
                  columns={columns}
                  data={usersList}
                  pagination={pagination}
                  onPageChange={handlePageChange}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">
                  {showPendingOnly ? 'No pending documents found' : 'No users with documents found'}
                </div>
                <p className="text-gray-500 text-sm">
                  {showPendingOnly ? 'All user documents have been reviewed' : 'No users have uploaded documents yet'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Document Viewer Modal */}
        {showModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Document Verification - {selectedUser.username} {selectedUser.lastname}
                  </h2>
                  <p className="text-sm text-gray-600">
                    Email: {selectedUser.email} | Phone: {selectedUser.number}
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="text-center">
                  {selectedUser.document ? (
                    <div className="space-y-4">
                      {/* Document Preview */}
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                        {selectedUser.document.toLowerCase().includes('.pdf') ? (
                          <div className="text-center">
                            <div className="text-6xl text-red-500 mb-4">📄</div>
                            <p className="text-gray-600 mb-4">PDF Document</p>
                            <button
                              onClick={() => downloadDocument(selectedUser.document)}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              <FiDownload size={16} />
                              View PDF
                            </button>
                          </div>
                        ) : (
                          <img
                            src={selectedUser.document}
                            alt="Document"
                            className="max-w-full max-h-96 mx-auto rounded-lg shadow-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'block';
                            }}
                          />
                        )}
                        <div style={{ display: 'none' }} className="text-center">
                          <div className="text-6xl text-gray-400 mb-4">📄</div>
                          <p className="text-gray-600 mb-4">Document Preview Not Available</p>
                          <button
                            onClick={() => downloadDocument(selectedUser.document)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            <FiDownload size={16} />
                            Download Document
                          </button>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Registration Date:</span>
                            <p className="text-gray-600">{moment(selectedUser.createdAt).format("DD/MM/YYYY HH:mm")}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-700">Current Status:</span>
                            <p className={`inline-block px-2 py-1 text-xs font-medium rounded-full ml-2 ${
                              selectedUser.documentVerified 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {selectedUser.documentVerified ? 'Verified' : 'Pending Review'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">
                      <div className="text-6xl mb-4">📄</div>
                      <p>No document available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadDocument(selectedUser.document)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    disabled={!selectedUser.document}
                  >
                    <FiDownload size={16} />
                    Download
                  </button>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-600 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  {!selectedUser.documentVerified ? (
                    <>
                      <button
                        onClick={() => verifyDocument(selectedUser._id, false, selectedUser.username)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <FiX size={16} />
                        Reject
                      </button>
                      <button
                        onClick={() => verifyDocument(selectedUser._id, true, selectedUser.username)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <FiCheck size={16} />
                        Approve
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => verifyDocument(selectedUser._id, false, selectedUser.username)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <FiX size={16} />
                      Revoke Verification
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default isAuth(DocumentVerification);