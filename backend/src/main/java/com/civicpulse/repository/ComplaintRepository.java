
package com.civicpulse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.civicpulse.entity.Complaint;
import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    List<Complaint> findAllByCitizen_EmailOrderBySubmittedAtDesc(String email);
    List<Complaint> findAllByOrderBySubmittedAtDesc();
    long countByStatus(String status);
}
