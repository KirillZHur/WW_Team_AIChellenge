package mai.challenge.correspondence.exception

import org.springframework.http.HttpStatus

class BackendException(val statusCode: HttpStatus, val errorMessage: String) : RuntimeException(errorMessage) {
}