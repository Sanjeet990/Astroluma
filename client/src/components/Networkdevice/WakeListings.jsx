import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { PiDevicesDuotone } from "react-icons/pi";
import { loadingState, loginState, reloadFolderListingState } from '../../atoms';
import ApiService from '../../utils/ApiService';

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
import SingleDeviceItem from './SingleDeviceItem';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import NoListing from '../Misc/NoListing';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import NiceLink from '../NiceViews/NiceLink';
import NiceDrag from '../NiceViews/NiceDrag';
import makeToast from '../../utils/ToastUtils';
import { useNavigate } from 'react-router-dom';


const WakeListings = () => {

    const navigate = useNavigate();

    const [reloadData, setReloadData] = useRecoilState(reloadFolderListingState);

    const [itemList, setItemList] = useState([]);

    const loginData = useRecoilValue(loginState);
    const setLoading = useSetRecoilState(loadingState);

    const [activeId, setActiveId] = useState(null);

    useDynamicFilter(false);
    useCurrentRoute("/manage/networkdevices");

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

        if (!over) {
            return;
        }

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
        ApiService.post("/api/v1/networkdevices/device/reorder", { items: reorderedArray.map(item => item._id) }, loginData?.token, navigate)
            .then(data => {
                //setReloadData(true);
                makeToast("success", String(data?.message));
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Error updating the reorder status.");
            }).finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        setLoading(true);
        ApiService.get("/api/v1/networkdevices/db/devices", loginData?.token, navigate)
            .then(data => {
                setItemList(data?.message?.items);
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Error fetching the network devices.");
            }).finally(() => {
                setLoading(false);
                setReloadData(false);
            });
    }, [reloadData, loginData, setLoading, setReloadData, navigate]);

    const deleteNetworkDevice = (id) => {
        setLoading(true);

        ApiService.get(`/api/v1/networkdevices/delete/${id}`, loginData?.token, navigate)
            .then(() => {
                setItemList(itemList.filter(item => item._id !== id));
                makeToast("success", "Selected Item deleted successfully.");
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Error deleting the selected item.");
            }).finally(() => {
                setLoading(false);
            });

    };

    return (
        <>
            <Helmet>
                <title>Network Devices Listing</title>
            </Helmet>

            <Breadcrumb type="custom" pageTitle={"Network Devices"} breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }]} />

            <div className="flex flex-col justify-between">
                <div className="text-left w-full md:w-auto" />
                <div className="flex flex-wrap justify-end space-x-2 mt-4 md:mt-0">
                    <NiceLink
                        className="bg-buttonGeneric text-buttonText"
                        label="Add Device"
                        to="/manage/networkdevices/save"
                    />
                </div>
            </div>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
                onDragStart={handleDragStart}
            >
                <div className="mt-8">
                    {
                        itemList?.length > 0 ?
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                                <SortableContext items={itemList} strategy={rectSortingStrategy}>
                                    {
                                        itemList.map((item) => {
                                            return (
                                                <SingleDeviceItem key={item._id} id={item._id} handle item={item} deleteNetworkDevice={deleteNetworkDevice} />
                                            );
                                        })
                                    }
                                    <DragOverlay>
                                        {
                                            activeId ? (
                                                <NiceDrag />
                                            ) : null}
                                    </DragOverlay>
                                </SortableContext>
                            </div> : <NoListing mainText="Oops! Nothing to List here" subText="Please add some devices first!" buttonText="Go to home" buttonLink="/" displayIcon={<PiDevicesDuotone />} />
                    }
                </div>
            </DndContext>
        </>
    );
};

const MemoizedComponent = React.memo(WakeListings);
export default MemoizedComponent;