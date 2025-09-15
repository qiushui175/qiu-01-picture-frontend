// @ts-ignore
/* eslint-disable */
import request from '@/request'

/** addSpaceUser POST /api/spaceuser/add */
export async function addSpaceUserUsingPost(
  body: API.SpaceUserAddRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseLong_>('/api/spaceuser/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** deleteSpaceUser POST /api/spaceuser/delete */
export async function deleteSpaceUserUsingPost(
  body: API.SpaceUserDeleteRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/spaceuser/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** editSpaceUser POST /api/spaceuser/edit */
export async function editSpaceUserUsingPost(
  body: API.SpaceUserEditRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseBoolean_>('/api/spaceuser/edit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** getSpaceUser POST /api/spaceuser/get */
export async function getSpaceUserUsingPost(
  body: API.SpaceUserQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponseSpaceUser_>('/api/spaceuser/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** listSpaceUserVOByPage POST /api/spaceuser/list */
export async function listSpaceUserVoByPageUsingPost(
  body: API.SpaceUserQueryRequest,
  options?: { [key: string]: any }
) {
  return request<API.BaseResponsePageSpaceUserVO_>('/api/spaceuser/list', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  })
}

/** listMySpaceUserVOByPage POST /api/spaceuser/list/my */
export async function listMySpaceUserVoByPageUsingPost(options?: { [key: string]: any }) {
  return request<API.BaseResponsePageSpaceUserVO_>('/api/spaceuser/list/my', {
    method: 'POST',
    ...(options || {}),
  })
}
