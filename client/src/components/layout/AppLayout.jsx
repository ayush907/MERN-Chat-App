import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Drawer, Grid, Skeleton } from '@mui/material';
import Header from './Header';
import Title from '../shared/Title';
import ChatList from '../specific/ChatList';
import { sampleChats } from '../constants/SampleData';
import Profile from '../specific/Profile';
import { useMyChatsQuery } from '../../redux/api/api';
import { useDispatch, useSelector } from 'react-redux';
import { setIsDeleteMenu, setIsMobile, setSelectedDeleteChat } from '../../redux/reducers/misc';
import { useErrors, useSocketEvents } from '../../hooks/hook';
import { getSocket } from '../../socket';
import { NEW_MESSAGE_ALERT, NEW_REQUEST, ONLINE_USERS, REFETCH_CHATS } from '../constants/events';
import { incrementNotification, setNewMessagesAlert } from '../../redux/reducers/chat';
import { getOrSaveFromStorage } from '../../lib/features';
import DeleteChatMenu from '../dialogs/DeleteChatMenu';

// Higher-Order Component (HOC) - AppLayout
const AppLayout = () => (WrappedComponent) => {
  return (props) => {
    const dispatch = useDispatch()
    const params = useParams();
    const navigate = useNavigate();
    const socket = getSocket()
    // console.log(socket.id)

    const chatId = params.chatId;
    const deleteMenuAnchor = useRef(null)

    const [onlineUsers, setOnlineUsers] = useState([])
  
    const { isMobile } = useSelector((state) => state.misc)
    const { user } = useSelector((state) => state.auth)
    const { newMessagesAlert } = useSelector((state) => state.chat)
    // console.log(newMessagesAlert)



    const { isLoading, data, isError, error, refetch } = useMyChatsQuery("")  // bydefault provides these (chat yaha pe mili)

    useErrors([{ isError, error }])
 

    useEffect(()=>{// localstorage mai message alert vaali value save karne ke liye
      getOrSaveFromStorage({key:NEW_MESSAGE_ALERT, value:newMessagesAlert})
    },[newMessagesAlert])


    // Handler for deleting a chat
    const handleDeleteChat = (e, chatId, groupChat) => {
      dispatch(setIsDeleteMenu(true))
      dispatch(setSelectedDeleteChat({chatId, groupChat}))
      deleteMenuAnchor.current = e.currentTarget
      // console.log("Delete Chat", _id, groupChat);
    };


    const handleMobileClose = () => {
      dispatch(setIsMobile(false))
    }

    const newMessagesAlertListener = useCallback((data)=>{
      if(data.chatId === chatId){
        return
      }
      dispatch(setNewMessagesAlert(data))
      // const sds = data.chatId
      // console.log("New Message Alert", sds)
    },[chatId])

    const newRequestListener = useCallback(()=>{
      // console.log('New request received, incrementing notification count');
      dispatch(incrementNotification())
    },[dispatch])

    const refetchListener = useCallback(()=>{
      refetch()
      navigate("/")
    },[refetch, navigate])        

    const onlineUsersListener = useCallback((data)=>{
      // console.log(data)
      setOnlineUsers(data)
    },[])

    const eventHandlers = { 
      [NEW_MESSAGE_ALERT]: newMessagesAlertListener,
      [NEW_REQUEST]: newRequestListener,
      [REFETCH_CHATS]: refetchListener,
      [ONLINE_USERS]: onlineUsersListener,
     }

    useSocketEvents(socket, eventHandlers)

    return (
      <>
        {/* Title and Header components */}
        <Title />
        <Header />

        <DeleteChatMenu dispatch={dispatch} deleteMenuAnchor={deleteMenuAnchor}/>

        {
          isLoading ? <Skeleton /> : (
            <Drawer open={isMobile} onClose={handleMobileClose}>
              <ChatList
                w='70vw'
                chats={data?.chats}
                chatId={chatId}
                handleDeleteChat={handleDeleteChat}
                newMessagesAlert={newMessagesAlert}
                onlineUsers={onlineUsers}
              />
            </Drawer>
          )
        }

        <Grid container height="calc(100vh - 4rem)">
          {/* Sidebar - Chat List (visible on small and larger screens) */}
          <Grid
            item
            sm={4} // Takes 4 columns on small screens
            md={3} // Takes 3 columns on medium screens
            sx={{ display: { xs: "none", sm: "block" } }} // Hidden on extra small screens
            height="100%"
          >
            {
              isLoading ? (
                <Skeleton />
              ) : (
                <ChatList
                  chats={data?.chats}
                  chatId={chatId}
                  handleDeleteChat={handleDeleteChat}
                  newMessagesAlert={newMessagesAlert}
                  onlineUsers={onlineUsers}
                />
              )
            }
          </Grid>

          {/* Main Content Area - WrappedComponent will render here */}
          <Grid item xs={12} sm={8} md={5} lg={6} height="100%">
            <WrappedComponent {...props} chatId={chatId} user={user} />
          </Grid>

          {/* Sidebar - Profile (visible on medium and larger screens) */}
          <Grid
            item
            md={4} // 4 columns for medium screens and above
            lg={3} // 3 columns for large screens
            sx={{
              display: { xs: "none", md: "block" }, // Hidden on smaller screens
              padding: "2rem",
              bgcolor: "rgb(0,0,0,0.85)"
            }}
            height="100%"
          >
            <Profile user={user} />
          </Grid>
        </Grid>
      </>
    );
  };
};

export default AppLayout;
