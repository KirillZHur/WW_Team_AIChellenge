package mai.challenge.correspondence.model

import java.time.Instant

data class AuthTokens(
    val accessToken: String,
    val accessTokenExpiresIn: Instant,
)