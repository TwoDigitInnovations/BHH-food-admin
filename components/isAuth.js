import { useEffect } from "react";
import { useRouter } from "next/router";

const isAuth = (Component) => {
  return function IsAuth(props) {
    const router = useRouter();

    let auth = false;
    let user;
    if (typeof window !== "undefined") {
      user = localStorage.getItem("userDetail");
    }
    if (user) {
      const u = JSON.parse(user);
      const token = localStorage.getItem("token");
      if (
        router?.pathname === "/inventory" ||
        router?.pathname === "/add-product" ||
        router?.pathname === "/orders" ||
        router?.pathname === "/Notification"||
        router?.pathname === "/queries"
      ) {
        auth =
          token && (u?.type === "ADMIN" || u?.type === "EMPLOYEE")
            ? true
            : false;
      } else {
        auth = token && u?.type === "ADMIN" ? true : false;
      }
    }

    useEffect(() => {
      if (!auth) {
        localStorage.clear();
        router.replace("/login");
      }
    }, []);

    return <Component {...props} />;
  };
};

export default isAuth;
