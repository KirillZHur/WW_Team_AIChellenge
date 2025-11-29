package mai.challenge.correspondence.repository

import mai.challenge.correspondence.entity.Letter
import org.springframework.data.jpa.repository.JpaRepository
import java.util.UUID

interface LetterRepository : JpaRepository<Letter, Long> {
    fun findAllBySender(sender: UUID): List<Letter>
}