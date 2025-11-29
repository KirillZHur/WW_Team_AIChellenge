package mai.challenge.correspondence.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

@Component
@ConfigurationProperties("jwt")
class JwtProperties {
    lateinit var secretBase64: String
    var accessTtlMin: Long = 15
    lateinit var issuer: String
}