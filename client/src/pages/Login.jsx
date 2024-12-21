import React from 'react'
import { Avatar, Button, Container, IconButton, Paper, Stack, TextField, Typography } from "@mui/material"
import { useState } from 'react'
import { CameraAlt as CameraAltIcon } from "@mui/icons-material"
import { VisuallyHiddenInput } from '../components/styles/StyledComponents'
import { useFileHandler, useInputValidation } from "6pp"
import { usernameValidator } from '../utils/validators'
import axios from 'axios'
import { server } from '../components/constants/config'
import { useDispatch } from 'react-redux'
import { userExists } from '../redux/reducers/auth'
import toast from 'react-hot-toast'

const Login = () => {

    const [islogin, setIslogin] = useState(true)

    const [isLoading, setIsLoading] = useState(false)

    const toggleLogin = () => { setIslogin(prev => !prev) }

    const name = useInputValidation("");
    const bio = useInputValidation("");
    const username = useInputValidation("", usernameValidator);
    const password = useInputValidation("");

    const avatar = useFileHandler("single")

    const dispatch = useDispatch()

    // function for handling the user login
    const handleLogin = async(e) => {
        e.preventDefault()
        const toastId = toast("Logging In....")
        setIsLoading(true)

        const config = {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            }
        }
        try {
            const {data} = await axios.post(`${server}/api/v1/user/login`,
                {
                    username: username.value,
                    password: password.value
                },
                config
            )
            dispatch((userExists(data.user)))
            toast.success(data.message, {id: toastId})
        } catch (error) {
            toast.error(error?.response.data.message || "Something went Wrong", {id: toastId})
        } finally{
            setIsLoading(false)
        }
    }


    // function for handling sign up
    const handleSignup = async(e) => {
        e.preventDefault()
        const toastId = toast("Signing In....")
        setIsLoading(true)

        const formData = new FormData()
        formData.append('avatar', avatar.file)
        formData.append('name', name.value)
        formData.append('bio', bio.value)
        formData.append('username', username.value)
        formData.append('password', password.value)

        const config = {
            withCredentials: true,
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        }

        try {
            const {data} = await axios.post(`${server}/api/v1/user/new`,
                formData,
                config
            )
            dispatch((userExists(data.user)))
            toast.success(data.message, {id: toastId})
        } catch (error) {
            toast.error(error?.response.data.message || "Something went Wrong", {id: toastId})
        } finally{
            setIsLoading(false)
        }

    }


    return (
        <div
            style={{ backgroundImage: "linear-gradient(rgba(200,200,200,0.5), rgba(120,110,220,0.5))" }}>
            <Container component={"main"} maxWidth="xs"
                sx={{ height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: "column",
                        alignItems: "center",
                    }}>


                    {
                        islogin ? (
                            <>
                                <Typography variant='h5'>Login</Typography>
                                <form style={{ width: "100%", marginTop: "1rem" }} onSubmit={handleLogin}>
                                    <TextField
                                        required
                                        fullWidth
                                        label="username"
                                        margin='normal'
                                        variant='outlined'
                                        value={username.value}
                                        onChange={username.changeHandler}
                                    />
                                    <TextField
                                        required
                                        fullWidth
                                        label="password"
                                        type='password'
                                        margin='normal'
                                        variant='outlined'
                                        value={password.value}
                                        onChange={password.changeHandler}
                                    />

                                    <Button
                                        sx={{ marginTop: "1rem" }}
                                        fullWidth
                                        type='submit'
                                        color='primary'
                                        variant='contained'
                                        disabled={isLoading}
                                        >
                                        login
                                    </Button>

                                    <Typography textAlign={'center'} m={"1rem"} > or </Typography>

                                    <Button
                                        fullWidth
                                        variant='text'
                                        onClick={toggleLogin}
                                        disabled={isLoading}
                                         >
                                        sign up instead
                                    </Button>
                                </form>
                            </>) : (
                            <>
                                <Typography variant='h5'>signup</Typography>
                                <form style={{ width: "100%", marginTop: "1rem" }} onSubmit={handleSignup}>

                                    <Stack position={'relative'} width={"10rem"} margin={"auto"}>
                                        <Avatar sx={{
                                            width: "10rem",
                                            height: "10rem",
                                            objectFit: "contain"
                                        }}
                                            src={avatar.preview}
                                        />

                                        <IconButton
                                            sx={{
                                                position: 'absolute',
                                                bottom: "0",
                                                right: "0",
                                                color: "white",
                                                bgcolor: "rgba(0,0,0,0.5)",
                                                ":hover": {
                                                    bgcolor: "rgba(0,0,0,0.7)",
                                                }
                                            }}
                                            component="label"
                                        >
                                            <>
                                                <CameraAltIcon />
                                                <VisuallyHiddenInput type='file' onChange={avatar.changeHandler} />
                                            </>
                                        </IconButton>
                                    </Stack>
                                    {avatar.error && (
                                        <Typography
                                            m={"1rem auto"}
                                            width={"fit-content"}
                                            display={"block"}
                                            color='error'
                                            variant='caption'>
                                            {avatar.error}
                                        </Typography>
                                    )}

                                    <TextField
                                        required
                                        fullWidth
                                        label="Name"
                                        margin='normal'
                                        variant='outlined'
                                        value={name.value}
                                        onChange={name.changeHandler}
                                    />
                                    <TextField
                                        required
                                        fullWidth
                                        label="Bio"
                                        margin='normal'
                                        variant='outlined'
                                        value={bio.value}
                                        onChange={bio.changeHandler}
                                    />
                                    <TextField
                                        required
                                        fullWidth
                                        label="username"
                                        margin='normal'
                                        variant='outlined'
                                        value={username.value}
                                        onChange={username.changeHandler}
                                    />
                                    {
                                        username.error && (
                                            <Typography color='error' variant='caption'>
                                                {username.error}
                                            </Typography>
                                        )
                                    }

                                    <TextField
                                        required
                                        fullWidth
                                        label="password"
                                        type='password'
                                        margin='normal'
                                        variant='outlined'
                                        value={password.value}
                                        onChange={password.changeHandler}
                                    />
                                    {
                                        password.error && (
                                            <Typography color='error' variant='caption'>
                                                {password.error}
                                            </Typography>
                                        )
                                    }

                                    <Button
                                        sx={{ marginTop: "1rem" }}
                                        fullWidth
                                        type='submit'
                                        color='primary'
                                        variant='contained'
                                        disabled={isLoading}
                                        >
                                        signup
                                    </Button>

                                    <Typography textAlign={'center'} m={"1rem"} > or </Typography>

                                    <Button
                                        fullWidth
                                        variant='text'
                                        onClick={toggleLogin} 
                                        disabled={isLoading}
                                        >
                                        login instead
                                    </Button>
                                </form>
                            </>)
                    }
                </Paper>



            </Container>
        </div>
    )
}

export default Login
