import React from 'react';
import { useRecoilValue } from 'recoil';
import PropTypes from 'prop-types';
import NiceLink from '../NiceViews/NiceLink';

import { contentLoadingState, loadingState } from '../../atoms';

const NoListing = ({ mainText, subText, buttonText, buttonLink, displayIcon: DisplayIcon }) => {
    const contentLoading = useRecoilValue(contentLoadingState);
    const loading = useRecoilValue(loadingState);

    return (
        (!contentLoading && !loading) && <div
            className="flex h-200 items-center justify-center"
        >
            <div className="bg-noListingCardBg p-8 rounded-lg shadow-md w-96 border-2 border-noListingCardBorder text-noListingCardText">
                <h2 className="text-3xl mb-4 text-center">
                    {mainText}
                </h2>
                <p className="text-center">
                    {subText}
                </p>
                <div className="flex justify-center mt-8">
                    {DisplayIcon && <div className="text-8xl">
                        {DisplayIcon}
                    </div>}
                </div>
                <div className="mt-8 text-center">
                    {
                        buttonLink && <NiceLink
                            label={buttonText}
                            to={buttonLink}
                            className="bg-buttonGeneric text-buttonText"
                        />
                    }

                </div>
            </div>
        </div>
    );
};

NoListing.propTypes = {
    mainText: PropTypes.string.isRequired,
    subText: PropTypes.string.isRequired,
    buttonText: PropTypes.string.isRequired,
    buttonLink: PropTypes.string,
    displayIcon: PropTypes.element
};

const MemoizedComponent = React.memo(NoListing);
export default MemoizedComponent;