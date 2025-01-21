import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { motion } from 'framer-motion';
import { BsThreeDots } from "react-icons/bs";
import ApiService from '../../utils/ApiService';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { changePasswordModalState, deletedUserState, deleteUserModalState, loadingState, loginState, imageModalState, selectedImageState, reloadDashboardDataState, userDataState } from '../../atoms';
import DeleteUserModal from '../Modals/DeleteUserModal';
import UpdatePasswordModal from '../Modals/UpdatePasswordModal';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import NiceLink from '../NiceViews/NiceLink';
import makeToast from '../../utils/ToastUtils';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const DropdownMenu = ({ isOpen, onClose, onEdit, onDelete, onChangePassword, onChangeAvatar, isSuperAdmin }) => {
  return isOpen ? (
    <>
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="absolute right-0 top-full mt-2 w-48 rounded-md shadow-lg bg-popupMenuBg border border-popupMenuBorder text-popupMenuText ring-1 ring-black ring-opacity-5 z-50">
        <div className="py-1">
          <button
            onClick={onEdit}
            className="w-full text-left px-4 py-2 text-sm text-popupMenuText hover:text-popupMenuHoverText hover:bg-popupMenuHoverBg"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="w-full cursor-pointer disabled:cursor-not-allowed text-left px-4 py-2 text-sm text-popupMenuText hover:text-popupMenuHoverText hover:bg-popupMenuHoverBg disabled:hover:text-popupMenuHoverText/40 disabled:hover:bg-popupMenuHoverBg/40 disabled:text-popupMenuText/40"
            disabled={isSuperAdmin}
          >
            Delete
          </button>
          <button
            onClick={onChangeAvatar}
            className="w-full text-left px-4 py-2 text-sm text-popupMenuText hover:text-popupMenuHoverText hover:bg-popupMenuHoverBg"
          >
            Change Avatar
          </button>
          <button
            onClick={onChangePassword}
            className="w-full text-left px-4 py-2 text-sm text-popupMenuText hover:text-popupMenuHoverText hover:bg-popupMenuHoverBg"
          >
            Reset Password
          </button>
        </div>
      </div>
    </>
  ) : null;
};


