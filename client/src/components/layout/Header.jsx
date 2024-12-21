import { AppBar, Backdrop, Badge, IconButton, Tooltip } from '@mui/material';
import React, { lazy, Suspense } from 'react';
import { useState } from 'react';
import { orange } from "../constants/color";
import { Typography } from '@mui/material';
import { Toolbar } from '@mui/material';
import { Box } from '@mui/material';
import { useNavigate } from "react-router-dom";
import {
    Logout as LogoutIcon,
    Add as AddIcon,
    Menu as MenuIcon,
    Search as SearchIcon,
    Group as GroupIcon,
    Notifications as NotificationsIcon,
    SixMpOutlined,
} from "@mui/icons-material";
import axios from 'axios';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { userNotExists } from '../../redux/reducers/auth';
import { server } from '../constants/config';
import { setIsMobile, setIsNewGroup, setIsNotification, setIsSearch } from '../../redux/reducers/misc';
import { resetNotificationCount } from '../../redux/reducers/chat';

// Lazy loading for Dialogs
const SearchDialog = lazy(() => import("../specific/Search"));
const NotificationDialog = lazy(() => import("../specific/Notifications"));
const NewGroupDialog = lazy(() => import("../specific/NewGroup"));

const Header = () => {

    const navigate = useNavigate();
    const dispatch = useDispatch()

    const { isSearch, isNotification, isNewGroup } = useSelector(state => state.misc)
    const { notificationCount } = useSelector(state => state.chat)

    // const [isMobile, setIsMobile] = useState(false);
    // const [isSearch, setIsSearch] = useState(false);
    // const [isNewgorup, setIsNewgorup] = useState(false);
    // const [isNotification, setIsNotification] = useState(false);


    // Event Handlers
    const handleMobile = () => {
        dispatch(setIsMobile(true))
    }

    const openSearch = () => {
        dispatch(setIsSearch(true))
    }

    const openNewGroup = () => {
        dispatch(setIsNewGroup(true))
    }

    const openNotification = () => {
        dispatch(setIsNotification(true))
        dispatch(resetNotificationCount())
    }

    const navigateToGroup = () => navigate("/groups");

    const logoutHandler = async () => {
        try {
            const { data } = await axios.get(`${server}/api/v1/user/logout`, { withCredentials: true })
            dispatch(userNotExists())
            toast.success(data.message)
        }
        catch (error) {
            toast.error(error?.response?.data?.message || "something went wrong....")
        }
    }

    return (
        <>
            <Box sx={{ flexgrow: 1 }} height={"4rem"} >
                <AppBar position='static' sx={{ bgcolor: orange }}>
                    <Toolbar>
                        <Typography variant="h6" sx={{ display: { xs: "none", sm: "block" } }}>
                            chattu
                        </Typography>
                        <Box sx={{ display: { xs: "block", sm: "none" } }}>
                            <IconButton color='inherit' onClick={handleMobile}>
                                <MenuIcon />
                            </IconButton>
                        </Box>
                        <Box sx={{ flexGrow: 1 }} />
                        <Box>
                            <IconBtn
                                title="search"
                                icon={<SearchIcon />}
                                onClick={openSearch}
                            />
                            <IconBtn
                                title="New Group"
                                icon={<AddIcon />}
                                onClick={openNewGroup}
                            />
                            <IconBtn
                                title="Manage Group"
                                icon={<GroupIcon />}
                                onClick={navigateToGroup}
                            />
                            <IconBtn
                                title="Notifications"
                                icon={<NotificationsIcon />}
                                onClick={openNotification}
                                value={notificationCount}
                            />
                            <IconBtn
                                title="Logout"
                                icon={<LogoutIcon />}
                                onClick={logoutHandler}
                            />
                        </Box>
                    </Toolbar>
                </AppBar>
            </Box>

            {/* Dialogs are lazy-loaded and displayed based on state */}
            {isSearch && (
                <Suspense fallback={<Backdrop open />}>
                    <SearchDialog />
                </Suspense>
            )}
            {isNotification && (
                <Suspense fallback={<Backdrop open />}>
                    <NotificationDialog />
                </Suspense>
            )}
            {isNewGroup && (
                <Suspense fallback={<Backdrop open />}>
                    <NewGroupDialog />
                </Suspense>
            )}
        </>
    );
};

// Reusable Icon Button Component
const IconBtn = ({ title, icon, onClick, value }) => (
    <Tooltip title={title}>
        <IconButton color='inherit' size='large' onClick={onClick}>
            {
                value ? (<Badge badgeContent={value} color='error'>{icon}</Badge>) : (icon)
            }
        </IconButton>
    </Tooltip>
);

export default Header;
