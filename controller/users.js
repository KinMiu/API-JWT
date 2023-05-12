import usersModel from '../models/usersModel.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

export const getUsers = async(req, res) => {
    try {
        const users = await usersModel.findAll({
            attributes: ['id', 'name', 'email']
        })
        res.json(users)
    } catch (error) {
        console.log(error)
    }
} 

export const registrasi = async(req, res) => {
    const { name, email, password, confPassword } = req.body
    console.log(name, email, password, password)
    if(password !== confPassword) return res.status(400).json({ msg: 'Password dan Confirm Password tidak cocok' })
    const salt = await bcrypt.genSalt()
    const hashpassword = await bcrypt.hash(password, salt)
    try {
        await usersModel.create({
            name: name,
            email: email,
            password: hashpassword
        })
        res.json({ msg: 'Registrasi Berhasil' })
    } catch (error) {
        console.log(error)
    }
}

export const Login = async(req, res) => {
    try { 
        const user = await usersModel.findAll({
            where: {
                email: req.body.email
            }
        })
        const match = await bcrypt.compare(req.body.password, user[0].password)
        if(!match) return res.status(400).json({ msg: 'Wrong Password' })
        const userID = user[0].id
        const name = user[0].name
        const email = user[0].email

        const accessToken = jwt.sign({userID, name, email}, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '20s'
        })
        const refreshToken = jwt.sign({userID, name, email}, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: '1d'
        })
        await usersModel.update({ refresh_token: refreshToken }, {
            where: {
                id: userID
            }
        })
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        })
        res.json({ accessToken })
    } catch (error) {
        res.status(404).json({ msg: 'Email Tidak ditemukan' })
    }
} 

export const logout = async(req, res) => {
    const refreshToken = req.cookies.refreshToken
    if(!refreshToken) return res.sendStatus(204)
    const user = await usersModel.findAll({
        where: {
            refresh_token: refreshToken
        }
    })
    if(!user[0]) return res.sendStatus(204)
    const userID = user[0].id
    await usersModel.update({ refresh_token: null }, {
        where: {
            id: userID
        }
    })
    res.clearCookie('refreshToken')
    return res.sendStatus(200)
} 
// const getUsers = async(req, res) => {} 