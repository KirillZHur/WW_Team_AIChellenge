package mai.challenge.correspondence.repository

import mai.challenge.correspondence.entity.Letter
import mai.challenge.correspondence.entity.LetterStatus
import org.springframework.data.jpa.repository.JpaRepository
import java.time.OffsetDateTime

interface LetterRepository : JpaRepository<Letter, Long> {
    fun findAllByStatus(status: LetterStatus): List<Letter>
    fun findAllBySlaAtBeforeAndStatusNot(slaAt: OffsetDateTime, status: LetterStatus): List<Letter>
}