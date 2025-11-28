package mai.challenge.correspondence.common.auth

import jakarta.annotation.PostConstruct
import org.springframework.stereotype.Service
import mai.challenge.correspondence.repository.RoleRepository

@Service
class RoleCache(
    private val roleRepository: RoleRepository
) {
    @Volatile private var idToCode: Map<Long, String> = emptyMap()

    @PostConstruct
    fun warmUp() {
        reload()
    }

    fun reload() {
//        idToCode = roleRepository.findAll().associate { it.id!! to it.name }
    }

    fun hasRole(userRoleIds: Collection<Long>, required: String): Boolean =
        userRoleIds.any { idToCode[it] == required }

    fun idByName(name: String): Long =
        idToCode.filter { (_, v) -> v == name }.keys.first()
}