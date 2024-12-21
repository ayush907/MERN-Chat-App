import React from 'react';
import { Grid, Skeleton, Stack } from '@mui/material';
import { BouncingSkeleton } from '../styles/StyledComponents';

const LayoutLoader = () => {
  return (
    <Grid container height="calc(100vh - 4rem)" spacing={1}>

      {/* Sidebar for larger screens */}
      <Grid
        item
        sm={4}
        md={3}
        sx={{ display: { xs: 'none', sm: 'block' } }}
        height="100%"
      >
        <Skeleton variant="rectangular" height="100vh" />
      </Grid>

      {/* Main content area */}
      <Grid
        item
        xs={12}
        sm={8}
        md={5}
        lg={6}
        height="100%"
      >
        <Stack spacing={1}>
          {Array.from({ length: 10 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height="4.1rem" />
          ))}
        </Stack>
      </Grid>

      {/* Sidebar for medium and larger screens */}
      <Grid
        item
        md={4}
        lg={3}
        sx={{ display: { xs: 'none', md: 'block' } }}
        height="100%"
      >
        <Skeleton variant="rectangular" height="100vh" />
      </Grid>

    </Grid>
  );
};


const TypingLoader = () => {

  return (
    <Stack
      spacing={"0.5rem"}
      direction={"row"}
      padding={"0.5rem"}
      justifyContent={"center"}
    >
      
      <BouncingSkeleton variant='circular' width={15} height={15} style={{animationDelay: '0.1s',}}/>
      <BouncingSkeleton variant='circular' width={15} height={15} style={{animationDelay: '0.1s',}}/>
      <BouncingSkeleton variant='circular' width={15} height={15} style={{animationDelay: '0.1s',}}/>
      <BouncingSkeleton variant='circular' width={15} height={15} style={{animationDelay: '0.1s',}}/>

    </Stack>
  )
}

export { LayoutLoader, TypingLoader }