package mai.challenge.correspondence.config

import io.jsonwebtoken.io.Decoders
import io.jsonwebtoken.security.Keys
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import javax.crypto.SecretKey

@Configuration
class JwtConfig(private val props: JwtProperties) {
    @Bean
    fun jwtSecretKey(): SecretKey =
        Keys.hmacShaKeyFor(Decoders.BASE64.decode(props.secretBase64)) // длина >= 256 бит для HS256
}