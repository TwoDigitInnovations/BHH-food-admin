import React, { useEffect, useState } from 'react'
import { AiOutlineArrowDown, AiOutlineArrowUp } from 'react-icons/ai'
import { BsChevronDown } from 'react-icons/bs'
import { MdOutlineAdd } from 'react-icons/md'
import { useRouter } from 'next/router'
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin2Fill } from "react-icons/ri";
import { Api } from "../services/service"

const FAQ = ({ props }) => {
    const [open, setOpen] = useState(0)
    const [createFAQ, setCreatFAQ] = useState(false)
    const [faq, setFaq] = useState([])
    const [newFAQ, setNewFAQ] = useState({
        question: '',
        answer: ""
    })
    const [singleFaq, setSigleFaq] = useState({})
    const router = useRouter();

    const getFAQ = () => {
        props.loader(true);
        Api("get", "faq", '', router).then(
            (res) => {
                console.log("res================>", res.data);
                props.loader(false);

                if (res?.status) {
                    setFaq(res.data)
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

    const deleteFAQ = (item) => {
        props.loader(true);

        if (!item?._id) {
            props.toaster({ type: "error", message: "Invalid FAQ ID" });
            return;
        }

        Api("delete", `deletefaq/${item._id}`, '', router).then(
            (res) => {
                console.log("res================>", res.data);
                props.loader(false);

                if (res?.status) {
                    props.toaster({ type: "success", message: res?.data?.message });
                    getFAQ()
                   
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

    const submit = () => {
        if (!newFAQ.question || !newFAQ.answer) {
            props.toaster({ type: "error", message: "Missing credentials" });
            return
        }
        props.loader(true)
        let url = singleFaq?._id ? `updatefaq/${singleFaq?._id}` : 'faq'

        Api("post", url, newFAQ, router).then(
            (res) => {
                console.log("res================>", res.data);
                props.loader(false);

                if (res?.status) {
                    getFAQ()
                    props.toaster({ type: "success", message: res?.data?.message });
                    setNewFAQ({
                        question: '',
                        answer: ""
                    })
                    setCreatFAQ(false);
                    setSigleFaq({})
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

    }

    useEffect(() => {
        getFAQ();
    }, [])
    return (
        <div className='w-full h-[75vh] overflow-y-auto pb-48 pt-2'>
            {
                createFAQ &&
                <div className={` z-50 fixed right-10 bottom-20 shadow-2xl w-[300px]  md:w-[350px] max-h-[550px] bg-white rounded-xl overflow-hidden `}>
                    <div className='p-4 bg-custom-darkpurple text-white text-2xl'>
                        <p>{`${singleFaq?._id ? 'Update' : 'Create'} FAQ`}</p>
                    </div>
                    <div className='p-3 w-full space-y-2'>
                        <p>Question</p>
                        <div className='w-full border-2 border-custom-darkpurple rounded-sm'>
                            <textarea type="text" value={newFAQ.question} className='w-full rounded-sm border-none outline-none p-2' placeholder='Question'
                                onChange={(e) => setNewFAQ({ ...newFAQ, question: e.target.value })} />
                        </div>
                        <p>Answer</p>
                        <div className='w-full border-2 border-custom-darkpurple rounded-sm'>
                            <textarea type="text" value={newFAQ.answer} className='w-full rounded-sm border-none outline-none p-2' placeholder='Answer'
                                onChange={(e) => setNewFAQ({ ...newFAQ, answer: e.target.value })} />
                        </div>
                        <button className=' py-2 px-6 text-white bg-custom-darkpurple rounded-md mx-auto w-full ' onClick={submit}> {`${singleFaq?._id ? 'UPDATE' : 'CREATE'}`}</button>
                    </div>
                </div>
            }

            <div
                className=' cursor-pointer fixed bottom-3 right-10 w-16 h-16 bg-custom-yellow text-[#0372F6] text-2xl p-3 rounded-full'
                onClick={() => setCreatFAQ(!createFAQ)}>
                {
                    createFAQ ?
                       <div className='w-12 h-12 bg-custom-darkpurple rounded-full p-3'> <BsChevronDown className='w-full h-full font-bold text-white' /></div>
                    
                        :
                        <div className='w-12 h-12 bg-custom-darkpurple rounded-full p-2'> <MdOutlineAdd className='w-full h-full text-white text-[20px]' />
                            </div>
                       
                }
            </div>
            <div className='w-full border-2 rounded-md border-custom-darkpurple p-4 space-y-2 md:space-y-4 '>
                {
                    faq &&
                    faq?.map((item, idx) => (
                        <div key={idx} className=' border-t-[6px] border-custom-darkpurple rounded-md border-[2px] '>
                            <div className='w-full p-2 md:p-3 border-b-[2px] border-custom-darkpurple flex items-center justify-between gap-2 cursor-pointer'
                                onClick={() => {
                                    if (open === idx + 1) {
                                        setOpen(0);
                                    }
                                    else {
                                        setOpen(idx + 1)
                                    }
                                }}>

                                <p>{item?.question}</p>
                                <div className='flex gap-5'>
                                    <div className='w-5 cursor-pointer'>
                                        {
                                            open === idx + 1 ?
                                                <AiOutlineArrowUp className='text-custom-darkpurple font-bold text-2xl' />
                                                :
                                                <AiOutlineArrowDown className='text-custom-darkpurple font-bold text-2xl' />
                                        }
                                    </div>
                                    <div className='w-5 cursor-pointer'>
                                        <FaEdit className='text-custom-darkpurple font-bold text-2xl' onClick={() => {
                                            setNewFAQ({
                                                question: item.question,
                                                answer: item?.answer
                                            });
                                            setSigleFaq(item);
                                            setCreatFAQ(true)

                                        }} />

                                    </div>
                                    <div className='w-15 cursor-pointer'>
                                        <RiDeleteBin2Fill className='text-custom-darkpurple font-bold text-2xl' onClick={() => { deleteFAQ(item) }} />

                                    </div>
                                </div>

                            </div>
                            <div className={`w-full p-2 md:p-3 ${open === idx + 1 ? 'h-auto block' : ' hidden h-0'} transition-all duration-500`}>
                                <p>{item?.answer}</p>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default FAQ