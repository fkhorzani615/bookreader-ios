import SwiftUI

struct BooksView: View {
    @EnvironmentObject var bookViewModel: BookViewModel
    @EnvironmentObject var categoryViewModel: CategoryViewModel
    @State private var searchText = ""
    @State private var selectedCategory: String = "All"
    @State private var sortOption: SortOption = .title
    @State private var showFilters = false
    
    enum SortOption: String, CaseIterable {
        case title = "Title"
        case author = "Author"
        case rating = "Rating"
        case views = "Views"
        case date = "Date"
        
        var icon: String {
            switch self {
            case .title: return "textformat"
            case .author: return "person"
            case .rating: return "star"
            case .views: return "eye"
            case .date: return "calendar"
            }
        }
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search and Filter Bar
                VStack(spacing: 12) {
                    SearchBar(text: $searchText)
                    
                    HStack {
                        // Category Filter
                        Menu {
                            Button("All") {
                                selectedCategory = "All"
                            }
                            
                            ForEach(categoryViewModel.categories) { category in
                                Button(category.name) {
                                    selectedCategory = category.name
                                }
                            }
                        } label: {
                            HStack {
                                Image(systemName: "folder")
                                    .font(.caption)
                                Text(selectedCategory)
                                    .font(.subheadline)
                                Image(systemName: "chevron.down")
                                    .font(.caption)
                            }
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                        }
                        
                        Spacer()
                        
                        // Sort Button
                        Menu {
                            ForEach(SortOption.allCases, id: \.self) { option in
                                Button {
                                    sortOption = option
                                } label: {
                                    HStack {
                                        Text(option.rawValue)
                                        if sortOption == option {
                                            Image(systemName: "checkmark")
                                        }
                                    }
                                }
                            }
                        } label: {
                            HStack {
                                Image(systemName: sortOption.icon)
                                    .font(.caption)
                                Text("Sort")
                                    .font(.subheadline)
                                Image(systemName: "chevron.down")
                                    .font(.caption)
                            }
                            .padding(.horizontal, 12)
                            .padding(.vertical, 8)
                            .background(Color(.systemGray6))
                            .cornerRadius(8)
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .background(Color(.systemBackground))
                
                // Books List
                if bookViewModel.isLoading {
                    Spacer()
                    ProgressView("Loading books...")
                        .progressViewStyle(CircularProgressViewStyle())
                    Spacer()
                } else if filteredAndSortedBooks.isEmpty {
                    Spacer()
                    VStack(spacing: 16) {
                        Image(systemName: "book.closed")
                            .font(.system(size: 60))
                            .foregroundColor(.gray)
                        
                        Text("No books found")
                            .font(.title2)
                            .fontWeight(.semibold)
                        
                        Text("Try adjusting your search or filters")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                } else {
                    ScrollView {
                        LazyVStack(spacing: 16) {
                            ForEach(filteredAndSortedBooks) { book in
                                NavigationLink(destination: BookDetailView(book: book)) {
                                    BookCardLarge(book: book)
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                    }
                }
            }
            .navigationTitle("Books")
            .navigationBarTitleDisplayMode(.large)
            .refreshable {
                await bookViewModel.fetchBooks()
            }
        }
        .onChange(of: searchText) { query in
            Task {
                if query.isEmpty {
                    await bookViewModel.fetchBooks()
                } else {
                    await bookViewModel.searchBooks(query: query)
                }
            }
        }
        .onChange(of: selectedCategory) { category in
            Task {
                if category == "All" {
                    await bookViewModel.fetchBooks()
                } else {
                    await bookViewModel.fetchBooksByCategory(category)
                }
            }
        }
    }
    
    private var filteredAndSortedBooks: [Book] {
        var books = bookViewModel.books
        
        // Apply category filter
        if selectedCategory != "All" {
            books = books.filter { $0.category == selectedCategory }
        }
        
        // Apply search filter
        if !searchText.isEmpty {
            let query = searchText.lowercased()
            books = books.filter { book in
                book.title.lowercased().contains(query) ||
                book.author.lowercased().contains(query) ||
                book.description.lowercased().contains(query) ||
                book.tags.contains { $0.lowercased().contains(query) }
            }
        }
        
        // Apply sorting
        switch sortOption {
        case .title:
            books.sort { $0.title.lowercased() < $1.title.lowercased() }
        case .author:
            books.sort { $0.author.lowercased() < $1.author.lowercased() }
        case .rating:
            books.sort { $0.rating > $1.rating }
        case .views:
            books.sort { $0.views > $1.views }
        case .date:
            books.sort { $0.createdAt > $1.createdAt }
        }
        
        return books
    }
}

#Preview {
    BooksView()
        .environmentObject(BookViewModel())
        .environmentObject(CategoryViewModel())
}
