import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom'
import personServices from './services/persons'
import Notification from './notification'
import './index.css'

const Persons = ({ persons, filter, deletePerson }) => {
  const nameList = persons.filter(person => {
    if(filter === '') return true

    if(person.name.toLocaleLowerCase().indexOf(filter.toLocaleLowerCase()) !== -1){
      return true
    }

    return false
  }).map(person => (
    <div key={person.id}>
      {`${person.name} ${person.number} `}
      <button onClick={() => deletePerson(person.id)}>delete</button>
    </div>
  ))

  return(
    <div>
      {nameList}
    </div>
  )
}

const Filter = ({ filter, handleFilterChange }) => {
  return (
    <div>
      filter shown with <input value={filter} onChange={handleFilterChange}/>
    </div>
  )
}

const PersonForm = ({ newName, newNumber, handleNameChange, handleNumberChange, handleAddPerson }) => {
  return (
    <div>
      <form>
        <div>
          name: <input value={newName} onChange={handleNameChange}/>
        </div>
        <div>
          number: <input value={newNumber} onChange={handleNumberChange}/>
        </div>
        <div>
          <button type="submit" onClick={handleAddPerson}>add</button>
        </div>
      </form>
    </div>
  )
}

const App = () => {
  const [ persons, setPersons ] = useState([])
  const [ newName, setNewName ] = useState('')
  const [ newNumber, setNewNumber ] = useState('')
  const [ filter, setFilter ] = useState('')
  const [ infoMessage, setInfoMessage ] = useState(null)
  const [ errorMessage, setErrorMessage ] = useState(null)

  const handleNameChange = (event) => setNewName(event.target.value)
  const handleNumberChange = (event) => setNewNumber(event.target.value)
  const handleFilterChange = (event) => setFilter(event.target.value)

  const getPersons = () => {
    personServices
      .getAll()
      .then(initPersons => {
        setPersons(initPersons)
      })
  }

  const createPerson = () => {
    const newPerson = {
      name: newName,
      number: newNumber
    }

    personServices
      .create(newPerson)
      .then(returnedPerson => {

        setPersons(persons.concat(returnedPerson))
        setNewName('')
        setNewNumber('')

        setInfoMessage(`Added ${returnedPerson.name}`)
        setTimeout(() => {
          setInfoMessage(null)
        }, 5000)
      })

      .catch(error => {
        setErrorMessage(error.response.data.error)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)
      })
  }

  const updatePerson = (id) => {
    personServices
      .update(id, {
        name: newName,
        number: newNumber
      })
      .then(returnedPerson => {
        setPersons(persons.map(person => person.id === returnedPerson.id
          ? returnedPerson
          : person
        ))

        setNewName('')
        setNewNumber('')

        setInfoMessage(`Updated ${returnedPerson.name}`)
        setTimeout(() => {
          setInfoMessage(null)
        }, 5000)
      })
      .catch(() => {
        const person = persons.reduce((prev, current) =>
          current.id === id ? { name: current.name } : prev,
        { name: '-' }
        )

        setErrorMessage(`Information of ${person.name} has already been removed from server`)
        setTimeout(() => {
          setErrorMessage(null)
        }, 5000)

        getPersons()
      })
  }

  const deletePerson = (id) => {
    const person = persons.reduce((prev, current) =>
      current.id === id ? { name: current.name } : prev,
    { name: '-' }
    )
    if(window.confirm(`Delete ${person.name}?`)){
      personServices
        .remove(id)
        .then(() => {
          getPersons()

          setInfoMessage(`Deleted ${person.name}`)
          setTimeout(() => {
            setInfoMessage(null)
          }, 5000)
        })
        .catch(() => {
          getPersons()

          setErrorMessage(`Information of ${person.name} has already been removed from server`)
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
        })
    }
  }

  useEffect(getPersons, [])

  const handleAddPerson = (event) => {
    event.preventDefault()
    const found = persons.find(x => x.name === newName)

    if(found){
      updatePerson(found.id)
    }else{
      createPerson()
    }
  }

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification type='info' message={infoMessage} />
      <Notification type='error' message={errorMessage} />
      <Filter
        filter={filter}
        handleFilterChange={handleFilterChange}
      />

      <h2>Add a new</h2>
      <PersonForm
        newName={newName}
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
        handleAddPerson={handleAddPerson}
      />

      <h2>Numbers</h2>
      <Persons
        persons={persons}
        filter={filter}
        deletePerson={deletePerson}
      />
    </div>
  )

}

export default App

ReactDOM.render(<App />, document.getElementById('root'))