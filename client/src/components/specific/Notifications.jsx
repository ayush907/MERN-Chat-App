import { Avatar, Button, Dialog, DialogTitle, ListItem, Skeleton, Stack, Typography } from '@mui/material'
import React, { memo } from 'react'
import { sampleNotifictions } from '../constants/SampleData'
import { useAcceptFriendRequestMutation, useGetNotificationsQuery } from '../../redux/api/api'
import { useAsyncMutation, useErrors } from '../../hooks/hook'
import { useDispatch, useSelector } from 'react-redux'
import { setIsNotification } from '../../redux/reducers/misc'
import toast from 'react-hot-toast'

const Notifications = () => {

  const { isNotification } = useSelector((state) => (state.misc))

  const dispatch = useDispatch()

  const { isLoading, data, error, isError } = useGetNotificationsQuery()

  const [acceptRequest] = useAsyncMutation(useAcceptFriendRequestMutation)

  const friendRequestHandler = async ({ _id, accept }) => {
    
    dispatch(setIsNotification(false))

    await acceptRequest("Accepting...", {requestId: _id, accept})

  }

  const closeHandler = () => {
    dispatch(setIsNotification(false))
  }

  useErrors([{ error, isError }])

  // console.log(data.allRequests)

  return (
    <Dialog open={isNotification} onClose={closeHandler}>
      <Stack
        p={{
          xs: "1rem", sm: "2rem"
        }} maxWidth={"25rem"}>
        <DialogTitle>Notifications</DialogTitle>
        {
          isLoading ? (
            <Skeleton />
          ) : (
            <>
              {
                data?.allRequests.length > 0 ? (
                  data?.allRequests.map(({ sender, _id }) => <NotificationItem
                    sender={sender}
                    _id={_id}
                    handler={friendRequestHandler}
                    key={_id}
                  />)
                ) : (
                  <Typography textAlign={"center"} >0 Notifications</Typography>)
              }
            </>
          )
        }
      </Stack>
    </Dialog>
  )
}

const NotificationItem = memo(({ sender, _id, handler }) => {

  const { name, avatar } = sender

  return (
    <ListItem>
      <Stack
        direction={"row"}
        alignItems={"center"}
        spacing={"1rem"}
        width={"100%"}>
        <Avatar />
        <Typography
          variant='body1'
          sx={{
            flexGlow: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            width: "100%"
          }}
        >
          {`${name} send you a friend request`}
        </Typography>
      </Stack>

      <Stack
        direction={{
          xs: 'column',
          sm: "row"
        }}
      >
        <Button onClick={() => handler({ _id, accept: true })}>Accept</Button>
        <Button color='error' onClick={() => handler({ _id, accept: false })}>Reject</Button>
      </Stack>
    </ListItem>
  )
})

export default Notifications
