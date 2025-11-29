package mai.challenge.correspondence.repository

import mai.challenge.correspondence.entity.Role
import org.springframework.data.jpa.repository.JpaRepository

interface RoleRepository : JpaRepository<Role, Long> {
}