import { AuthProvider } from "../contexts/AuthContext";
import { Profile } from "./authentication/Profile";
import LogIn from "./authentication/LogIn";
import SignUp from "./authentication/SignUp";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./authentication/PrivateRoute";
import ForgotPassword from "./authentication/ForgotPassword";
import UpdateProfile from "./authentication/UpdateProfile";
import DashBoard from "./googleDrive/DashBoard";

function App() {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Drive */}
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <DashBoard />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/folder/:folderId"
                        element={
                            <PrivateRoute>
                                <DashBoard />
                            </PrivateRoute>
                        }
                    />

                    {/* Profile */}
                    <Route
                        path="/user"
                        element={
                            <PrivateRoute>
                                <Profile />
                            </PrivateRoute>
                        }
                    />
                    <Route
                        path="/update-profile"
                        element={
                            <PrivateRoute>
                                <UpdateProfile />
                            </PrivateRoute>
                        }
                    />

                    {/* Auth */}
                    <Route path="/signup" element={<SignUp />} />
                    <Route path="/login" element={<LogIn />} />
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;
