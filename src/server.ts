import express from 'express' 
import colors from 'colors'
import morgan from 'morgan'
import { db } from './config/db'
import budgetRouter from './routes/budgetRouter'
import authRouter from './routes/authRouter'

export async function conncetDB() {
    try {
        await db.authenticate()
        db.sync()
        //console.log( colors.blue.bold('Conexión exitosa a la bd'))
    } catch (error) {
        //console.log(error)
        //console.log( colors.red.bold('Hubo un error en la BD'))
    }
}

conncetDB()

const app = express()

app.use(morgan('dev'))

app.use(express.json())

app.use('/api/budgets', budgetRouter)
app.use('/api/auth', authRouter)

app.get('/', (req, res) => {
    res.send('Todo bien...')
})


export default app