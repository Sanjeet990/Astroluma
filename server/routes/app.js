const express = require('express');
const { verifyToken } = require('../middlewares/auth');
const { runIntegratedApp, connectTest, installedApps } = require('../controllers/app');

const router = express.Router();

router.get('/app/run/:listingId/:appId', verifyToken, runIntegratedApp);
router.post('/app/test', verifyToken, connectTest);
router.get('/app/installed', verifyToken, installedApps);

module.exports = router;