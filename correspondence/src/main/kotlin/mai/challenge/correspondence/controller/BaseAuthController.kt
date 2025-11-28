package mai.challenge.correspondence.controller

import mai.challenge.correspondence.entity.User
import mai.challenge.correspondence.model.Roles
import mai.challenge.correspondence.service.AuthService

abstract class BaseAuthController(
    private val authService: AuthService,
) {
    protected fun currentUser() = authService.getCurrentUser()
    protected fun hasRole(user: User, required: Roles) = authService.hasRole(user, required)
}