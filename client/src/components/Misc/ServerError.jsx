import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

const ServerError = () => {

  return (
    <div className="flex h-screen items-center justify-center w-full">
      <Helmet>
        <title>Server Error</title>
      </Helmet>
      <div className="bg-noListingCardBg p-8 rounded-xl shadow-md w-full md:w-96 border border-noListingCardBorder text-noListingCardText mx-4">
        <h2 className="text-3xl mb-4 text-center">
          Oops! Some error occurred.
        </h2>
        <p className="text-center">
          Unable to handle this request at this moment.
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


const MemoizedComponent = React.memo(ServerError);
export default MemoizedComponent;