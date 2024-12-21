import React from 'react'
import AdminLayout from '../../components/layout/AdminLayout'
import { Box, Container, Paper, Skeleton, Stack, Typography } from '@mui/material'
import {
    AdminPanelSettings as AdminPanelSettingsIcon,
    Group as GroupIcon,
    Message as MessageIcon,
    Notifications as NotificationsIcon,
    Person as PersonIcon,
} from '@mui/icons-material'
import { LayoutLoader } from "../../components/layout/Loaders"
import moment from 'moment'
import { CurveButton, SearchField } from '../../components/styles/StyledComponents'
import { DoughnutChart, LineChart } from '../../components/specific/Chart'
import { useFetchData } from "6pp"
import { server } from "../../components/constants/config";
import { useErrors } from "../../hooks/hook"

const DashBoard = () => {

    const { loading, data, error, } = useFetchData(`${server}/api/v1/admin/stats`, "dashboard-stats")

    const { stats } = data || {}

    useErrors([
        {
            isError: error,
            error: error
        }
    ])

    const Appbar = (
        <Paper
            elevation={3}
            sx={{ padding: "2rem", margin: "2rem 0", borderRadius: "1rem" }}>

            <Stack direction={"row"} alignItems={"center"} spacing={"1rem"}>
                <AdminPanelSettingsIcon sx={{ fontSize: "3rem" }} />

                <SearchField placeholder='Search...' />

                <CurveButton>Search</CurveButton>
                <Box flexGrow={1} />
                <Typography
                    display={{
                        xs: "none",
                        lg: "block"
                    }}
                    color={'rgba(0 0 0 0.7)'}
                    textAlign={"center"}
                >
                    {moment().format("dddd, MMMM Do YYYY")}
                </Typography>
                <NotificationsIcon />
            </Stack>
        </Paper>
    )

    // console.log(data)

    const Widgets = (
        <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={"2rem"}
            justifyContent={"space-between"}
            alignItems={"center"}
            margin={"2rem 0"}
        >
            <Widget title={"Users"} value={stats?.usersCount} Icon={<PersonIcon />} />
            <Widget title={"Chats"} value={stats?.totalChatsCount} Icon={<GroupIcon />} />
            <Widget title={"Messages"} value={stats?.messagesCount} Icon={<MessageIcon />} />
        </Stack>
    )


    return (
        <AdminLayout>
            {
                loading ? (
                    <Skeleton height={"100vh"} />
                ) : (
                    <Container component={"main"}>
                        {Appbar}

                        <Stack
                            direction={{ xs: "column", lg: "row" }}
                            sx={{ gap: "2rem" }}
                            flexWrap={"wrap"}
                            justifyContent={"center"}
                            alignItems={{ xs: "center", lg: "stretch" }}>

                            {/* first paper for line chart */}
                            <Paper
                                elevation={3}
                                sx={{
                                    padding: "2rem 3.5rem",
                                    borderRadius: "1rem",
                                    width: "100%",
                                    maxWidth: "45rem",
                                }}
                            >
                                <Typography margin={"2rem 0"} variant='h4'>
                                    Last Messages
                                </Typography>

                                {/* this is line chart */}
                                <LineChart value={stats?.messagesChart || []} />
                            </Paper>

                            {/* second paper for Doughnut Chart */}
                            <Paper
                                elevation={3}
                                sx={{
                                    padding: "1rem",
                                    borderRadius: "1rem",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    width: { xs: "100%", sm: "50%" },
                                    position: "relative",
                                    width: "100%",
                                    maxWidth: '25rem'
                                }}
                            >
                                {/* this is Doughnut chart */}
                                <DoughnutChart value={[stats?.totalChatsCount - stats?.groupsCount || 0, stats?.groupsCount || 0]} labels={["Single Chats", "Group Chats"]} />

                                <Stack
                                    position={"absolute"}
                                    direction={"row"}
                                    justifyContent={"center"}
                                    alignItems={"center"}
                                    spacing={"0.5rem"}
                                    width={"100%"}
                                    height={"100%"}
                                >
                                    <GroupIcon /> <Typography> Vs </Typography>  <PersonIcon />
                                </Stack>
                            </Paper>
                        </Stack>

                        {Widgets}
                    </Container>
                )
            }
        </AdminLayout>
    )
}

const Widget = ({ title, value, Icon }) => {
    return (
        <Paper
            sx={{
                padding: "2rem",
                margin: "2rem 0",
                borderRadius: "1.5rem",
                width: "20rem"
            }}
        >
            <Stack alignItems={"center"} spacing={"1rem"}>
                <Typography
                    sx={{
                        color: "rgba(0,0,0,0.7)",
                        borderRadius: "50%",
                        border: "5px solid rgba(0,0,0,0.9)",
                        width: "5rem",
                        height: "5rem",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    {value}
                </Typography>
                <Stack
                    direction={"row"}
                    spacing={"1rem"}
                    alignItems={"center"}
                >
                    {Icon}
                    <Typography>{title}</Typography>
                </Stack>
            </Stack>
        </Paper>
    )
}

export default DashBoard