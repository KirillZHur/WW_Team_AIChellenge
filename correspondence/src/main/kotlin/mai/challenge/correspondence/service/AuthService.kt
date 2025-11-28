package mai.challenge.correspondence.service

import mai.challenge.correspondence.exception.BackendException
import org.springframework.http.HttpStatus
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import mai.challenge.correspondence.entity.User
import mai.challenge.correspondence.model.Roles
import mai.challenge.correspondence.repository.UserRepository
import mai.challenge.correspondence.common.auth.RoleCache
import java.util.UUID

@Service
class AuthService(
    private val userRepository: UserRepository,
    private val roleCache: RoleCache,
) {
    fun getCurrentUser(): User {
        val auth =  SecurityContextHolder.getContext().authentication ?: throw BackendException(
            HttpStatus.UNAUTHORIZED,
            "No authentication"
        )
        val user = userRepository.findById(UUID.fromString(auth.name))
        return user.orElseThrow( { BackendException(HttpStatus.UNAUTHORIZED, "Invalid access token") } )
    }

    fun hasRole(user: User, role: Roles): Boolean {
        return roleCache.hasRole(user.roles.map { it.id!! }, role.name)
    }
}