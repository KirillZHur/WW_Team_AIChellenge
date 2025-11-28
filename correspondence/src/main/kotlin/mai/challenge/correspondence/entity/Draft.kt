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
import jakarta.persistence.ManyToOne
import jakarta.persistence.OneToMany
import jakarta.persistence.Table
import jakarta.persistence.Version
import java.time.OffsetDateTime

@Entity
@Table(name = "drafts")
data class Draft(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "letter_id", nullable = false)
    val letter: Letter,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    val style: DraftStyle,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    var status: DraftStatus = DraftStatus.GENERATING,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    val source: DraftSource = DraftSource.LLM,

    @Column(columnDefinition = "text")
    var text: String? = null,

    @Column(nullable = false)
    val version: Int = 1,

    @Column(name = "created_by", nullable = false, length = 100)
    val createdBy: String,

    @Column(name = "updated_by", length = 100)
    var updatedBy: String? = null,

    @Column(name = "created_at", nullable = false)
    val createdAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: OffsetDateTime = OffsetDateTime.now(),

    @Version
    @Column(name = "row_version")
    val rowVersion: Long? = null,

    @OneToMany(mappedBy = "draft", cascade = [CascadeType.ALL], orphanRemoval = true)
    val workflowTasks: MutableList<WorkflowTask> = mutableListOf()
)

enum class DraftStyle {
    OFFICIAL_REGULATOR,
    FORMAL_BUSINESS,
    CLIENT_FRIENDLY,
    SHORT_REPLY
}

enum class DraftSource {
    LLM,
    HUMAN
}

enum class DraftStatus {
    GENERATING,
    EDITABLE,
    ON_REVIEW,
    APPROVED,
    REJECTED,
    SENT
}
