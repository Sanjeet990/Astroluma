import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { loadingState, loginState, moveItemState, reloadFolderListingState, userDataState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import SingleListing from './SingleListing';
import PropTypes from 'prop-types';
import { FaCameraRetro, FaLink, FaArrowRight } from "react-icons/fa";

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy
} from "@dnd-kit/sortable";
import { Helmet } from 'react-helmet';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import NoListing from '../Misc/NoListing';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import NiceButton from '../NiceViews/NiceButton';
import NiceLink from '../NiceViews/NiceLink';
import NiceDrag from '../NiceViews/NiceDrag';
import makeToast from '../../utils/ToastUtils';

const Listings = ({ type }) => {
    const params = useParams();
    const listingId = params?.listingid;

    const [reloadData, setReloadData] = useRecoilState(reloadFolderListingState);
    const [moveItem, setMoveItem] = useRecoilState(moveItemState);
    const [itemList, setItemList] = useState([]);
    const [parentFolder, setParentFolder] = useState(null);
    const [activeId, setActiveId] = useState(null);
    const [breadcrumbList, setBreadcrumbList] = useState([]);

    const loginData = useRecoilValue(loginState);
    const userData = useRecoilValue(userDataState);
    const setLoading = useSetRecoilState(loadingState);
    const setActiveRoute = useCurrentRoute();

    useDynamicFilter(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const filteredItems = useMemo(() => {
        if (moveItem) {
            return itemList.filter(item => item.listingType === 'category');
        }
        return itemList;
    }, [itemList, moveItem]);

    useEffect(() => {
        setActiveRoute(`/manage/${type}`);
    }, [type, setActiveRoute]);

    const handleDragStart = useCallback((event) => {
        setActiveId(event.active.id);
    }, []);

    const updateReorderStatusOnServer = useCallback(async (reorderedArray) => {
        setLoading(true);
        try {
            const data = await ApiService.post(
                `/api/v1/listing/folder/${listingId}/reorder`,
                { items: reorderedArray.map(item => item._id) },
                loginData?.token
            );
            makeToast("success", String(data?.message));
        } catch {
            makeToast("error", "Reordering failed.");
        } finally {
            setLoading(false);
        }
    }, [listingId, loginData?.token, setLoading]);

    const handleDragEnd = useCallback((event) => {
        setActiveId(null);
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = itemList.findIndex(item => item._id === active.id);
            const newIndex = itemList.findIndex(item => item._id === over.id);
            const reorderedArray = arrayMove(itemList, oldIndex, newIndex);
            setItemList(reorderedArray);
            updateReorderStatusOnServer(reorderedArray);
        }
    }, [itemList, updateReorderStatusOnServer]);

    const moveHere = useCallback(async () => {
        if (!moveItem) return;

        setLoading(true);
        try {
            await ApiService.get(
                `/api/v1/listing/move/${moveItem?._id}/to/${listingId}`,
                loginData?.token
            );
            setMoveItem(null);
            setReloadData(true);
            makeToast("success", "Item moved successfully.");
        } catch {
            makeToast("error", "Item cannot be moved.");
        } finally {
            setLoading(false);
        }
    }, [moveItem, listingId, loginData?.token, setMoveItem, setReloadData, setLoading]);

    const cancelMove = useCallback(() => {
        setMoveItem(null);
    }, [setMoveItem]);

    const deleteListing = useCallback(async (id) => {
        setLoading(true);
        try {
            await ApiService.get(`/api/v1/listing/delete/${id}`, loginData?.token);
            setItemList(prev => prev.filter(item => item._id !== id));
            makeToast("success", "Selected Item deleted successfully.");
        } catch {
            makeToast("error", "Item cannot be deleted.");
        } finally {
            setLoading(false);
        }
    }, [loginData?.token, setLoading]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const data = await ApiService.get(
                    `/api/v1/listing/folder/${listingId}/list/manage/${type}`,
                    loginData?.token
                );
                setItemList(data?.message?.items);
                setParentFolder(data?.message?.parentFolder);
                setBreadcrumbList(data?.message?.breadcrumb);
            } catch {
                makeToast("error", "Can not fetch the folder details.");
            } finally {
                setLoading(false);
                setReloadData(false);
            }
        };

        fetchData();
    }, [listingId, reloadData, loginData?.token, setReloadData, setLoading, type]);

    const renderActionButtons = useMemo(() => (
        <div className="flex flex-wrap justify-between items-center mt-4 md:mt-0">
            <div className="text-lg font-semibold text-gray-600">
                {
                    moveItem && <>Select a folder to move to</>
                }
            </div>
            <div className="flex flex-wrap justify-end space-x-2">
                {moveItem ? (
                    <>
                        {parentFolder && (
                            <NiceLink
                                label='Go to Parent'
                                className="bg-buttonGeneric text-buttonText"
                                to={`/manage/listing/${parentFolder?.parentId ? parentFolder?.parentId : ""}`}
                            />
                        )}
                        {moveItem?.parentId !== listingId && (
                            <NiceButton
                                label="Move Here"
                                className="bg-buttonGeneric text-buttonText"
                                onClick={moveHere}
                            />
                        )}
                        <NiceButton
                            label="Cancel Move"
                            className="bg-buttonGeneric text-buttonText"
                            onClick={cancelMove}
                        />
                    </>
                ) : (
                    type !== "streaming" ? (
                        <>
                            {parentFolder && (
                                <NiceLink
                                    label='Go to Parent'
                                    className="bg-buttonGeneric text-buttonText"
                                    to={`/manage/listing/${parentFolder?.parentId ? parentFolder?.parentId : ""}`}
                                />
                            )}
                            <NiceLink
                                label="Add Folder"
                                className="bg-buttonGeneric text-buttonText"
                                to={`/manage/listing/${parentFolder ? `${parentFolder?._id}/` : ""}save/folder`}
                            />
                            <NiceLink
                                label="Add Link"
                                className="bg-buttonGeneric text-buttonText"
                                to={`/manage/listing/${parentFolder ? `${parentFolder?._id}/` : ""}save/link`}
                            />
                            {userData?.todolist && (
                                <NiceLink
                                    label="Add Todo"
                                    className="bg-buttonGeneric text-buttonText"
                                    to={`/manage/listing/${parentFolder ? `${parentFolder?._id}/` : ""}save/todo`}
                                />
                            )}
                            {userData?.snippetmanager && (
                                <NiceLink
                                    label="Add Snippet"
                                    className="bg-buttonGeneric text-buttonText"
                                    to={`/manage/listing/${parentFolder ? `${parentFolder?._id}/` : ""}save/snippet`}
                                />
                            )}
                        </>
                    ) : (
                        <NiceLink
                            label="Add RTSP Stream"
                            className="bg-buttonGeneric text-buttonText"
                            to={`/manage/listing/${parentFolder ? `${parentFolder?._id}/` : ""}save/stream`}
                        />
                    )
                )}
            </div>
        </div>
    ), [type, parentFolder, moveItem, listingId, userData?.todolist, userData?.snippetmanager, moveHere, cancelMove]);

    const getTitle = useMemo(() => {
        if (moveItem) {
            return `Move ${moveItem.listingName}`;
        }
        return type === "listing" ? "Folder" : "Stream Hub";
    }, [moveItem, type]);

    return (
        <>
            <Helmet>
                <title>{getTitle} Listing - {parentFolder ? parentFolder?.listingName : "Root"}</title>
            </Helmet>

            {type === "streaming" ? (
                <Breadcrumb
                    type="custom"
                    pageTitle="Stream Hub"
                    breadcrumbList={[{ id: "1", linkName: "Settings", linkUrl: "/manage" }]}
                />
            ) : listingId ? (
                <Breadcrumb
                    type="listing"
                    pageTitle={moveItem ? `Move ${moveItem.listingName}` : (parentFolder?.listingName || "Listing")}
                    breadcrumbList={breadcrumbList}
                />
            ) : (
                <Breadcrumb
                    type="custom"
                    pageTitle={moveItem ? `Move ${moveItem.listingName}` : (parentFolder?.listingName || "Listing")}
                    breadcrumbList={[{ id: "1", linkName: "Settings", linkUrl: "/manage" }]}
                />
            )}

            {renderActionButtons}

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
            >
                <div className="mt-4">
                    {filteredItems.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                            <SortableContext items={filteredItems} strategy={rectSortingStrategy}>
                                {filteredItems.map((item) => (
                                    <SingleListing
                                        key={item._id}
                                        id={item._id}
                                        handle
                                        item={item}
                                        deleteListing={deleteListing}
                                    />
                                ))}
                            </SortableContext>
                            <DragOverlay>
                                {activeId ? <NiceDrag /> : null}
                            </DragOverlay>
                        </div>
                    ) : moveItem ? (
                        <NoListing
                            mainText="Move Item Here"
                            subText={`No folders to move '${moveItem.listingName}' to. You can still move it here.`}
                            buttonText="Move Here"
                            buttonOnClick={moveHere}
                            displayIcon={<FaArrowRight />}
                        />
                    ) : type === "streaming" ? (
                        <NoListing
                            mainText="Oops! Nothing to List here"
                            subText="Please add some streaming source first!"
                            buttonText="Go to home"
                            buttonLink="/"
                            displayIcon={<FaCameraRetro />}
                        />
                    ) : (
                        <NoListing
                            mainText="Oops! Nothing to List here"
                            subText="Please create some folder or links first!"
                            buttonText="Go to home"
                            buttonLink="/"
                            displayIcon={<FaLink />}
                        />
                    )}
                </div>
            </DndContext>
        </>
    );
};

Listings.propTypes = {
    type: PropTypes.string.isRequired
};

export default React.memo(Listings);