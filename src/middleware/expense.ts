import { Request, Response, NextFunction } from "express"
import { body, param, validationResult } from "express-validator"
import Expense from "../models/Expense"
import Budget from "../models/Budget"

declare global {
    namespace Express {
        interface Request {
            expense?: Expense
        }
    }
}

export const validateExpenseInput = async (req: Request, res: Response, next: NextFunction) => {
    await body('name')
        .notEmpty().withMessage('El nombre no puede ir vacio')
        .run(req)
        
    await body('amount')
        .notEmpty().withMessage('La cantidad no puede ir vacia')
        .isNumeric().withMessage('Cantidad no válida')
        .custom((value) => value > 0).withMessage('Gasto debe ser mayor a 0')
        .run(req)
    
    next()
    
}

export const validateExpenseId = async (req: Request, res: Response, next: NextFunction) => { 
    await param('expenseId')
        .isInt().withMessage('ID no válido')
        .custom((value) => value > 0).withMessage('ID no válido')
        .run(req)

    let errors = validationResult(req)
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() })
        return
    }
    next()
}

export const validateExpenseExists = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {expenseId} = req.params
        const expense = await Expense.findByPk(expenseId)
        if(!expense) {
            const error = new Error('Gasto no encontrado')
            res.status(404).json({error: error.message})
        }
        req.expense = expense

        next()
        
    } catch (error) {
        //console.log(error)
        res.status(500).json({error: 'Hubo un error'})    
    }
}
