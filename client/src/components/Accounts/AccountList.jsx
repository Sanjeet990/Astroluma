import React, { useEffect, useState } from 'react';
import { Helmet } from "react-helmet";
import { motion } from 'framer-motion';
import ApiService from '../../utils/ApiService';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { changePasswordModalState, deletedUserState, deleteUserModalState, loadingState, loginState } from '../../atoms';
import DeleteUserModal from '../Modals/DeleteUserModal';
import UpdatePasswordModal from '../Modals/UpdatePasswordModal';
import useDynamicFilter from '../../hooks/useDynamicFilter';
import Breadcrumb from '../Breadcrumb/Breadcrumb';
import useCurrentRoute from '../../hooks/useCurrentRoute';
import NiceButton from '../NiceViews/NiceButton';
import NiceLink from '../NiceViews/NiceLink';
import makeToast from '../../utils/ToastUtils';


const AccountList = () => {

  const [userList, setUserList] = useState([]);

  const setLoading = useSetRecoilState(loadingState);
  const loginData = useRecoilValue(loginState);

  const setUserDelete = useSetRecoilState(deleteUserModalState);
  const setChangePassword = useSetRecoilState(changePasswordModalState);
  const deletedUser = useRecoilValue(deletedUserState);

  useDynamicFilter(false);
  useCurrentRoute("/manage/accounts");

  //fetch details of the folder by userId
  useEffect(() => {
    setLoading(true);
    ApiService.get("/api/v1/accounts/list", loginData?.token)
      .then(data => {
        setUserList(data?.message);
      })
      .catch(() => {
        makeToast("error", "Error loading data...");
      }).finally(() => {
        setLoading(false);
      });
  }, [loginData?.token, setLoading, deletedUser]);


  const deleteUser = (userId) => {
    setUserDelete({ isOpen: true, data: { userId } });
  }

  const changePassword = (userId) => {
    setChangePassword({ isOpen: true, data: { userId } });
  }

  return (
    <>
      <DeleteUserModal />
      <UpdatePasswordModal />
      <Helmet>
        <title>User Accounts</title>
      </Helmet>

      <Breadcrumb type="custom" pageTitle={"User Accounts"} breadcrumbList={[{ "id": "1", "linkName": "Settings", "linkUrl": "/manage" }]} />

      <div className="flex flex-col justify-between">
        <div className="text-left w-full md:w-auto" />
        {
          loginData?.admin && <div className="flex flex-wrap justify-end space-x-2 mt-4 md:mt-0">
            <NiceLink
              label='Add User'
              to="/manage/accounts/add"
              className="bg-buttonGeneric text-buttonText"
            />
          </div>
        }
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full mt-4"
      >
        <ul className="space-y-4 w-full">
          {
            !loginData?.admin ?
              <li className="border-internalCardBorder bg-internalCardBg text-internalCardText shadow-md rounded-lg p-2 flex justify-center items-center w-full md:p-4">
                <p className="text-lg">You are not authorized to view this page.</p>
              </li>
              :
              userList.length === 0 ?
                <li className="border-internalCardBorder bg-internalCardBg text-internalCardText shadow-md rounded-lg p-2 flex justify-center items-center w-full md:p-4">
                  <p className="text-lg">No users found.</p>
                </li>
                :
                userList?.map(user => (
                  <motion.li
                    key={user._id}
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 * user._id }}
                    className="border-internalCardBorder bg-internalCardBg text-internalCardText shadow-md rounded-lg p-2 flex flex-col md:flex-row justify-between items-start md:items-center w-full md:p-4"
                  >
                    <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mt-2 md:mt-0 mr-auto">
                      <div className="text-base md:text-base">{user.fullName}</div>
                      <div className="text-sm md:text-base md:ml-4">({user.username})</div>
                    </div>
                    <div className="flex space-x-2 mt-2 md:mt-0 ml-auto">
                      <NiceLink
                        label="Edit"
                        className="bg-buttonGeneric text-buttonText"
                        to={`/manage/accounts/${user._id}`}
                      />
                      <NiceButton
                        label="Delete"
                        className="bg-buttonDanger text-buttonText"
                        onClick={() => deleteUser(user._id)}
                        disabled={user.isSuperAdmin}
                      />
                      <NiceButton
                        label="Reset Password"
                        className="bg-buttonSuccess text-buttonText"
                        onClick={() => changePassword(user._id)}
                      />
                    </div>
                  </motion.li>
                ))
          }
        </ul>
      </motion.div>
    </>
  );
};


const MemoizedComponent = React.memo(AccountList);
export default MemoizedComponent;
