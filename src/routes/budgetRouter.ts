import { Router } from 'express'
import { body } from 'express-validator'
import { BudgetController } from '../controllers/BudgetController'
import { handleInputErrors } from '../middleware/validation'

const router = Router()

router.get('/', 
    BudgetController.getAll
)

router.post('/', 
    body('name')
        .notEmpty().withMessage('El nombre no puede ir vacio'),
    body('amount')
        .notEmpty().withMessage('La cantidad no puede ir vacia')
        .isNumeric().withMessage('Cantidad no válida')
        .custom((value) => value > 0).withMessage('Presupuesto debe ser mayor a 0'),
    handleInputErrors,
    BudgetController.create
)

router.get('/:id', BudgetController.getById)

router.put('/:id', BudgetController.updateById)

router.put('/:id', BudgetController.deleteById)

export default router