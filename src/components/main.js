import React, { useRef, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from "firebase/storage";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";
import LoadingButton from "@mui/lab/LoadingButton";
import Alert from "@mui/material/Alert";
import Stack from "@mui/material/Stack";
import Grow from "@mui/material/Grow";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Button from "@mui/material/Button";
import Camera from "@mui/icons-material/Camera";

// Constant Styles
const iframeStyles = {
  minWidth: "835px",
  minHeight: "450px",
  margin: "5px",
  borderRadius: "8px",
  maxWidth: "620px",
  maxHeight: "500px",
  marginBottom: "20px",
};

const livefeedIframeStyles = {
  height: "175px",
  width: "300px",
  borderRadius: "8px",
  cursor: "pointer",
};

const referenceimgStyles = {
  height: "168px",
  width: "auto",
  borderRadius: "8px",
};

const commonSizeStyles = {
  width: "100%",
  height: "100%",
  borderRadius: "8px",
};

const containerStyles = {
  background: "white",
  height: "auto",
  width: "auto",
  minHeight: "auto",
  maxHeight: "540px",
  alignContent: "center",
  borderRadius: "8px",
  maxWidth: "670px",
  margin: "10px",
  minWidth: "845px",
};

const modalStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.8)",
  zIndex: 1000,
};

