package mai.challenge.correspondence.service.impl

import org.springframework.http.HttpStatus
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import mai.challenge.correspondence.entity.User
import mai.challenge.correspondence.model.AuthTokens
import mai.challenge.correspondence.repository.RoleRepository
import mai.challenge.correspondence.exception.BackendException
import mai.challenge.correspondence.repository.UserRepository
import mai.challenge.correspondence.service.JwtService
import mai.challenge.correspondence.service.UserService

@Service
class UserServiceImpl(
    private val userRepository: UserRepository,
    private val roleRepository: RoleRepository,
    private val passwordEncoder: PasswordEncoder,
    private val jwtService: JwtService,
) : UserService {

    @Transactional
    override fun save(user: User, roleIds: List<Long>): User {
        if (findByEmail(user.email) != null) {
            throw BackendException(HttpStatus.CONFLICT, "Email ${user.email} is already used")
        }

        val roles = roleRepository.findAllById(roleIds)
        if (roles.toList().size != roleIds.size) {
            val invalidIds = roleIds.toSet().minus(roles.map { it.id })
            throw BackendException(HttpStatus.BAD_REQUEST, "Invalid role ids : $invalidIds")
        }

        user.copy(roles = roles)
        return userRepository.save(user)
    }

    override fun findByEmail(email: String): User? {
        return userRepository.findByEmail(email)
    }

    override fun authUser(
        login: String,
        password: String
    ): AuthTokens {
        val user = findByEmail(login) ?: throw BackendException(HttpStatus.BAD_REQUEST, "Email $login is invalid")
        if (!passwordEncoder.matches(password, user.passwordHash)) {
            throw BackendException(HttpStatus.BAD_REQUEST, "Invalid password")
        }
        val jwtToken = jwtService.generateToken(user)
        return AuthTokens(
            jwtToken.jwt,
            jwtToken.exp.toInstant()
        )
    }
}