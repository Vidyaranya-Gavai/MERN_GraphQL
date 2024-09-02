import { Navigate, Route, Routes } from "react-router-dom";
import { useQuery } from "@apollo/client";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import TransactionPage from "./pages/TransactionPage";
import NotFoundPage from "./pages/NotFoundPage";
import Header from "./components/ui/Header";

import { GET_AUTHENTICATED_USER } from "./graphql/queries/user.query.js";
import { Toaster } from "react-hot-toast";

function App() {
  const { loading, data, error } = useQuery(GET_AUTHENTICATED_USER);
  console.log("Data", data);
  console.log("Loading", loading);
  console.log("Error", error);
  return (
    <>
      {data?.authUser && <Header />}
      <Routes>
        <Route
          path="/"
          element={
            data?.authUser ? (
              <HomePage pic={data.authUser.profilePicture} />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/login"
          element={data?.authUser ? <Navigate to="/" /> : <LoginPage />}
        />
        <Route
          path="/signup"
          element={data?.authUser ? <Navigate to="/" /> : <SignupPage />}
        />
        <Route
          path="/transaction/:id"
          element={data?.authUser ? <Navigate to="/" /> : <TransactionPage />}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
