import Foundation
import FirebaseFirestore
import SwiftUI

@MainActor
class BookViewModel: ObservableObject {
    @Published var books: [Book] = []
    @Published var featuredBooks: [Book] = []
    @Published var isLoading = false
    @Published var errorMessage: String?
    
    private let db = Firestore.firestore()
    
    init() {
        Task {
            await fetchBooks()
        }
    }
    
    func fetchBooks() async {
        isLoading = true
        errorMessage = nil
        
        do {
            let query = db.collection("books")
                .whereField("isPublic", isEqualTo: true)
                .order(by: "createdAt", descending: true)
            
            let snapshot = try await query.getDocuments()
            let fetchedBooks = snapshot.documents.compactMap { Book(document: $0) }
            
            books = fetchedBooks
            featuredBooks = fetchedBooks.filter { $0.featured }
            
        } catch {
            errorMessage = error.localizedDescription
            print("Error fetching books: \(error)")
        } finally {
            isLoading = false
        }
    }
    
    func fetchBooksByCategory(_ category: String) async {
        isLoading = true
        errorMessage = nil
        
        do {
            let query = db.collection("books")
                .whereField("isPublic", isEqualTo: true)
                .whereField("category", isEqualTo: category)
                .order(by: "createdAt", descending: true)
            
            let snapshot = try await query.getDocuments()
            let fetchedBooks = snapshot.documents.compactMap { Book(document: $0) }
            
            books = fetchedBooks
            
        } catch {
            errorMessage = error.localizedDescription
            print("Error fetching books by category: \(error)")
        } finally {
            isLoading = false
        }
    }
    
    func searchBooks(query: String) async {
        guard !query.isEmpty else {
            await fetchBooks()
            return
        }
        
        isLoading = true
        errorMessage = nil
        
        do {
            let queryLower = query.lowercased()
            let filteredBooks = books.filter { book in
                book.title.lowercased().contains(queryLower) ||
                book.author.lowercased().contains(queryLower) ||
                book.description.lowercased().contains(queryLower) ||
                book.tags.contains { $0.lowercased().contains(queryLower) }
            }
            
            books = filteredBooks
            
        } catch {
            errorMessage = error.localizedDescription
            print("Error searching books: \(error)")
        } finally {
            isLoading = false
        }
    }
    
    func addBook(_ book: Book) async throws {
        do {
            let bookData: [String: Any] = [
                "title": book.title,
                "description": book.description,
                "author": book.author,
                "category": book.category,
                "coverImageUrl": book.coverImageUrl,
                "pdfUrl": book.pdfUrl,
                "isPublic": book.isPublic,
                "featured": book.featured,
                "views": book.views,
                "likes": book.likes,
                "tags": book.tags,
                "userId": book.userId,
                "createdAt": Timestamp(),
                "updatedAt": Timestamp(),
                "language": book.language,
                "pages": book.pages,
                "rating": book.rating,
                "reviews": book.reviews
            ]
            
            try await db.collection("books").addDocument(data: bookData)
            await fetchBooks()
            
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }
    
    func updateBook(_ book: Book) async throws {
        do {
            let bookData: [String: Any] = [
                "title": book.title,
                "description": book.description,
                "author": book.author,
                "category": book.category,
                "coverImageUrl": book.coverImageUrl,
                "pdfUrl": book.pdfUrl,
                "isPublic": book.isPublic,
                "featured": book.featured,
                "views": book.views,
                "likes": book.likes,
                "tags": book.tags,
                "updatedAt": Timestamp(),
                "language": book.language,
                "pages": book.pages,
                "rating": book.rating,
                "reviews": book.reviews
            ]
            
            try await db.collection("books").document(book.id).updateData(bookData)
            await fetchBooks()
            
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }
    
    func deleteBook(_ bookId: String) async throws {
        do {
            try await db.collection("books").document(bookId).delete()
            await fetchBooks()
            
        } catch {
            errorMessage = error.localizedDescription
            throw error
        }
    }
    
    func incrementBookViews(_ bookId: String) async {
        do {
            try await db.collection("books").document(bookId).updateData([
                "views": FieldValue.increment(Int64(1))
            ])
        } catch {
            print("Error incrementing book views: \(error)")
        }
    }
    
    func toggleBookLike(_ bookId: String, userId: String) async {
        // Implementation for toggling book likes
        // This would require updating both the book document and user's favorites
    }
}
