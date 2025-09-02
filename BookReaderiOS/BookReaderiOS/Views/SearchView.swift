import SwiftUI

struct SearchView: View {
    @EnvironmentObject var bookViewModel: BookViewModel
    @EnvironmentObject var videoViewModel: VideoViewModel
    @State private var searchText = ""
    @State private var searchResults: SearchResults = SearchResults()
    @State private var isSearching = false
    @State private var selectedFilter: SearchFilter = .all
    
    enum SearchFilter: String, CaseIterable {
        case all = "All"
        case books = "Books"
        case videos = "Videos"
        
        var icon: String {
            switch self {
            case .all: return "magnifyingglass"
            case .books: return "book"
            case .videos: return "play.rectangle"
            }
        }
    }
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search Bar
                SearchBar(text: $searchText)
                    .padding(.horizontal, 16)
                    .padding(.top, 8)
                
                // Filter Tabs
                HStack(spacing: 0) {
                    ForEach(SearchFilter.allCases, id: \.self) { filter in
                        Button(action: {
                            selectedFilter = filter
                            performSearch()
                        }) {
                            HStack {
                                Image(systemName: filter.icon)
                                    .font(.caption)
                                Text(filter.rawValue)
                                    .font(.subheadline)
                                    .fontWeight(.medium)
                            }
                            .padding(.horizontal, 16)
                            .padding(.vertical, 12)
                            .frame(maxWidth: .infinity)
                            .background(
                                selectedFilter == filter ? Color.blue : Color.clear
                            )
                            .foregroundColor(
                                selectedFilter == filter ? .white : .primary
                            )
                        }
                        .buttonStyle(PlainButtonStyle())
                    }
                }
                .background(Color(.systemGray6))
                .cornerRadius(12)
                .padding(.horizontal, 16)
                .padding(.top, 12)
                
                // Search Results
                if searchText.isEmpty {
                    // Show recent searches or suggestions
                    RecentSearchesView()
                } else if isSearching {
                    Spacer()
                    ProgressView("Searching...")
                        .progressViewStyle(CircularProgressViewStyle())
                    Spacer()
                } else if searchResults.isEmpty {
                    // No results
                    NoResultsView(searchText: searchText)
                } else {
                    // Show results
                    SearchResultsView(
                        results: searchResults,
                        selectedFilter: selectedFilter
                    )
                }
            }
            .navigationTitle("Search")
            .navigationBarTitleDisplayMode(.large)
        }
        .onChange(of: searchText) { query in
            if query.isEmpty {
                searchResults = SearchResults()
            } else {
                performSearch()
            }
        }
    }
    
    private func performSearch() {
        guard !searchText.isEmpty else { return }
        
        isSearching = true
        
        Task {
            var results = SearchResults()
            
            switch selectedFilter {
            case .all:
                async let booksTask = searchBooks(query: searchText)
                async let videosTask = searchVideos(query: searchText)
                
                let (books, videos) = await (booksTask, videosTask)
                results.books = books
                results.videos = videos
                
            case .books:
                let books = await searchBooks(query: searchText)
                results.books = books
                
            case .videos:
                let videos = await searchVideos(query: searchText)
                results.videos = videos
            }
            
            await MainActor.run {
                searchResults = results
                isSearching = false
            }
        }
    }
    
    private func searchBooks(query: String) async -> [Book] {
        let queryLower = query.lowercased()
        return bookViewModel.books.filter { book in
            book.title.lowercased().contains(queryLower) ||
            book.author.lowercased().contains(queryLower) ||
            book.description.lowercased().contains(queryLower) ||
            book.tags.contains { $0.lowercased().contains(queryLower) }
        }
    }
    
    private func searchVideos(query: String) async -> [Video] {
        let queryLower = query.lowercased()
        return videoViewModel.videos.filter { video in
            video.title.lowercased().contains(queryLower) ||
            video.description.lowercased().contains(queryLower) ||
            video.tags.contains { $0.lowercased().contains(queryLower) }
        }
    }
}

struct SearchResults {
    var books: [Book] = []
    var videos: [Video] = []
    
    var isEmpty: Bool {
        books.isEmpty && videos.isEmpty
    }
    
    var totalCount: Int {
        books.count + videos.count
    }
}

struct RecentSearchesView: View {
    @State private var recentSearches = [
        "SwiftUI tutorial",
        "iOS development",
        "Machine learning",
        "Design patterns",
        "React Native"
    ]
    
    var body: some View {
        VStack(alignment: .leading, spacing: 20) {
            Text("Recent Searches")
                .font(.title2)
                .fontWeight(.semibold)
                .padding(.horizontal, 16)
            
            LazyVStack(spacing: 12) {
                ForEach(recentSearches, id: \.self) { search in
                    Button(action: {
                        // Handle recent search selection
                    }) {
                        HStack {
                            Image(systemName: "clock")
                                .foregroundColor(.secondary)
                                .font(.caption)
                            
                            Text(search)
                                .foregroundColor(.primary)
                                .font(.subheadline)
                            
                            Spacer()
                            
                            Image(systemName: "arrow.up.left")
                                .foregroundColor(.secondary)
                                .font(.caption)
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 12)
                        .background(Color(.systemGray6))
                        .cornerRadius(8)
                    }
                    .buttonStyle(PlainButtonStyle())
                }
            }
            .padding(.horizontal, 16)
            
            Spacer()
        }
        .padding(.top, 20)
    }
}

struct NoResultsView: View {
    let searchText: String
    
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("No results found")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("We couldn't find any results for \"\(searchText)\"")
                .font(.subheadline)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
            
            Text("Try checking your spelling or using different keywords")
                .font(.caption)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
        }
        .padding(.horizontal, 32)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

struct SearchResultsView: View {
    let results: SearchResults
    let selectedFilter: SearchView.SearchFilter
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Results Summary
                HStack {
                    Text("Found \(results.totalCount) results")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                    
                    Spacer()
                }
                .padding(.horizontal, 16)
                
                // Books Results
                if !results.books.isEmpty && (selectedFilter == .all || selectedFilter == .books) {
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Books (\(results.books.count))")
                            .font(.title3)
                            .fontWeight(.semibold)
                            .padding(.horizontal, 16)
                        
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 16) {
                                ForEach(results.books) { book in
                                    NavigationLink(destination: BookDetailView(book: book)) {
                                        BookCard(book: book)
                                    }
                                    .buttonStyle(PlainButtonStyle())
                                }
                            }
                            .padding(.horizontal, 16)
                        }
                    }
                }
                
                // Videos Results
                if !results.videos.isEmpty && (selectedFilter == .all || selectedFilter == .videos) {
                    VStack(alignment: .leading, spacing: 16) {
                        Text("Videos (\(results.videos.count))")
                            .font(.title3)
                            .fontWeight(.semibold)
                            .padding(.horizontal, 16)
                        
                        LazyVGrid(columns: Array(repeating: GridItem(.flexible(), spacing: 16), count: 2), spacing: 16) {
                            ForEach(results.videos) { video in
                                NavigationLink(destination: VideoPlayerView(video: video)) {
                                    VideoCard(video: video)
                                }
                                .buttonStyle(PlainButtonStyle())
                            }
                        }
                        .padding(.horizontal, 16)
                    }
                }
            }
            .padding(.vertical, 8)
        }
    }
}

#Preview {
    SearchView()
        .environmentObject(BookViewModel())
        .environmentObject(VideoViewModel())
}
