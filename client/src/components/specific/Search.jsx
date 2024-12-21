import { Dialog, DialogTitle, InputAdornment, List, Stack, TextField } from '@mui/material'
import React, { useEffect } from 'react'
import { useState } from 'react'
import { useInputValidation } from "6pp"
import { Search as SearchIcon } from '@mui/icons-material'
import toast from 'react-hot-toast'
import UserItem from '../shared/UserItem'
import { sampleUsers } from '../constants/SampleData'
import { useDispatch, useSelector } from 'react-redux'
import { setIsSearch } from '../../redux/reducers/misc'
import { useLazySearchUserQuery, useSendFriendRequestMutation } from '../../redux/api/api'
import { useAsyncMutation } from '../../hooks/hook'

const Search = () => {

  const {isSearch} = useSelector(state => state.misc)

  const [searchUser] = useLazySearchUserQuery()

  // const [sendFriendRequest] = useSendFriendRequestMutation()
  const [sendFriendRequest, isLoadingSendFriendRequest,] = useAsyncMutation(useSendFriendRequestMutation)

  const dispatch = useDispatch()

  const search = useInputValidation("")  

  // let isLoadingSendFriendRequest = false

  const [users, setUsers] = useState([])

  const addFriendHandler = async(id) => {
    await sendFriendRequest("Sending Friend Request....", {userId: id})
  }

  // function for closing the search dialog
  const searchCloseHandler =()=>{
    dispatch(setIsSearch(false))
  }

  // user search karne ke liye
  useEffect(()=>{
    const timeOutId = setTimeout(() => {
      searchUser(search.value)
      .then(({data})=> setUsers(data.users))
      .catch((err)=> console.log(err))
    }, 1000);

    return ()=>{
      clearTimeout(timeOutId)
    }
  },[search.value])

  return (
    <Dialog open={isSearch} onClose={searchCloseHandler} >
      <Stack p={"2rem"} direction={"column"} width={"25rem"} >
        <DialogTitle textAlign={"center"}>Find People</DialogTitle>
        <TextField label=""
          value={search.value}
          onChange={search.changeHandler}
          variant='outlined'
          size='small'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />

        <List>
          {
            users.map((i) => (
              <UserItem user={i} key={i._id}
                handler={addFriendHandler}
                handlerIsLoading={isLoadingSendFriendRequest}
              />
            ))
          }
        </List>
      </Stack>
    </Dialog>
  )
}

export default Search
