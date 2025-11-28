package mai.challenge.correspondence.handler

import com.fasterxml.jackson.databind.exc.MismatchedInputException
import correspondence.model.ErrorResponse
import mai.challenge.correspondence.exception.BackendException
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.http.converter.HttpMessageNotReadableException
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice
import java.time.OffsetDateTime

@RestControllerAdvice
class GlobalExceptionHandler {


    @ExceptionHandler(HttpMessageNotReadableException::class)
    fun handleInvalid(ex: HttpMessageNotReadableException): ResponseEntity<ErrorResponse> {
        val cause = ex.cause

        when (cause) {
            is MismatchedInputException -> {
                val fieldPath = cause.path.joinToString(".") { it.fieldName ?: "[${it.index}]" }
                return errorResponse(HttpStatus.BAD_REQUEST, "Missing $fieldPath field")
            }
            else -> {
                return errorResponse(HttpStatus.BAD_REQUEST, "Error occurred while processing request: ${ex.message}")
            }
        }
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleInvalid(ex: MethodArgumentNotValidException): ResponseEntity<ErrorResponse> {
        val cause = ex.bindingResult.fieldErrors
        val sb = StringBuilder()
        cause.forEach { sb.append(it.field).append(": ").appendLine(it.defaultMessage) }
        return errorResponse(HttpStatus.BAD_REQUEST, sb.toString())
    }

    @ExceptionHandler(BackendException::class)
    fun handleBackendException(ex: BackendException) = errorResponse(ex.statusCode, ex.errorMessage)

    private fun errorResponse(status: HttpStatus, msg: String): ResponseEntity<ErrorResponse> {
        return ResponseEntity.status(status).body(ErrorResponse(msg, OffsetDateTime.now()))
    }

}