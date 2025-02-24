import { Request, Response } from "express"
import User from "../models/User"
import { checkPassword, hashPassword } from "../utils/auth"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../emails/AuthEmails"
import { generateJWT } from "../utils/jwt"

export class AuthController {
    
    static createAccount = async (req: Request, res: Response) => {
        const {email, password} = req.body
        //prevenir duplicados
        const userExists = await User.findOne({where: {email}})
        if(userExists) {
            const error =  new Error('El Usuario ya existe')
            res.status(409).json({error: error.message})
            return
        }
        try {
            const user = await User.create(req.body)
            user.password = await hashPassword(password)

            const token = generateToken()
            user.token = token

            if(process.env.NODE_ENV !== 'production') {
                globalThis.cashTrackerConfirmationToken = token
            }

            await user.save()
            await AuthEmail.sendConfirmationEmail({
                name: user.name,
                email: user.email,
                token: user.token
            })
            res.status(201).json('Cuenta creada correctamente')
        } catch (error) {
            //console.log(error)
            res.status(500).json({error: 'Hubo un error'})
        }
    }

    static confirmAccount = async (req: Request, res: Response) => {

        const {token} = req.body
        const user = await User.findOne({where: {token}})
        if(!user) {
            const error = new Error('Token no válido')
            res.status(401).json({error: error.message})
            return
        }
        user.confirmed = true
        user.token = null
        await user.save()
        res.json('cuenta confirmada correctamente')

    }

    static login = async (req: Request, res: Response) => {

        const {email, password} = req.body
        const user = await User.findOne({where: {email}})

        if(!user) {
            const error = new Error('Usuario no encontrado')
            res.status(404).json({error: error.message})
            return
        }

        if(!user.confirmed) {
            const error = new Error('Usuario no confirmado')
            res.status(403).json({error: error.message})
            return
        }

        const isPassCorrect = await checkPassword(password, user.password)
        if(!isPassCorrect) {
            const error = new Error('Password Incorrecto')
            res.status(401).json({error: error.message})
            return
        }

        const token = generateJWT(user.id)
        res.json(token)

    }

    static forgoPassword = async (req: Request, res: Response) => {
        const {email} = req.body

        const user = await User.findOne({where: {email}})
        if(!user) {
            const error = new Error('Usuario no encontrado')
            res.status(404).json({error: error.message})
            return
        }
        user.token = generateToken()
        await user.save()

        await AuthEmail.sendPasswordResetToken({
            name: user.name,
            email: user.email,
            token: user.token
        })
        res.json('Revisa tu email Para Instrucciones')
    }

    static validateToken = async (req: Request, res: Response) => {
        const {token} = req.body
        const tokenExists = await User.findOne({where: {token}})
        if(!tokenExists) {
            const error = new Error('Token no válido')
            res.status(404).json({error: error.message})
            return
        }
        
        res.json('Token válido')
    }

    static resetPasswordWithToken = async (req: Request, res: Response) => {
        const {token} = req.params
        const {password} = req.body

        const user = await User.findOne({where: {token}})
        if(!user) {
            const error = new Error('Token no válido')
            res.status(404).json({error: error.message})
            return
        }
        //asignar el nuevo password
        user.password = await(hashPassword(password))
        user.token = null
        await user.save()

        res.json('El usuario se modificó correctamente')
        
    }

    static user = async (req: Request, res: Response) => {
        
        res.json(req.user)
    }

    static updateCurrentUserPassword = async (req: Request, res: Response) => {
        const {current_password, password} = req.body
        const {id} = req.user

        const user = await User.findByPk(id)

        const isPassCorrect = await checkPassword(current_password, user.password)
        if(!isPassCorrect) {
            const error = new Error('Password Actual Incorrecto')
            res.status(404).json({error: error.message})
            return
        }

        user.password = await hashPassword(password)
        await user.save()

        res.json('El password se modificó correctamente')
    }

    static checkPassword = async (req: Request, res: Response) => {
        const { password} = req.body
        const {id} = req.user

        const user = await User.findByPk(id)

        const isPassCorrect = await checkPassword(password, user.password)
        if(!isPassCorrect) {
            const error = new Error('Password Actual Incorrecto')
            res.status(404).json({error: error.message})
            return
        }
        res.json('Password Correcto')
    }
}