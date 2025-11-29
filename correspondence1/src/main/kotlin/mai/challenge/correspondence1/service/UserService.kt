package mai.challenge.correspondence.service

import mai.challenge.correspondence.entity.User
import mai.challenge.correspondence.model.AuthTokens

interface UserService {
    fun save(user: User, roleIds: List<Long>): User
    fun findByEmail(email: String): User?
    fun authUser(login: String, password: String): AuthTokens
}