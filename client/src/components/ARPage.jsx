import React from "react";
import ARViewer from "./ARViewer";

const ARPage = () => {
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#f8f5f2",
                padding: "30px",
            }}
        >
            <div
                style={{
                    maxWidth: "1200px",
                    margin: "0 auto",
                }}
            >
                <h1
                    style={{
                        textAlign: "center",
                        marginBottom: "10px",
                    }}
                >
                    Shaili AR Try-On
                </h1>

                <p
                    style={{
                        textAlign: "center",
                        marginBottom: "25px",
                    }}
                >
                    View your selected fashion item in Augmented Reality
                </p>

                <ARViewer />
            </div>
        </div>
    );
};

export default ARPage;
