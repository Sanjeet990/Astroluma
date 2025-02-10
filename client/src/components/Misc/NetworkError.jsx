import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

const NetworkError = () => {

  return (
    <div className="flex h-screen items-center justify-center w-full">
      <Helmet>
        <title>Network Error</title>
      </Helmet>
      <div className="bg-noListingCardBg p-8 rounded-xl shadow-md w-full md:w-96 border border-noListingCardBorder text-noListingCardText mx-4">
        <h2 className="text-3xl  mb-4 text-center">
          Oops! Can not connect
        </h2>
        <p className="text-center">
          Unable to connect to the backend API.
        </p>
        <img
          src="/network-error.png"
          alt="Network Error"
          className="mt-4 mx-auto"
        />
        <p className="mt-8 text-center">
          <Link to="/" className="bg-buttonGeneric text-buttonText py-2 px-4 rounded-full mt-8">Go to Homepage</Link>
        </p>
      </div>
    </div>
  );
}


const MemoizedComponent = React.memo(NetworkError);
export default MemoizedComponent;
