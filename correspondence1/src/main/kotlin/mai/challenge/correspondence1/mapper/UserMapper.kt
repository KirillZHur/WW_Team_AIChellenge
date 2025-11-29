package mai.challenge.correspondence.mapper

import correspondence.model.UserRegistrationRequest
import correspondence.model.UserResponse
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import mai.challenge.correspondence.entity.User
import java.time.Instant
import java.util.UUID

@Component
class UserMapper(private val passwordEncoder: PasswordEncoder) {

    fun toEntity(req: UserRegistrationRequest): User {
        return User(
            id = UUID.randomUUID(),
            passwordHash = passwordEncoder.encode(req.password)!!,
            email = req.email,
            createdAt = Instant.now(),
            updatedAt = Instant.now(),
        )
    }

    fun toResponse(user: User): UserResponse {
        return UserResponse(
            id = user.id,
            email = user.email,
            roleIds = user.roles.map { role -> role.id!! }
        )
    }
}