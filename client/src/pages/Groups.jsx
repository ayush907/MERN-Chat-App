import React, { memo, useState, useEffect, Suspense, lazy } from 'react';
import { Backdrop, Box, Button, CircularProgress, Drawer, Grid, IconButton, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Done as DoneIcon, Edit as EditIcon, KeyboardBackspace as KeyboardBackspaceIcon, Menu as MenuIcon } from '@mui/icons-material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Link } from "../components/styles/StyledComponents"
import AvatarCard from '../components/shared/AvatarCard';
import { sampleChats, sampleUsers } from '../components/constants/SampleData';
import UserItem from '../components/shared/UserItem';
import { bgGradient } from '../components/constants/color';
import { useAddGroupMembersMutation, useChatDetailsQuery, useDeleteChatMutation, useMyGroupsQuery, useRemoveGroupMemberMutation, useRenameGroupMutation } from '../redux/api/api';
import { useAsyncMutation, useErrors } from '../hooks/hook';
import { LayoutLoader } from "../components/layout/Loaders"
import { useDispatch, useSelector } from 'react-redux';
import { setIsAddMember } from '../redux/reducers/misc';

const ConfirmDeleteDialog = lazy(() => import('../components/dialogs/ConfirmDeleteDialog'))
const AddMemberDialog = lazy(() => import('../components/dialogs/AddMemberDialog'))

// const isAddmember = false  // redux mai banega ye baad mai

