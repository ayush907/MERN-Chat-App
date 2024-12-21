import React, { Fragment, useCallback, useEffect, useRef, useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { IconButton, Skeleton, Stack } from '@mui/material'
import { greyColor } from '../components/constants/color'
import { AttachFile as AttachFileIcon, Send as SendIcon } from '@mui/icons-material'
import { InputBox } from '../components/styles/StyledComponents'
import FileMenu from '../components/dialogs/FileMenu'
import { sampleMessage } from '../components/constants/SampleData'
import MessageComponent from '../components/shared/MessageComponent'
import { getSocket } from '../socket'
import { ALERT, CHAT_JOINED, CHAT_LEAVED, NEW_MESSAGE, START_TYPING, STOP_TYPING } from '../components/constants/events'
import { useChatDetailsQuery, useGetMessagesQuery } from '../redux/api/api'
import { useErrors, useSocketEvents } from '../hooks/hook'
import { useInfiniteScrollTop } from "6pp"
import { useDispatch } from 'react-redux'
import { setIsFileMenu } from '../redux/reducers/misc'
import { removeNewMessagesAlert } from '../redux/reducers/chat'
import { TypingLoader } from '../components/layout/Loaders'
import { useNavigate } from 'react-router-dom'

// const user = {
//   _id: "sfsfsfsdfs",
//   name: "abhishek"
// }

const Chat = ({ chatId, user }) => {

  const socket = getSocket()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const containerRef = useRef(null)
  const bottomRef = useRef(null)

  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  // console.log(messages)
  const [page, setPage] = useState(1)
  const [fileMenuAnchor, setFileMenuAnchor] = useState(null)


  const [IamTyping, setIamTyping] = useState(false)
  const [userTyping, setUserTyping] = useState(false)
  const typingTimeout = useRef(null)
  // console.log(userTyping)


  const chatDetails = useChatDetailsQuery({ chatId, skip: !chatId })
  // console.log(chatDetails)

  const oldMessagesChunk = useGetMessagesQuery({ chatId, page })
  // console.log(page)

  const { data: oldMessages, setData: setOldMessages } = useInfiniteScrollTop(
    containerRef,
    oldMessagesChunk.data?.totalPages,
    page,
    setPage,
    oldMessagesChunk.data?.messages
  )

  const errors = [
    { isError: chatDetails.isError, error: chatDetails.error },
    { isError: oldMessagesChunk.isError, error: oldMessagesChunk.error },
  ]
  // console.log("oldMessages", oldMessages)

  const members = chatDetails?.data?.chat?.members


  const messageOnChange = (e) => {
    setMessage(e.target.value)

    if (!IamTyping) {
      socket.emit(START_TYPING, { members, chatId })    // start typing emit kiya hai 
      setIamTyping(true)
    }

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current)
    }

    typingTimeout.current = setTimeout(() => {
      socket.emit(STOP_TYPING, { members, chatId })    // stop typing emit kiya hai 
      setIamTyping(false)
    }, 2000);

  }

  const handleFileOpen = (e) => {
    dispatch(setIsFileMenu(true))
    setFileMenuAnchor(e.currentTarget)
  }

  // messages bhejne ke liye
  const submitHandler = (e) => {
    e.preventDefault()

    if (!message.trim()) {
      return
    }
    // emitting message to the server
    socket.emit(NEW_MESSAGE, { chatId, members, message })
    setMessage("")
  }

  
  useEffect(() => {
    socket.emit(CHAT_JOINED, {userId: user._id, members: members})
    dispatch(removeNewMessagesAlert(chatId))

    return () => {
      setMessages([])
      setMessage("")
      setOldMessages([])
      setPage(1)
      socket.emit(CHAT_LEAVED, {userId: user._id, members: members})
    }
  }, [chatId])
  

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])


  useEffect(()=>{
    if(chatDetails.isError){
      return navigate("/")
    }
  },[chatDetails.isError])

  // ye message ki listening ke liye function hai 
  const newMessagesListener = useCallback((data) => {
    if (data.chatId !== chatId) {
      return
    }
    // console.log(data)
    setMessages((prev) => [...prev, data.message])
  }, [chatId])


  // start typing listenening ke liye function hai 
  const startTypingListener = useCallback((data) => {
    if (data.chatId !== chatId) {
      return
    }
    // console.log("start typing...", data)
    setUserTyping(true)
  }, [chatId])


  // stop typing listeneing ke liye function hai 
  const stopTypingListener = useCallback((data) => {
    if (data.chatId !== chatId) {
      return
    }
    // console.log("stop typing...", data)
    setUserTyping(false)
  }, [chatId])


  const alertListener = useCallback((data) => {

    if(data.chatId !== chatId){
      return
    }
    const messageForAlert = {
      content: data.message,
      sender: {
        _id: "abcdefghijklmnopqrst",
        name: "Admin"
      },
      chat: chatId,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev)=> [...prev, messageForAlert])

  }, [chatId])


  const eventHandler = {
    [ALERT]: alertListener,
    [NEW_MESSAGE]: newMessagesListener,
    [START_TYPING]: startTypingListener,
    [STOP_TYPING]: stopTypingListener,
  }

  useSocketEvents(socket, eventHandler)

  useErrors(errors)

  const allMessages = [...oldMessages, ...messages]

  return (
    chatDetails.isLoading ? (
      <Skeleton />
    ) : (
      <Fragment>
        <Stack
          ref={containerRef}
          boxSizing={"border-box"}
          padding={"1rem"}
          spacing={"1rem"}
          bgcolor={greyColor}
          height={"90%"}
          sx={{
            overflowX: "hidden",
            overflowY: "auto",
          }}
        >
          {
            allMessages.map((i) => (
              <MessageComponent key={i._id} message={i} user={user} />
            ))
          }

          <div ref={bottomRef} />
          {userTyping && <TypingLoader />}

        </Stack>

        <form
          style={{
            height: "10%",
          }}
          onSubmit={submitHandler}
        >

          <Stack
            direction={"row"}
            height={"100%"}
            padding={"1rem"}
            alignItems={"center"}
            position={"relative"}
          >
            <IconButton
              sx={{
                position: "absolute",
                left: "1.5rem",
                rotate: "30deg",
              }}
              onClick={handleFileOpen}
            >
              <AttachFileIcon />
            </IconButton>

            <InputBox
              placeholder='type message here......'
              value={message}
              onChange={messageOnChange}
            />

            <IconButton
              type='submit'
              sx={{
                rotate: "-30deg",
                backgroundColor: "orange",
                color: "white",
                marginLeft: "1rem",
                "&:hover": {
                  bgcolor: "error.dark",

                }
              }}
            >
              <SendIcon />
            </IconButton>

          </Stack>


        </form>
        <FileMenu anchorE1={fileMenuAnchor} chatId={chatId} />
      </Fragment>
    )
  )
}

export default AppLayout()(Chat)
