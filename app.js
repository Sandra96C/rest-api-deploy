const express = require('express') // require -> commonJS
const movies = require('./movies.json')
const PORT = process.env.PORT ?? 1234
const crypto = require('node:crypto')
const app = express()
const { validateMovie, validateParcialMovie } = require('./schema/movies')
const util = require("util")
const cors = require('cors') // cuidao perque moltes voltes ho solventa posant un asterisc

app.use(express.json())
app.disable('x-powered-by')
app.use(cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = [
            'http://localhost:8080',
            'http://localhost:1234',
            'http://movies.com',
            'http://midu.dev',
        ]

        if(ACCEPTED_ORIGINS.includes(origin) || !origin) {
            return callback(null, true)
        }

        return callback(new Error('Not allowed by CORS'))
    }
}))
// metodos normales: GET/HEAD/POST
// metodos complejos: PUT/PATCH/DELETE

// CORS PRE-Flight
// OPTIONS



// Todos los recursos que sean MOVIES se identifican como /movies
app.get('/movies', (req, res) => {
    // res.header('Access-Control-Allow-Origin', '*') // Todos tendrian accesso
    // res.header('Access-Control-Allow-Origin', 'http://localhost:8080') // Solo tendrian acceso los localhost con ese puerto

    const origin = req.header('origin')
    
    // Cuando la peticion es del mismo Origin no envia ese header
    // if(ACCEPTED_ORIGINS.includes(origin) || !origin) {
    //     res.header('Access-Control-Allow-Origin', origin) // Solo tendrian acceso los localhost con ese puerto
    // }
    
    const { genre } = req.query
    
    if(genre) {
        const filteredMovies = movies.filter( movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase()))
        return res.json(filteredMovies)
    }

    res.json(movies)
} )

app.get('/movies/:id', (req, res) => { 
    const { id } = req.params
    const movie = movies.find((movie) => movie.id == id)
    if(movie) return res.json(movie)
    
    return res.status(404).json({message: 'Movie not found'})
})

app.patch('/movies/:id', (req, res) => {
    const result = validateParcialMovie(req.body)
    
    if(!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)
    
    if(movieIndex === -1) {
        return res.status(404).json({message: 'Movie not found'})
    }

    const updatedMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updatedMovie
    return res.json(updatedMovie)
})

app.post('/movies', (req, res) => {
    const result = validateMovie(req.body)
    
    if(result.error) { //!result.success
        //422
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const newMovie = {
        id: crypto.randomUUID(), // uuid v4
        ...result.data
    }
    // Esto no seria REST, porque estamos guardanado
    // el estado de la aplicacion en memoria
    movies.push(newMovie)
    
    res.status(201).json(newMovie)
})

app.options('/movies/:id', (req, res) => {
    const origin = req.header('origin')
    
    // Cuando la peticion es del mismo Origin no envia ese header
    // if(ACCEPTED_ORIGINS.includes(origin) || !origin) {
    //     res.header('Access-Control-Allow-Origin', origin)
    //     res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE')
    // }

    // res.send()
    res.sendStatus(200)
})

app.delete('/movies/:id', (req, res) => {

    const origin = req.header('origin')
    
    // Cuando la peticion es del mismo Origin no envia ese header
    // if(ACCEPTED_ORIGINS.includes(origin) || !origin) {
    //     res.header('Access-Control-Allow-Origin', origin) // Solo tendrian acceso los localhost con ese puerto
    // }

    const { id } = req.params
    const movieIndex = movies.findIndex(movie => movie.id === id)

    if(movieIndex === -1) {
        return res.status(404).json({message: 'Movie not found'})
    }

    movies.splice(movieIndex, 1)
    return res.json({ message: 'Movie deleted'})

})

app.listen(PORT, () => {
    console.log(`Servidor escuchando http://localhost:${PORT}`)    
})