const AccountList = () => {
  const navigate = useNavigate();
  const [userList, setUserList] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isInitialMount, setIsInitialMount] = useState(true);

  const setLoading = useSetRecoilState(loadingState);
  const loginData = useRecoilValue(loginState);
  const userData = useRecoilValue(userDataState);
  const setUserDelete = useSetRecoilState(deleteUserModalState);
  const setChangePassword = useSetRecoilState(changePasswordModalState);
  const setChangeAvatar = useSetRecoilState(imageModalState);
  const deletedUser = useRecoilValue(deletedUserState);
  const setReloadData = useSetRecoilState(reloadDashboardDataState);

  const [selectedImage, setSelectedImage] = useRecoilState(selectedImageState);

  useDynamicFilter(false);
  useCurrentRoute("/manage/accounts");

  useEffect(() => {
    setSelectedImage(null);
    setIsInitialMount(false);
  }, [setSelectedImage, setIsInitialMount]);

  useEffect(() => {
    setLoading(true);
    ApiService.get("/api/v1/accounts/list", loginData?.token, navigate)
      .then(data => {
        setUserList(data?.message);
      })
      .catch((error) => {
        if (!error.handled) makeToast("error", "Error loading data...");
      }).finally(() => {
        setLoading(false);
      });
  }, [loginData?.token, setLoading, deletedUser, navigate]);

  useEffect(() => {
    if (selectedImage !== null && !isInitialMount) {
      setLoading(true);

      ApiService.post(`/api/v1/accounts/avatar/${selectedImage?.data}`, { avatar: selectedImage?.image }, loginData?.token, navigate)
        .then(() => {
          //Reload it admin is changing their own avatar
          if (selectedImage?.data.toString() === userData?._id.toString()) {
            setReloadData(true);
          }

          makeToast("success", "Avatar updated successfully.");
        })
        .catch((error) => {
          console.log(error);
          if (!error.handled) makeToast("error", "Error updating avatar...");
        }).finally(() => {
          setLoading(false);
          setSelectedImage(null);
        });
    }
  }, [loginData?.token, setLoading, navigate, selectedImage, isInitialMount, setSelectedImage, setReloadData, userData?._id]);

  const deleteUser = (userId) => {
    setUserDelete({ isOpen: true, data: { userId } });
    setOpenMenuId(null);
  }

  const changePassword = (userId) => {
    setChangePassword({ isOpen: true, data: { userId } });
    setOpenMenuId(null);
  }

  const handleEdit = (userId) => {
    navigate(`/manage/accounts/${userId}`);
    setOpenMenuId(null);
  }

  const changeAvatar = (userId) => {
    setChangeAvatar({ isOpen: true, title: "Select Avatar", data: userId });
    setOpenMenuId(null);
  }

  return (
    <>
      <DeleteUserModal />
      <UpdatePasswordModal />
      <Helmet>
        <title>User Accounts</title>
      </Helmet>

      <Breadcrumb
        type="custom"
        pageTitle="User Accounts"
        breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }]}
      />

      <div className="flex flex-col justify-between">
        <div className="text-left w-full md:w-auto" />
        {loginData?.admin && (
          <div className="flex flex-wrap justify-end space-x-2 mt-4 md:mt-0">
            <NiceLink
              label='Add User'
              to="/manage/accounts/add"
              className="bg-buttonGeneric text-buttonText"
            />
          </div>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full mt-4"
      >
        <ul className="space-y-4 w-full">
          {!loginData?.admin ? (
            <li className="border-internalCardBorder bg-internalCardBg text-internalCardText shadow-md rounded-lg p-2 flex justify-center items-center w-full md:p-4">
              <p className="text-lg">You are not authorized to view this page.</p>
            </li>
          ) : userList.length === 0 ? (
            <li className="border-internalCardBorder bg-internalCardBg text-internalCardText shadow-md rounded-lg p-2 flex justify-center items-center w-full md:p-4">
              <p className="text-lg">No users found.</p>
            </li>
          ) : (
            userList?.map(user => (
              <motion.li
                key={user._id}
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 * user._id }}
                className="border-internalCardBorder bg-internalCardBg text-internalCardText shadow-md rounded-lg p-2 relative flex items-center w-full"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center gap-1">
                    <span className="text-base truncate">{user.fullName}</span>
                    <span className="text-sm md:text-base">({user.username})</span>
                  </div>
                </div>

                <div className="flex items-center ml-4 relative">
                  {
                    (userData?._id?.toString() !== user?._id?.toString()) && <>
                      <button
                        onClick={() => setOpenMenuId(openMenuId === user._id ? null : user._id)}
                        className="p-2 rounded-full hover:bg-white/40"
                      >
                        <BsThreeDots />
                      </button>
                      <DropdownMenu
                        isOpen={openMenuId === user._id}
                        onClose={() => setOpenMenuId(null)}
                        onEdit={() => handleEdit(user._id)}
                        onDelete={() => deleteUser(user._id)}
                        onChangePassword={() => changePassword(user._id)}
                        onChangeAvatar={() => changeAvatar(user._id)}
                        userId={user._id}
                        isSuperAdmin={user.isSuperAdmin}
                      />
                    </>
                  }
                </div>
              </motion.li>
            ))
          )}
        </ul>
      </motion.div>
    </>
  );
};

DropdownMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onChangePassword: PropTypes.func.isRequired,
  onChangeAvatar: PropTypes.func.isRequired,
  isSuperAdmin: PropTypes.bool.isRequired
};

AccountList.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onChangePassword: PropTypes.func,
  isSuperAdmin: PropTypes.bool
};

export default React.memo(AccountList);