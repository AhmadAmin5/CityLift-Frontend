import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { queryClient } from "./query/queryClient";
import App from "./App";
import "./index.css";
import "mapbox-gl/dist/mapbox-gl.css";
import { BrowserRouter } from "react-router-dom";

async function enableMocking() {
    if (import.meta.env.VITE_USE_MOCK_API !== "true") {
        return;
    }

    const { worker } = await import("./mocks/browser");

    return worker.start({
        onUnhandledRequest: "bypass",
    });
}

enableMocking().then(() => {
    ReactDOM.createRoot(document.getElementById("root")).render(
        <React.StrictMode>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <App />
                    <Toaster richColors position="top-center" />
                </BrowserRouter>
            </QueryClientProvider>
        </React.StrictMode>,
    );
});
