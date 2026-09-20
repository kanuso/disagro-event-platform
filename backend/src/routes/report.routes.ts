import { Router } from 'express';
import reportController from '../controllers/report.controller';

const router = Router();

router.get(
  '/attendances',
  reportController.getAttendanceReport.bind(reportController)
);

router.get(
  '/products',
  reportController.getProductReport.bind(reportController)
);

router.get(
  '/services',
  reportController.getServiceReport.bind(reportController)
);

export default router;