import React, { useEffect, useState } from 'react'
import { IoIosAdd } from "react-icons/io";
import { IoIosRemove } from "react-icons/io";
import { useRouter } from "next/router";
import { Api } from '@/services/service';
import { produce } from 'immer';
// import SelectSearch from 'react-select-search';
// import 'react-select-search/style.css'
import Barcode from "react-barcode";

function OrdersDetails(props) {
    const router = useRouter();
    console.log(router)
    const [productsId, setProductsId] = useState({});
    const [selectedImage, setSelectedImage] = useState('');
    const [selectedSize, setSelectedSize] = useState([]);
    const [cartData, setCartData] = useState([]);
    const [selecteSize, setSelecteSize] = useState({});
    const [selectedImageList, setSelectedImageList] = useState([]);
    const [fragranceList, setFragranceList] = useState([]);
    const [selectFragranceSearch, setSelectFragranceSearch] = useState([]);
    const [selectFragranceList, setSelectFragranceList] = useState([]);
    const [mainProductsData, setMainProductsData] = useState({});
    const [userAddress, setUserAddress] = useState([]);

    useEffect(() => {
        let cart = localStorage.getItem("addCartDetail");
        if (cart) {
            setCartData(JSON.parse(cart));
        }
        if (router?.query?.id) {
            getProductById()
        }
    }, [router?.query?.id])

    useEffect(() => {
        console.log(selectFragranceList)
    }, [selectFragranceList])

    const getProductById = async () => {
        props.loader(true);
        Api("get", `getProductRequest/${router?.query?.id}`, '', router).then(
            (res) => {
                props.loader(false);
                console.log("res================>", res);
                setMainProductsData(res?.data)
                const d = res.data.productDetail.find(f => f._id === router?.query?.product_id)
                console.log(d)
                setProductsId(d);
                const address = res.data.Local_address
                console.log("addresss=>-----------", address);

                setUserAddress(address)
                setSelectedImageList(d?.image)
                setSelectedImage(d.image[0])
                // setSelectedSize(res.data?.varients[0].size)
                // setSelecteSize(res.data?.varients[0].size[0])
                console.log(d?.fragrance)
                if (d?.fragrance?.length > 0) {
                    setSelectFragranceList(d?.fragrance)
                }
            },
            (err) => {
                props.loader(false);
                console.log(err);
                props.toaster({ type: "error", message: err?.message });
            }
        );
    };

    console.log("main product data ::", mainProductsData);


    const imageOnError = (event) => {
        event.currentTarget.src = '/default-product-image.png';
    };

    const handleBackClick = () => {
        router.push("/orders")
    };
    return (
        <>
            <section className="w-full h-full bg-[#F9F9F9] py-6 px-4 md:px-8 overflow-scroll pb-20">
                {/* Header Section */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-gray-800 font-bold text-2xl md:text-3xl">Order Details</h1>
                    <button className="bg-[#F38529] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#e07a25] transition-colors"
                        onClick={handleBackClick}
                    >
                        Back to Orders
                    </button>
                </div>

                {/* Main Content */}
                <section className='bg-white rounded-xl shadow-sm overflow-hidden'>
                    <div className="md:grid md:grid-cols-2 w-full">
                        {/* Product Image Gallery */}
                        <div className='border-b md:border-b-0 md:border-r border-gray-100'>
                            <div className='p-6'>
                                <div className='grid md:grid-cols-5 grid-cols-1 gap-4'>
                                    {/* Thumbnails */}
                                    <div className='flex flex-row md:flex-col md:space-y-4 space-x-3 md:space-x-0 overflow-x-auto md:overflow-y-auto md:h-[400px] pb-4 md:pb-0'>
                                        {selectedImageList?.map((item, i) => (
                                            <div key={i} className='flex-shrink-0'>
                                                <div
                                                    className={`cursor-pointer rounded-lg overflow-hidden hover:shadow-md transition-all duration-200 ${selectedImage === item ? 'ring-2 ring-[#F38529]' : 'ring-1 ring-gray-200'}`}
                                                    onClick={() => {
                                                        setSelectedImage(item);
                                                        imageOnError();
                                                    }}
                                                >
                                                    <img
                                                        className="w-20 h-20 md:w-full md:h-24 object-cover"
                                                        src={item || '/default-product-image.png'}
                                                        alt="Product thumbnail"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Main Image */}
                                    <div className="col-span-4 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center h-[400px]">
                                        <img
                                            className="max-h-full max-w-full object-contain"
                                            src={selectedImage || '/default-product-image.png'}
                                            onError={imageOnError}
                                            alt="Product main image"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Details */}
                        <div className='p-6 md:p-8'>
                            <div className='flex flex-col space-y-4'>
                                <h2 className='text-gray-800 text-2xl md:text-3xl font-semibold'>{productsId?.product?.name}</h2>

                                <div className='flex items-center'>
                                    <span className='text-[#F38529] text-2xl font-bold'>${selecteSize?.rate || productsId?.price}</span>
                                </div>

                                {/* Product Specs */}
                                <div className='mt-4 space-y-3'>
                                    {productsId?.color && (
                                        <div className='flex items-center'>
                                            <span className='text-gray-600 w-32'>Color:</span>
                                            <div className='flex items-center'>
                                                <span className='w-5 h-5 rounded-full mr-2 border border-gray-300' style={{ backgroundColor: productsId?.color }}></span>
                                                <span className='text-gray-800 font-medium'>{productsId?.color}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className='flex items-center'>
                                        <span className='text-gray-600 w-32'>Quantity:</span>
                                        <span className='text-gray-800 font-medium'>{productsId?.qty || 0}</span>
                                    </div>

                                    {/* <div className='flex items-center'>
                                        <span className='text-gray-600 w-32'>Shelf Life:</span>
                                        <span className='text-gray-800'>{productsId?.product?.selflife || 'Not specified'}</span>
                                    </div> */}

                                    <div className='flex items-center'>
                                        <span className='text-gray-600 w-32'>Unit:</span>
                                        <span className='text-gray-800'>{productsId?.product?.price_slot[0]?.value} {productsId?.product?.price_slot[0]?.unit}</span>
                                    </div>
                                </div>

                                {/* Product Description */}
                                <div className='mt-6'>
                                    <h3 className='text-gray-800 font-semibold mb-2'>Description</h3>
                                    <p className='text-gray-600 leading-relaxed'>{productsId?.product?.long_description}</p>
                                </div>
                                <div className='flex justify-start items-center p-2'>
                                    {productsId?.BarCode && (
                                        <div className="mt-2">
                                            <h3 className="text-[17px] text-gray-700 font-medium mb-2">Generated Barcode:</h3>
                                            <div className="bg-gray-100 p-2 rounded-md inline-block relative justify-center">
                                                <Barcode value={productsId?.BarCode} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Product Information */}
                    <div className='px-6 pb-8'>
                        <div className='bg-gray-50 rounded-xl p-6 border border-gray-100 mt-6'>
                            <h3 className='text-gray-800 font-semibold text-lg mb-4 pb-2 border-b border-gray-200'>Product Information</h3>

                            <div className='grid md:grid-cols-2 gap-6'>
                                <div>
                                    <div className='flex items-center mb-3'>
                                        <span className='text-gray-600 w-40'>Manufacturer:</span>
                                        <span className='text-gray-800'>{productsId?.product?.manufacturername || 'Not specified'}</span>
                                    </div>

                                    <div className='flex items-center mb-3'>
                                        <span className='text-gray-600 w-40'>Country of Origin:</span>
                                        <span className='text-gray-800'>{productsId?.product?.origin || 'Not specified'}</span>
                                    </div>
                                </div>
                                {userAddress?.address && (
                                    <div>
                                        <div className='flex flex-col'>
                                            <span className='text-gray-600 mb-1'>Shipping Address:</span>
                                            <span className='text-gray-800 p-3 bg-white rounded-lg border border-gray-200'>
                                                {userAddress?.address || 'Not specified'}
                                            </span>
                                        </div>
                                    </div>
                                )}

                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    {/* <div className='px-6 pb-6 flex justify-between items-center'>
                        <button className='bg-gray-100 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors'>
                            Report Issue
                        </button>

                        <button className='bg-[#F38529] text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-[#e07a25] transition-colors'>
                            Track Order
                        </button>
                    </div> */}
                </section>

                {/* Order Status Progress Bar */}
                {/* <div className='mt-8 px-4 py-6 bg-white rounded-xl shadow-sm'>
                    <h3 className='text-gray-800 font-semibold text-lg mb-6'>Order Status</h3>

                    <div className='relative'>
                        <div className='flex justify-between mb-2'>
                            <div className='text-[#F38529] font-medium'>Ordered</div>
                            <div className='text-[#F38529] font-medium'>Processing</div>
                            <div className='text-gray-400'>Shipped</div>
                            <div className='text-gray-400'>Delivered</div>
                        </div>

                        <div className='overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200'>
                            <div style={{ width: '50%' }} className='shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-[#F38529]'></div>
                        </div>
                    </div>
                </div> */}
            </section>
        </>
    )
}

export default OrdersDetails
