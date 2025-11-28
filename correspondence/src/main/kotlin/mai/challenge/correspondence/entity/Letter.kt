package mai.challenge.correspondence.entity

import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import java.time.OffsetDateTime

@Entity
@Table(name = "letters")
data class Letter(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "external_id", length = 255)
    val externalId: String? = null,

    @Column(length = 500)
    val sender: String? = null,

    @Column(length = 1000)
    val subject: String? = null,

    @Column(columnDefinition = "text")
    val body: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    val status: LetterStatus = LetterStatus.NEW,

    @Column(name = "sla_at")
    val slaAt: OffsetDateTime? = null,

    @Column(name = "created_at", nullable = false)
    val createdAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    val updatedAt: OffsetDateTime = OffsetDateTime.now(),

    @OneToMany(mappedBy = "letter", cascade = [CascadeType.ALL], orphanRemoval = true)
    val drafts: MutableList<Draft> = mutableListOf()
)

enum class LetterStatus {
    NEW, IN_PROGRESS, ON_REVIEW, ANSWER_SENT, CLOSED
}
