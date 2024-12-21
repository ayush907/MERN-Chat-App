import moment from "moment"

const fileFormat = (url = "") => {
    const fileExt = url.split(".").pop()

    if (fileExt === "mp4" || fileExt === "webm" || fileExt === "ogg") {
        return "video"
    }

    if (fileExt === "mp3" || fileExt === "wav") {
        return "audio"
    }

    if (fileExt === "png" || fileExt === "jpg" || fileExt === "jpeg" || fileExt === "gif") {
        return "image"
    }

    return "file"

}


const transformImage = (url = "", width = 100) => {

    const newUrl = url.replace("upload/", `upload/dpr_auto/w_${width}/`)

    return newUrl
}


const getlast7Days =()=>{
    const currentDate = moment();
    const last7days = []
    for(let i = 0; i < 7; i++){
        const dayDate = currentDate.clone().subtract(i, "days")
        const dayName = dayDate.format("dddd")
        last7days.unshift(dayName)
    }
    return last7days
}

const getOrSaveFromStorage = ({key, value, get})=>{

    if(get){
        return localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key)): null
    }
    else{
        localStorage.setItem(key, JSON.stringify(value))
    }

}

export { fileFormat, transformImage, getlast7Days, getOrSaveFromStorage }