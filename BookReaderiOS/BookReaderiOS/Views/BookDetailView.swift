import SwiftUI

struct BookDetailView: View {
    let book: Book
    @EnvironmentObject var bookViewModel: BookViewModel
    @State private var showingPDF = false
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Book Header
                BookHeaderView(book: book)
                
                // Book Actions
                BookActionsView(book: book)
                
                // Book Information
                BookInfoView(book: book)
                
                // Book Description
                BookDescriptionView(book: book)
                
                // Tags
                if !book.tags.isEmpty {
                    TagsView(tags: book.tags)
                }
                
                // Related Books (placeholder)
                RelatedBooksView()
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
        }
        .navigationTitle("Book Details")
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .navigationBarTrailing) {
                Button(action: {
                    // Add to favorites
                }) {
                    Image(systemName: "heart")
                        .foregroundColor(.red)
                }
            }
        }
        .onAppear {
            Task {
                await bookViewModel.incrementBookViews(book.id)
            }
        }
        .sheet(isPresented: $showingPDF) {
            PDFViewerView(pdfUrl: book.pdfUrl, bookTitle: book.title)
        }
    }
}

struct BookHeaderView: View {
    let book: Book
    
    var body: some View {
        VStack(spacing: 20) {
            // Cover Image
            AsyncImage(url: URL(string: book.coverImageUrl)) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fit)
            } placeholder: {
                Rectangle()
                    .fill(Color.gray.opacity(0.3))
                    .overlay(
                        Image(systemName: "book.closed")
                            .font(.system(size: 60))
                            .foregroundColor(.gray)
                    )
            }
            .frame(height: 300)
            .cornerRadius(16)
            .shadow(color: .black.opacity(0.2), radius: 8, x: 0, y: 4)
            
            // Title and Author
            VStack(spacing: 8) {
                Text(book.title)
                    .font(.title)
                    .fontWeight(.bold)
                    .multilineTextAlignment(.center)
                
                Text("by \(book.author)")
                    .font(.title3)
                    .foregroundColor(.secondary)
            }
            
            // Rating and Stats
            HStack(spacing: 24) {
                VStack(spacing: 4) {
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .foregroundColor(.yellow)
                        Text(String(format: "%.1f", book.rating))
                            .fontWeight(.semibold)
                    }
                    Text("Rating")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                VStack(spacing: 4) {
                    Text("\(book.views)")
                        .font(.title3)
                        .fontWeight(.semibold)
                    Text("Views")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
                
                VStack(spacing: 4) {
                    Text("\(book.pages)")
                        .font(.title3)
                        .fontWeight(.semibold)
                    Text("Pages")
                        .font(.caption)
                        .foregroundColor(.secondary)
                }
            }
        }
    }
}

struct BookActionsView: View {
    let book: Book
    @State private var showingPDF = false
    
    var body: some View {
        VStack(spacing: 16) {
            // Read Button
            Button(action: {
                showingPDF = true
            }) {
                HStack {
                    Image(systemName: "book.open")
                        .font(.system(size: 18))
                    Text("Read Book")
                        .font(.headline)
                        .fontWeight(.semibold)
                }
                .frame(maxWidth: .infinity)
                .frame(height: 50)
                .background(Color.blue)
                .foregroundColor(.white)
                .cornerRadius(12)
            }
            
            // Secondary Actions
            HStack(spacing: 16) {
                Button(action: {
                    // Add to favorites
                }) {
                    HStack {
                        Image(systemName: "heart")
                        Text("Favorite")
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 44)
                    .background(Color.red.opacity(0.1))
                    .foregroundColor(.red)
                    .cornerRadius(12)
                }
                
                Button(action: {
                    // Share book
                }) {
                    HStack {
                        Image(systemName: "square.and.arrow.up")
                        Text("Share")
                    }
                    .frame(maxWidth: .infinity)
                    .frame(height: 44)
                    .background(Color.green.opacity(0.1))
                    .foregroundColor(.green)
                    .cornerRadius(12)
                }
            }
        }
        .sheet(isPresented: $showingPDF) {
            PDFViewerView(pdfUrl: book.pdfUrl, bookTitle: book.title)
        }
    }
}

struct BookInfoView: View {
    let book: Book
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Book Information")
                .font(.title3)
                .fontWeight(.semibold)
            
            VStack(spacing: 12) {
                InfoRow(title: "Category", value: book.category)
                InfoRow(title: "Language", value: book.language.uppercased())
                InfoRow(title: "Pages", value: "\(book.pages)")
                InfoRow(title: "Published", value: book.createdAt.formatted(date: .abbreviated, time: .omitted))
                InfoRow(title: "Last Updated", value: book.updatedAt.formatted(date: .abbreviated, time: .omitted))
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemGray6))
        )
    }
}

struct InfoRow: View {
    let title: String
    let value: String
    
    var body: some View {
        HStack {
            Text(title)
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            Spacer()
            
            Text(value)
                .font(.subheadline)
                .fontWeight(.medium)
        }
    }
}

struct BookDescriptionView: View {
    let book: Book
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Description")
                .font(.title3)
                .fontWeight(.semibold)
            
            Text(book.description)
                .font(.body)
                .lineSpacing(4)
                .multilineTextAlignment(.leading)
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemGray6))
        )
    }
}

struct TagsView: View {
    let tags: [String]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Tags")
                .font(.title3)
                .fontWeight(.semibold)
            
            LazyVGrid(columns: Array(repeating: GridItem(.flexible()), count: 3), spacing: 8) {
                ForEach(tags, id: \.self) { tag in
                    Text(tag)
                        .font(.caption)
                        .fontWeight(.medium)
                        .padding(.horizontal, 12)
                        .padding(.vertical, 6)
                        .background(
                            RoundedRectangle(cornerRadius: 16)
                                .fill(Color.blue.opacity(0.1))
                        )
                        .foregroundColor(.blue)
                }
            }
        }
        .padding(20)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color(.systemGray6))
        )
    }
}

struct RelatedBooksView: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            Text("Related Books")
                .font(.title3)
                .fontWeight(.semibold)
            
            Text("More books you might like will appear here")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .frame(maxWidth: .infinity, alignment: .center)
                .padding(.vertical, 40)
                .background(
                    RoundedRectangle(cornerRadius: 16)
                        .fill(Color(.systemGray6))
                )
        }
    }
}

struct PDFViewerView: View {
    let pdfUrl: String
    let bookTitle: String
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            VStack {
                Text("PDF Viewer")
                    .font(.title)
                    .padding()
                
                Text("PDF would be displayed here for: \(bookTitle)")
                    .multilineTextAlignment(.center)
                    .padding()
                
                Spacer()
            }
            .navigationTitle("Reading")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    NavigationView {
        BookDetailView(book: Book(
            id: "1",
            title: "The Swift Programming Language",
            description: "A comprehensive guide to Swift programming language covering all aspects from basic syntax to advanced features. This book is perfect for both beginners and experienced developers looking to master Swift.",
            author: "Apple Inc.",
            category: "Programming",
            coverImageUrl: "https://example.com/cover.jpg",
            pdfUrl: "https://example.com/book.pdf",
            rating: 4.5,
            views: 1250,
            pages: 300,
            tags: ["swift", "programming", "ios", "apple"]
        ))
        .environmentObject(BookViewModel())
    }
}
