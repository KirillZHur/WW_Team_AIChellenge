package mai.challenge.correspondence.service

import io.jsonwebtoken.Jwts
import mai.challenge.correspondence.entity.User
import mai.challenge.correspondence.model.JwtWithExp
import org.springframework.stereotype.Service
import mai.challenge.correspondence.config.JwtProperties
import java.time.Instant
import java.time.temporal.ChronoUnit
import java.util.Date
import javax.crypto.SecretKey

@Service
class JwtServiceImpl(
    private val props: JwtProperties,
    private val secretKey: SecretKey,
) : JwtService {
    override fun generateToken(user: User): JwtWithExp {
        val nowInstant = Instant.now()
        val iat = Date.from(nowInstant)
        val exp = Date.from(nowInstant.plus(props.accessTtlMin, ChronoUnit.MINUTES))

        val jwt = Jwts.builder()
            .issuer(props.issuer)
            .subject(user.id.toString())
            .issuedAt(iat)
            .expiration(exp)
            .signWith(secretKey, Jwts.SIG.HS256)
            .compact()
        return JwtWithExp(jwt, exp)
    }
}