package mai.challenge.correspondence.entity

import jakarta.persistence.*
import java.time.OffsetDateTime

@Entity
@Table(name = "workflow_tasks")
data class WorkflowTask(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "draft_id", nullable = false)
    val draft: Draft,

    @Column(nullable = false, length = 100)
    val assignee: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    var status: WorkflowTaskStatus = WorkflowTaskStatus.PENDING,

    @Column(columnDefinition = "text")
    var comment: String? = null,

    @Column(name = "created_at", nullable = false)
    val createdAt: OffsetDateTime = OffsetDateTime.now(),

    @Column(name = "completed_at")
    var completedAt: OffsetDateTime? = null
)

enum class WorkflowTaskStatus {
    PENDING,
    COMPLETED,
    CANCELLED
}