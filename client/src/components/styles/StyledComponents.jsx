import { keyframes, Skeleton, styled } from "@mui/material";
import { Link as LinkComponent } from "react-router-dom";
import { greyColor } from "../constants/color";

const VisuallyHiddenInput = styled("input")({
    clip: "rect(0, 0, 0, 0)",
    border: 0,
    height: 1,
    width: 1,
    margin: -1,
    overflow: "hidden",
    padding: 0,
    position: "absolute",
    whiteSpace: "nowrap",
})

const Link = styled(LinkComponent)`
    color: black;
    text-decoration: none;
    padding: 1rem;
    &:hover{
    background-color: rgba(0,0,0,0.1);
    }
`;

const InputBox = styled("input")`
    width: 100%;
    height: 100%;
    border: none;
    outline: none;
    padding: 0 3rem;
    border-radius: 1.5rem;
    background-color: ${greyColor};
`

const SearchField = styled("input")`
    padding: 1rem;
    width: 20vmax;
    border: none;
    outline: none;
    border-radius: 1.5rem;
    background-color: #f1f1f1;
    font-size: 1.1rem;
`


const CurveButton = styled("button")`
    padding: 1rem;
    border: none;
    border-radius: 1.5rem;
    outline: none;
    cursor: pointer;
    background-color: black;
    color: white;
    font-size: 1.1rem;
    &:hover{
        background-color: rgba(0,0,0,0.8);
    }
`

const bounceAnimation = keyframes`
    0% {transform: scale(1);}
    50% {transform: scale(1.5);}
    100% {transform: scale(1);}
`

const BouncingSkeleton = styled(Skeleton)(() => (
    {
        animation: `${bounceAnimation} 1s infinite`,
    }
))

export {
    VisuallyHiddenInput,
    Link,
    InputBox,
    SearchField,
    CurveButton,
    BouncingSkeleton
}