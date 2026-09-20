import { Router } from 'express';
import clientController from '../controllers/client.controller';

const router = Router();

router.get('/', clientController.getAll.bind(clientController));

router.get('/:id', clientController.getById.bind(clientController));

router.post('/', clientController.create.bind(clientController));

router.put('/:id', clientController.update.bind(clientController));

router.delete('/:id', clientController.delete.bind(clientController));

export default router;