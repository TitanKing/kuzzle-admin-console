import kuzzle from '../../../services/kuzzle'
import SessionUser from '../../../models/SessionUser'
import { setTokenToCurrentEnvironment } from '../../../services/environment'
import * as types from './mutation-types'
import Promise from 'bluebird'

export default {
  [types.DO_LOGIN] ({commit}, data) {
    let user = SessionUser()

    return new Promise((resolve, reject) => {
      kuzzle
        .unsetJwtToken()
        .loginPromise('local', {username: data.username, password: data.password}, '2s')
        .then(loginResult => {
          user.id = loginResult._id
          user.token = loginResult.jwt
          setTokenToCurrentEnvironment(loginResult.jwt)

          return kuzzle.whoAmIPromise()
        })
        .then(KuzzleUser => {
          user.params = KuzzleUser.content

          return kuzzle.getMyRightsPromise()
        })
        .then(rights => {
          user.rights = rights
          commit(types.SET_CURRENT_USER, user)
          commit(types.SET_TOKEN_VALID, true)

          resolve()
        })
        .catch(error => {
          reject(new Error(error.message))
        })
    })
  },
  [types.LOGIN_BY_TOKEN] ({commit}, data) {
    let user = SessionUser()
    if (!data.token) {
      setTokenToCurrentEnvironment(null)
      commit(types.SET_CURRENT_USER, SessionUser())
      commit(types.SET_TOKEN_VALID, false)
      kuzzle.unsetJwtToken()
      return Promise.resolve(user)
    }

    return kuzzle.checkTokenPromise(data.token)
      .then(res => {
        if (!res.valid) {
          commit(types.SET_CURRENT_USER, SessionUser())
          commit(types.SET_TOKEN_VALID, false)
          setTokenToCurrentEnvironment(null)
          kuzzle.unsetJwtToken()
          return Promise.resolve(SessionUser())
        }

        kuzzle.setJwtToken(data.token)
        setTokenToCurrentEnvironment(data.token)
        return kuzzle.whoAmIPromise()
          .then(KuzzleUser => {
            user.id = KuzzleUser.id
            user.params = KuzzleUser.content
            return kuzzle.getMyRightsPromise()
          })
          .then(rights => {
            user.rights = rights

            commit(types.SET_CURRENT_USER, user)
            commit(types.SET_TOKEN_VALID, true)

            return Promise.resolve(user)
          })
      })
      .catch(error => Promise.reject(new Error(error.message)))
  },
  [types.CHECK_FIRST_ADMIN] ({commit}) {
    return kuzzle
      .queryPromise({controller: 'server', action: 'adminExists'}, {})
      .then(res => {
        if (!res.result.exists) {
          commit(types.SET_ADMIN_EXISTS, false)
          return Promise.resolve()
        }

        commit(types.SET_ADMIN_EXISTS, true)
        return Promise.resolve()
      })
      .catch(error => Promise.reject(new Error(error.message)))
  },
  [types.DO_LOGOUT] ({commit}) {
    kuzzle.logout()
    kuzzle.unsetJwtToken()
    setTokenToCurrentEnvironment(null)
    commit(types.SET_CURRENT_USER, SessionUser())
    commit(types.SET_TOKEN_VALID, false)
  }
}
// export const setTokenValid = (store, isValid) => {
//   store.commit(SET_TOKEN_VALID, isValid)
// }
//
// export const setCurrentUser = (store, user) => {
//   store.commit(SET_CURRENT_USER, user)
// }
//
// export const setFirstAdmin = (store, exists) => {
//   store.commit(SET_ADMIN_EXISTS, exists)
// }
