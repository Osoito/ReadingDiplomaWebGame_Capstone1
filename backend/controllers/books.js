import { response } from 'express'

// Used for book related routing
//const booksRouter = require('express').Router()
import express from 'express'
//const BookService = require('../services/bookService')
import BookService from '../services/bookService.js'

const booksRouter = express.Router()
// example route for getting all books
booksRouter.get('/', async (request, response) => {
    const books = await BookService.getAllBooks()
    response.json(books)
})

booksRouter.post('/', async(request, response) =>{
    const { title, author, coverimage, booktype } = request.body

    try{
        const newBook = await BookService.addBook({
            title,
            author,
            coverimage,
            booktype
        })
        response.status(201).json(newBook)
    } catch (error){
        response.status(400).json({ error: error.message })
    }
    

    
})


export default booksRouter