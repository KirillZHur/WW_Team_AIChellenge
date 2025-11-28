package mai.challenge.correspondence.model

data class JwtPayload(
    val id: Long,
    val email: String,
    val roles: List<Long> = emptyList()
)
