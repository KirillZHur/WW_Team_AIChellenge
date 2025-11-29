package mai.challenge.correspondence.controller

import mai.challenge.correspondence.entity.WorkflowTaskStatus
import mai.challenge.correspondence.model.ApproveTaskRequest
import mai.challenge.correspondence.model.RejectTaskRequest
import mai.challenge.correspondence.model.toDto
import mai.challenge.correspondence.service.WorkflowService
import org.springframework.web.bind.annotation.*
import java.security.Principal

@RestController
@CrossOrigin("localhost:3000")
@RequestMapping("/api/v1/workflow")
class WorkflowController(
    private val workflowService: WorkflowService
) {

    @GetMapping("/tasks")
    fun getTasks(
        principal: Principal,
        @RequestParam(required = false) status: WorkflowTaskStatus?
    ) = workflowService.getTasksForAssignee(principal.name, status)
        .map { it.toDto() }

    @PostMapping("/tasks/{taskId}/approve")
    fun approve(
        @PathVariable taskId: Long,
        @RequestBody req: ApproveTaskRequest,
        principal: Principal
    ) = workflowService.approveTask(taskId, principal.name, req.comment)
        .toDto()

    @PostMapping("/tasks/{taskId}/reject")
    fun reject(
        @PathVariable taskId: Long,
        @RequestBody req: RejectTaskRequest,
        principal: Principal
    ) = workflowService.rejectTask(taskId, principal.name, req.comment)
        .toDto()
}
