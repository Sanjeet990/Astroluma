import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const Breadcrumb = ({ type, pageTitle, breadcrumbList, showTitle = true }) => {

    return (
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-title-md2 text-breadcrumbTitleText">
                {showTitle ? pageTitle : ""}
            </h2>

            <nav>
                <ol className="flex items-center gap-2">
                    {
                        type === "custom" && (
                            breadcrumbList?.map((item) => (
                                <li key={item.id}>
                                    <Link className="font-medium text-breadcrumbText" to={item.linkUrl}>
                                        {item.linkName} /
                                    </Link>
                                </li>
                            ))
                        )
                    }
                    {
                        type === "front" && (
                            <>
                                <li>
                                    <Link className="font-medium text-breadcrumbText" to={"/"}>
                                        {"Home"} /
                                    </Link>
                                </li>
                                {
                                    breadcrumbList?.map((item) => (
                                        <li key={item.id}>
                                            <Link className="font-medium text-breadcrumbText" to={`/c/${item.id}`}>
                                                {item.listingName} /
                                            </Link>
                                        </li>
                                    ))
                                }
                            </>
                        )
                    }
                    {
                        type === "admin" && (
                            <>
                                <li>
                                    <Link className="font-medium text-breadcrumbText" to={"/manage"}>
                                        {"Settings"} /
                                    </Link>
                                </li>
                                {
                                    breadcrumbList?.map((item) => (
                                        <li key={item?.id}>
                                            <Link className="font-medium text-breadcrumbText" to={`/manage/listing/${item?.id}`}>
                                                {item?.listingName} /
                                            </Link>
                                        </li>
                                    ))
                                }
                            </>
                        )
                    }
                    {
                        type === "listing" && (
                            <>
                                <li>
                                    <Link className="font-medium text-breadcrumbText" to={"/manage"}>
                                        {"Settings"} /
                                    </Link>
                                </li>
                                <li>
                                    <Link className="font-medium text-breadcrumbText" to={"/manage/listing"}>
                                        {"Listing"} /
                                    </Link>
                                </li>
                                {
                                    breadcrumbList?.map((item) => (
                                        <li key={item.id}>
                                            <Link className="font-medium text-breadcrumbText" to={`/manage/listing/${item.id}`}>
                                                {item.listingName} /
                                            </Link>
                                        </li>
                                    ))
                                }
                            </>
                        )
                    }
                    <li className="font-medium text-breadcrumbLinkText">{pageTitle}</li>
                </ol>
            </nav>
        </div>
    );
};

Breadcrumb.propTypes = {
    type: PropTypes.string.isRequired,
    pageTitle: PropTypes.string.isRequired,
    breadcrumbList: PropTypes.array,
    showTitle: PropTypes.bool
}

Breadcrumb.displayName = "Breadcrumb";
const MemoizedComponent = React.memo(Breadcrumb);
export default MemoizedComponent;
