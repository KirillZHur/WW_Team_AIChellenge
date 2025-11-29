package mai.challenge.correspondence.controller

import mai.challenge.correspondence.entity.WorkflowTaskStatus
import mai.challenge.correspondence.model.ApproveTaskRequest
import mai.challenge.correspondence.model.RejectTaskRequest
import mai.challenge.correspondence.model.toDto
import mai.challenge.correspondence.service.WorkflowService
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
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
