import SwiftUI

struct BookCard: View {
    let book: Book
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Cover Image
            AsyncImage(url: URL(string: book.coverImageUrl)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .overlay(
                        Image(systemName: "book.closed")
                            .font(.system(size: 40))
                            .foregroundColor(.gray)
                    )
            }
            .frame(width: 120, height: 160)
            .clipped()
            .cornerRadius(12)
            
            // Book Info
            VStack(alignment: .leading, spacing: 4) {
                Text(book.title)
                    .font(.subheadline)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
                
                Text(book.author)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
                
                HStack(spacing: 8) {
                    // Rating
                    HStack(spacing: 2) {
                        Image(systemName: "star.fill")
                            .font(.caption2)
                            .foregroundColor(.yellow)
                        
                        Text(String(format: "%.1f", book.rating))
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                    
                    // Views
                    HStack(spacing: 2) {
                        Image(systemName: "eye")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                        
                        Text("\(book.views)")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
            }
            .frame(width: 120)
        }
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

struct BookCardLarge: View {
    let book: Book
    
    var body: some View {
        HStack(spacing: 16) {
            // Cover Image
            AsyncImage(url: URL(string: book.coverImageUrl)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
            } placeholder: {
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .overlay(
                        Image(systemName: "book.closed")
                            .font(.system(size: 40))
                            .foregroundColor(.gray)
                    )
            }
            .frame(width: 80, height: 120)
            .clipped()
            .cornerRadius(8)
            
            // Book Info
            VStack(alignment: .leading, spacing: 8) {
                Text(book.title)
                    .font(.headline)
                    .fontWeight(.semibold)
                    .foregroundColor(.primary)
                    .lineLimit(2)
                    .multilineTextAlignment(.leading)
                
                Text(book.author)
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                    .lineLimit(1)
                
                Text(book.description)
                    .font(.caption)
                    .foregroundColor(.secondary)
                    .lineLimit(3)
                    .multilineTextAlignment(.leading)
                
                HStack(spacing: 16) {
                    // Rating
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.caption)
                            .foregroundColor(.yellow)
                        
                        Text(String(format: "%.1f", book.rating))
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    // Views
                    HStack(spacing: 4) {
                        Image(systemName: "eye")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        Text("\(book.views)")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                    
                    // Pages
                    HStack(spacing: 4) {
                        Image(systemName: "doc.text")
                            .font(.caption)
                            .foregroundColor(.secondary)
                        
                        Text("\(book.pages) pages")
                            .font(.caption)
                            .foregroundColor(.secondary)
                    }
                }
            }
            
            Spacer()
        }
        .padding(16)
        .background(Color(.systemBackground))
        .cornerRadius(16)
        .shadow(color: .black.opacity(0.1), radius: 4, x: 0, y: 2)
    }
}

#Preview {
    VStack(spacing: 20) {
        BookCard(book: Book(
            id: "1",
            title: "The Swift Programming Language",
            description: "A comprehensive guide to Swift programming",
            author: "Apple Inc.",
            category: "Programming",
            coverImageUrl: "https://example.com/cover.jpg",
            pdfUrl: "https://example.com/book.pdf",
            rating: 4.5,
            views: 1250,
            pages: 300
        ))
        
        BookCardLarge(book: Book(
            id: "2",
            title: "iOS App Development with SwiftUI",
            description: "Learn to build beautiful iOS apps using SwiftUI framework",
            author: "John Doe",
            category: "Programming",
            coverImageUrl: "https://example.com/cover2.jpg",
            pdfUrl: "https://example.com/book2.pdf",
            rating: 4.8,
            views: 890,
            pages: 450
        ))
    }
    .padding()
}
