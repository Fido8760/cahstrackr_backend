import { transport } from "../config/nodemailer"

type EmailType = {
    name: string
    email: string
    token: string
}

export class AuthEmail {
    static sendConfirmationEmail = async (user: EmailType) => {
        const email = await transport.sendMail({
            from: 'CashTrackr <admin@cashtrackr.com>',
            to: user.email,
            subject: 'CastTrackr Confirma tu cuenta',
            html: `
                <p>Hola: ${user.name}, has creado tu cuenta en CashTrackr, ya está casi lista </p>
                <p>Visita el siguiente enlace:  </p>
                <a href="#">Confrimar Cuenta </a>
                <p>e ingresa el código: <b>${user.token}</b></p>

            `
        })
        //console.log('Mensaje Enviado', email.messageId)
    }

    static sendPasswordResetToken = async (user: EmailType) => {
        const email = await transport.sendMail({
            from: 'CashTrackr <admin@cashtrackr.com>',
            to: user.email,
            subject: 'CastTrackr - Reestablece tu password',
            html: `
                <p>Hola: ${user.name}, has solicitado reestablecer tu password</p>
                <p>Visita el siguiente enlace:  </p>
                <a href="#">Reestablecer Password</a>
                <p>e ingresa el código: <b>${user.token}</b></p>

            `
        })
        //console.log('Mensaje Enviado', email.messageId)
    }
}