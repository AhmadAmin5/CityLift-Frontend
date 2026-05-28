import { Navigate, Route, Routes } from "react-router-dom";

import SplashPage from "@/pages/SplashPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import OtpVerificationPage from "@/pages/auth/OtpVerificationPage";
import PlaceholderPage from "@/pages/PlaceholderPage";
import { PublicOnlyRoute, RequireAuth } from "@/routes/AuthGuards";
import RiderHomePage from "@/pages/rider/RiderHomePage";
import RiderSearchingPage from "@/pages/rider/RiderSearchingPage";
import RiderLiveRidePage from "./pages/rider/RiderLiveRidePage";
import RiderReceiptPage from "./pages/rider/RiderReceiptPage";
import RiderRatingPage from "./pages/rider/RiderRatingPage";
import RiderRideHistoryPage from "./pages/rider/RiderRideHistoryPage";
import RiderRideDetailPage from "./pages/rider/RiderRideDetailPage";
import RiderSavedPlacesPage from "./pages/rider/RiderSavedPlacesPage";
import ProfilePage from "./pages/shared/ProfilePage";
import DriverHomePage from "./pages/driver/DriverHomePage";
import DriverOnboardingPage from "./pages/driver/DriverOnboardingPage";
import DriverDocumentsPage from "./pages/driver/DriverDocumentsPage";
import DriverVehiclesPage from "./pages/driver/DriverVehiclesPage";
import DriverNavigationToPickupPage from "./pages/driver/DriverNavigationToPickupPage";
import DriverArrivedWaitingPage from "./pages/driver/DriverArrivedWaitingPage";
import DriverActiveTripPage from "./pages/driver/DriverActiveTripPage";
import DriverRideSummaryPage from "./pages/driver/DriverRideSummaryPage";
import DriverEarningsPage from "./pages/driver/DriverEarningsPage";
import DriverRatingsPage from "./pages/driver/DriverRatingsPage";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/splash" replace />} />
            <Route path="/splash" element={<SplashPage />} />

            <Route element={<PublicOnlyRoute />}>
                <Route path="/auth/login" element={<LoginPage />} />
                <Route
                    path="/auth/register/rider"
                    element={<RegisterPage role="rider" />}
                />
                <Route
                    path="/auth/register/driver"
                    element={<RegisterPage role="driver" />}
                />
            </Route>

            <Route path="/auth/verify-otp" element={<OtpVerificationPage />} />
            <Route path="/auth/otp" element={<OtpVerificationPage />} />

            <Route element={<RequireAuth allowedRoles={["rider"]} />}>
                <Route path="/rider/home" element={<RiderHomePage />} />
                <Route
                    path="/rider/ride/:ride_id/searching"
                    element={<RiderSearchingPage />}
                />
                <Route
                    path="/rider/ride/:ride_id/live"
                    element={<RiderLiveRidePage />}
                />
                <Route
                    path="/rider/rides/:ride_id"
                    element={<RiderRideDetailPage />}
                />
                <Route
                    path="/rider/saved-places"
                    element={<RiderSavedPlacesPage />}
                />
                <Route
                    path="/rider/ride/:ride_id/receipt"
                    element={<RiderReceiptPage />}
                />
                <Route
                    path="/rider/ride/:ride_id/rating"
                    element={<RiderRatingPage />}
                />
                <Route path="/rider/rides" element={<RiderRideHistoryPage />} />
                <Route
                    path="/rider/profile"
                    element={<PlaceholderPage title="Rider Profile" />}
                />
            </Route>
            <Route path="/profile" element={<ProfilePage />} />

            <Route element={<RequireAuth allowedRoles={["driver"]} />}>
                <Route path="/driver/home" element={<DriverHomePage />} />
                <Route
                    path="/driver/onboarding"
                    element={<DriverOnboardingPage />}
                />
                <Route
                    path="/driver/documents"
                    element={<DriverDocumentsPage />}
                />
                <Route
                    path="/driver/vehicles"
                    element={<DriverVehiclesPage />}
                />
                <Route path="/driver/ratings" element={<DriverRatingsPage />} />
                <Route
                    path="/driver/rides/:ride_id/navigation"
                    element={<DriverNavigationToPickupPage />}
                />
                <Route
                    path="/driver/rides/:ride_id/arrived"
                    element={<DriverArrivedWaitingPage />}
                />
                <Route
                    path="/driver/rides/:ride_id/active"
                    element={<DriverActiveTripPage />}
                />
                <Route
                    path="/driver/rides/:ride_id/summary"
                    element={<DriverRideSummaryPage />}
                />
                <Route path="/driver/earnings" element={<DriverEarningsPage />} />
            </Route>

            <Route element={<RequireAuth allowedRoles={["admin"]} />}>
                <Route
                    path="/admin/dashboard"
                    element={
                        <PlaceholderPage
                            title="Admin Dashboard"
                            subtitle="Admin demo screens will show pricing rules, surge zones, ML models, and document review."
                        />
                    }
                />
                <Route
                    path="/admin/pricing-rules"
                    element={<PlaceholderPage title="Pricing Rules" />}
                />
                <Route
                    path="/admin/driver-documents"
                    element={<PlaceholderPage title="Driver Document Review" />}
                />
                <Route
                    path="/admin/surge-zones"
                    element={<PlaceholderPage title="Surge Zones" />}
                />
                <Route
                    path="/admin/ml-models"
                    element={<PlaceholderPage title="ML Models" />}
                />
            </Route>

            <Route path="*" element={<Navigate to="/splash" replace />} />
        </Routes>
    );
}
