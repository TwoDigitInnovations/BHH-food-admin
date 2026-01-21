import React, { useState } from 'react'
import Link from 'next/link'
import { BsPinterest } from 'react-icons/bs'

import { useRouter } from "next/router";
import { Api } from '@/utils/service';

const Footer = (props) => {
    const router = useRouter();
    const [email, setEmail] = useState('');

    const Subscriber = () => {
        console.log(email)
        props.loader(true);
        Api("post", "add-subscriber", { email }, router).then(
            (res) => {
                console.log("res================>", res);
                props.loader(false);
                props.toaster({ type: "success", message: "subscribed successfully" });
                setEmail('')
            },

            (err) => {
                props.loader(false);
                console.log(err);
                props.toaster({ type: "error", message: err?.data?.message });
                props.toaster({ type: "error", message: err?.message });
            }
        );
    };
    return (
        <div className='min-w-screen md:py-8 md:mt-8 px-10'>
           
        </div>
    )
}

export default Footer