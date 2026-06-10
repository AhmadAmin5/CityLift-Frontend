import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { App } from "@capacitor/app";

export default function BackButtonHandler() {
    const location = useLocation();
    const navigate = useNavigate();

    // Store the current pathname in a ref so the listener always has access
    // to the latest value without needing to re-register the listener.
    const pathnameRef = useRef(location.pathname);

    useEffect(() => {
        pathnameRef.current = location.pathname;
    }, [location.pathname]);

    useEffect(() => {
        let active = true;
        let listener = null;

        const setupListener = async () => {
            const handler = await App.addListener("backButton", (data) => {
                if (!active) return;

                const currentPath = pathnameRef.current;
                const rootRoutes = [
                    "/splash",
                    "/auth/login",
                    "/rider/home",
                    "/driver/home",
                    "/admin/dashboard",
                ];

                if (!data.canGoBack || rootRoutes.includes(currentPath)) {
                    App.exitApp();
                } else {
                    navigate(-1);
                }
            });

            if (!active) {
                handler.remove();
            } else {
                listener = handler;
            }
        };

        setupListener();

        return () => {
            active = false;
            if (listener) {
                listener.remove();
            }
        };
    }, [navigate]);

    return null;
}
