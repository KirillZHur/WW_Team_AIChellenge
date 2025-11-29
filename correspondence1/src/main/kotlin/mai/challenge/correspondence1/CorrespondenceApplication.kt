package mai.challenge.correspondence

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication
import org.springframework.cloud.openfeign.EnableFeignClients

@SpringBootApplication
@EnableFeignClients
class CorrespondenceApplication

fun main(args: Array<String>) {
    runApplication<CorrespondenceApplication>(*args)
}
