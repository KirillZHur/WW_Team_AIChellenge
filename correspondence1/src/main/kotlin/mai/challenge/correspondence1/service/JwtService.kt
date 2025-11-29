package mai.challenge.correspondence.service

import mai.challenge.correspondence.entity.User
import mai.challenge.correspondence.model.JwtWithExp

interface JwtService {
    fun generateToken(user: User): JwtWithExp
}