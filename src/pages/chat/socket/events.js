import moment from "moment";
import { IOEvents } from "./eventTypes";

/**
 * 
 * @param {any} socket 
 * @param {any} props 
 */
export function attachEvents(socket, props) {

    console.log("CHECk props ==>", props);

    socket.on(IOEvents.CONNECT, () => {
        console.log(IOEvents.CONNECT);
        socket.emit(IOEvents.SET_LANGUAGE, { locale: 'en' })
        socket.emit(IOEvents.AUTHORIZATION, { authorization: props.user.tokenType + " " + props.user.token })
    })

    socket.on(IOEvents.AUTHORIZATION, (res) => {
        console.log(IOEvents.AUTHORIZATION, res);
        if (res.success) {
            props.getChatContacts(props.user.user.userId)
            props.authorizedSuccess()
        }
        else {
            props.authorizedFailure()
        }
    })

    socket.on(IOEvents.JOIN_ROOM, (res) => {
        console.log(IOEvents.JOIN_ROOM, res);

    })

    socket.on(IOEvents.GET_PREVIOUS_MESSAGES, (res) => {
        console.log(IOEvents.GET_PREVIOUS_MESSAGES, res);
        if (res.success) {
            props.getPreviousMessagesSuccess(res.data)
        }
        else {
            props.getPreviousMessagesFailure(res.error)
        }
    })

    socket.on(IOEvents.NEW_MESSAGE, (res) => {
        console.log(IOEvents.NEW_MESSAGE, res);

        //To Update chat head message
        for (let chat in props.chats) {
            if (res.success && res.chatId == chat.chatId) {
                chat.messages[0] = res.data
            }
            else if (res.chatId == chat.chatId) {
                chat.messages[0].error = true
            }
        }
        props.updateChatHeadMessage(props.chats)

        //Sent message fail
        if (!res.success &&
            res.messageId &&
            res.chatId == props.selectedChat.chatId) {
            for (let msg of props.messages) {
                if (msg.messageId == res.messageId &&
                    msg.chatId == res.chatId) {
                    msg.error = true
                    break
                }
            }
            props.newMessageFailure(props.messages)
            return
        }

        //user message receive
        if (res.success &&
            res.messageId &&
            res.chatId == props.selectedChat.chatId) {
            for (let msg of props.messages) {
                if (msg.messageId == res.messageId &&
                    msg.chatId == res.chatId) {
                    msg = res.data
                    break
                }
            }
            props.newMessageSuccess(props.messages)
        }

        //New Message receive
        else if (res.success &&
            res.chatId == props.selectedChat.chatId) {
            props.newMessage(res.data)
        }
    })
}

/**
 * 
 * @param {any} socket 
 * @param {uuid} chatId 
 * @param {Moment} timeStamp 
 */

export function getPreviousMessages(socket, chatId, timeStamp = moment()) {
    socket.emit(IOEvents.GET_PREVIOUS_MESSAGES, { chatId: chatId, dateTime: timeStamp })
}

/**
 * 
 * @param {any} socket 
 * @param {uuid} chatId 
 * @param {Moment} timeStamp 
 */

export function sendMessage(socket, chatId, message, messageId) {
    socket.emit(IOEvents.NEW_MESSAGE, { chatId, message: message, messageId })
}