package mai.challenge.correspondence.controller

import mai.challenge.correspondence.entity.Letter
import mai.challenge.correspondence.model.LetterCreatedDto
import mai.challenge.correspondence.model.LetterDto
import mai.challenge.correspondence.service.AuthService
import mai.challenge.correspondence.service.LetterService
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestPart
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile

@RestController
@RequestMapping("/api/v1")
class LetterController(
    private val letterService: LetterService,
    private val authService: AuthService,
) : BaseAuthController(authService) {

    @GetMapping("/letters")
    fun getLetters() = ResponseEntity.ok(
        letterService.getLetters(currentUser())
            .map { LetterDto(id = it.id, title = it.title) })

    @PostMapping("/letter", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun createLetter(
        @RequestPart("file") file: MultipartFile,
        @RequestPart("title") title: String
    ): ResponseEntity<LetterCreatedDto> {
        val user = currentUser();

        val letter: Letter = letterService.createLetter(
            file = file,
            title = title,
            createdBy = user
        )

        val dto = LetterCreatedDto(
            id = letter.id!!,
            createdAt = letter.createdAt,
            status = letter.status.name
        )

        return ResponseEntity.status(HttpStatus.CREATED).body(dto)
    }
}
