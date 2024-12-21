import React, { Suspense, useEffect } from 'react'
import axios from "axios"
import { server } from "./components/constants/config"


import { lazy } from 'react'
import { BrowserRouter, Routes, Route } from "react-router-dom"
import ProtectRoute from './components/auth/ProtectRoute'
import { LayoutLoader } from './components/layout/Loaders'
import { useDispatch, useSelector } from 'react-redux'
import { userExists, userNotExists } from './redux/reducers/auth'
import {Toaster} from "react-hot-toast"
import { SocketProvider } from './socket'


const Home = lazy(() => import('./pages/Home'))
const Login = lazy(() => import('./pages/Login'))
const Groups = lazy(() => import('./pages/Groups'))
const Chat = lazy(() => import('./pages/Chat'))
const NotFound = lazy(() => import('./pages/NotFound'))

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const DashBoard = lazy(() => import('./pages/admin/DashBoard'))

const UserManagement = lazy(() => import('./pages/admin/UserManagement'))
const ChatManagement = lazy(() => import('./pages/admin/ChatManagement'))
const MessagesManagement = lazy(() => import('./pages/admin/MessagesManagement'))


// let user = true;

const App = () => {

  const { user, loader } = useSelector(state => state.auth)

  const dispatch = useDispatch()

  useEffect(() => {
    const fetchuser = async () => {
      await axios.get(`${server}/api/v1/user/me`, {withCredentials: true})
        .then(({data}) => {dispatch(userExists(data.user))})
        .catch((err) => dispatch(userNotExists()))
    }
    fetchuser()
  }, [dispatch])


  return loader ? (
    <LayoutLoader />
  ) : (
    <BrowserRouter>
      <Suspense fallback={<LayoutLoader />}>
        <Routes>
          <Route element={<SocketProvider><ProtectRoute user={user} /></SocketProvider>}>
            <Route path='/' element={<Home />} />
            <Route path='/groups' element={<Groups />} />
            <Route path='/chat/:chatId' element={<Chat />} />
          </Route>

          <Route path='/login' element={<ProtectRoute user={!user} redirect='/' ><Login /></ProtectRoute>} />
          <Route path='*' element={<NotFound />} />
          <Route path='/admin' element={<AdminLogin />} />
          <Route path='admin/dashboard' element={<DashBoard />} />
          <Route path='admin/users' element={<UserManagement />} />
          <Route path='admin/chats' element={<ChatManagement />} />
          <Route path='admin/messages' element={<MessagesManagement />} />
        </Routes>
      </Suspense>
      <Toaster position='bottom-center'/>
    </BrowserRouter>
  )
}

export default App
