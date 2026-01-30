import React, { useMemo, useState, useEffect, useContext } from "react";
import Table from "@/components/table";
import { Api, FileDownloadApi } from "@/services/service";
import { useRouter } from "next/router";
import { userContext } from "./_app";
import isAuth from "@/components/isAuth";
import { indexID } from "@/components/reported/customTableAct";
import { Search, Filter, Mail, User, Calendar, ShoppingBag, DollarSign, Phone, X } from "lucide-react";
import Swal from "sweetalert2";

function CustomerDashboard(props) {
    const router = useRouter();
    const [user, setUser] = useContext(userContext);

    const [allUsers, setAllUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        totalPages: 1,
        currentPage: 1,
        itemsPerPage: 10,
    });
    const [subject, setSubject] = useState('')

    // Message modal state
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isBulkMessageModalOpen, setIsBulkMessageModalOpen] = useState(false);
    const [messageText, setMessageText] = useState("");
    const [templateId, setTemplateId] = useState("");
    const [selectedCustomer, setSelectedCustomer] = useState(null);

    // Dashboard modal state
    const [isDashboardModalOpen, setIsDashboardModalOpen] = useState(false);
    const [selectedCustomerEmail, setSelectedCustomerEmail] = useState('');
    const [customerDashboardData, setCustomerDashboardData] = useState({
        username: '',
        lastname: '',
        email: '',
        profileImage: '',
        ordersYear: 0,
        ordersMonth: 0,
        spentYear: '0.00',
        spentMonth: '0.00',
        recentOrders: []
    });

    // Dashboard filters
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());
    const [dashboardLoading, setDashboardLoading] = useState(false);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);


    useEffect(() => {
        getAllUsers(currentPage, pagination.itemsPerPage);
    }, [currentPage, pagination.itemsPerPage]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchTerm?.trim()) {
                getAllUsers(1, 10, searchTerm);
            } else {
                getAllUsers(1, 10);
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchTerm]);


    useEffect(() => {
        if (isDashboardModalOpen && selectedCustomerEmail) {
            fetchCustomerDashboardData();
        }
    }, [isDashboardModalOpen, selectedCustomerEmail, selectedYear, selectedMonth]);

    const getAllUsers = async (page = 1, limit = 10, searchTerm) => {
        props.loader(true);
        try {
            let query = `getuserlist?page=${page}&limit=${limit}&type=USER`;
            if (searchTerm && searchTerm.trim() !== "") {
                query += `&searchTerm=${encodeURIComponent(searchTerm.trim())}`;
            }

            const res = await Api(
                "get",
                query,
                "",
                router
            );

            if (res?.status) {
                setAllUsers(res?.data || []);
                // setAllUsersData(res?.data || []);
                setPagination({
                    totalPages: res?.pagination?.totalPages,
                    currentPage: res?.pagination?.currentPage,
                    itemsPerPage: res?.pagination?.itemsPerPage,
                });
                setCurrentPage(res?.pagination?.currentPage);
            } else {
                props.toaster({
                    type: "error",
                    message: res?.data?.message || "Failed to fetch users",
                });
            }
        } catch (err) {
            console.error("Error fetching users:", err);
            props.toaster({
                type: "error",
                message: err?.message || "An error occurred while fetching users",
            });
        } finally {
            props.loader(false);
        }
    };

    console.log(currentPage);
    console.log(pagination);

    // const getAllUsersForBulkMessage = async () => {
    //     props.loader(true);
    //     try {
    //         const res = await Api("post", `getuserlist`, { type: "USER" }, router);
    //         if (res?.status) {

    //             setPagination({
    //                 totalPages: res?.data?.pagination?.totalPages || 1,
    //                 currentPage: res?.data?.pagination?.currentPage || 1,
    //                 itemsPerPage: res?.data?.pagination?.itemsPerPage || 10,
    //             });
    //         } else {
    //             props.toaster({ type: "error", message: res?.data?.message || "Failed to fetch users for bulk message" });
    //         }
    //     } catch (err) {
    //         console.error("Error fetching users for bulk message:", err);
    //         props.toaster({ type: "error", message: err?.message || "An error occurred" });
    //     } finally {
    //         props.loader(false);
    //     }
    // };

    const fetchCustomerDashboardData = async () => {
        if (!selectedCustomerEmail) return;

        setDashboardLoading(true);
        try {
            const data = {
                email: selectedCustomerEmail,
                year: parseInt(selectedYear),
                month: parseInt(selectedMonth)
            };

            const response = await Api('post', '/getCustomerDashboard', data, router);
            setCustomerDashboardData(response?.data);
            console.log(response.data)
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            props.toaster({
                type: 'error',
                message: error?.message || 'Failed to fetch customer data'
            });
        } finally {
            setDashboardLoading(false);
        }
    };

    const renderUserName = ({ row }) => (
        <div className="p-2 flex items-center">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                {`${row.original.username?.charAt(0).toUpperCase() || 'U'}${row.original.lastname?.charAt(0).toUpperCase() || 'T'}`}
            </div>
            <div className="ml-3">
                <p className="text-gray-800 font-medium">{row.original.username} {row.original.lastname}</p>
            </div>
        </div>
    );

    const renderEmail = ({ value }) => (
        <div className="p-3">
            <p className="text-gray-600">{value}</p>
        </div>
    );

    const renderPhoneNumber = ({ value }) => (
        <div className="p-3">
            <p className="text-gray-600">{value || "N/A"}</p>
        </div>
    );

    const renderMessageAction = ({ row }) => (
        <div className="p-2">
            <button
                onClick={() => openMessageModal(row.original)}
                className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer"
            >
                <Mail size={18} />
                <span className="text-[16px] m-1">Message</span>
            </button>
        </div>
    );

    const renderStatusAction = ({ row }) => (
        <div className="p-2">
            <button
                onClick={() => toggleUserStatus(row.original._id, row.original.status)}
                className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer"
            >
                <span className="text-[16px] m-1">{row.original.status}</span>
            </button>
        </div>
    );

    const renderDashboardAction = ({ row }) => (
        <div className="p-2">
            <button
                onClick={() => openCustomerDashboard(row?.original?.email)}
                className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-600 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer"
            >
                <span className="text-[16px] m-1">View</span>
            </button>
        </div>
    );

    const openMessageModal = (customer) => {
        setSelectedCustomer(customer);
        setIsMessageModalOpen(true);
        setMessageText("");
    };

    const closeMessageModal = () => {
        setIsMessageModalOpen(false);
        setSelectedCustomer(null);
        setMessageText("");
        setTemplateId('')
        setSubject('')
    };

    const openBulkMessageModal = () => {
        setIsBulkMessageModalOpen(true);
        setMessageText("");
    };

    const closeBulkMessageModal = () => {
        setIsBulkMessageModalOpen(false);
        setMessageText("");
        setTemplateId('');
        setSubject('')
    };

    const openCustomerDashboard = (customerEmail) => {
        setSelectedCustomerEmail(customerEmail);
        setIsDashboardModalOpen(true);
    };

    const closeDashboard = () => {
        setIsDashboardModalOpen(false);
        setSelectedCustomerEmail('');
        setCustomerDashboardData({
            username: '',
            lastname: '',
            email: '',
            profileImage: '',
            ordersYear: 0,
            ordersMonth: 0,
            spentYear: '0.00',
            spentMonth: '0.00',
            recentOrders: []
        });
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!subject.trim()) {
            props.toaster({ type: "error", message: "Subject is required" });
            return;
        }

        if (!messageText.trim() && !templateId.trim()) {
            props.toaster({ type: "error", message: "Both fields should not empty" });
            return;
        }

        if (!selectedCustomer) {
            props.toaster({ type: "error", message: "No customer selected" });
            return;
        }

        const data = {
            email: selectedCustomer.email,
            message: messageText.trim(),
            templateId: templateId.trim(),
            subject: subject.trim()
        };

        props.loader(true);
        Api("post", 'sendmessage', data, router)
            .then((res) => {
                if (res?.status) {
                    props.toaster({
                        type: "success",
                        message: `Message sent to ${selectedCustomer.username}`
                    });
                    closeMessageModal();
                } else {
                    props.toaster({
                        type: "error",
                        message: res?.message || "Failed to send message"
                    });
                }
            })
            .catch((err) => {
                console.error("Error sending message:", err);
                props.toaster({ type: "error", message: err?.message || "Failed to send message" });
            })
            .finally(() => {
                props.loader(false);
            });
    };

    const handleSendBulkMessage = () => {
        if (!subject.trim()) {
            props.toaster({ type: "error", message: "Subject is required" });
            return;
        }
        if (!messageText.trim() && !templateId.trim()) {
            props.toaster({ type: "error", message: "Both fields should not empty" });
            return;
        }

        const data = {
            message: messageText.trim(),
            templateId: templateId.trim(),
            subject: subject.trim()
        };

        props.loader(true);
        Api("post", 'BulkMessage', data, router)
            .then((res) => {
                if (res?.status) {
                    props.toaster({
                        type: "success",
                        message: res.data.message || "message Send"
                    });
                    closeBulkMessageModal();
                } else {
                    props.toaster({
                        type: "error",
                        message: res?.data?.message || "Failed to send bulk message"
                    });
                }
            })
            .catch((err) => {
                console.error("Error sending bulk message:", err);
                props.toaster({ type: "error", message: err?.message || "Failed to send bulk message" });
            })
            .finally(() => {
                props.loader(false);
            });
    };

    const toggleUserStatus = (userId, currentStatus) => {
        const action = currentStatus === "Suspended" ? "Activate" : "Suspend";
        const confirmationText = `Are you sure you want to ${action.toLowerCase()} this user?`;
        const successText = `User ${action.toLowerCase()}d successfully`;

        Swal.fire({
            text: confirmationText,
            showCancelButton: true,
            confirmButtonColor: "#F38529",
            cancelButtonColor: "#d33",
            confirmButtonText: `Yes, ${action} user`,
            width: "350px"
        }).then((result) => {
            if (result.isConfirmed) {
                const data = { userId };

                props.loader(true);
                Api("post", 'suspendUser', data, router)
                    .then((res) => {
                        if (res?.status) {
                            props.toaster({ type: "success", message: successText });
                            getAllUsers(currentPage, pagination.itemsPerPage);
                        } else {
                            props.toaster({
                                type: "error",
                                message: res?.message || "Failed to update user status"
                            });
                        }
                    })
                    .catch((err) => {
                        console.error("Error updating user status:", err);
                        props.toaster({ type: "error", message: err?.message || "Failed to update user status" });
                    })
                    .finally(() => {
                        props.loader(false);
                    });
            }
        });
    };

    const columns = useMemo(() => [
        {
            Header: "Sr.No",
            Cell: indexID,
            width: "70px",
        },
        {
            Header: "Name",
            Cell: renderUserName,
        },
        {
            Header: "Email",
            accessor: "email",
            Cell: renderEmail,
        },
        {
            Header: "Mobile No.",
            accessor: "number",
            Cell: renderPhoneNumber,
        },
        {
            Header: "Action",
            Cell: renderMessageAction,
        },
        {
            Header: "Status",
            Cell: renderStatusAction
        },
        {
            Header: "Dashboard",
            Cell: renderDashboardAction
        }
    ], []);

    const DownloadExcelFile = async () => {
        try {
            props.loader(true);
            const blob = await FileDownloadApi("get", "downloadCustomerExcel");
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "customer.xlsx";
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
            props.toaster("Customer Details Excel File Downloaded")
            props.loader(false)
        } catch (error) {
            console.error(error);
            alert("Failed to download Excel file");
        }
    };

    return (
        <div className="w-full h-full bg-gray-50 p-6 overflow-y-scroll scrollbar-hide overflow-scroll pb-28">
            <div className="mb-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-gray-800 font-bold text-2xl mb-6">
                        Customer Dashboard
                    </h1>
                    <button className="text-white text-md font-semibold bg-[#F38529] cursor-pointer px-4 rounded-md py-2"
                        onClick={DownloadExcelFile}
                    > Download Excel File</button>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-4">
                    <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="relative flex-grow">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5 focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none"
                                type="text"
                                placeholder="Search by name or email"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                className="inline-flex items-center px-4 py-2.5 bg-[#F38529] text-white rounded-lg hover:bg-orange-600"
                                onClick={openBulkMessageModal}
                            >
                                <Mail className="h-4 w-4 mr-2" />
                                <span>Bulk Message</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-lg font-medium text-gray-800">All Customers</h2>
                    <p className="text-sm text-gray-500">Send messages to customers or update their status (Suspend/Active)</p>
                </div>

                <div className="overflow-auto p-4">
                    <Table
                        columns={columns}
                        data={allUsers}
                        pagination={pagination}
                        onPageChange={(page) => setCurrentPage(page)}
                        currentPage={currentPage}
                        itemsPerPage={pagination?.itemsPerPage}
                        setPagination={setPagination}
                    />
                </div>
            </div>


            {isMessageModalOpen && selectedCustomer && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="text-lg font-medium text-gray-800">
                                Send Message
                            </h3>
                            <button
                                onClick={closeMessageModal}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4">
                            <div className="mb-4">
                                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                    <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                                        {`${selectedCustomer.username?.charAt(0).toUpperCase() || ''}${selectedCustomer.lastname?.charAt(0).toUpperCase() || ''}`}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{selectedCustomer.username} {selectedCustomer.lastname || ""}</p>
                                        <p className="text-sm text-gray-500">{selectedCustomer.email}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subject
                                </label>
                                <input

                                    value={subject}
                                    onChange={(e) => { setSubject(e.target.value) }}
                                    placeholder="Type your subject here..."
                                    className="w-full p-3 border border-gray-200 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none resize-none"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Your Message
                                </label>
                                <textarea
                                    rows="6"
                                    value={messageText}
                                    onChange={(e) => { setMessageText(e.target.value); setTemplateId('') }}
                                    placeholder="Type your message here..."
                                    className="w-full p-3 border border-gray-200 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none resize-none"
                                />
                            </div>
                            <p className="text-black text-center">----OR-----</p>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Template ID
                                </label>
                                <input
                                    rows="6"
                                    value={templateId}
                                    onChange={(e) => { setTemplateId(e.target.value); setMessageText('') }}
                                    placeholder="Template ID"
                                    className="w-full p-3 border border-gray-200 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeMessageModal}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-[#F38529] text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 cursor-pointer"
                                >
                                    <Mail size={16} />
                                    <span>Send Message</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {isBulkMessageModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md overflow-hidden">
                        <div className="flex justify-between items-center p-4 border-b border-gray-100">
                            <h3 className="text-lg font-medium text-gray-800">
                                Send Message To All Customers
                            </h3>
                            <button
                                onClick={closeBulkMessageModal}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-4">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subject
                                </label>
                                <input

                                    value={subject}
                                    onChange={(e) => { setSubject(e.target.value) }}
                                    placeholder="Type your subject here..."
                                    className="w-full p-3 border border-gray-200 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none resize-none"
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Your Message
                                </label>
                                <textarea
                                    rows="6"
                                    value={messageText}
                                    onChange={(e) => { setMessageText(e.target.value); setTemplateId('') }}
                                    placeholder="Type your message here..."
                                    className="w-full p-3 border border-gray-200 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none resize-none"
                                />
                            </div>
                            <p className="text-black text-center">----OR-----</p>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Template ID
                                </label>
                                <input
                                    rows="6"
                                    value={templateId}
                                    onChange={(e) => { setTemplateId(e.target.value); setMessageText('') }}
                                    placeholder="Template ID"
                                    className="w-full p-3 border border-gray-200 text-gray-800 rounded-lg focus:ring-2 focus:ring-orange-400 focus:border-transparent outline-none resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    onClick={closeBulkMessageModal}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSendBulkMessage}
                                    className="px-4 py-2 bg-[#F38529] text-white rounded-lg hover:bg-orange-600 flex items-center gap-2 cursor-pointer"
                                >
                                    <Mail size={16} />
                                    <span>Send Message To All Customers</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}


            {isDashboardModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                <User className="text-[#F38529]" size={24} />
                                Customer Dashboard
                            </h3>
                            <button
                                onClick={closeDashboard}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {dashboardLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : (
                            <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                                {/* Filter Section */}
                                <div className="p-6 border-b border-gray-100 bg-gray-50">
                                    <div className="flex flex-wrap gap-4 items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Calendar size={20} className="text-gray-500" />
                                            <label htmlFor="year" className="text-sm font-medium text-gray-700">Year:</label>
                                            <select
                                                id="year"
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 text-black"
                                            >
                                                {years.map(year => (
                                                    <option key={year} value={year}>{year}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label htmlFor="month" className="text-sm font-medium text-gray-700">Month:</label>
                                            <select
                                                id="month"
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(e.target.value)}
                                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 text-black"
                                            >
                                                {months.map((month, index) => (
                                                    <option key={index} value={index + 1}>{month}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Profile Info */}
                                <div className="p-6">
                                    <div className="flex items-center gap-6 p-6 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-[#F38529]">
                                        <img
                                            src="/userprofile.png"
                                            alt="User Profile"
                                            className="w-20 h-20 rounded-full object-cover border-4 border-[#F38529] shadow-lg"
                                        />
                                        <div className="flex-1">
                                            <h4 className="text-xl font-semibold text-gray-800 mb-1">
                                                {customerDashboardData.username} {customerDashboardData.lastname}
                                            </h4>
                                            <div className="flex items-center gap-2 text-gray-600 mb-2">
                                                <Mail size={16} />
                                                <span className="text-sm">{customerDashboardData.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Grid */}
                                <div className="px-6 pb-6">
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <ShoppingBag className="text-blue-600" size={24} />
                                                <span className="text-xs text-blue-600 font-medium">YEAR</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">Orders This Year</p>
                                            <p className="text-2xl font-bold text-gray-800">{customerDashboardData.ordersYear}</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <ShoppingBag className="text-green-600" size={24} />
                                                <span className="text-xs text-green-600 font-medium">MONTH</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">Orders This Month</p>
                                            <p className="text-2xl font-bold text-gray-800">{customerDashboardData.ordersMonth}</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <DollarSign className="text-purple-600" size={24} />
                                                <span className="text-xs text-purple-600 font-medium">YEAR</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">Spent This Year</p>
                                            <p className="text-2xl font-bold text-green-600">${customerDashboardData.spentYear}</p>
                                        </div>

                                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <DollarSign className="text-orange-600" size={24} />
                                                <span className="text-xs text-orange-600 font-medium">MONTH</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">Spent This Month</p>
                                            <p className="text-2xl font-bold text-green-600">${customerDashboardData.spentMonth}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Recent Orders */}
                                {/* {customerDashboardData.recentOrders && customerDashboardData.recentOrders.length > 0 && ( */}
                                <div className="px-6 pb-6">
                                    <h5 className="text-lg font-semibold text-gray-800 mb-4">All Orders</h5>
                                    <div className="space-y-2">
                                        {customerDashboardData?.recentOrders?.map((order, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div>
                                                    <p className="font-medium text-gray-800">#{order.orderId}</p>
                                                    <p className="text-sm text-gray-500">{order.status}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-green-600">${order.amount}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(order.date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* )} */}
                            </div>
                        )}

                        {/* Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                            <button
                                type="button"
                                onClick={closeDashboard}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default isAuth(CustomerDashboard);