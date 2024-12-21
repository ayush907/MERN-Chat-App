import React from 'react'
import {Error as ErrorIcon} from "@mui/icons-material"
import { Container, Stack, Typography } from '@mui/material'
import {Link} from "react-router-dom"

const NotFound = () => {
  return (
    <Container maxWidth="lg" sx={{height: "100vh", display: "flex", justifyContent: "center", alignItems: " center"}}>
      <Stack alignItems={"center"} spacing={"2rem"}>
        <ErrorIcon sx={{fontSize: "10rem"}}/>
        <Typography variant='h1'>404</Typography>
        <Typography variant='h3'>Page Not Found</Typography>
        <Link to="/">Go Back to home</Link>
      </Stack>
    </Container>
  )
}

export default NotFound
