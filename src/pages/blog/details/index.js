import React from 'react'
import { Fragment, useState, useEffect } from 'react'
import axios from 'axios'
import classnames from 'classnames'
import Avatar from '@components/avatar'
import cmtImg from '@src/assets/images/portrait/small/avatar-s-6.jpg'
import { kFormatter } from '@utils'


import { withRouter } from 'react-router';

// ** Store & Actions
import { connect, useSelector } from 'react-redux'
import {
  getBlogList,
  getBlogListSuccess,
  getBlogListFailure,
  getBlog,
  getBlogSuccess,
  getBlogFailure,
  commentOnBlog,
  commentOnBlogSuccess,
  commentOnBlogFailure,

} from '../store/actions'


import {
  Share2,
  MessageSquare,
  Bookmark,
  GitHub,
  Gitlab,
  Facebook,
  Twitter,
  Linkedin,
  CornerUpLeft
} from 'react-feather'
import Breadcrumbs from '@components/breadcrumbs'


import UILoader from '../../../@core/components/ui-loader';

import {
  useParams
} from "react-router-dom";

import {
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  CardText,
  CardImg,
  Badge,
  Media,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Form,
  Input,
  Button,
  FormGroup,
  CustomInput
} from 'reactstrap'

import '@styles/base/pages/page-blog.scss'
import '../style.scss'

import { GET_BLOG_IMAGE_URL, GET_IMAGE_URL } from '../../../helpers/url_helper';
import moment from 'moment'

import ReactMarkdown from 'react-markdown'
import { render } from 'react-dom'
import { getCategoryBadgeColor } from '../util'


const BlogDetails = (props) => {

  let { id } = useParams();
  const { selectedBlog } = props

  const [comment, setComment] = useState("")

  useEffect(() => {
    props.getBlog(id);
  }, [])

  useEffect(() => {


    if (selectedBlog.id) {
      let uploadPath = "http://192.168.10.102:1337/uploads/";
      let markdown = String(selectedBlog.Content).replaceAll("/uploads/", uploadPath);

      render(<ReactMarkdown>{markdown}</ReactMarkdown>, document.getElementById("blog-content-container"))
    }

  }, [selectedBlog])



  const renderComments = () => {
    return selectedBlog.comments.map((comment, index) =>
      <Media className='mb-1' key={'comment' + index}>
        <Avatar className='mr-75' img={GET_IMAGE_URL()} width='38' height='38' />
        <Media body>
          <h6 className='font-weight-bolder mb-25'>{"Username"}</h6>
          <CardText>{moment(comment.created_at).format("hh:mm a MMM DD,YYYY ")}</CardText>
          <CardText>{comment.text}</CardText>
        </Media>
      </Media>)
  }

  const postComment = (e) => {
    e.preventDefault()
    console.log("COMMENT ==> ", comment)
    props.commentOnBlog({ id: props.selectedBlog.id, comment: comment })
    setComment("");

  }

  return (
    <Fragment>
      <UILoader blocking={props.selectedBlogLoading}>
        <div className='blog-wrapper'>
          <div className='content-detached'>
            <div className='content-body'>
              {Object.keys(selectedBlog).length > 0 &&
                (<Row>
                  <Col sm='12'>
                    <Card className='mb-3'>
                      <div
                        className="blog-detail-banner-container"
                        style={
                          {
                            backgroundImage: `url(${GET_BLOG_IMAGE_URL(selectedBlog.MainImage.formats.large ? selectedBlog.MainImage.formats.large.url : selectedBlog.MainImage.formats.medium.url)})`,
                          }
                        }
                      >
                        <span className="pl-3 pr-3 pb-1">{selectedBlog.Title}</span>
                        <div className="blog-banner-gradient"></div>
                      </div>
                      <CardBody className="p-3">
                        <Media className="mb-2">
                          <Avatar className='mr-50' img={GET_IMAGE_URL(selectedBlog.user.profilePicture)} imgHeight='24' imgWidth='24' />
                          <Media body>
                            <small className='text-muted mr-25'>by</small>
                            <small>
                              <a className='text-body' href='/' onClick={e => e.preventDefault()}>
                                {selectedBlog.user.name}
                              </a>
                            </small>
                            <span className='text-muted ml-50 mr-25'>|</span>
                            <small className='text-muted'>{moment(selectedBlog.Published_date).format('MMM DD, YYYY')}</small>
                          </Media>
                        </Media>
                        <div className='my-1 py-25'>
                          {
                            selectedBlog.category_ids.map((category, index) =>
                              <span key={selectedBlog.id + "category_selected" + index}>
                                <Badge
                                  color={getCategoryBadgeColor(index)}
                                  pill
                                >
                                  {category.Name}
                                </Badge>
                                &nbsp;
                              </span>
                            )
                          }
                        </div>
                        <div id="blog-content-container">
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                  {
                    selectedBlog.comments.length > 0 &&
                    <Col sm='12'>
                      <h6 className='section-label'>Comment</h6>
                      <Card>
                        <CardBody>
                          {renderComments()}
                        </CardBody>
                      </Card>
                    </Col>
                  }
                  <Col sm='12'>
                    <h6 className='section-label'>Leave a Comment</h6>
                    <Card>
                      <CardBody>
                        <Form className='form' onSubmit={e => postComment(e)}>
                          <Row>
                            <Col sm='12'>
                              <FormGroup className='mb-2'>
                                <Input
                                  className='mb-2'
                                  type='textarea'
                                  rows='4'
                                  placeholder='Comment'
                                  value={comment}
                                  onChange={e => setComment(e.target.value)}
                                  required
                                />
                              </FormGroup>
                            </Col>
                            <Col sm='12'>
                              <Button.Ripple type="submit" color='primary'>Post Comment</Button.Ripple>
                            </Col>
                          </Row>
                        </Form>
                      </CardBody>
                    </Card>
                  </Col>
                </Row>
                )}
            </div>
          </div>
        </div>
      </UILoader>
    </Fragment>
  )
}


const mapStateToProps = (state) => {

  const {
    blogList,
    blogListError,
    blogListLoading,
    selectedBlog,
    selectedBlogError,
    selectedBlogLoading,
    commentProcessing
  } = state.Blogs;
  return {
    blogList,
    blogListError,
    blogListLoading,
    selectedBlog,
    selectedBlogError,
    selectedBlogLoading,
    commentProcessing
  }
}

export default withRouter(
  connect(mapStateToProps, {
    getBlogList,
    getBlogListSuccess,
    getBlogListFailure,
    getBlog,
    getBlogSuccess,
    getBlogFailure,
    commentOnBlog,
    commentOnBlogSuccess,
    commentOnBlogFailure,

  })(BlogDetails)
)