const modalContentStyles = {
  position: "relative",
  backgroundColor: "transparent",
  borderRadius: "8px",
  padding: "20px",
  width: "80%",
  height: "80%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const comparemodalContentStyles = {
  position: "relative",
  backgroundColor: "transparent",
  borderRadius: "8px",
  padding: "20px",
  width: "100%",
  height: "100%",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const RoboflowDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [capturedImageURL, setCapturedImageURL] = useState(() => {
    return sessionStorage.getItem("capturedImageURL") || null;
  });
  const storage = getStorage();
  const [classCounts, setClassCounts] = useState({});
  const [prevClassCounts, setPrevClassCounts] = useState({});
  const [noPredictions, setNoPredictions] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [compareOpen, setcompareOpen] = useState(false);
  const [iframeSrc, setIframeSrc] = useState("");
  const [division, setDivision] = useState(8);
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data) {
        if (event.data.type === "classCounts") {
          setPrevClassCounts(classCounts);
          setClassCounts(event.data.data);
          setNoPredictions(false);
          handleAlerts(event.data.data);
        } else if (event.data.type === "noPredictions") {
          setPrevClassCounts({});
          setClassCounts({});
          setNoPredictions(true);
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [classCounts]);

  useEffect(() => {
    const setupWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
      }
    };

    setupWebcam();

    const fetchCapturedImageURL = async () => {
      const docRef = doc(db, "reports", "latest");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const imageURL = docSnap.data().imageURL;
        setCapturedImageURL(imageURL);
      } else {
        console.log("No such document!");
      }
    };

    fetchCapturedImageURL(); // Call the function to fetch image URL
  }, []);

  const getVideoDimensions = (video) => {
    const videoRatio = video.videoWidth / video.videoHeight;
    const elementWidth = video.offsetWidth;
    const elementHeight = video.offsetHeight;
    const elementRatio = elementWidth / elementHeight;

    if (elementRatio > videoRatio) {
      return { width: elementHeight * videoRatio, height: elementHeight };
    } else {
      return { width: elementWidth, height: elementWidth / videoRatio };
    }
  };

  const handleAlerts = (data) => {
    const alertsToShow = [];
    const emptyalertsToShow = [];
    const currentDate = new Date();

    // Function to format date and time
    const formatDateTime = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours() % 12 || 12).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      const ampm = date.getHours() >= 12 ? "PM" : "AM";

      return `DATE: ${year}-${month}-${day} TIME: ${hours}:${minutes}:${seconds} ${ampm}`;
    };

      Object.keys(data).forEach((classKey) => {
        const prevCount = prevClassCounts[classKey];
        const newCount = data[classKey];

        if (prevCount !== newCount) {
          let message;

          if (newCount < prevCount) {
            message = `${classKey} Restocked: ${classKey} counter changed from ${prevCount} to ${newCount}`;
          } else {
            message = `${classKey} Detected: ${classKey} counter changed from ${
              prevCount !== undefined ? prevCount : 0
            } to ${newCount}`;
          }

          if (!alerts.some((alert) => alert.message === message)) {
            alertsToShow.push({
              id: uuidv4(),
              message: message,
              severity: "info",
            });

            // Sending alert message to the endpoint
            axios
              .post(
                "https://sheet.best/api/sheets/d171bf6c-942a-4976-b99b-f065915266c1",
                {
                  message: message,
                  datetime: formatDateTime(currentDate),
                }
              )
              .then((response) => {
                console.log(response);
              })
              .catch((error) => {
                console.error("Error while sending alert message:", error);
              });
          }
        }
      });
    

    // const message = `Status Changed: ${status} detected`;
    // if (!alertsToShow.some(alert => alert.message === message)) {
    //     alertsToShow.push({
    //         id: uuidv4(),
    //         message: message,
    //         severity: 'warning'
    //     });

    //     // Sending alert message to the endpoint
    //     axios.post('https://sheet.best/api/sheets/d171bf6c-942a-4976-b99b-f065915266c1', {
    //         message: message,
    //         datetime: formatDateTime(currentDate)
    //     })
    //     .then((response) => {
    //         console.log(response);
    //     })
    //     .catch((error) => {
    //         console.error('Error while sending alert message:', error);
    //     });
    // }

    setAlerts((prevAlerts) => [...prevAlerts, ...alertsToShow]);

    setTimeout(() => {
      setAlerts((prevAlerts) =>
        prevAlerts.filter(
          (alert) => !alertsToShow.find((newAlert) => newAlert.id === alert.id)
        )
      );
    }, 5000);
  };

  const openModal = (src) => {
    setIframeSrc(src);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setIframeSrc("");
  };

  const opencompareModal = (src) => {
    setIframeSrc(src);
    setcompareOpen(true);
  };

  const closecompareModal = () => {
    setcompareOpen(false);
    setIframeSrc("");
  };

  const handleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  const comparehandleModalClick = (e) => {
    if (e.target === e.currentTarget) {
      closecompareModal();
    }
  };

  const calculatePercentage = () => {
    const totalReduceCount = classCounts["Reduced"] || 0;
    const totalEmptyCount = classCounts["Empty-Space"] || 0;
    const totalPoints = totalReduceCount * 0.5 + totalEmptyCount * 1;
    const percentage = Math.max(0, ((division - totalPoints) / division) * 100);
    return percentage.toFixed(2);
  };

  const getStatus = (percentage) => {
    if (percentage > 80 && percentage <= 100) {
      return "Full";
    } else if (percentage > 40 && percentage <= 80) {
      return "Half-Full";
    } else if (percentage >= 0 && percentage <= 40) {
      return "Low-Stock";
    } else {
      return "Unknown";
    }
  };

  const percentageforStats = parseFloat(calculatePercentage());
  const status = getStatus(percentageforStats);

  const getStatusStyle = (status) => {
    switch (status) {
      case "Full":
        return { backgroundColor: "#00800080", color: "white" };
      case "Half-Full":
        return { backgroundColor: "#ffa50070", color: "white" };
      case "Low-Stock":
        return { backgroundColor: "#ff000069ed", color: "white" };
      default:
        return {};
    }
  };

  const captureAndDownloadFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!canvas || !video) return;
    setLoading(true);

    // Set canvas dimensions to match the video's natural resolution
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height); // Capture frame from video

    const capturedFrame = canvas.toDataURL("image/png"); // Convert to Base64
    setCapturedImage(capturedFrame); // Store the captured frame

    const imageRef = ref(storage, `captured_images/${Date.now()}.png`);
    await uploadString(imageRef, capturedFrame, "data_url");

    const downloadURL = await getDownloadURL(imageRef);

    await setDoc(
      doc(db, "reports", "latest"),
      { imageURL: downloadURL, timestamp: Timestamp.fromDate(new Date()) },
      { merge: true }
    );

    setCapturedImageURL(downloadURL);
    sessionStorage.setItem("capturedImageURL", downloadURL);
    setLoading(false);
  };

  return (
    <div
      style={{
        height: "100vh",
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div style={{ position: "relative" }}>
        <div
          style={{
            position: "absolute",
            top: 59,
            left: 32,
            zIndex: 10,
            backgroundColor: "#00000038",
            padding: "10px",
            color: "white",
            fontFamily: "monospace",
            fontSize: "16px",
            borderTopLeftRadius: "8px",
            fontWeight: "800",
            textAlign: "left",
          }}
        >
          <h2
            className="text-lg font-bold text-gray-600"
            style={{
              color: "white",
              textDecorationLine: "underline",
              fontSize: "18px",
            }}
          >
            Shelf 1 / Camera 1
          </h2>
          {noPredictions ? (
            <p>No Reduced/Empty-Space detected</p>
          ) : (
            <>
              {Object.keys(classCounts).map((classKey, index) => (
                <div key={index}>
                  <p style={getStatusStyle(status)}>Status: {status}</p>
                  <p>
                    Division: {division}
                    <button
                      style={{ marginLeft: "10px" }}
                      onClick={() => setDivision(division + 1)}
                    >
                      ↑
                    </button>
                    <button
                      style={{ marginLeft: "6px" }}
                      onClick={() => setDivision(division - 1)}
                    >
                      ↓
                    </button>
                  </p>
                  <p>Percentage: {calculatePercentage()}%</p>
                  <p>
                    {classKey} Count: {classCounts[classKey]}
                  </p>
                </div>
              ))}
            </>
          )}
        </div>
        <div style={containerStyles}>
          <h1
            className="text-lg font-bold text-gray-600"
            style={{ marginTop: "10px", marginBottom: "10px" }}
          >
            Detection Reference
          </h1>
          <iframe src="inference.html" style={iframeStyles}></iframe>
          <div
            style={{
              position: "absolute",
              top: 58,
              left: 32,
              width: "802px",
              height: "449px",
              backgroundColor: "transparent",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
              opacity: 1,
              transition: "opacity 0.3s",
              borderRadius: "8px",
              fontFamily: "monospace",
              alignItems: "flex-start",
            }}
          >
            <button
              style={{
                backgroundColor: "#000000c2",
                color: "white",
                padding: "5px 20px",
                borderRadius: "5px",
                border: "1px solid white",
                cursor: "pointer",
                fontFamily: "monospace",
                cursor: "pointer",
                margin: "10px",
                opacity: "0.3",
              }}
              onClick={() => openModal("inference.html")}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.3)}
            >
              View Feed
            </button>
            <button
              style={{
                backgroundColor: "#000000c2",
                color: "white",
                padding: "5px 20px",
                borderRadius: "5px",
                border: "1px solid white",
                cursor: "pointer",
                fontFamily: "monospace",
                cursor: "pointer",
                margin: "10px",
                marginLeft: "0px",
                opacity: "0.3",
              }}
              onClick={() => openModal("alertLog.html")}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.3)}
            >
              View Alert Logs
            </button>
            <button
              style={{
                backgroundColor: "#000000c2",
                color: "white",
                padding: "5px 20px",
                borderRadius: "5px",
                border: "1px solid white",
                cursor: "pointer",
                fontFamily: "monospace",
                margin: "10px",
                marginLeft: "0px",
                opacity: "0.3",
              }}
              onClick={() =>
                window.open(
                  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQJtg8NGbTjHwypQxJYF4WgN8oW-0mwkZOboBV0n7FGIoP06wYA0Bc_XDx8Wc-s-2UAYQcL6jCVYVKb/pub?output=pdf",
                  "_blank"
                )
              }
              onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.3)}
            >
              Download Alert Logs
            </button>
          </div>
        </div>
      </div>
      <div>
        <div
          id="webcamliveFeed"
          style={{
            textAlign: "center",
            background: "white",
            padding: "0px 20px 20px",
            borderRadius: "8px",
            width: "fit-content",
            height: "fitcontent",
            position: "relative",
            paddingBottom: "10px",
            paddingLeft: "10px",
            paddingRight: "10px",
          }}
        >
          <h1
            className="text-lg font-bold text-gray-600"
            style={{ marginTop: "10px", padding: "9px" }}
          >
            Live Feed
          </h1>
          <div style={{ position: "relative", display: "inline-block" }}>
            <video
              style={livefeedIframeStyles}
              ref={videoRef}
              autoPlay
              muted
              playsInline
              onLoadedMetadata={() => {
                const video = videoRef.current;
                const { width, height } = getVideoDimensions(video);
                canvasRef.current.width = width;
                canvasRef.current.height = height;
              }}
            />
            <canvas
              hidden
              style={{ opacity: "0%" }}
              ref={canvasRef}
              className="absolute top-0 left-0 z-10"
            />
            <div
              style={{
                position: "absolute",
                top: 3,
                left: 0,
                width: "100%",
                height: "96%",
                backgroundColor: "#00000042",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                opacity: 0,
                transition: "opacity 0.3s",
                borderRadius: "8px",
                fontFamily: "monospace",
                zIndex: 1000,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = 0)}
            >
              <button
                style={{
                  backgroundColor: "#000000c2",
                  color: "white",
                  padding: "5px 20px",
                  borderRadius: "5px",
                  border: "1px solid white",
                  cursor: "pointer",
                  fontFamily: "monospace",
                  cursor: "pointer",
                  margin: "10px",
                  marginLeft: "0px",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = 1)}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = 0.8)}
                onClick={() => openModal("cam.html")}
              >
                View Feed
              </button>
            </div>
          </div>
        </div>
        <div
          id="webcamliveFeed"
          style={{
            textAlign: "center",
            background: "white",
            padding: "0px 20px 20px",
            borderRadius: "8px",
            width: "fit-content",
            height: "fitcontent",
            paddingBottom: "10px",
            paddingLeft: "10px",
            paddingRight: "10px",
          }}
        >
          <h1
            className="text-lg font-bold text-gray-600"
            style={{ marginTop: "10px", padding: "9px" }}
          >
            Reference Image
          </h1>
          <div style={{ display: "flex", marginBottom: "8px" }}>
            <Stack direction="row" spacing={1}>
              <LoadingButton
                style={{
                  width: "180px",
                  fontFamily: "monospace",
                  fontWeight: "600",
                  fontSize: "15px",
                  background: "#008000a8",
                }}
                onClick={captureAndDownloadFrame}
                loading={loading}
                variant="contained"
                endIcon={<Camera />}
              >
                Capture
              </LoadingButton>
              <Button
                style={{
                  width: "112px",
                  fontFamily: "monospace",
                  fontWeight: "600",
                  fontSize: "15px",
                  background: "#008000a8",
                }}
                variant="contained"
                onClick={() => opencompareModal("inference.html")}
              >
                Compare
              </Button>
            </Stack>
          </div>
          <div
            style={{
              height: "175px",
              width: "300px", // Set an explicit width
              borderRadius: "4px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              background: capturedImageURL ? "transparent" : "#80808024",
            }}
          >
            {capturedImageURL ? (
              <img
                src={capturedImageURL}
                alt="Captured"
                style={referenceimgStyles}
              />
            ) : (
              <span
                style={{
                  fontSize: "15px",
                  fontFamily: "monospace",
                  fontStyle: "italic",
                  color: "grey",
                  width: "100%", // Ensure span takes full width
                  textAlign: "center", // Center-align the text within the span
                }}
              >
                No image captured yet.
              </span>
            )}
          </div>
        </div>
      </div>

      <Box
        className="absolute inset-x-0 top-4 z-50 flex justify-center"
        style={{
          paddingTop: "35px",
          justifySelf: "right",
          paddingRight: "15px",
        }}
      >
        <Stack sx={{ width: "100%" }} spacing={1}>
          {alerts.map((alert) => (
            <Grow in={true} timeout={500} key={alert.id}>
              <Alert
                severity={alert.severity}
                style={{
                  fontFamily: "monospace",
                  border: "1px solid #0000004a",
                  paddingTop: "0px",
                  paddingBottom: "0px",
                }}
              >
                {alert.message}
              </Alert>
            </Grow>
          ))}
        </Stack>
      </Box>

      {modalOpen && (
        <Grow in={true} timeout={300}>
          <div style={modalStyles} onClick={handleModalClick}>
            <div style={modalContentStyles}>
              <IconButton
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  color: "white",
                  background: "#00000078",
                }}
                onClick={closeModal}
              >
                <CloseIcon />
              </IconButton>
              <iframe
                src={iframeSrc}
                style={{ width: "100%", height: "100%", borderRadius: "8px" }}
              ></iframe>
            </div>
          </div>
        </Grow>
      )}
      {compareOpen && (
        <Grow in={true} timeout={300}>
          <div style={modalStyles} onClick={comparehandleModalClick}>
            <div style={comparemodalContentStyles}>
              <IconButton
                style={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  color: "white",
                  background: "#00000078",
                }}
                onClick={closecompareModal}
              >
                <CloseIcon />
              </IconButton>
              <iframe
                src={iframeSrc}
                style={{ ...commonSizeStyles, border: "none" }}
              ></iframe>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  background: capturedImageURL ? "transparent" : "#80808024",
                  marginLeft: "15px",
                  width: "100%",
                }}
              >
                {capturedImageURL ? (
                  <img
                    src={capturedImageURL}
                    alt="Captured"
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      fontSize: "15px",
                      fontFamily: "monospace",
                      fontStyle: "italic",
                      color: "grey",
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    No image captured yet.
                  </span>
                )}
              </div>
            </div>
          </div>
        </Grow>
      )}
    </div>
  );
};

// Exporting Component
export default RoboflowDetection;
