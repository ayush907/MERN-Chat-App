import React from 'react'
import {Helmet} from "react-helmet-async"

const Title = ({title = "chat", description = "this is the chat app called chattu"}) => {
  return (
    <Helmet>
        <title>{title}</title>
        <meta name = "description" content={description} />
    </Helmet>
  )
}

export default Title
