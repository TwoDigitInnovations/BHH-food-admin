import axios from "axios";

//  const ConstantsUrl = "http://localhost:8000/v1/api/";
   const ConstantsUrl = "https://api.bhhfood.com/v1/api/";

async function Api(method, url, datas, router) {
  let requestData = {};

  if (datas) {
    requestData = { ...datas };
  }

  if (method != "get") {
    const { data } = await axios.get(
      `https://ipinfo.io/json?token=${process.env.NEXT_PUBLIC_TOKEN}`
    );

    requestData.action = url;
    requestData.ipConfig = data;
  }

  return new Promise(function (resolve, reject) {
    let token = "";
    if (typeof window !== "undefined") {
      token = localStorage?.getItem("token") || "";
    }
    axios({
      method,
      url: ConstantsUrl + url,
      data: requestData,
      headers: { Authorization: `jwt ${token}` },
    }).then(
      (res) => {
        resolve(res.data);
      },
      (err) => {
        console.log(err);
        if (err.response) {
          if (err?.response?.status === 401) {
            if (typeof window !== "undefined") {
              console.log("sdfvgbhn", err.response);
              localStorage.removeItem("userDetail");
              router.push("/login");
            }
          }
          reject(err.response.data);
        } else {
          reject(err);
        }
      }
    );
  });
}

async function ApiFormData(method, url, data, router) {
  // if (method != 'get') {
  //   const { data } = await axios.get(`https://ipinfo.io/json?token=${process.env.NEXT_PUBLIC_TOKEN}`)
  //   datas.action = url;
  //   datas.ipConfig = data;
  // }
  return new Promise(function (resolve, reject) {
    let token = "";
    if (typeof window !== "undefined") {
      token = localStorage?.getItem("token") || "";
    }
    console.log(token);
    axios({
      method,
      url: ConstantsUrl + url,
      data,
      headers: {
        Authorization: `jwt ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }).then(
      (res) => {
        resolve(res.data);
      },
      (err) => {
        console.log(err);
        if (err.response) {
          if (err?.response?.status === 401) {
            if (typeof window !== "undefined") {
              localStorage.removeItem("userDetail");
              router.push("/");
            }
          }
          reject(err.response.data);
        } else {
          reject(err);
        }
      }
    );
  });
}

const timeSince = (date) => {
  date = new Date(date);
  const diff = new Date().valueOf() - date.valueOf();
  const seconds = Math.floor(diff / 1000);
  var interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " Years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Months" : " Month") +
      " ago"
    );
  }
  interval = seconds / 604800;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Weeks" : " Week") +
      " ago"
    );
  }

  interval = seconds / 86400;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Days" : " Day") +
      " ago"
    );
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Hours" : " Hour") +
      " ago"
    );
  }
  interval = seconds / 60;
  if (interval > 1) {
    return (
      Math.floor(interval) +
      (Math.floor(interval) > 1 ? " Min" : " min") +
      " ago"
    );
  }
  return "Just now";
};

function FileDownloadApi(method, url, data, router, params) {
  return new Promise(function (resolve, reject) {
    let token = "";
    if (typeof window !== "undefined") {
      token = localStorage?.getItem("token") || "";
    }

    axios({
      method,
      url: ConstantsUrl + url,
      data,
      params,
      responseType: "blob", // 👈 Important: tells Axios to expect binary data
      headers: {
        Authorization: `jwt ${token}`,
      },
    })
      .then((res) => {
        resolve(res.data); // Return blob data
      })
      .catch((err) => {
        if (err.response) {
          const status = err.response.status;
          const message = err.response?.data?.message || "";

          if (
            (status === 401 || status === 403) &&
            typeof window !== "undefined"
          ) {
            if (
              message.toLowerCase().includes("jwt expired") ||
              message.toLowerCase().includes("unauthorized")
            ) {
              localStorage.removeItem("token");
              localStorage.removeItem("userDetail");
              router?.push("/signIn");
            }
          }

          reject(err.response.data);
        } else {
          reject(err);
        }
      });
  });
}

export { Api, timeSince, ApiFormData, FileDownloadApi };
