import { all, fork } from "redux-saga/effects"

//public
import AccountSaga from "./auth/register/saga"
import AuthSaga from "./../pages/auth/login/store/saga"
import ChatSaga from "./../pages/chat/store/saga"
import MeetingsSaga from "./../pages/meetings/store/saga"
import DocumentSaga from "./../pages/documents/store/saga"
import BlogSaga from "./../pages/blog/store/saga"
import LessonsSaga from "./../pages/lessons/store/saga"
import TestsSaga from "./../pages/tests/store/saga"
import AssignmentsSaga from "./../pages/assignments/store/saga"

export default function* rootSaga() {
  yield all([
    AccountSaga(),
    AuthSaga(),
    ChatSaga(),
    MeetingsSaga(),
    DocumentSaga(),
    BlogSaga(),
    LessonsSaga(),
    TestsSaga(),
    AssignmentsSaga()
  ])
}
