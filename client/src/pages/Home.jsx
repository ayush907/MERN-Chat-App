import React from 'react'
import AppLayout from '../components/layout/AppLayout'
import { Box, Typography } from '@mui/material'
import { greyColor } from '../components/constants/color'

const Home = () => {
  return (
    <Box bgcolor={greyColor} height={"100%"}>
      <Typography p={"2rem"} variant='h5' textAlign={"center"}>Select a Freind to chat  HOME COMPONENT</Typography>
    </Box>
  )
}

export default AppLayout()(Home)
