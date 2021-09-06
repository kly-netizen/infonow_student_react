import { post, del, get, put, postForm } from "./api_helper"
import * as  url from "./url_helper"




// Gets the logged in user data from local session
export const getLoggedInUser = () => {
  const user = localStorage.getItem("authUser")
  return user ? JSON.parse(user) : null;
}

export const setLoggedInUser = (obj = {}) => {
  localStorage.setItem("authUser", JSON.stringify(obj))
}

export const getAuthentication = () => {
  const tokenInfo = localStorage.getItem("authToken")
  return tokenInfo ? JSON.parse(tokenInfo) : null;
}

//is user is logged in
export const isUserAuthenticated = () => {
  return getAuthentication() !== null
}


// Get started
export const getStartedContent = () => get(url.GET_STARTED_CONTENT)

//Teacher History

export const getAllTeachers = (id) => get(url.All_TEACHERS(id))


// Chats
export const getChatContactsRequest = id => get(url.GET_CHATS_CONTACTS(id))
export const getChatDocuments = id => get(url.GET_CHAT_DOCUMENTS(id))
export const updateUser = (id, data) => put(url.UPDATE_USER(id), data)
export const createChat = data => post(url.CHATS, data)

//Documents
export const getUserDocuments = () => get(url.GET_USER_DOCUMENTS)
export const deleteUserDocument = (id) => del(url.DELETE_USER_DOCUMENTS(id))
export const uploadDocument = (data, options) => postForm(url.UPLOAD_DOCUMENT_URL, data, options);

//Blogs 
export const getBlogList = () => get(url.GET_BLOG_LIST)
export const getBlog = (id) => get(url.GET_BLOG(id))
export const getBlogCategories = () => get(url.GET_BLOG_CATEGORIES)
export const getBlogComments = (id) => get(url.GET_BLOG_COMMENTS(id))
export const postCommentOnBlog = (data) => post(url.COMMENT_ON_BLOG, data)


export const uploadBlogImage = (data, options) => postForm(url.UPLOAD_BLOG_IMAGE_URL, data, options);

// Student Actions
export const postStudentLogin = data => post(url.POST_STUDENT_LOGIN, data);
export const signInWithGoogle = data => post(url.SIGN_IN_WITH_GOOGLE, data);
export const setupAccountPassword = data => post(url.SETUP_ACCOUNT_PASSWORD, data);
export const registerUser = data => post(url.REGISTER, data);
export const forgotAccountPassword = data => post(url.FORGOT_PASSWORD, data);
export const resetAccountPassword = data => post(url.RESET_PASSWORD, data);

//Meeting
export const getMeetingToken = () => get(url.MEETING_TOKEN);
export const newMeeting = data => post(url.NEW_MEETING, data);
export const getStudentAllMeetings = userId => get(url.GET_ALL_MEETINGS(userId));
export const getMeetingDates = userId => get(url.GET_MEETING_DATES(userId));
export const updateMeeting = (id, action, data) => put(url.UPDATE_MEETING(id, action), data);
export const getMeetingWithAdmin = userId => get(url.GET_ADMIN_MEETING(userId));
export const newAdminMeeting = data => post(url.NEW_ADMIN_MEETING, data);

//Lessons

export const getTopics = () => get(url.TOPICS);
export const getLesson = (id) => get(url.LESSON(id));
export const completedLesson = (data) => put(url.STUDENT_LESSONS, data);
export const getTopicLessons = id => get(url.GET_TOPIC_LESSONS(id));
export const uploadNewTopic = data => postForm(url.NEW_TOPICS, data);
export const getRecentLessons = (id) => get(url.GET_RECENT_LESSONS);
export const getIncompleteLessonsCount = () => get(url.GET_INCOMPLETE_LESSON_COUNT);

//Test

export const getPastTests = () => get(url.GET_PAST_TESTS);
export const getUpcomingTests = () => get(url.GET_UPCOMING_TESTS);
export const newTestAttempt = (data) => post(url.POST_TEST_ATTEMPT, data);
export const submitTestAttempt = (data) => put(url.SUBMIT_TEST_ATTEMPT, data);
export const getTestAttemptDetails = (id) => get(url.GET_TEST_ATTEMPT_DETAILS(id));

// Assignments 
export const getNewAssignments = () => get(url.NEW_ASSIGNMENTS)
export const getPastAssignments = () => get(url.PAST_ASSIGNMENTS)
export const getAssignmentAttempt = (id) => get(url.GET_ASSIGNMENT_ATTEMPT(id))
export const getAssignment = (id) => get(url.GET_ASSIGNMENT(id))
export const createAssignmentAttempt = (data) => post(url.ASSIGNMENT_ATTEMPT, data)
export const submitAssignment = (data) => put(url.ASSIGNMENT_ATTEMPT, data)

//Profile

export const updateProfileData = (id, data) => put(url.UPDATE_PROFILE_DATA(id), data);
export const uploadProfilePicture = (id, data) => postForm(url.UPLOAD_PROFILE_PICTURE(id), data);
export const updatePassword = (id, data) => put(url.UPDATE_PASSWORD(id), data);