import { Router } from 'express';
import attendanceController from '../controllers/attendance.controller';

const router = Router();

router.get(
  '/',
  attendanceController.getAll.bind(attendanceController)
);

router.post(
  '/',
  attendanceController.create.bind(attendanceController)
);

router.patch(
  '/:id/confirm',
  attendanceController.confirm.bind(attendanceController)
);

router.patch(
  '/:id/cancel',
  attendanceController.cancel.bind(attendanceController)
);

router.get(
  '/:id',
  attendanceController.getById.bind(attendanceController)
);

router.post(
  '/public',
  attendanceController.createPublic.bind(attendanceController)
);

router.get(
  '/:id/portfolio',
  attendanceController.getPortfolio.bind(attendanceController)
);
export default router;