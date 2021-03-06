require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')



app.use(express.static('build'))
app.use(cors())
app.use(bodyParser.json())

morgan.token('id', function getId(req) {
  return req.id
})

morgan.token('content', function (req,res) { 
  return [JSON.stringify(req.body)]
})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :content '))
    

app.get('/info',(req,res) => {

  var now = new Date().toString()
  var people = Person.find({}).then(persons => {
    res.json(`Phonebook has info for ${persons.map(person => person.toJSON()).length} people.  ${now}`)
  })
  //res.send(`Phonebook has info for ${persons.} people.<br><br>${now}`) 
})  

app.get('/api/persons',(req,res) => {
  Person.find({}).then(persons => {
    res.json(persons.map(person => person.toJSON()))
  })
})

app.get('/api/persons/:id', (req,res,next) => {
  Person.findById(req.params.id).then(person => {
    if (person) {
      res.json(person.toJSON())
    } else {
      res.status(400).end()
    }
  })
  .catch(error => next(error))
})

app.delete('/api/persons/:id', (req,res,next) => {
  Person.findByIdAndRemove(req.params.id)
    .then(result => {
      res.status(204).end()
    })
    .catch(error => next(error))
})

//const generateId = () => {
  //const newId = Math.floor(Math.random()*1000)
  //return newId
//}

app.post('/api/persons', (req,res,next) => { 
  const body = req.body
  

  const person = new Person({
    name: body.name,
    number: body.number,
  })

  person.
    save()
    .then(savedPerson => savedPerson.toJSON())
    .then(savedAndFormattedPerson => {
      res.json(savedAndFormattedPerson)
  })
  .catch(error => next(error));  
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind == 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({error: error.message})
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

