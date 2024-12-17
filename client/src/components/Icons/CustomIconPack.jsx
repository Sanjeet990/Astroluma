import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ImageView from '../Misc/ImageView';
import NiceButton from '../NiceViews/NiceButton';
import NiceLoader from '../NiceViews/NiceLoader';
import makeToast from '../../utils/ToastUtils';
import { useRecoilValue } from 'recoil';
import { colorThemeState } from '../../atoms';
import SystemThemes from '../../utils/SystemThemes';
import NiceInput from '../NiceViews/NiceInput';
import PropTypes from 'prop-types';
import ApiService from '../../utils/ApiService';

const CustomIconPack = ({ onSelectImage, iconPack }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [icons, setIcons] = useState([]);
    const [displayedIcons, setDisplayedIcons] = useState([]);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [baseUrlLight, setBaseUrlLight] = useState('');
    const [iconProvider, setIconProvider] = useState('com.astroluma.self');

    const ITEMS_PER_PAGE = 32;

    const colorTheme = useRecoilValue(colorThemeState);
    const [themeType, setThemeType] = useState("light");

    useEffect(() => {
        const newThemeType = SystemThemes.find(theme => theme.value === colorTheme)?.type || "light";
        setThemeType(newThemeType);
    }, [colorTheme]);

    useEffect(() => {
        setPage(1);
        setSearchTerm('');
        setIcons([]);
        setDisplayedIcons([]);
        setBaseUrl('');
        setBaseUrlLight('');
        setIconProvider('');
    }, [colorTheme]);

    const fetchIcons = useCallback(async () => {
        setIsLoading(true);

        ApiService.get(iconPack?.jsonUrl)
            .then(data => {
                setIcons(data.iconData);
                setBaseUrl(data.baseUrl);
                setBaseUrlLight(data.baseUrlLight);
                setIconProvider(data.iconProvider);

                // Initialize first page of icons
                const initialIcons = data.iconData.slice(0, ITEMS_PER_PAGE);
                setDisplayedIcons(initialIcons);
            })
            .catch(() => {
                makeToast("error", "Error loading data...");
            }).finally(() => {
                setIsLoading(false);
            });
    }, [iconPack?.jsonUrl]);

    useEffect(() => {
        fetchIcons();
    }, [fetchIcons]);

    // Effect to handle filtering
    useEffect(() => {
        if (searchTerm === '') {
            // Reset to initial page view when search is cleared
            setDisplayedIcons(icons.slice(0, ITEMS_PER_PAGE));
            setPage(1);
            return;
        }

        const filteredIcons = icons.filter(icon =>
            icon.iconName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setDisplayedIcons(filteredIcons);
        setPage(1);
    }, [searchTerm, icons]);

    const decideTheIcon = useCallback((icon) => {
        if (themeType === "dark" && icon?.iconUrlLight) {
            return `${baseUrlLight}${icon?.iconUrlLight}`;
        } else {
            return `${baseUrl}${icon?.iconUrl}`;
        }
    }, [baseUrl, baseUrlLight, themeType]);

    const handleLoadMore = () => {
        if (searchTerm) return; // Don't load more when filtering

        const nextPage = page + 1;
        const startIndex = page * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        const newIcons = icons.slice(startIndex, endIndex);

        setDisplayedIcons(prev => [...prev, ...newIcons]);
        setPage(nextPage);
    };

    const handleSelectIcon = (icon) => {
        if (icon) {
            onSelectImage({
                iconUrl: `${baseUrl}${icon?.iconUrl}`,
                iconUrlLight: icon?.iconUrlLight ? `${baseUrlLight}${icon?.iconUrlLight}` : null,
                iconProvider,
                iconId: icon.iconId,
            });
        } else {
            makeToast("error", "No valid icon format available");
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const renderSearchBox = () => (
        <div className="mb-4">
            <NiceInput
                value={searchTerm}
                className='border bg-inputBg border-inputBorder text-inputText placeholder-inputPlaceholder'
                onChange={handleSearchChange}
                placeholder={`Search ${iconPack.iconName} Icons...`}
            />
        </div>
    );

    const renderIconGrid = () => (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4 overflow-auto max-h-64 place-items-center">
            {displayedIcons.map((icon, index) => (
                <motion.div
                    key={`${icon.iconUrl}-${index}`}
                    whileHover={{ scale: 0.92 }}
                    onClick={() => handleSelectIcon(icon)}
                    className="w-18 h-24 p-1 border border-imageSelectionBorder hover:border-imageSelectionHoverBorder bg-imageSelectionBg hover:bg-imageSelectionHoverBg rounded-lg flex flex-col justify-center items-center cursor-pointer transition-all duration-300"
                >
                    <div
                        className='w-16 h-16 flex justify-center items-center p-2'>
                        <ImageView
                            src={decideTheIcon(icon)}
                            alt={icon.iconName}
                            className="w-12 h-12 rounded-lg"
                            defaultSrc="/default.png"
                            errorSrc="/default.png"
                        />
                    </div>
                    <span className="text-xxs text-center w-full px-1 break-words leading-tight">
                        {icon.iconName}
                    </span>
                </motion.div>
            ))}
        </div>
    );

    if (isLoading) {
        return (
            <div className="flex flex-col justify-center items-center p-4 shadow rounded border border-gray-700">
                <NiceLoader className='text-loaderColor' />
                <p className="mt-4 text-center">Loading icons...</p>
            </div>
        );
    }

    return (
        <div>
            {renderSearchBox()}
            {renderIconGrid()}

            {!searchTerm && displayedIcons.length > 0 && displayedIcons.length < icons.length && (
                <div className="flex justify-center mt-4">
                    <NiceButton
                        label='Load More'
                        onClick={handleLoadMore}
                        parentClassname='w-full'
                        className='w-full bg-buttonGeneric text-buttonText'
                    />
                </div>
            )}
        </div>
    );
};
CustomIconPack.displayName = 'CustomIconPack';

CustomIconPack.propTypes = {
    onSelectImage: PropTypes.func.isRequired,
    iconPack: PropTypes.object.isRequired,
};

export default React.memo(CustomIconPack);