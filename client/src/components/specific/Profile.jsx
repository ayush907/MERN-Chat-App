import React, { useEffect } from 'react'
import { Avatar, Stack, Typography } from '@mui/material'
import {
    Face as FaceIcon,
    AlternateEmail as UserNameIcon,
    CalendarMonth as CalendarIcon,
} from "@mui/icons-material"

import moment from "moment"
import { transformImage } from '../../lib/features'


const Profile = ({user}) => {

    return (
        <Stack spacing={"2rem"} direction={"column"} alignItems={"center"}>
            <Avatar
            src={transformImage(user?.avatar?.url)}
                sx={{
                    width: 200,
                    height: 200,
                    objectFit: "contain",
                    marginBottom: "1rem",
                    border: "5px solid white"
                }}
            />
            <ProfileCard heading={"bio"} text={user?.bio} />
            <ProfileCard heading={"username"} text={user?.username} Icon={<UserNameIcon/>} />
            <ProfileCard heading={"Name"} text={user?.name} Icon={<FaceIcon/>} />
            <ProfileCard heading={"Joined"} text={moment(user?.createdAt).fromNow()} Icon={<CalendarIcon/>} />
        </Stack>
    )
}


const ProfileCard = ({ text, Icon, heading }) => (
    <Stack
        direction={"row"}
        spacing={"1rem"}
        alignItems={"center"}
        color={"white"}
        textAlign={"center"}
    >
        {
            Icon && Icon   // agar Icon hai to icon dikhaana hai
        }

        <Stack>
            <Typography variant='body1'>{text}</Typography>
            <Typography color={"grey"} variant='caption'>{heading}</Typography>
        </Stack>

    </Stack>
)


export default Profile
