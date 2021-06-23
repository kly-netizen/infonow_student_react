import React from 'react';
// ** React Imports
import { useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom'

// ** Custom Components
import Avatar from '@components/avatar'
import AvatarGroup from '@components/avatar-group'
import { getShortNameForDocument } from '@utils';

// ** Store & Actions

// ** Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { MessageSquare, Menu, Search, MoreVertical, Send, Calendar } from 'react-feather'
import {
  UncontrolledDropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Form,
  Label,
  InputGroup,
  InputGroupAddon,
  Input,
  InputGroupText,
  Button,
  Spinner,
  Progress,
  Tooltip,
  UncontrolledTooltip,
  Card,
  CardBody
} from 'reactstrap'

import moment from 'moment';
import { useSkin } from '@hooks/useSkin';

import { v4 } from "uuid"
import { sendMessage, getPreviousMessages, deleteMessages, userBlockChat, userUnBlockChat } from './socket/events';

import { GET_DOCUMENT_URL, GET_IMAGE_URL, DOCUMENT_BASE_URL } from './../../helpers/url_helper';
import { detectLinkInMessage, getFileIcon, getFilePreview } from './utility';


const ChatLog = props => {
  // ** Props & Store
  const {
    store,
    handleUserSidebarRight, handleSidebar,
    userSidebarLeft, socket } = props

  const { muteChatNotification, uploadDocument,
    unmuteChatNotification, mutedNotificationIds,
    selectedChat, newMessage,
    isEndOfMessages, documentList, cancelDocumentUpload, updateDocumentProgress,
    user, messages, messagesLoading, setPreviousMessagesLoading } = store

  // ** Refs & Dispatch
  const chatArea = useRef(null)

  // ** State
  const [msg, setMsg] = useState('')
  const [messageRefId, setMessageRefId] = useState(null)
  const [showScrollToBottom, setShowScrollToBottom] = useState(false)
  const [skin, setSkin] = useSkin();


  // ** Scroll to chat bottom
  const scrollToBottom = (animated = false) => {
    const chatContainer = ReactDOM.findDOMNode(chatArea.current)
    chatContainer.scrollTo({ top: Number.MAX_SAFE_INTEGER, behavior: animated ? 'smooth' : 'auto' });
  }

  const scrollToPosition = () => {
    if (messageRefId) {
      let topMsg = document.getElementById(messageRefId);
      if (topMsg) topMsg.scrollIntoView();
    }
  }

  useEffect(() => {
    setMessageRefId(null)
  }, [selectedChat])


  // ** If user chat is not empty scrollToBottom
  useEffect(() => {
    const selectedUserLen = Object.keys(selectedChat).length
    if (selectedUserLen > 0 && !messageRefId) scrollToBottom()
    if (messageRefId) scrollToPosition()
  }, [messages])


  const handleScroll = event => {
    const { scrollHeight, scrollTop, clientHeight, scrollToBottom } = event.target;
    const bottom = scrollHeight - scrollTop - clientHeight

    setShowScrollToBottom(bottom > 200)
    if (scrollTop == 0 && messages.length > 15 && !isEndOfMessages) {
      let time = messages[0] ? messages[0].createdAt : moment().utc()
      messages[0] ? setMessageRefId(messages[0].messageId) : setMessageRefId(null)
      if (selectedChat.chatId) {
        setPreviousMessagesLoading()
        getPreviousMessages(socket, selectedChat.chatId, time)
      }
    }
  }


  const openDocument = (link) => {
    if (link)
      window.open(GET_DOCUMENT_URL(link), '_blank')
  }

  // ** Renders user chat
  const renderChats = () => {
    return <>
      {
        messagesLoading &&
        <div className="text-center">
          <Spinner size="lg" color={'primary'} />
        </div>
      }
      {messages.map((item, index) =>
        <div
          key={index}
          className={classnames('chat', {
            'chat-left': item.user.userId !== user.userId,
          })}
        >
          {
            !(index > 0 && index < messages.length && moment(messages[index - 1].createdAt).isSame(item.createdAt, 'date')) &&
            <div
              className="text-center m-2"
              style={{ display: "flex", justifyContent: "center", alignItems: 'center' }}
            >
              <Calendar size={16} />
              &nbsp;&nbsp;
              {
                moment(item.createdAt).format("DD MMM YYYY")
              }
            </div>
          }

          <div>
            <div className='chat-avatar'>
              <Avatar
                className='box-shadow-1 cursor-pointer'
                img={GET_IMAGE_URL(item.user.profilePicture)}
                style={{
                  visibility: index < messages.length && index > 0 ?
                    (item.user.userId == messages[index - 1].user.userId
                      && moment(messages[index - 1].createdAt)
                        .isSame(item.createdAt, 'minute') ? "hidden" : "visible"
                    )
                    : "visible"
                }}
              />
            </div>
            <div
              className="chat-body"
            >
              <div id={item.messageId} key={"msg_" + item.messageId} className='chat-content'>
                <p
                  className="message-user-name"
                  style={{
                    display: index < messages.length && index > 0 ?
                      (item.user.userId == messages[index - 1].user.userId
                        && moment(messages[index - 1].createdAt)
                          .isSame(item.createdAt, 'minute') ? "none" : "block"
                      )
                      : "block"
                  }}
                >
                  {
                    selectedChat.type == "group"
                    && item.user.userId !== user.userId
                    && (item.user.name || "").split(" ")[0]
                  }
                </p>
                <p
                  onClick={() => openDocument(!!item.document ? item.document.name : null)}
                  className={!!item.document ? "cursor-pointer" : ''}
                >
                  {
                    !!item.document && <>{getFileIcon(item.document.fileType)}&nbsp;&nbsp;</>
                  }
                  {
                    item.document ?
                      <span className="font-weight-bold">{item.content}</span>
                      : detectLinkInMessage(item.content)
                  }
                </p>
                {item.document &&
                  getFilePreview(item.document.name, item.document.fileType)
                }
              </div>
            </div>
            {
              index < messages.length - 1 && index > -1 ?
                <>
                  {
                    item.user.userId == messages[index + 1].user.userId
                      && moment(messages[index + 1].createdAt).isSame(item.createdAt, 'minute') ?
                      ""
                      : <div className="msg-time" > {moment(item.createdAt).format("hh:mm a")}</div>
                  }
                </>
                : <div className="msg-time" > {moment(item.createdAt).format("hh:mm a")}</div>
            }
          </div>
        </div>
      )
      }</>

  }

  // ** Opens right sidebar & handles its data
  const handleAvatarClick = obj => {
    handleUserSidebarRight()
    // handleUser(obj)
  }

  // ** On mobile screen open left sidebar on Start Conversation Click
  const handleStartConversation = () => {
    if (!Object.keys(selectedChat).length && !userSidebarLeft && window.innerWidth <= 1200) {
      handleSidebar()
    }
  }

  const clearChat = (e) => {
    e.preventDefault()
    deleteMessages(socket, selectedChat.chatId)
    setMessageRefId(null)
  }

  const blockChat = (e) => {
    e.preventDefault()
    userBlockChat(socket, selectedChat.chatId)
  }

  const unBlockChat = (e) => {

    e.preventDefault()
    userUnBlockChat(socket, selectedChat.chatId)
  }

  const muteNotification = (e) => {
    e.preventDefault()
    muteChatNotification(selectedChat.chatId)
  }

  const unmuteNotification = (e) => {
    e.preventDefault()
    unmuteChatNotification(selectedChat.chatId)
  }



  // ** Sends New Msg
  const handleSendMsg = e => {
    e.preventDefault()
    if (msg.length) {
      let message = {
        content: msg,
        messageId: v4(),
        createdAt: moment(),
        user: user
      }
      setMessageRefId(message.messageId)
      sendMessage({ socket, chatId: selectedChat.chatId, message: msg, messageId: message.messageId })
      newMessage(message)
      setMsg('')
    }

  }

  // ** ChatWrapper tag based on chat's length
  const ChatWrapper = Object.keys(selectedChat).length > 0 ? PerfectScrollbar : 'div'

  const onFileSelectChange = (e) => {
    console.log("FILES", e.target.files)
    let count = 0;
    for (let key in e.target.files) {
      if (e.target.files.hasOwnProperty(key)) {
        uploadDocument({
          chatId: selectedChat.chatId,
          file: e.target.files[key],
          callback: ({ progress, documentId }) => updateDocumentProgress({ progress, documentId })
        })
        if (count == 5) {
          break;
        }
        count++
      }
    }
    document.getElementById('attach-doc').value = null;
  }

  return (
    <div className='chat-app-window'>
      <div className={classnames('start-chat-area', { 'd-none': Object.keys(selectedChat).length })}>
        <div className='start-chat-icon mb-1'>
          <MessageSquare />
        </div>
      </div>
      {Object.keys(selectedChat).length ? (
        <div className={classnames('active-chat', { 'd-none': selectedChat === null })}>
          <div className='chat-navbar'>
            <header className='chat-header'>
              <div className='d-flex align-items-center'>
                <div className='sidebar-toggle d-block d-lg-none mr-1' onClick={handleSidebar}>
                  <Menu size={21} />
                </div>
                <Avatar
                  imgHeight='36'
                  imgWidth='36'
                  img={GET_IMAGE_URL(selectedChat.type == 'group'
                    ? selectedChat.groupPicture || null
                    : selectedChat.chatParticipants.find(u => u.user.userId != user.userId).user.profilePicture)
                  }
                  className='avatar-border user-profile-toggle m-0 mr-1'
                  onClick={handleUserSidebarRight}
                />
                <h6 className='mb-0' onClick={handleUserSidebarRight}>
                  {
                    selectedChat.type == 'group'
                      ? selectedChat.groupName
                      : selectedChat.chatParticipants.find(u => u.user.userId != user.userId).user.name
                  }
                </h6>
              </div>
              <div className='d-flex align-items-center'>
                {/* <PhoneCall size={18} className='cursor-pointer d-sm-block d-none mr-1' />
                <Video size={18} className='cursor-pointer d-sm-block d-none mr-1' /> */}
                <Search size={18} className='cursor-pointer d-sm-block d-none' />
                <UncontrolledDropdown>
                  <DropdownToggle className='btn-icon' color='transparent' size='sm'>
                    <MoreVertical size='18' />
                  </DropdownToggle>
                  <DropdownMenu right>
                    <DropdownItem href='/' onClick={e => {
                      e.preventDefault()
                      handleUserSidebarRight()
                    }}>
                      View Contact
                    </DropdownItem>
                    {
                      mutedNotificationIds && !mutedNotificationIds[selectedChat.chatId]
                      &&
                      <DropdownItem href='/' onClick={muteNotification}>
                        Mute Notifications
                      </DropdownItem>
                    }
                    {
                      mutedNotificationIds && mutedNotificationIds[selectedChat.chatId]
                      &&
                      <DropdownItem href='/' onClick={unmuteNotification}>
                        Unmute Notifications
                      </DropdownItem>
                    }
                    {
                      selectedChat.chatParticipants.find(u => u.user.userId == user.userId && !u.blockedAt) &&
                      <DropdownItem href='/' onClick={blockChat}>
                        Block Chat
                      </DropdownItem>
                    }
                    {
                      selectedChat.chatParticipants.find(u => u.user.userId == user.userId && u.blockedAt) &&
                      <DropdownItem href='/' onClick={unBlockChat}>
                        Unblock Chat
                      </DropdownItem>
                    }
                    <DropdownItem href='/' onClick={clearChat}>
                      Clear Chat
                    </DropdownItem>
                    <DropdownItem href='/' onClick={e => e.preventDefault()}>
                      Report
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </div>
            </header>
          </div>

          <ChatWrapper onScroll={e => handleScroll(e)} ref={chatArea} className='user-chats' options={{ wheelPropagation: false }}>
            {
              Object.keys(selectedChat).length > 0 &&
              <div className='chats'>
                {renderChats()}
              </div>
            }
            {
              messages.length > 0 && messages[messages.length - 1].user.userId === user.userId &&
              <div className="text-right p-1 msg-delivery-status-container">
                <AvatarGroup
                  data={
                    selectedChat.chatParticipants
                      .filter(cp => cp.seenAt != null && cp.user.userId != user.userId)
                      .map(p => ({
                        title: p.user.name,
                        img: DOCUMENT_BASE_URL + p.user.profilePicture || `${DOCUMENT_BASE_URL}profile-pictures/default.png`,
                        imgWidth: '16',
                        imgHeight: '16',
                        className: 'msg-delivery-status'
                      }))
                  } />
              </div>
            }
          </ChatWrapper>

          <Button
            onClick={() => scrollToBottom(true)}
            color="gradient-primary"
            hidden={!showScrollToBottom}
            className="btn-icon round btn-sm btn-scroll-top-chat">
            <i className="la la-arrow-down" />
          </Button>

          {
            documentList.filter(f => f.chatId == selectedChat.chatId).length > 0 &&
            < div className="chat-selected-files-container">
              <Card className="ml-1">
                <CardBody className="p-1">
                  <div className="chat-selected-files-area">
                    {
                      documentList.filter(f => f.chatId == selectedChat.chatId).map((d, index) =>
                        <div className="selected-file" key={"selectedFiles_" + d.documentId}>
                          <Progress
                            value={d.progress}
                            min={0}
                            max={100}
                            animated={true}
                          />
                          <div>
                            <span className="mr-1" id={`doc-name-${d.documentId}`} >
                              {getShortNameForDocument(d.name)}
                            </span>
                            <UncontrolledTooltip placement='top' target={`doc-name-${d.documentId}`}>
                              {d.name}
                            </UncontrolledTooltip>
                            <button onClick={() => cancelDocumentUpload({ documentId: d.documentId })}>
                              <i className="la la-times"></i>
                            </button>
                          </div>
                        </div>)
                    }
                  </div>
                </CardBody>
              </Card>
            </div>
          }
          {
            selectedChat.chatParticipants.find(u => u.user.userId == user.userId && !u.blockedAt)
              ?
              <Form className='chat-app-form' onSubmit={e => handleSendMsg(e)}>
                <InputGroup className='input-group-merge mr-1 form-send-message'>
                  <Input
                    value={msg}
                    onChange={e => setMsg(e.target.value)}
                    placeholder='Type your message...'
                  />
                  <InputGroupAddon addonType='append'>
                    <InputGroupText>
                      <Label className='attachment-icon mb-0' for='attach-doc'>
                        <i className='cursor-pointer text-secondary la la-paperclip chat-file' />
                        <input type='file' id='attach-doc' multiple={true} hidden onChange={onFileSelectChange} />
                      </Label>
                    </InputGroupText>
                  </InputGroupAddon>
                </InputGroup>
                <Button
                  className='send'
                  color='primary'
                  onClick={handleSendMsg}
                >
                  <Send size={14} className='d-lg-none' />
                  <span className='d-none d-lg-block'>Send</span>
                </Button>
              </Form>
              :
              <div className="text-center pt-1">
                You can not reply to this conversation
              </div>
          }
        </div>
      ) : null
      }
    </div >
  )
}

export default ChatLog
