import { Router } from 'express';
import serviceController from '../controllers/service.controller';

const router = Router();

router.get('/', serviceController.getAll.bind(serviceController));

router.get('/active', serviceController.getActive.bind(serviceController));

router.get('/:id', serviceController.getById.bind(serviceController));

router.post('/', serviceController.create.bind(serviceController));

router.put('/:id', serviceController.update.bind(serviceController));

router.delete('/:id', serviceController.delete.bind(serviceController));

export default router;