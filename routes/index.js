import express from 'express'
import { getUsers, registrasi, Login, logout } from '../controller/users.js'
import { verifyToken } from '../middleware/verifyToken.js'
import { refreshToken } from '../controller/refreshToken.js'

const router = express.Router()

router.get('/users', verifyToken,getUsers)
router.post('/users', registrasi)
router.post('/login', Login)
router.get('/token', refreshToken)
router.delete('/logout', logout)

export default router