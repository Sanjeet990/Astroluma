const express = require('express');
const { verifyToken } = require('../middlewares/auth');
const { userList, accountInfo, saveAccount, deleteUser, changePassword, updateAvatar, updateOwnAvatar } = require('../controllers/accounts');

const router = express.Router();

router.post('/accounts/save', verifyToken, saveAccount);
router.get('/accounts/list', verifyToken, userList);
router.get('/accounts/info/:userId', verifyToken, accountInfo);
router.get('/accounts/delete/:userId', verifyToken, deleteUser);
router.post('/accounts/password/:userId', verifyToken, changePassword);
router.post('/accounts/avatar/:userId', verifyToken, updateAvatar);
router.post('/accounts/avatar', verifyToken, updateOwnAvatar);

module.exports = router;