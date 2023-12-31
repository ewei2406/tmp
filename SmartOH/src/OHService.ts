// @ts-nocheck
import axios from 'axios'; // ES6 Modules
import { io, Socket } from "socket.io-client";

const subscribe = () => {
    const socket = io('ws://localhost:3000')
    socket.on('changed', m => console.log(m))
}

const sendRequest = (request: string) => {
    axios.get(request)
}

const joinAsStudent = (
    studentID: string, roomID: string, question: string) => {
    console.log("HERE")
    sendRequest(
        `/api/student/join?id=${studentID}&question=${encodeURIComponent(question)}&roomID=${roomID}`)
}

const leaveAsStudent = (studentID: string, roomID: string) => {
    sendRequest(`/api/student/leave?id=${studentID}&roomID=${roomID}`)
}

const updateQuestion = (studentID: string, roomID: string, newQuestion: string) => {
    sendRequest(`/api/student/edit?id=${studentID}&roomID=${roomID}&question=${encodeURIComponent(newQuestion)}`)
}

const joinAsTA = (
    taID: string, roomID: string) => {

    sendRequest(
        `/api/ta/join?id=${taID}&roomID=${roomID}`)
}

const leaveAsTA = (taID: string, roomID: string) => {
    console.log("LEAVING")
    sendRequest(`/api/ta/leave?id=${taID}&roomID=${roomID}`)
}

const moveStudentAsTA = (index: number, roomID: string, studentID: string, unhelp: boolean = false) => {
    console.log("MOVING " + studentID)
    
    sendRequest(`/api/ta/move?index=${index}&roomID=${roomID}&id=${studentID}&unhelp=${unhelp}`)
}
const helpAsTA = (taID: string, roomID: string, studentID: string) => {
    console.log('HELPING ' + studentID);
    axios.get(`/api/ta/help?roomID=${roomID}&id=${studentID}&taID=${taID}`)
}
const putbackStudent = (studentID: string, roomID: string, index: number) => {
    console.log('PUTTING BACK ' + studentID);
    axios.get(`/api/ta/putback?roomID=${roomID}&id=${studentID}&index=${index}`)
}

const getSimilarities = (request: any) => {

    return axios.post('/api/ml/similarity', { request })
}
const getSummary = (roomID: string, onFinish: any) => {
    console.log("Summary")
    axios.get(`/api/ml/summarize?roomID=${roomID}`).then(res => onFinish(res.data))
}

const getHelp = (question: string, onFinish: any) => {
    console.log("Question")
    axios.get(`/api/ml/help?question=${encodeURIComponent(question)}`).then(res => onFinish(res.data))
}

const OHService = { getSimilarities, getHelp, subscribe, joinAsStudent, joinAsTA, leaveAsTA, leaveAsStudent , moveStudentAsTA, updateQuestion , helpAsTA, putbackStudent, getSummary }

export { OHService }