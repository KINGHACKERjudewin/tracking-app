const router = require('express').Router();
const ctrl = require('../controllers/timetrackingController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/today', ctrl.todaySummary);
router.get('/',         ctrl.getSessions);
router.post('/start',   ctrl.start);
router.put('/:id/stop', ctrl.stop);
router.delete('/:id',   ctrl.remove);

module.exports = router;
