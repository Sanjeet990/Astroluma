const express = require('express');
const { doLogin, authMethods, validateOIDCCode } = require('../controllers/auth');

const router = express.Router();

router.post('/login', doLogin);
router.get('/login/methods', authMethods);
router.post('/login/oidc/validate', validateOIDCCode);

module.exports = router;