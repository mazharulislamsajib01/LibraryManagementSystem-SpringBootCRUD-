package com.sajib.library_management.repository;

import com.sajib.library_management.entity.Member;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRepository extends JpaRepository<Member, Long> {
}

