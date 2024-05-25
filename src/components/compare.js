import React, { useState } from "react";

const iframeStyles = {
  minWidth: "620px",
  minHeight: "500px",
  margin: "20px",
  padding: "20px",
  borderRadius: "8px",
  maxWidth: "620px",
  maxHeight: "500px",
  marginTop: "0px",
  paddingTop: "0px",
};

const containerStyles = {
  background: "white",
  height: "auto",
  width: "auto",
  minHeight: "500px",
  alignContent: "center",
  borderRadius: "8px",
  maxWidth: "670px",
  margin: "10px", // Reduced margin
};

const RoboflowDetection = () => {
  const [capturedImageURL] = useState(() => {
    return sessionStorage.getItem("capturedImageURL") || null;
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        textAlign: "center",
      }}
    >
      <div style={containerStyles}>
        <h1
          class="text-lg font-bold text-gray-600"
          style={{ marginTop: "20px", marginBottom: "20px" }}
        >
          Detection Reference
        </h1>
        <iframe src="inference.html" style={iframeStyles}></iframe>
      </div>
      <div
        style={{
          margin: "10px",
          textAlign: "center",
          background: "white",
          padding: "48px",
          borderRadius: "8px",
          paddingTop: "0px",
        }}
      >
        <h1
          class="text-lg font-bold text-gray-600"
          style={{ marginTop: "20px", marginBottom: "20px" }}
        >
          Image Reference
        </h1>
        {capturedImageURL ? (
          <img
            src={capturedImageURL}
            alt="Captured"
            style={{ maxWidth: "590px", height: "auto", borderRadius: "8px" }}
          />
        ) : (
          <div style={{ color: "gray", fontStyle: "italic" }}>
            No image captured yet. Press the button to capture a frame.
          </div>
        )}
      </div>
    </div>
  );
};

export default RoboflowDetection;
