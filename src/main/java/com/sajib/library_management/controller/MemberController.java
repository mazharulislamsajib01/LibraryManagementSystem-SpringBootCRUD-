
package com.sajib.library_management.controller;

import com.sajib.library_management.entity.Member;
import com.sajib.library_management.repository.MemberRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
public class MemberController {

    private final MemberRepository memberRepository;

    public MemberController(MemberRepository memberRepository) {
        this.memberRepository = memberRepository;
    }

    // POST - Add Member
    @PostMapping("/post")
    public Member addMember(@RequestBody Member member) {
        return memberRepository.save(member);
    }

    // GET - Get All Members
    @GetMapping("/get")
    public List<Member> getAllMembers() {
        return memberRepository.findAll();
    }

    // GET - Get Member By ID
    @GetMapping("/{id}")
    public Member getMemberById(@PathVariable Long id) {
        return memberRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Member not found"));
    }

    // GET - Search Members By Name or Email
    @GetMapping("/search")
    public List<Member> searchMembers(
            @RequestParam String keyword) {

        return memberRepository.findAll()
                .stream()
                .filter(member ->
                        member.getName().toLowerCase()
                                .contains(keyword.toLowerCase())
                                ||
                                member.getEmail().toLowerCase()
                                        .contains(keyword.toLowerCase())
                )
                .toList();
    }

    // PUT - Update Member
    @PutMapping("/{id}")
    public Member updateMember(
            @PathVariable Long id,
            @RequestBody Member updatedMember) {

        Member existingMember = memberRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Member not found"));

        existingMember.setName(updatedMember.getName());
        existingMember.setEmail(updatedMember.getEmail());
        existingMember.setPhone(updatedMember.getPhone());
        existingMember.setAddress(updatedMember.getAddress());
        existingMember.setMembershipDate(
                updatedMember.getMembershipDate());

        return memberRepository.save(existingMember);
    }

    // DELETE - Delete Member
    @DeleteMapping("/{id}")
    public String deleteMember(@PathVariable Long id) {

        Member existingMember = memberRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Member not found"));

        memberRepository.delete(existingMember);

        return "Member deleted successfully!";
    }
}
