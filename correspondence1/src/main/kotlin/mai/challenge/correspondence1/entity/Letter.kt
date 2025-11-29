package mai.challenge.correspondence.entity

import jakarta.persistence.CascadeType
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.EnumType
import jakarta.persistence.Enumerated
import jakarta.persistence.FetchType
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.JoinColumn
import jakarta.persistence.JoinTable
import jakarta.persistence.ManyToMany
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import mai.challenge.correspondence.entity.Approver
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "letters")
data class Letter(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    val sender: UUID,

    @Column(length = 1000)
    val title: String,

    @Column(columnDefinition = "text")
    val body: String? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    val status: LetterStatus = LetterStatus.NEW,

    @Column(name = "quickly")
    val quickly: Boolean = false,

    @Column
    val type: String? = null,

    @Column
    val summary: String? = null,

    @Column(name = "created_at", nullable = false)
    val createdAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    val updatedAt: OffsetDateTime = OffsetDateTime.now(),

    @OneToMany(mappedBy = "letter", cascade = [CascadeType.ALL], orphanRemoval = true)
    val drafts: MutableList<Draft> = mutableListOf(),

    @ManyToMany(fetch = FetchType.EAGER, cascade = [CascadeType.ALL])
    @JoinTable(
        name = "letter_approvers",
        joinColumns = [JoinColumn(name = "letter_id")],
        inverseJoinColumns = [JoinColumn(name = "approver_id")]
    )
    val approvers: List<Approver> = listOf()
)

enum class LetterStatus {
    NEW, IN_PROGRESS, ON_REVIEW, ANSWER_SENT, CLOSED
}