const Groups = () => {

  const chatId = useSearchParams()[0].get("group")
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { isAddMember } = useSelector((state) => state.misc)

  const myGroups = useMyGroupsQuery("")
  // console.log(myGroups.data)

  const groupDetails = useChatDetailsQuery(
    { chatId, populate: true },
    { skip: !chatId }  // jab chatid hogi tabhi fetch karna hai.
  )

  const [updateGroup, isLoadingGroupName] = useAsyncMutation(useRenameGroupMutation)

  const [removeMember, isLoadingRemoveMember] = useAsyncMutation(useRemoveGroupMemberMutation)

  const [deleteGroup, isLoadingDeleteGroup] = useAsyncMutation(useDeleteChatMutation)

  // console.log(groupDetails.data)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isEdit, setIsEdit] = useState(false)
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState(false)


  const [groupName, setGroupName] = useState("")
  const [groupNameUpdatedValue, setGroupNameUpdatedValue] = useState("")

  const [members, setMembers] = useState([])

  const errors = [
    {
      isError: myGroups.isError,
      error: myGroups.error
    },
    {
      isError: groupDetails.isError,
      error: groupDetails.error
    },
  ]

  useErrors(errors)       // error ke liye hook hai ye


  useEffect(() => {
    const groupData = groupDetails.data
    if (groupData) {
      setGroupName(groupData.chat.name)
      setGroupNameUpdatedValue(groupData.chat.name)
      setMembers(groupData.chat.members)
    }

    return () => {
      setGroupName("")
      setGroupNameUpdatedValue("")
      setMembers([])
      setIsEdit(false)
    }
  }, [groupDetails.data])


  const navigateBack = () => {
    navigate("/")
  }

  const handleMobile = () => {
    setIsMobileMenuOpen(prev => !prev)
  }

  const handleMobileClose = () => {
    setIsMobileMenuOpen(false)
  }

  const updateGroupName = () => {
    setIsEdit(false)
    updateGroup("Updating Group Name...", { chatId, name: groupNameUpdatedValue })
    // console.log("group name updated", groupNameUpdatedValue)       
  }


  const OpenConfirmDeleteHandler = () => {
    setConfirmDeleteDialog(true)
    console.log("delete group dialog open")
  }

  const CloseConfirmDeleteHandler = () => {
    setConfirmDeleteDialog(false)
    console.log("delete group")
  }

  const openAddMemberHandler = () => {
    dispatch(setIsAddMember(true))
    // console.log("add member")
  }

  const deleteHandler = () => {
    deleteGroup("Deleting Group...", chatId)
    CloseConfirmDeleteHandler()
    navigate("/groups")
  }

  const removeMemberHandler = (userId) => {
    removeMember("Removing Member...", { chatId, userId })
    // console.log("remove member", userId)
  }

  useEffect(() => {
    if (chatId) {
      setGroupName(`Group Name ${chatId}`);
      setGroupNameUpdatedValue(`Group Name ${chatId}`)
    }

    return () => {
      setGroupName("")
      setGroupNameUpdatedValue("")
      setIsEdit(false)
    }
  }, [chatId])

  const IconBtns = (
    <>
      <Box
        sx={{
          display: {
            xs: "block",
            sm: "none",
            position: "fixed",
            right: "1rem",
            top: "1rem",
          },
        }}
      >
        <IconButton onClick={handleMobile}>
          <MenuIcon />
        </IconButton>
      </Box>

      <Tooltip title="back">
        <IconButton
          sx={{
            position: 'absolute',
            top: "2rem",
            left: "2rem",
            bgcolor: "black",
            color: "white",
            ":hover": {
              bgcolor: "rgba(0,0,0,0.7)"
            },
          }}
          onClick={navigateBack}
        >
          <KeyboardBackspaceIcon />
        </IconButton>
      </Tooltip>
    </>
  )

  const GroupName = (
    <Stack
      direction={"row"}
      alignItems={"center"}
      justifyContent={"center"}
      spacing={"1rem"}
      padding={"3rem"}
    >
      {
        isEdit ? (
          <>
            <TextField
              value={groupNameUpdatedValue}
              onChange={(e) => { setGroupNameUpdatedValue(e.target.value) }}
            />
            <IconButton onClick={updateGroupName} disabled={isLoadingGroupName}><DoneIcon /></IconButton>
          </>
        ) : (
          <>
            <Typography variant='h4'>{groupName}</Typography>
            <IconButton disabled={isLoadingGroupName} onClick={() => setIsEdit(true)}><EditIcon /></IconButton>
          </>)
      }
    </Stack>
  )

  const ButtonGroup = (
    <Stack
      direction={{
        sm: "row",
        xs: "column-reverse"
      }}
      spacing={"1rem"}
      p={{
        xs: "0",
        sm: "1rem",
        md: "1rem 4rem"
      }}
    >
      <Button size='large' color='error' startIcon={<DeleteIcon />} onClick={OpenConfirmDeleteHandler}> Delete Group </Button>
      <Button size='large' variant='contained' startIcon={<AddIcon />} onClick={openAddMemberHandler} > Add  Member</Button>
    </Stack>
  )

  return myGroups.isLoading ? (<LayoutLoader />) : (
    <Grid container height="100vh">
      {/* Groups List Section */}
      <Grid
        item
        sm={4} // 4 columns for screens 'sm' and larger
        sx={{
          display: {
            xs: 'none', // Hide on extra small screens (mobile)
            sm: 'block', // Show on small and larger screens (tablet and desktop)
          },
        }}
      >
        <GroupsList myGroups={myGroups?.data?.groups} chatId={chatId} />
      </Grid>

      {/* Groups Detail Section */}
      <Grid
        item
        xs={12} // Full width on extra small screens (mobile)
        sm={8} // 8 columns for screens 'sm' and larger
        sx={{
          display: 'flex',
          flexDirection: 'column', // Vertical stack of items
          alignItems: 'center', // Center content horizontally
          position: 'relative', // Position relative for any absolute child if required
          padding: '1rem 3rem', // Padding around the content
        }}
      >

        {IconBtns}

        {
          groupName && <>

            {GroupName}

            <Typography
              margin={"2rem"}
              alignSelf={"flex-start"}
              variant='body1'
            >
              Members
            </Typography>

            <Stack
              maxWidth={"45rem"}
              width={"100%"}
              boxSizing={"border-box"}
              padding={{
                sm: "1rem",
                xs: "0",
                md: "1rem 4rem"
              }}
              spacing={"2rem"}
              height={"50vh"}
              overflow={"auto"}
            >


              {/* Members */}
              {

                isLoadingRemoveMember ? (
                  <CircularProgress />
                ) : (
                  members.map((i) => (
                    <UserItem
                      key={i._id}
                      user={i}
                      isAdded
                      styling={{
                        boxShadow: "0 0 0.5rem rgba(0,0,0,0.2)",
                        padding: "1rem 2rem",
                        borderRadius: "1rem"
                      }}
                      handler={removeMemberHandler}
                    />
                  ))
                )

              }


            </Stack>

            {ButtonGroup}

          </>
        }

      </Grid>

      {
        isAddMember && (<Suspense fallback={<Backdrop open />}>
          <AddMemberDialog chatId={chatId} />
        </Suspense>)
      }

      {
        confirmDeleteDialog && (<Suspense fallback={<Backdrop open />}>
          <ConfirmDeleteDialog
            open={confirmDeleteDialog}
            handleClose={CloseConfirmDeleteHandler}
            deleteHandler={deleteHandler}
          />
        </Suspense>)
      }

      <Drawer
        sx={{
          display: {
            xs: "block",
            sm: "none"
          }
        }}
        open={isMobileMenuOpen}
        onClose={handleMobileClose}
      >
        <GroupsList w={"50vw"} myGroups={myGroups?.data?.groups} chatId={chatId} />
      </Drawer>

    </Grid>
  );
};


const GroupsList = ({ w = "100%", myGroups = [], chatId }) => (
  <Stack width={w} sx={{ backgroundImage: bgGradient, height: "100vh", overflow: "auto" }}>
    {
      myGroups.length > 0 ? (myGroups.map((group, index) => (<GroupListItem
        group={group} chatId={chatId} key={`${group._id}-${index}`} />))
      ) : (
        <Typography textAlign={"center"} padding={"1rem"}>
          No Groups
        </Typography>)
    }
  </Stack>
)


const GroupListItem = memo(({ group, chatId }) => {
  const { name, avatar, _id } = group

  return (
    <Link to={`?group=${_id}`} onClick={e => { if (chatId === _id) e.preventDefault() }}>

      <Stack direction={"row"} spacing={"1rem"} alignItems={"center"}>
        <AvatarCard avatar={avatar} />
        <Typography>{name}</Typography>
      </Stack>

    </Link>
  )
})

export default Groups;
