
package com.sajib.library_management.controller;

import com.sajib.library_management.entity.Book;
import com.sajib.library_management.repository.BookRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookRepository bookRepository;

    public BookController(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    // POST - Add Book
    @PostMapping("/post")
    public Book addBook(@RequestBody Book book) {
        return bookRepository.save(book);
    }

    // GET - Get All Books
    @GetMapping("/get")
    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    // GET - Get Book By ID
    @GetMapping("/{id}")
    public Book getBookById(@PathVariable Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Book not found"));
    }

    // GET - Search Books By Title, Author or ISBN
    @GetMapping("/search")
    public List<Book> searchBooks(
            @RequestParam String keyword) {

        return bookRepository.findAll()
                .stream()
                .filter(book ->
                        book.getTitle()
                                .toLowerCase()
                                .contains(keyword.toLowerCase())
                                ||
                                book.getAuthor()
                                        .toLowerCase()
                                        .contains(keyword.toLowerCase())
                                ||
                                book.getIsbn()
                                        .toLowerCase()
                                        .contains(keyword.toLowerCase())
                )
                .toList();
    }

    // PUT - Update Complete Book
    @PutMapping("/{id}")
    public Book updateBook(
            @PathVariable Long id,
            @RequestBody Book updatedBook) {

        Book existingBook = bookRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Book not found"));

        existingBook.setTitle(updatedBook.getTitle());
        existingBook.setAuthor(updatedBook.getAuthor());
        existingBook.setIsbn(updatedBook.getIsbn());
        existingBook.setCategory(updatedBook.getCategory());
        existingBook.setTotalCopies(updatedBook.getTotalCopies());
        existingBook.setAvailableCopies(updatedBook.getAvailableCopies());

        return bookRepository.save(existingBook);
    }

    // PATCH - Update Available Copies Only
    @PatchMapping("/{id}/available-copies")
    public Book updateAvailableCopies(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> request) {

        Book existingBook = bookRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Book not found"));

        Integer availableCopies = request.get("availableCopies");

        if (availableCopies == null) {
            throw new IllegalArgumentException(
                    "availableCopies is required");
        }

        existingBook.setAvailableCopies(availableCopies);

        return bookRepository.save(existingBook);
    }

    // DELETE - Delete Book
    @DeleteMapping("/{id}")
    public String deleteBook(@PathVariable Long id) {

        Book existingBook = bookRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Book not found"));

        bookRepository.delete(existingBook);

        return "Book deleted successfully!";
    }
}
