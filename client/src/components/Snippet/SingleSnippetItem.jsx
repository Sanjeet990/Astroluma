import React, { useCallback, useEffect, useState } from "react";
import { FaPlus } from 'react-icons/fa';
import { useRecoilValue, useSetRecoilState } from "recoil";
import { contentLoadingState, loginState, newDeleteCodeModalState, newSnippetCodeModalState } from "../../atoms";
import ApiService from '../../utils/ApiService';
import SingleCodeItem from "./SingleCodeItem";
import NewSnippetCodeItemModal from "../Modals/NewSnippetCodeItemModal";
import DeleteCodeItemModal from "../Modals/DeleteCodeItemModal";
import { motion } from "framer-motion";
import makeToast from "../../utils/ToastUtils";
import PropTypes from "prop-types";
import emitter, { RELOAD_CODE_SNIPPET } from "../../events";
import { useNavigate } from "react-router-dom";

const SingleSnippetItem = ({ snippet }) => {

    const navigate = useNavigate();

    const loginData = useRecoilValue(loginState);
    const setLoading = useSetRecoilState(contentLoadingState);
    const setModalState = useSetRecoilState(newSnippetCodeModalState);
    const setDeleteModalState = useSetRecoilState(newDeleteCodeModalState);
    const [fileList, setFileList] = useState([]);

    const reloadCodeSnippets = useCallback(() => {
        setLoading(true);
        ApiService.get(`/api/v1/snippet/list/${snippet?._id}`, loginData?.token, navigate)
            .then(data => {
                setFileList(data.message.snippetItems);
            })
            .catch((error) => {
                if (!error.handled) makeToast("error", "Can not load data.");
            }).finally(() => {
                setLoading(false);
            });
    }, [snippet, loginData, setLoading, navigate]);

    useEffect(() => {
        emitter.on(RELOAD_CODE_SNIPPET, reloadCodeSnippets);

        return emitter.off(RELOAD_CODE_SNIPPET, reloadCodeSnippets);
    }, [reloadCodeSnippets]);

    useEffect(() => {
        reloadCodeSnippets();
    }, [snippet, reloadCodeSnippets]);

    const addNewFile = () => {
        setModalState({ isOpen: true, data: { snippetId: snippet?._id } })
    }

    const editCodeFile = (file) => {
        setModalState({ isOpen: true, data: { snippetId: snippet?._id, snippetItem: file } })
    }

    const deleteCodeFile = (file) => {
        setDeleteModalState({ isOpen: true, data: { snippetId: snippet?._id, snippetItem: file } })
    }

    return (
        <>
            <NewSnippetCodeItemModal />
            <DeleteCodeItemModal />

            <div className="p-4 codeviewer">
                <div className="panel flex justify-end items-center">
                    <FaPlus onClick={addNewFile} className="cursor-pointer text-snippedIconColor hover:text-snippedIconHoverColor" />
                </div>
            </div>
            <div>
                {
                    fileList.length === 0 ?
                        <div className="flex items-center justify-center h-32">
                            <p>No snippets here. You can add one by clicking the plus icon above.</p>
                        </div>
                        :
                        fileList.map((file, index) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                key={file._id}
                            >
                                <SingleCodeItem key={index} snippet={file} editCodeFile={() => editCodeFile(file)} deleteCodeFile={() => deleteCodeFile(file)} />
                            </motion.div>
                        ))
                }
            </div>
        </>
    );
};

SingleSnippetItem.propTypes = {
    snippet: PropTypes.object.isRequired
}

const MemoizedComponent = React.memo(SingleSnippetItem);
export default MemoizedComponent;