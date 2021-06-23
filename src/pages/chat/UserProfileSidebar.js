import React, { useEffect } from 'react';
// ** Custom Components
import Avatar from '@components/avatar'

import {
  UncontrolledTooltip
} from 'reactstrap'

// ** Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'
import { X } from 'react-feather'
import { GET_DOCUMENT_URL, GET_IMAGE_URL } from '../../helpers/url_helper';


import { getShortNameForDocument } from '@utils';
import { getFileIcon } from './utility';
import UILoader from '../../@core/components/ui-loader';



const UserProfileSidebar = props => {
  // ** Props
  const { handleUserSidebarRight, userSidebarRight, store } = props

  const { user, selectedChat, chatDocuments, chatDocumentsLoading, getSelectChatDocuments } = store

  useEffect(() => {
    if (userSidebarRight && selectedChat.chatId)
      getSelectChatDocuments({ chatId: selectedChat.chatId })
  }, [userSidebarRight])

  const openDocument = (link) => {
    if (link)
      window.open(GET_DOCUMENT_URL(link), '_blank')
  }

  return (
    Object.keys(selectedChat).length > 0
    &&

    < div className={classnames('user-profile-sidebar', {
      show: userSidebarRight === true
    })}>
      <header className='user-profile-header'>
        <span className='close-icon' onClick={handleUserSidebarRight}>
          <X size={14} />
        </span>
        <div className='header-profile-sidebar'>
          <Avatar
            className='box-shadow-1 avatar-border'
            size='xl'
            // status={user.status}
            img={GET_IMAGE_URL(selectedChat.type == 'group'
              ? selectedChat.groupPicture || null
              : selectedChat.chatParticipants.find(u => u.user.userId != user.userId).user.profilePicture)
            }
            imgHeight='70'
            imgWidth='70'
          />
          <h4 className='chat-user-name'> {
            selectedChat.type == 'group'
              ? selectedChat.groupName
              : selectedChat.chatParticipants.find(u => u.user.userId != user.userId).user.name
          }
          </h4>
          {/* <span className='user-post'>{user.role}</span> */}
        </div>
      </header>
      <PerfectScrollbar className='user-profile-sidebar-area' options={{ wheelPropagation: false }}>
        {
          selectedChat.type != "group" &&
          <>
            <h6 className='section-label mb-1'>About</h6>
            <p>
              {
                selectedChat.chatParticipants.find(cp => cp.user.userId != user.userId)
                  .user.about || "These aren’t the droids you’re looking for!"
              }
            </p>
          </>
        }
        <div className='personal-info'>
          {
            selectedChat.type == "group" &&
            <>
              <h6 className='section-label mb-1 mt-3'>Group Information</h6>
              <ul className='list-unstyled'>
                {
                  selectedChat.chatParticipants.filter(cp => cp.user.userId != user.userId).map(c =>
                    <li className='mb-1' key={c.user.userId}>
                      <div>
                        <Avatar
                          img={GET_IMAGE_URL(c.user.profilePicture)}
                          imgHeight='14'
                          imgWidth='14'
                        />
                        <span className="pl-1">
                          {
                            c.user.name
                          }
                        </span>
                      </div>
                    </li>
                  )
                }
              </ul>
            </>
          }
        </div>
        <div className='more-options'>
          <h6 className='section-label mb-1 mt-3'>Shared Media</h6>
          <UILoader blocking={!!chatDocumentsLoading}>
            <ul className='list-unstyled'>
              {
                chatDocuments.length == 0 && !chatDocumentsLoading &&
                <li className='cursor-pointer mb-1'>
                  No Media found
                </li>
              }
              {
                chatDocuments.length > 0 &&
                chatDocuments.map((d, index) =>
                  <li
                    key={"doc_list_" + index}
                    className='cursor-pointer mb-1'
                    onClick={() => openDocument(d.name)}
                  >
                    {
                      getFileIcon(d.fileType)
                    }
                    <span id={`chat-media-${d.documentId}`} className="ml-1">
                      {
                        getShortNameForDocument(d.fileName)
                      }
                    </span>
                    <UncontrolledTooltip placement='top' target={`chat-media-${d.documentId}`}>
                      {d.fileName}
                    </UncontrolledTooltip>
                  </li>)
              }
            </ul>
          </UILoader>
        </div>
      </PerfectScrollbar>
    </div >

  )
}

export default UserProfileSidebar
