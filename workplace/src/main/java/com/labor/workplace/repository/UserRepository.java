
package com.labor.workplace.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import com.labor.workplace.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailAndPassword(
            String email,
            String password);

    Optional<User> findByEmail(String email);

    java.util.List<User> findByRole(String role);

    java.util.List<User> findByCreatedByAdminEmail(String createdByAdminEmail);
}