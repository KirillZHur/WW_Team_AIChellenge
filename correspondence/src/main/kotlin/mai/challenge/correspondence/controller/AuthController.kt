package mai.challenge.correspondence.controller

import correspondence.api.AuthenticationApi
import correspondence.model.LoginRequest
import correspondence.model.TokenPair
import correspondence.model.UserRegistrationRequest
import correspondence.model.UserResponse
import mai.challenge.correspondence.mapper.UserMapper
import mai.challenge.correspondence.service.UserService
import mai.challenge.correspondence.service.AuthService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RestController
import java.time.OffsetDateTime
import java.time.ZoneId

@RestController
class AuthController(
    private val userService: UserService,
    private val userMapper: UserMapper,
    authService: AuthService,
) : BaseAuthController(authService), AuthenticationApi {

    override fun authUser(loginRequest: LoginRequest): ResponseEntity<TokenPair> {
        return loginRequest
            .let { userService.authUser(it.login, it.password) }
            .let { TokenPair(
                it.accessToken,
                OffsetDateTime.ofInstant(it.accessTokenExpiresIn, ZoneId.systemDefault())
                ) }
            .let { ResponseEntity.ok(it) }
    }

    override fun getMe(): ResponseEntity<UserResponse> {
        return ResponseEntity.ok(userMapper.toResponse(currentUser()))
    }

    override fun logout(): ResponseEntity<Unit> {
        return ResponseEntity.ok().build()
    }

    override fun registerUser(userRegistrationRequest: UserRegistrationRequest): ResponseEntity<UserResponse> {
        return userRegistrationRequest
            .let { request -> userMapper.toEntity(request) }
            .let { user -> userService.save(user, userRegistrationRequest.roleIds) }
            .let { user -> userMapper.toResponse(user) }
            .let { response -> ResponseEntity.ok(response) }
    }

}
