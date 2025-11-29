package mai.challenge.correspondence.service

import mai.challenge.correspondence.entity.Letter
import mai.challenge.correspondence.entity.User
import org.springframework.web.multipart.MultipartFile

interface LetterService {

    fun getLetters(
        user: User,
    ): List<Letter>

    fun createLetter(
        file: MultipartFile,
        title: String,
        createdBy: User,
    ): Letter
}