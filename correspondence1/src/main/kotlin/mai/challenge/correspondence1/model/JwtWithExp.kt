package mai.challenge.correspondence.model

import java.util.Date

data class JwtWithExp(
    val jwt: String,
    val exp: Date,
)
