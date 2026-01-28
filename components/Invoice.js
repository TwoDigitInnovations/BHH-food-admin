import React, { useRef, useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { MdFileDownload } from "react-icons/md";
import Barcode from "react-barcode";
import { Api } from "@/services/service";
import { useRouter } from "next/router";

const Invoice = ({ order }) => {
  let brackIndex = [8, 23, 38];
  const invoiceRef = useRef(null);
  const invoiceId = order?.orderId || order?._id;
  const router = useRouter();
  function formatOrderDateTime(createdAt) {
    const dateObj = new Date(createdAt || Date.now());

    const formattedDate = `${String(dateObj.getMonth() + 1).padStart(
      2,
      "0"
    )}/${String(dateObj.getDate()).padStart(2, "0")}/${dateObj.getFullYear()}`;

    const formattedTime = dateObj.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true, // AM/PM
    });

    return `${formattedDate} ${formattedTime}`;
  }

  const orderDateTime = formatOrderDateTime(order?.createdAt);
  console.log(orderDateTime);

  const website = "www.bhhfood.com";
  const customerName =
    `${order?.Local_address?.name || ""} ${
      order?.Local_address?.lastname || ""
    }`.trim() ||
    `${order?.user?.username || ""} ${order?.user?.lastname || ""}`.trim() ||
    "N/A";

  const orderData = {
    id: invoiceId,
    date: orderDateTime,
    customer: {
      name: customerName,
      address: order?.Local_address?.address,
      phone: order?.Local_address?.phoneNumber,
    },
    total: order.total,
    items:
      order?.productDetail?.map((item) => ({
        name: item?.product?.name,
        product: item?.product,
        qty: item?.qty || 1,
        price: item?.price || 0,
        tax: item?.tax || 0,
        total: item?.total || 0,
      })) || [],
  };

  console.log();

  const total = parseFloat(
    orderData.items
      .reduce(
        (sum, i) =>
          sum +
          (Number(i?.total) > 0
            ? Number(i?.total)
            : Number(i.price) * Number(i.qty)),
        0
      )
      .toFixed(2)
  );

  const totalQty = order?.productDetail?.reduce((sum, i) => sum + i.qty, 0);

  const downloadInvoice = async () => {
    const input = invoiceRef.current;
    if (!input) return;

    await new Promise((res) => setTimeout(res, 500));

    // render whole invoice to a single canvas
    const canvas = await html2canvas(input, { scale: 2, useCORS: true });

    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth(); // mm
    const pdfHeight = pdf.internal.pageSize.getHeight(); // mm

    // margins (in mm) — change these values as you want
    const marginLeft = 0;
    const marginTopFirst = 0; // first page top margin (mm)
    const marginBottomFirst = 10; // first page bottom margin (mm)
    const marginTopOther = 20; // 2nd+ pages top margin (mm)
    const marginBottomOther = 0; // 2nd+ pages bottom margin (mm)

    const imgWidthMM = pdfWidth - marginLeft * 2; // using full page width (adjust if you want left/right margins)

    // conversion helpers
    const pxPerMm = canvas.width / imgWidthMM; // pixels per mm
    const mmPerPx = imgWidthMM / canvas.width; // mm per pixel (used for final image height in mm)

    // compute how many pixels of source canvas fit into one PDF page content area
    const safetyPx = 2; // small fudge to avoid tiny overlap/repeat
    const pageContentHeightFirstPx = Math.max(
      1,
      Math.floor((pdfHeight - marginTopFirst - marginBottomFirst) * pxPerMm) -
        safetyPx
    );
    const pageContentHeightOtherPx = Math.max(
      1,
      Math.floor((pdfHeight - marginTopOther - marginBottomOther) * pxPerMm) -
        safetyPx
    );

    let yPx = 0; // current top of the slice in source canvas (pixels)

    // helper to create a cropped canvas for a slice
    const makePageImage = (srcCanvas, sx, sy, sWidth, sHeight) => {
      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = sWidth;
      pageCanvas.height = sHeight;
      const ctx = pageCanvas.getContext("2d");
      ctx.drawImage(srcCanvas, sx, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
      return pageCanvas.toDataURL("image/png");
    };

    // FIRST PAGE
    const firstSlicePx = Math.min(
      pageContentHeightFirstPx,
      canvas.height - yPx
    );
    const firstData = makePageImage(canvas, 0, yPx, canvas.width, firstSlicePx);
    const firstSliceHeightMM = firstSlicePx * mmPerPx; // convert slice px -> mm for PDF height
    pdf.addImage(
      firstData,
      "PNG",
      marginLeft,
      marginTopFirst,
      imgWidthMM,
      firstSliceHeightMM
    );
    yPx += firstSlicePx;

    // FOLLOWING PAGES
    while (yPx < canvas.height) {
      // remaining pages use top margin = marginTopOther
      const slicePx = Math.min(pageContentHeightOtherPx, canvas.height - yPx);
      const data = makePageImage(canvas, 0, yPx, canvas.width, slicePx);
      const sliceHeightMM = slicePx * mmPerPx;

      pdf.addPage();
      pdf.addImage(
        data,
        "PNG",
        marginLeft,
        marginTopOther,
        imgWidthMM,
        sliceHeightMM
      );

      yPx += slicePx;
    }

    pdf.save(`Invoice-${order?.orderId || Date.now()}.pdf`);
  };

  const downloadPicklist = async () => {
    try {
      const data = {
        orderId: order?._id,
      };

     
      const token = localStorage.getItem("token");
      const baseURL = "https://api.bhhfood.com/v1/api/";
      
      const response = await fetch(`${baseURL}/createpicklist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `jwt ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to generate picklist PDF");
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Picklist-${order?.orderId || Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading picklist:", error);
      alert("Failed to download picklist PDF");
    }
  };

  let orderType = "Store Pickup";
  if (order?.isLocalDelivery) orderType = "Local Delivery";
  if (order?.isShipmentDelivery) orderType = "Shipment Delivery";
  if (order?.isDriveUp) orderType = "Curbside Pickup";

  function convertISODateToFormattedString(isoDateString) {
    if (!isoDateString) return "";

    const date = new Date(isoDateString);

    if (isNaN(date)) {
      return "Invalid Date";
    }

    const day = date.getDate(); // local timezone
    const monthIndex = date.getMonth(); // local timezone
    const year = date.getFullYear(); // local timezone

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    return `${day} ${monthNames[monthIndex]} ${year}`;
  }

  const frozenItems = [];
  const nonFrozenItems = [];

  if (Array.isArray(orderData?.items)) {
    orderData.items.forEach((item, index) => {
      console.log(`Checking product #${index}:`, item);
      console.log("Category:", item?.product?.categoryName);

      if (item?.product?.categoryName === "Frozen Foods") {
        frozenItems.push(item);
      } else {
        nonFrozenItems.push(item);
      }
    });
  }

  console.log("✅ Frozen Food Products:", frozenItems);
  console.log("✅ Non Frozen Food Products:", nonFrozenItems);

  function ProductRow({ item }) {
    const [imgBase64, setImgBase64] = useState(null);

    useEffect(() => {
      (async () => {
        try {
          const res = await Api(
            "get",
            `/changeBase64?url=${encodeURIComponent(
              item.product?.varients[0]?.image[0]
            )}`,
            "",
            router
          );
          setImgBase64(res?.base64);
        } catch (err) {
          console.error("Error fetching base64:", err);
        }
      })();
    }, [item.product?.varients[0]?.image[0]]);

    return (
      <td style={{ padding: "0.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {imgBase64 && (
            <img
              src={imgBase64}
              alt="image"
              style={{
                width: "45px",
                height: "45px",
                objectFit: "cover",
                borderRadius: "4px",
              }}
            />
          )}
          <span>{item.name}</span>
        </div>
      </td>
    );
  }

  return (
    <div className="">
      <div className="relative inline-flex gap-2">
        {/* <button
          onClick={downloadInvoice}
          className="inline-flex items-center gap-2 text-gray-700 py-1 px-3 rounded-md cursor-pointer 
                   hover:bg-gray-100 transition-colors duration-200 ease-in-out focus:outline-none 
                   focus:ring-2 focus:ring-gray-300"
          type="button"
          aria-label="Download Invoice"
        >
          <span>Invoice</span>
          <MdFileDownload className="text-xl" />
        </button> */}
        
        <button
          onClick={downloadPicklist}
          className="inline-flex items-center gap-2 text-gray-700 py-1 px-3 rounded-md cursor-pointer 
                   hover:bg-gray-100 transition-colors duration-200 ease-in-out focus:outline-none 
                   focus:ring-2 focus:ring-gray-300"
          type="button"
          aria-label="Download Picklist"
        >
          <span>Invoice</span>
          <MdFileDownload className="text-xl" />
        </button>
      </div>

      {/* Hidden off-screen invoice */}
      <div
        ref={invoiceRef}
        style={{
          // position: "absolute",
          // top: "-9999px",
          // left: "-9999px",
          position: "fixed",
          top: 0,
          left: "-200vw",
          width: "800px",
          zIndex: -1,
          // opacity: 0,
          pointerEvents: "none",

          background: "white",
          padding: "40px",
          color: "black",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            justifyContent: "space-between",
            alignItems: "center",
            display: "flex",
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "10px",
            marginBottom: "5px",
          }}
        >
          <div>
            <h1
              style={{ fontSize: "2rem", fontWeight: "bold", color: "#f38529" }}
            >
              BHH FOOD
            </h1>
            <p style={{ fontSize: "0.875rem" }}>{website}</p>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: "1.2rem", color: "#f38529" }}>
              Order type: <strong>{orderType}</strong>
            </p>
            <p style={{ fontSize: "0.875rem", margin: "0" }}>
              Order ID #: <strong>{orderData.id}</strong>
            </p>
            <p style={{ fontSize: "0.875rem", margin: 0 }}>
              order Date: {orderData.date}
            </p>
            {!order?.isShipment && (
              <>
                {order?.isLocalDelivery &&
                  order?.Local_address?.dateOfDelivery && (
                    <p style={{ fontSize: "0.875rem", margin: 0 }}>
                      Delivery Date:{" "}
                      {convertISODateToFormattedString(
                        order.Local_address.dateOfDelivery
                      )}
                    </p>
                  )}

                {!order?.isLocalDelivery && order?.dateOfDelivery && (
                  <p style={{ fontSize: "0.875rem", margin: 0 }}>
                    Pickup Date:{" "}
                    {convertISODateToFormattedString(order.dateOfDelivery)}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
        <div
          style={{
            width: "400px", // fixed width
            height: "150px", // fixed height
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            // optional: spacing inside
          }}
        >
          <Barcode value={order.orderId} />
        </div>
        <div style={{ marginBottom: "1.5rem", display: "grid" }}>
          <h2
            style={{
              fontSize: "1.125rem",
              fontWeight: "600",
              marginBottom: "0.25rem",
            }}
          >
            Billed To:
          </h2>

          <span>{orderData.customer.name}</span>
          <span>{orderData.customer.address || order?.user?.email}</span>
          <span>{orderData.customer.phone || order?.user?.number}</span>

          {order?.Local_address?.BusinessAddress && (
            <span>
              Business Address: {order?.Local_address?.BusinessAddress}
            </span>
          )}
          {order?.Local_address?.ApartmentNo && (
            <span>Apartment No: {order?.Local_address?.ApartmentNo}</span>
          )}
          {order?.Local_address?.SecurityGateCode && (
            <span>
              Security Gate Code: {order?.Local_address?.SecurityGateCode}
            </span>
          )}
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginBottom: "1.5rem",
            fontSize: "0.875rem",
          }}
        >
          <thead
            style={{
              backgroundColor: "#f3f4f6",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <tr style={{ breakInside: "avoid" }}>
              <th
                style={{
                  textAlign: "left",
                  padding: "0.5rem",
                  border: "1px solid #e5e7eb",
                }}
              >
                Item
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "0.5rem",
                  border: "1px solid #e5e7eb",
                }}
              >
                Qty
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "0.5rem",
                  border: "1px solid #e5e7eb",
                }}
              >
                Subtotal
              </th>
            </tr>
          </thead>

          <tbody>
            {/* Non Frozen Items First */}
            {nonFrozenItems?.map((item, idx) => (
              <tr
                key={`nonfrozen-${idx}`}
                style={{ borderBottom: "1px solid #e5e7eb" }}
              >
                <div>
                  <ProductRow key={item.id} item={item} />
                </div>
                <td
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #e5e7eb",
                    textAlign: "right",
                  }}
                >
                  {item.qty}
                </td>
                <td
                  style={{
                    padding: "0.5rem",
                    border: "1px solid #e5e7eb",
                    textAlign: "right",
                  }}
                >
                  $
                  {Number(item?.total) > 0
                    ? Number(item?.total).toFixed(2)
                    : (Number(item.price) * Number(item.qty)).toFixed(2)}
                </td>
              </tr>
            ))}

            {frozenItems?.length > 0 && (
              <>
                <tr>
                  <td
                    colSpan="3"
                    style={{
                      padding: "0.5rem",
                      border: "1px solid #e5e7eb",
                      fontWeight: "bold",
                      backgroundColor: "#f9fafb",
                    }}
                  >
                    Frozen Foods
                  </td>
                </tr>

                {frozenItems?.map((item, idx) => (
                  <tr
                    key={`frozen-${idx}`}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      breakInside: "avoid",
                    }}
                  >
                    <ProductRow key={item.id} item={item} />
                    <td
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #e5e7eb",
                        textAlign: "right",
                      }}
                    >
                      {item.qty}
                    </td>
                    <td
                      style={{
                        padding: "0.5rem",
                        border: "1px solid #e5e7eb",
                        textAlign: "right",
                      }}
                    >
                      $
                      {Number(item?.total) > 0
                        ? Number(item?.total).toFixed(2)
                        : (Number(item.price) * Number(item.qty)).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </>
            )}

            <tr
              style={{
                borderBottom: "1px solid #e5e7eb",
                breakInside: "avoid",
              }}
            >
              <td
                style={{
                  padding: "0.5rem",
                  border: "1px solid #e5e7eb",
                  textAlign: "left",
                }}
                colSpan="1"
              >
                Total
              </td>
              <td
                style={{
                  padding: "0.5rem",
                  border: "1px solid #e5e7eb",
                  textAlign: "right",
                }}
                colSpan="1"
              >
                {totalQty}
              </td>
              <td
                style={{
                  padding: "0.5rem",
                  border: "1px solid #e5e7eb",
                  textAlign: "right",
                }}
                colSpan="1"
              >
                ${total}
              </td>
            </tr>
          </tbody>
        </table>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderTop: "1px solid #e5e7eb",
            paddingTop: "16px",
            paddingLeft: "50%",
            gap: "32px", // spacing between left and right columns
          }}
        >
          {/* Right Side - Totals */}
          <div style={{ flex: 1 }}>
            {[
              { label: "Subtotal", value: `$${total}` },
              {
                label: "Discount",
                value: `$${parseFloat(order.discount || 0).toFixed(2)}`,
              },
              {
                label: "Delivery tip",
                value: `$${parseFloat(order.Deliverytip || 0).toFixed(2)}`,
              },
              {
                label: "Delivery Charges",
                value: `$${parseFloat(order.deliveryfee || 0).toFixed(2)}`,
              },
              {
                label: "Service Fee",
                value: `$${parseFloat(order.serviceFee || 0).toFixed(2)}`,
              },
              {
                label: "Total Tax",
                value: `$${parseFloat(order.totalTax || 0).toFixed(2)}`,
              },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                  color: "#000",
                }}
              >
                <span style={{ flex: 1, textAlign: "left" }}>{item.label}</span>
                <span style={{ width: "100px", textAlign: "right" }}>
                  {item.value}
                </span>
              </div>
            ))}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid #e5e7eb",
                paddingTop: "0.5rem",
                fontWeight: "bold",
              }}
            >
              <span style={{ flex: 1, textAlign: "left" }}>Total</span>
              <span style={{ width: "100px", textAlign: "right" }}>
                $
                {parseFloat(
                  Number(order.total) + (Number(order?.totalTax) || 0)
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <p>Thank you for shopping with BHH FOOD</p>
          <p>For queries, contact us at contact@bhhfood.com</p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
