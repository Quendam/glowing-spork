import React from 'react'

const Notification = ({ message, type }) => {
  if(message === null){
    return null
  }

  return(
    <div className={type === 'error' ? 'error' : 'info'}>
      {message}
    </div>
  )
}

export default Notification