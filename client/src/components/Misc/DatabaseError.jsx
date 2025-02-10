import React, { useEffect } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import ApiService from '../../utils/ApiService';
import { useRecoilState } from "recoil";
import NiceLink from "../NiceViews/NiceLink";
import { loadingState } from "../../atoms";
import makeToast from "../../utils/ToastUtils";

const DatabaseError = () => {

    const navigate = useNavigate();
    const [loading, setLoading] = useRecoilState(loadingState);

    useEffect(() => {
        setLoading(true);
        ApiService.get("/api/v1/home", null, navigate)
            .then(() => {
                navigate("/");
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Can not connect to the API.");
            }).finally(() => {
                setLoading(false);
            });
    }, [navigate, setLoading]);

    if (loading) return null;

    return (
        <div className="flex h-screen items-center justify-center w-full p-4">
            <Helmet>
                <title>Database Connection Error</title>
            </Helmet>
            <div className="bg-noListingCardBg p-8 rounded-xl shadow-md w-full md:w-96 border border-noListingCardBorder text-noListingCardText mx-4">
                <h2 className="text-3xl mb-4 text-center font-semibold">
                    Database Connection Failed
                </h2>

                <div className="mt-4 mx-auto h-48 w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" className="w-full h-full">
                        {/* Database Icon */}
                        <g transform="translate(200, 150)">
                            {/* Database cylinders */}
                            <path d="M-60 -40 C-60 -52 60 -52 60 -40 L60 -20 C60 -8 -60 -8 -60 -20 Z" fill="#e0e0e0" stroke="#666" strokeWidth="2" />
                            <path d="M-60 -25 C-60 -37 60 -37 60 -25 L60 -5 C60 7 -60 7 -60 -5 Z" fill="#d0d0d0" stroke="#666" strokeWidth="2" />
                            <path d="M-60 -10 C-60 -22 60 -22 60 -10 L60 10 C60 22 -60 22 -60 10 Z" fill="#c0c0c0" stroke="#666" strokeWidth="2" />

                            {/* Error Symbol */}
                            <circle cx="80" cy="-30" r="30" fill="#ff4444" stroke="#dd2222" strokeWidth="2" />
                            <path d="M65 -45 L95 -15 M65 -15 L95 -45" stroke="white" strokeWidth="4" strokeLinecap="round" />
                        </g>

                        {/* Connection Lines */}
                        <g stroke="#666" strokeWidth="2" strokeDasharray="5,5">
                            <path d="M50 150 L120 150" />
                            <path d="M280 150 L350 150" />
                        </g>

                        {/* Warning Signs */}
                        <g transform="translate(200, 80)">
                            <path d="M-20 0 L0 -34.6 L20 0 Z" fill="#ffcc00" stroke="#cc9900" strokeWidth="2" />
                            <text x="0" y="-10" textAnchor="middle" fontSize="24" fontWeight="bold">!</text>
                        </g>

                        {/* Status Indicators */}
                        <circle cx="50" cy="150" r="8" fill="#44ff44" />
                        <circle cx="350" cy="150" r="8" fill="#ff4444" />
                    </svg>
                </div>

                <div className="mt-8 space-y-6">
                    <div className="bg-bodyBg text-bodyText border-l-4 border-red-600 p-4 rounded text-bg-bodyBg">
                        <p className="text-center">
                            Unable to establish connection with the database.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xl font-medium">Troubleshooting Steps:</h3>
                        <div className="space-y-2 pl-4">
                            <p className="flex items-center">
                                <span className="mr-2">•</span>
                                Verify your database connection string in the environment variables
                            </p>
                            <p className="flex items-center">
                                <span className="mr-2">•</span>
                                Ensure MongoDB container is running and accessible
                            </p>
                            <p className="flex items-center">
                                <span className="mr-2">•</span>
                                Consider using MongoDB Atlas for a cloud-hosted solution
                            </p>
                        </div>
                    </div>

                    <div className="bg-bodyBg text-bodyText border-l-4 border-green-600 p-4 rounded text-bg-bodyBg">
                        <p className="text-center">
                            Need help setting up your database? Book an appointment with our developer for assistance.
                        </p>
                    </div>

                    <div className="flex justify-center mt-8">
                        <NiceLink
                            label='Book an appointment'
                            to="https://getastroluma.com/appointment"
                            className="bg-buttonGeneric text-buttonText"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

const MemoizedComponent = React.memo(DatabaseError);
export default MemoizedComponent;