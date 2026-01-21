import Layout from "@/components/layouts";
import Loader from "@/components/loader";
import Toaster from "@/components/toaster";
import { Api } from "@/services/service";
import "@/styles/globals.css";
import { useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";
// import IPInfo from 'ip-info-react';

export const userContext = createContext();
export const dataContext = createContext();
export default function App({ Component, pageProps }) {
  const [user, setUser] = useState({});
  const [data, setData] = useState({});
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState({
    type: "",
    message: "",
  });
  const router = useRouter();

  useEffect(() => {
    setToast(toast);
    if (!!toast.message) {
      setTimeout(() => {
        setToast({ type: "", message: "" });
      }, 5000);
    }
  }, [toast]);
  useEffect(() => {
    getUserDetail();
  }, []);

  const getUserDetail = () => {
    const users = localStorage.getItem("userDetail");
    if (users) {
      const d = JSON.parse(users)
      getProfileData(d)
      // setUser(JSON.parse(users));
      // router.push("/");
    } else {
      if (router.route !== "/login" && router.route !== "/signup") {
        router.push("/login");
      }
    }
  };

  const getProfileData = (d) => {
    setOpen(true);
    Api("get", "getProfile", null)
      .then(res => {
        setOpen(false);
        if (res?.status) {
          if (res.data.type === "ADMIN" || res.data.type === "EMPLOYEE") {
            setUser({
              ...d,
              ...res.data
            });
          } else {
            setToast('Unauthorised account')
            if (router.route !== "/login" && router.route !== "/signup") {
              router.push("/login");
              setUser(null)
            }
          }
        } else {
          setToast({ type: "error", message: res?.data?.message });
        }
      })
      .catch(err => {
        setOpen(false);
        setToast({ type: "error", message: err?.data?.message });
      });
  };


  return (
    <>
      {" "}
      {/* <IPInfo> */}
      <dataContext.Provider value={[data, setData]}>
        <userContext.Provider value={[user, setUser]}>
          <Loader open={open} />
          <div className="fixed right-5 top-20 min-w-max z-50">
            {!!toast.message && (
              <Toaster type={toast.type} message={toast.message} />
            )}
          </div>
          <Layout loader={setOpen} toaster={setToast}>
            <Loader open={open} />
            <div className="fixed right-5 top-20 min-w-max">
              {!!toast.message && (
                <Toaster type={toast.type} message={toast.message} />
              )}
            </div>
            {user && (
              <Component
                {...pageProps}
                loader={setOpen}
                toaster={setToast}
                user={user}
              />
            )}
          </Layout>
        </userContext.Provider>{" "}
      </dataContext.Provider>
      {/* </IPInfo> */}
    </>
  );
}
