const z = require('zod')

const movieSchema = z.object({
    title: z.string({
        invalid_type_error: 'Movie title must be a string',
        required_error: 'Movie title is required.'
    }),
    year: z.number().int().min(1900).max(2025),
    director: z.string(),
    duration: z.number().positive(),
    rate: z.number().min(0).max(20).default(5),
    poster: z.string().url({
        message: 'Poster must be a valid URL'
    }),
    genre: z.array(
        z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi', 'Romance', 'Crime']),
        {
            required_error: 'Movie genre is required.',
            invalid_type_error: 'Movie genre must be an arrat of enum Genre',
        }
    )
    // genre: z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi', 'Romance']).array()
})

function validateMovie(object) {
    // return movieSchema.parse(object)
    return movieSchema.safeParse(object) //devuelve un objeto 
}

function validateParcialMovie(object) {
    return movieSchema.partial().safeParse(object) // si la propiedad esta la valida
}

module.exports = {
    validateMovie,
    validateParcialMovie
}