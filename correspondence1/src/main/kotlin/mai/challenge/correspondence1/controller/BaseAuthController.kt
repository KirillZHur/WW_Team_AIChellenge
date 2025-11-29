package mai.challenge.correspondence.controller

import mai.challenge.correspondence.service.AuthService

abstract class BaseAuthController(
    private val authService: AuthService,
) {
    protected fun currentUser() = authService.getCurrentUser()
}