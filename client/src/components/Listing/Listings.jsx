import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { loadingState, loginState, moveItemState, reloadFolderListingState, userDataState } from '../../atoms';
import ApiService from '../../utils/ApiService';
import SingleListing from './SingleListing';
import PropTypes from 'prop-types';
import { FaCameraRetro, FaLink } from "react-icons/fa";

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

    const loginData = useRecoilValue(loginState);

    const userData = useRecoilValue(userDataState);

    const setLoading = useSetRecoilState(loadingState);
    const [breadcrumbList, setBreadcrumbList] = useState([]);

    const [activeId, setActiveId] = useState(null);

    const setActiveRoute = useCurrentRoute();

    useDynamicFilter(false);

    useEffect(() => {
        setActiveRoute(`/manage/${type}`);
    }, [type, setActiveRoute]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates
        })
    );

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        setActiveId(null);
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = itemList.findIndex(item => item._id === active.id);
            const newIndex = itemList.findIndex(item => item._id === over.id);
            const reorderedArray = arrayMove(itemList, oldIndex, newIndex);

            // Update the state with the reordered array
            setItemList(reorderedArray);
            updateReorderStatusOnServer(reorderedArray);
        }
    };

    const updateReorderStatusOnServer = (reorderedArray) => {
        setLoading(true);
        ApiService.post(`/api/v1/listing/folder/${listingId}/reorder`, { items: reorderedArray.map(item => item._id) }, loginData?.token)
            .then(data => {
                //setReloadData(true);
                makeToast("success", String(data?.message));
            })
            .catch(() => {
                makeToast("error", "Reordering failed.");
            }).finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        setLoading(true);
        ApiService.get(`/api/v1/listing/folder/${listingId}/list/manage/${type}`, loginData?.token)
            .then(data => {
                setItemList(data?.message?.items);
                setParentFolder(data?.message?.parentFolder);
                setBreadcrumbList(data?.message?.breadcrumb);
            })
            .catch(() => {
                makeToast("error", "Can not fetch the folder details.");
            }).finally(() => {
                setLoading(false);
                setReloadData(false);
            });
    }, [listingId, reloadData, loginData?.token, setReloadData, setLoading, type]);


    const moveHere = () => {
        if (moveItem) {
            setLoading(true);
            ApiService.get(`/api/v1/listing/move/${moveItem?._id}/to/${listingId}`, loginData?.token)
                .then(() => {
                    setMoveItem(null);
                    setReloadData(true);
                    makeToast("success", "Item moved successfully.");
                })
                .catch(() => {
                    makeToast("error", "Item cannot be moved.");
                }).finally(() => {
                    setLoading(false);
                });
        }
    };

    const deleteListing = (id) => {
        setLoading(true);

        ApiService.get(`/api/v1/listing/delete/${id}`, loginData?.token)
            .then(() => {
                setItemList(itemList.filter(item => item._id !== id));
                makeToast("success", "Selected Item deleted successfully.");
            })
            .catch(() => {
                makeToast("error", "Item cannot be deleted.");
            }).finally(() => {
                setLoading(false);
            });

    };

    return (
        <>
            <Helmet>
                <title>{type === "listing" ? "Folder" : "Stream Hub"} Listing - {parentFolder ? parentFolder?.listingName : "Root"}</title>
            </Helmet>

            {
                type === "streaming" ?
                    <Breadcrumb type="custom" pageTitle={"Stream Hub"} breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }]} />
                    :
                    listingId ? <Breadcrumb type="listing" pageTitle={parentFolder?.listingName || "Listing"} breadcrumbList={breadcrumbList} />
                        : <Breadcrumb type="custom" pageTitle={parentFolder?.listingName || "Listing"} breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }]} />
            }

            <div className="flex flex-col justify-between">
                <div className="text-left w-full md:w-auto" />
                <div className="flex flex-wrap justify-end space-x-2 mt-4 md:mt-0">
                    {
                        type !== "streaming" ?
                            <>
                                {
                                    parentFolder &&
                                    <NiceLink
                                        label='Go to Parent'
                                        className="bg-buttonGeneric text-buttonText"
                                        to={`/manage/listing/${parentFolder?.parentId ? `${parentFolder?.parentId}` : ""}`}
                                    />
                                }
                                {
                                    (moveItem && moveItem?.parentId !== listingId) && <NiceButton
                                        label="Move Here"
                                        className="bg-buttonGeneric text-buttonText"
                                        onClick={moveHere}
                                    />
                                }
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
                                {
                                    userData?.todolist && <NiceLink
                                        label="Add Todo"
                                        className="bg-buttonGeneric text-buttonText"
                                        to={`/manage/listing/${parentFolder ? `${parentFolder?._id}/` : ""}save/todo`}
                                    />
                                }
                                {
                                    userData?.snippetmanager && <NiceLink
                                        label="Add Snippet"
                                        className="bg-buttonGeneric text-buttonText"
                                        to={`/manage/listing/${parentFolder ? `${parentFolder?._id}/` : ""}save/snippet`}
                                    />
                                }
                            </> :
                            <NiceLink
                                label="Add RTSP Stream"
                                className="bg-buttonGeneric text-buttonText"
                                to={`/manage/listing/${parentFolder ? `${parentFolder?._id}/` : ""}save/stream`}
                            />
                    }
                </div>
            </div>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
            >
                <div className="mt-4">
                    {
                        itemList?.length > 0 ?
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                <SortableContext items={itemList} strategy={rectSortingStrategy}>
                                    {itemList.map((item) => {
                                        return (
                                            <SingleListing key={item._id} id={item._id} handle item={item} deleteListing={deleteListing} />
                                        );
                                    })}
                                    <DragOverlay>
                                        {activeId ? (
                                            <NiceDrag />
                                        ) : null}
                                    </DragOverlay>
                                </SortableContext>
                            </div> :
                            type === "streaming" ? <NoListing mainText="Oops! Nothing to List here" subText="Please add some streaming source first!" buttonText="Go to home" buttonLink="/" displayIcon={<FaCameraRetro />} />
                                :
                                <NoListing mainText="Oops! Nothing to List here" subText="Please create some folder or links first!" buttonText="Go to home" buttonLink="/" displayIcon={<FaLink />} />
                    }
                </div>
            </DndContext>
        </>
    );
};

Listings.propTypes = {
    type: PropTypes.string.isRequired
};

const MemoizedComponent = React.memo(Listings);
export default MemoizedComponent;
