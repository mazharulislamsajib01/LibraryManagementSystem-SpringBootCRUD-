package com.sajib.library_management.controller;

import com.sajib.library_management.entity.Book;
import com.sajib.library_management.entity.Loan;
import com.sajib.library_management.entity.Member;
import com.sajib.library_management.repository.BookRepository;
import com.sajib.library_management.repository.LoanRepository;
import com.sajib.library_management.repository.MemberRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/loans")
public class LoanController {

    private final LoanRepository loanRepository;
    private final BookRepository bookRepository;
    private final MemberRepository memberRepository;

    public LoanController(
            LoanRepository loanRepository,
            BookRepository bookRepository,
            MemberRepository memberRepository) {

        this.loanRepository = loanRepository;
        this.bookRepository = bookRepository;
        this.memberRepository = memberRepository;
    }

    // POST - Issue Book
    @PostMapping("/issue")
    public Loan issueBook(
            @RequestParam Long memberId,
            @RequestParam Long bookId) {

        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new RuntimeException("Book not found"));

        if (book.getAvailableCopies() <= 0) {
            throw new RuntimeException("No available copies of this book");
        }

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        Loan loan = new Loan();
        loan.setMember(member);
        loan.setBook(book);
        loan.setIssueDate(LocalDate.now());
        loan.setDueDate(LocalDate.now().plusDays(14));
        loan.setStatus("ISSUED");

        return loanRepository.save(loan);
    }

    // GET - Get All Loans
    @GetMapping("/get")
    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }

    // GET - Get Loan By ID
    @GetMapping("/{id}")
    public Loan getLoanById(@PathVariable Long id) {
        return loanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loan not found"));
    }

    // GET - Get Loans By Member ID
    @GetMapping("/member/{memberId}")
    public List<Loan> getLoansByMember(@PathVariable Long memberId) {

        return loanRepository.findAll()
                .stream()
                .filter(loan -> loan.getMember().getId().equals(memberId))
                .toList();
    }

    // POST - Return Book
    @PostMapping("/{id}/return")
    public Loan returnBook(@PathVariable Long id) {

        Loan loan = loanRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Loan not found"));

        if ("RETURNED".equals(loan.getStatus())) {
            throw new RuntimeException("Book already returned");
        }

        loan.setReturnDate(LocalDate.now());
        loan.setStatus("RETURNED");

        Book book = loan.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);

        bookRepository.save(book);

        return loanRepository.save(loan);
    }
}
